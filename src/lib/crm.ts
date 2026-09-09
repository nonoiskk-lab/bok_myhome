import { prisma } from "@/lib/db";
import type { LeadSourceValue, ActivityTypeValue } from "@/lib/constants";

// A double-click or a retried request within this window is the same
// enquiry, not a new one — everything after it is a genuinely new
// requirement even from the same customer.
const DUPLICATE_WINDOW_MS = 60 * 1000;

export interface CaptureLeadInput {
  name: string;
  phone: string; // already normalized (normalizeIndianMobile().digits)
  email?: string;
  message?: string;
  budget?: number;
  source: LeadSourceValue;
  propertyId?: string;
  preferredContactMethod?: string;
  preferredVisitDate?: Date;
}

export interface CaptureLeadResult {
  leadId: string;
  customerId: string;
  isNewCustomer: boolean;
  duplicate: boolean;
}

/**
 * The CRM's single entry point for a customer submission: find-or-create
 * the Customer by mobile number (the dedup key), record the enquiry as a
 * Lead ("requirement") under that customer, and log an Activity — all in
 * one transaction so the customer, requirement and activity never end up
 * out of sync with each other.
 */
export async function captureLead(input: CaptureLeadInput): Promise<CaptureLeadResult> {
  return prisma.$transaction(async (tx) => {
    const existingCustomer = await tx.customer.findUnique({ where: { mobile: input.phone } });

    if (existingCustomer) {
      const recentDuplicate = await tx.lead.findFirst({
        where: {
          customerId: existingCustomer.id,
          source: input.source,
          createdAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
        },
        orderBy: { createdAt: "desc" },
      });
      if (recentDuplicate) {
        return {
          leadId: recentDuplicate.id,
          customerId: existingCustomer.id,
          isNewCustomer: false,
          duplicate: true,
        };
      }
    }

    const customer = existingCustomer
      ? await tx.customer.update({
          where: { id: existingCustomer.id },
          data: {
            email: existingCustomer.email ?? (input.email || undefined),
          },
        })
      : await tx.customer.create({
          data: {
            name: input.name,
            mobile: input.phone,
            email: input.email || undefined,
            source: input.source,
          },
        });

    const lead = await tx.lead.create({
      data: {
        name: input.name,
        phone: input.phone,
        email: input.email || undefined,
        message: input.message || undefined,
        budget: input.budget,
        source: input.source,
        status: input.source === "SITE_VISIT_REQUEST" ? "SITE_VISIT_SCHEDULED" : "NEW",
        customerId: customer.id,
        propertyId: input.propertyId,
        preferredContactMethod: input.preferredContactMethod,
        preferredVisitDate: input.preferredVisitDate,
      },
    });

    await tx.activity.create({
      data: {
        customerId: customer.id,
        leadId: lead.id,
        type: existingCustomer ? "REQUIREMENT_ADDED" : "ENQUIRY_RECEIVED",
        description: existingCustomer
          ? `New requirement added${input.message ? `: ${input.message}` : ""} (source: ${input.source})`
          : `New customer enquiry received via ${input.source}`,
        createdBy: "System",
      },
    });

    return { leadId: lead.id, customerId: customer.id, isNewCustomer: !existingCustomer, duplicate: false };
  });
}

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Start/end UTC instants for "today" in India Standard Time (Asia/Kolkata). */
export function getISTDayRange(reference: Date = new Date()): { start: Date; end: Date } {
  const shifted = new Date(reference.getTime() + IST_OFFSET_MS);
  const startShifted = new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()));
  const start = new Date(startShifted.getTime() - IST_OFFSET_MS);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

/** Records one Activity row for a customer's timeline. */
export async function logActivity(params: {
  customerId: string;
  leadId?: string;
  type: ActivityTypeValue;
  description: string;
  createdBy?: string;
}) {
  return prisma.activity.create({
    data: {
      customerId: params.customerId,
      leadId: params.leadId,
      type: params.type,
      description: params.description,
      createdBy: params.createdBy ?? "Admin",
    },
  });
}
