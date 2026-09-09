import { prisma } from "@/lib/db";
import { sendLeadWhatsAppNotification } from "@/lib/integrations/whatsapp";

/**
 * The CRM database is the single source of truth for a lead — this only
 * sends a best-effort WhatsApp alert to staff about it (a communication
 * channel, not a data store) and records whether that alert went out.
 * Safe to call repeatedly (e.g. an admin retry) without duplicating the
 * lead itself.
 */
export async function syncLead(leadId: string): Promise<void> {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return;

  const whatsappResult = await sendLeadWhatsAppNotification({
    name: lead.name,
    phone: lead.phone,
    source: lead.source,
    createdAt: lead.createdAt,
  });

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      whatsappStatus: whatsappResult.status,
      syncAttempts: { increment: 1 },
      lastSyncAt: new Date(),
    },
  });

  if (whatsappResult.status === "FAILED") {
    console.error(`[lead-sync] WhatsApp notify failed for lead ${leadId}: ${whatsappResult.error}`);
  }
}
