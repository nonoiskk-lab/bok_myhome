import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/crm";
import { LEAD_STATUSES, LEAD_PRIORITIES, CUSTOMER_TYPES, LEAD_STATUS_LABELS, LEAD_PRIORITY_LABELS } from "@/lib/constants";

const schema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  company: z.string().trim().max(150).optional().or(z.literal("")),
  customerType: z.enum(CUSTOMER_TYPES).optional(),
  status: z.enum(LEAD_STATUSES).optional(),
  priority: z.enum(LEAD_PRIORITIES).optional(),
  assignedTo: z.string().trim().max(100).optional().or(z.literal("")),
  nextFollowUpAt: z.string().optional(),
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

  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const { nextFollowUpAt, email, company, assignedTo, ...rest } = parsed.data;

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      ...rest,
      email: email || undefined,
      company: company || undefined,
      assignedTo: assignedTo || undefined,
      nextFollowUpAt: nextFollowUpAt ? new Date(nextFollowUpAt) : undefined,
    },
  });

  if (parsed.data.status && parsed.data.status !== existing.status) {
    await logActivity({
      customerId: id,
      type: "STATUS_CHANGED",
      description: `Status changed from ${LEAD_STATUS_LABELS[existing.status as keyof typeof LEAD_STATUS_LABELS] ?? existing.status} to ${LEAD_STATUS_LABELS[parsed.data.status]}`,
      createdBy: session.name,
    });
  }
  if (parsed.data.priority && parsed.data.priority !== existing.priority) {
    await logActivity({
      customerId: id,
      type: "PRIORITY_CHANGED",
      description: `Priority changed from ${LEAD_PRIORITY_LABELS[existing.priority as keyof typeof LEAD_PRIORITY_LABELS] ?? existing.priority} to ${LEAD_PRIORITY_LABELS[parsed.data.priority]}`,
      createdBy: session.name,
    });
  }

  return NextResponse.json({ ok: true, customer });
}
