import Link from "next/link";
import { Phone, MessageCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { LeadStatusSelect } from "@/components/admin/LeadStatusSelect";
import { LeadSyncStatus } from "@/components/admin/LeadSyncStatus";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { toWhatsAppPhone } from "@/lib/format";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const leads = await prisma.lead.findMany({
    include: { property: { select: { title: true, propertyId: true, slug: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <h1 className="font-serif text-2xl text-navy-950">Leads / CRM</h1>
      <p className="mt-1 text-sm text-slate-600">{leads.length} leads captured across the site.</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-navy-950/8 bg-white">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-navy-950/8 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="p-4">Lead</th>
              <th className="p-4">Property</th>
              <th className="p-4">Source</th>
              <th className="p-4">Received</th>
              <th className="p-4">Status</th>
              <th className="p-4">Sync</th>
              <th className="p-4">Contact</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-navy-950/8 last:border-0">
                <td className="p-4">
                  <p className="font-medium text-navy-950">{lead.name}</p>
                  <p className="text-xs text-slate-400">{lead.phone}</p>
                </td>
                <td className="p-4 text-slate-600">
                  {lead.property ? (
                    <Link href={`/properties/${lead.property.slug}`} target="_blank" className="hover:text-gold-600">
                      {lead.property.title}
                    </Link>
                  ) : (
                    "General enquiry"
                  )}
                </td>
                <td className="p-4 text-xs text-slate-500">{lead.source.replace(/_/g, " ")}</td>
                <td className="p-4 text-xs text-slate-500">
                  {formatDistanceToNow(lead.createdAt, { addSuffix: true })}
                </td>
                <td className="p-4">
                  <LeadStatusSelect id={lead.id} status={lead.status} />
                </td>
                <td className="p-4">
                  <LeadSyncStatus
                    id={lead.id}
                    googleSheetStatus={lead.googleSheetStatus}
                    whatsappStatus={lead.whatsappStatus}
                  />
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <a
                      href={`tel:${lead.phone}`}
                      aria-label="Call"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-950 hover:bg-navy-950/5"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                    <a
                      href={buildWhatsAppLink(
                        `Hi ${lead.name}, following up on your enquiry with BOK MyHome.`,
                        toWhatsAppPhone(lead.phone)
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="WhatsApp"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-green-600 hover:bg-green-500/10"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-sm text-slate-500">
                  No leads yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
