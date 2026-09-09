import { NextResponse, after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { LEAD_SOURCES } from "@/lib/constants";
import { normalizeIndianMobile } from "@/lib/phone";
import { captureLead } from "@/lib/crm";
import { syncLead } from "@/lib/leads/sync";

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

  let result;
  try {
    result = await captureLead({
      name: data.name,
      phone: phone.digits,
      email: data.email || undefined,
      message: data.message || undefined,
      source: data.source,
      propertyId: data.propertyId || undefined,
      preferredContactMethod: data.preferredContactMethod || undefined,
      preferredVisitDate: data.preferredVisitDate ? new Date(data.preferredVisitDate) : undefined,
    });
  } catch (err) {
    console.error("[api/leads] failed to save lead:", err);
    return NextResponse.json(
      { error: "Something went wrong while submitting your details. Please try again." },
      { status: 500 }
    );
  }

  if (!result.duplicate && data.propertyId) {
    await prisma.property.update({
      where: { id: data.propertyId },
      data: { enquiries: { increment: 1 } },
    });
  }

  if (!result.duplicate) {
    after(() => syncLead(result.leadId));
  }

  return NextResponse.json(
    { ok: true, leadId: result.leadId, customerId: result.customerId },
    { status: result.duplicate ? 200 : 201 }
  );
}
