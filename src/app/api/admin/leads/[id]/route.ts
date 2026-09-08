import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { LEAD_STATUSES } from "@/lib/constants";

const schema = z.object({
  status: z.enum(LEAD_STATUSES).optional(),
  nextFollowUp: z.string().optional(),
  note: z.string().trim().optional(),
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

  const { note, ...rest } = parsed.data;

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...rest,
      nextFollowUp: rest.nextFollowUp ? new Date(rest.nextFollowUp) : undefined,
      notes: note ? { create: { body: note } } : undefined,
    },
  });

  return NextResponse.json({ ok: true, lead });
}
