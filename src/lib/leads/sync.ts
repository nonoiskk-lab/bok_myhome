import { prisma } from "@/lib/db";
import { appendLeadToGoogleSheet } from "@/lib/integrations/googleSheets";
import { sendLeadWhatsAppNotification } from "@/lib/integrations/whatsapp";

/**
 * Syncs one lead to its external destinations (Google Sheet + WhatsApp).
 * Supabase already holds the lead — this never re-creates or deletes it,
 * only records how each destination went, so a lead is never silently lost
 * even if both syncs fail. Safe to call repeatedly (e.g. an admin retry).
 */
export async function syncLead(leadId: string): Promise<void> {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return;

  const timestamp = lead.createdAt.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const [sheetResult, whatsappResult] = await Promise.all([
    appendLeadToGoogleSheet({
      timestamp,
      name: lead.name,
      phone: lead.phone,
      source: lead.source,
      status: lead.status,
    }),
    sendLeadWhatsAppNotification({
      name: lead.name,
      phone: lead.phone,
      source: lead.source,
      createdAt: lead.createdAt,
    }),
  ]);

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      googleSheetStatus: sheetResult.status,
      whatsappStatus: whatsappResult.status,
      syncAttempts: { increment: 1 },
      lastSyncAt: new Date(),
    },
  });

  if (sheetResult.status === "FAILED") {
    console.error(`[lead-sync] Google Sheet append failed for lead ${leadId}: ${sheetResult.error}`);
  }
  if (whatsappResult.status === "FAILED") {
    console.error(`[lead-sync] WhatsApp notify failed for lead ${leadId}: ${whatsappResult.error}`);
  }
}
