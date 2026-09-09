import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/crm";

const schema = z.object({
  body: z.string().trim().min(1, "Note cannot be empty").max(2000),
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

  const note = await prisma.customerNote.create({
    data: { customerId: id, body: parsed.data.body, createdBy: session.name },
  });

  await logActivity({
    customerId: id,
    type: "NOTE_ADDED",
    description: `Note added: ${parsed.data.body.slice(0, 140)}`,
    createdBy: session.name,
  });

  return NextResponse.json({ ok: true, note }, { status: 201 });
}
