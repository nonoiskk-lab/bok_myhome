import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/crm";
import { FOLLOWUP_STATUSES } from "@/lib/constants";

const schema = z.object({
  status: z.enum(FOLLOWUP_STATUSES),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const followup = await prisma.followup.findUnique({ where: { id } });
  if (!followup) return NextResponse.json({ error: "Follow-up not found" }, { status: 404 });

  const updated = await prisma.followup.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  if (parsed.data.status === "DONE") {
    await prisma.customer.update({ where: { id: followup.customerId }, data: { lastContactedAt: new Date() } });
  }

  // Keep the customer's "next follow-up" pointer at the soonest pending one.
  const soonestPending = await prisma.followup.findFirst({
    where: { customerId: followup.customerId, status: "PENDING" },
    orderBy: { dueAt: "asc" },
  });
  await prisma.customer.update({
    where: { id: followup.customerId },
    data: { nextFollowUpAt: soonestPending?.dueAt ?? null },
  });

  if (parsed.data.status === "DONE") {
    await logActivity({
      customerId: followup.customerId,
      leadId: followup.leadId ?? undefined,
      type: "FOLLOWUP_COMPLETED",
      description: "Follow-up marked as completed",
      createdBy: session.name,
    });
  }

  return NextResponse.json({ ok: true, followup: updated });
}
