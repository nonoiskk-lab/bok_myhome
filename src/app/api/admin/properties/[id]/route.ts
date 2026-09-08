import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { LISTING_STATUSES } from "@/lib/constants";

const patchSchema = z.object({
  featured: z.boolean().optional(),
  premium: z.boolean().optional(),
  verified: z.boolean().optional(),
  listingStatus: z.enum(LISTING_STATUSES).optional(),
  price: z.coerce.number().positive().optional(),
  title: z.string().trim().min(3).optional(),
  description: z.string().trim().min(10).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const property = await prisma.property.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true, property });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.property.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
