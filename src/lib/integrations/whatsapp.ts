export type SyncStatus = "SUCCESS" | "FAILED" | "NOT_CONFIGURED";
export interface SyncResult {
  status: SyncStatus;
  error?: string;
}

interface LeadNotification {
  name: string;
  phone: string;
  source: string;
  createdAt: Date;
}

/**
 * Sends a new-lead alert to the business's WhatsApp via the official Meta
 * WhatsApp Cloud API (never an unofficial/unsafe automation method). Needs
 * a Meta WhatsApp Business App: WHATSAPP_PHONE_NUMBER_ID + WHATSAPP_ACCESS_TOKEN
 * (server-side only) and WHATSAPP_NOTIFY_TO (the staff number that should
 * receive lead alerts). Note: Cloud API free-form text messages require an
 * open 24h conversation window with the recipient, or an approved message
 * template outside that window — see Meta's docs for this project's app.
 */
export async function sendLeadWhatsAppNotification(lead: LeadNotification): Promise<SyncResult> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const notifyTo = process.env.WHATSAPP_NOTIFY_TO;

  if (!phoneNumberId || !accessToken || !notifyTo) {
    return { status: "NOT_CONFIGURED" };
  }

  const time = lead.createdAt.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  const body = `🔔 NEW CUSTOMER LEAD\n\n👤 Name: ${lead.name}\n📱 Mobile: ${lead.phone}\n🌐 Source: ${lead.source}\n🕐 Time: ${time}`;

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: notifyTo,
        type: "text",
        text: { body },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      return { status: "FAILED", error: `HTTP ${res.status}: ${errBody.slice(0, 300)}` };
    }
    return { status: "SUCCESS" };
  } catch (err) {
    return { status: "FAILED", error: err instanceof Error ? err.message : "Unknown WhatsApp error" };
  }
}
