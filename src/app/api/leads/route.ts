import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { LEAD_SOURCES } from "@/lib/constants";

const leadSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,15}$/, "Please enter a valid phone number"),
  email: z.string().trim().email().optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  source: z.enum(LEAD_SOURCES),
  propertyId: z.string().optional(),
  preferredContactMethod: z.string().optional(),
  preferredVisitDate: z.string().optional(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = leadSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const lead = await prisma.lead.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      message: data.message || undefined,
      source: data.source,
      status: data.source === "SITE_VISIT_REQUEST" ? "SITE_VISIT_SCHEDULED" : "NEW",
      propertyId: data.propertyId || undefined,
      preferredContactMethod: data.preferredContactMethod || undefined,
      preferredVisitDate: data.preferredVisitDate ? new Date(data.preferredVisitDate) : undefined,
    },
  });

  if (data.propertyId) {
    await prisma.property.update({
      where: { id: data.propertyId },
      data: { enquiries: { increment: 1 } },
    });
  }

  return NextResponse.json({ ok: true, leadId: lead.id }, { status: 201 });
}
