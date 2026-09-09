import { NextResponse, after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { LEAD_SOURCES } from "@/lib/constants";
import { normalizeIndianMobile } from "@/lib/phone";
import { syncLead } from "@/lib/leads/sync";

// A double-click or a repeated request from a flaky connection shouldn't
// create two leads — but a genuinely new enquiry a few minutes later should.
const DUPLICATE_WINDOW_MS = 2 * 60 * 1000;

const leadSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  phone: z.string().trim().min(1, "Please enter your mobile number").max(20),
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
  const phone = normalizeIndianMobile(data.phone);
  if (!phone.valid) {
    return NextResponse.json(
      { error: { formErrors: [], fieldErrors: { phone: ["Please enter a valid 10-digit Indian mobile number"] } } },
      { status: 400 }
    );
  }

  const existing = await prisma.lead.findFirst({
    where: {
      phone: phone.digits,
      source: data.source,
      propertyId: data.propertyId || undefined,
      createdAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    return NextResponse.json({ ok: true, leadId: existing.id }, { status: 200 });
  }

  const lead = await prisma.lead.create({
    data: {
      name: data.name,
      phone: phone.digits,
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

  after(() => syncLead(lead.id));

  return NextResponse.json({ ok: true, leadId: lead.id }, { status: 201 });
}
