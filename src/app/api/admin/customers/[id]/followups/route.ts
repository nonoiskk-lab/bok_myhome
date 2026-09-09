import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/crm";

const schema = z.object({
  dueAt: z.string().min(1, "Please choose a follow-up date and time"),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
  leadId: z.string().optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const dueAt = new Date(parsed.data.dueAt);
  if (Number.isNaN(dueAt.getTime())) {
    return NextResponse.json({ error: { fieldErrors: { dueAt: ["Invalid date/time"] } } }, { status: 400 });
  }

  const followup = await prisma.followup.create({
    data: {
      customerId: id,
      leadId: parsed.data.leadId || undefined,
      dueAt,
      note: parsed.data.note || undefined,
    },
  });

  // Keep the customer's "next follow-up" pointer at the soonest pending one.
  const soonestPending = await prisma.followup.findFirst({
    where: { customerId: id, status: "PENDING" },
    orderBy: { dueAt: "asc" },
  });
  await prisma.customer.update({
    where: { id },
    data: { nextFollowUpAt: soonestPending?.dueAt ?? null },
  });

  await logActivity({
    customerId: id,
    leadId: parsed.data.leadId || undefined,
    type: "FOLLOWUP_SCHEDULED",
    description: `Follow-up scheduled for ${dueAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}${
      parsed.data.note ? ` — ${parsed.data.note}` : ""
    }`,
    createdBy: session.name,
  });

  return NextResponse.json({ ok: true, followup }, { status: 201 });
}
