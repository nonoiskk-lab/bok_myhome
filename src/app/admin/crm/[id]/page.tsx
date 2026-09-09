import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, MessageCircle, Mail, Building2, Calendar } from "lucide-react";
import { prisma } from "@/lib/db";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { toWhatsAppPhone, formatIndianPrice } from "@/lib/format";
import { LEAD_STATUS_LABELS, ACTIVITY_TYPE_LABELS, type LeadStatusValue, type ActivityTypeValue } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { CustomerStatusPriority } from "@/components/admin/crm/CustomerStatusPriority";
import { FollowupsPanel } from "@/components/admin/crm/FollowupsPanel";
import { NotesPanel } from "@/components/admin/crm/NotesPanel";

export const dynamic = "force-dynamic";

export default async function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      leads: { orderBy: { createdAt: "desc" }, include: { property: { select: { title: true, slug: true } } } },
      followups: { orderBy: { dueAt: "asc" } },
      activities: { orderBy: { createdAt: "desc" }, take: 50 },
      notes: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!customer) notFound();

  return (
    <div>
      <Link href="/admin/crm" className="flex items-center gap-1 text-sm text-slate-500 hover:text-gold-600">
        <ArrowLeft className="h-4 w-4" /> Back to CRM
      </Link>

      <div className="mt-4 rounded-2xl border border-navy-950/8 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl text-navy-950">{customer.name}</h1>
            <p className="mt-1 text-xs text-slate-400">Customer ID: {customer.id}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-600">
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {customer.mobile}
              </span>
              {customer.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {customer.email}
                </span>
              )}
              {customer.company && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" /> {customer.company}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Customer since{" "}
                {customer.createdAt.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium" })}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <a
              href={`tel:${customer.mobile}`}
              className="flex items-center gap-1.5 rounded-full border border-navy-950/15 px-3.5 py-2 text-sm font-medium text-navy-900 hover:bg-navy-950/5"
            >
              <Phone className="h-4 w-4" /> Call
            </a>
            <a
              href={buildWhatsAppLink(`Hi ${customer.name}, following up on your enquiry with BOK MyHome.`, toWhatsAppPhone(customer.mobile))}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-green-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-green-600"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-5 border-t border-navy-950/8 pt-4">
          <CustomerStatusPriority
            id={customer.id}
            status={customer.status}
            priority={customer.priority}
            assignedTo={customer.assignedTo}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-navy-950/8 bg-white p-6">
          <h2 className="font-semibold text-navy-950">Requirement History</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[400px] text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Requirement</th>
                  <th className="pb-2">Budget</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {customer.leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-navy-950/8">
                    <td className="py-2.5 text-xs text-slate-500">
                      {lead.createdAt.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium" })}
                    </td>
                    <td className="py-2.5 text-navy-950">
                      {lead.property ? (
                        <Link href={`/properties/${lead.property.slug}`} target="_blank" className="hover:text-gold-600">
                          {lead.property.title}
                        </Link>
                      ) : (
                        lead.message || lead.source.replace(/_/g, " ")
                      )}
                    </td>
                    <td className="py-2.5 text-xs text-slate-500">{lead.budget ? formatIndianPrice(lead.budget) : "—"}</td>
                    <td className="py-2.5">
                      <Badge tone="slate">{LEAD_STATUS_LABELS[lead.status as LeadStatusValue] ?? lead.status}</Badge>
                    </td>
                  </tr>
                ))}
                {customer.leads.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-sm text-slate-500">
                      No requirements recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-navy-950/8 bg-white p-6">
          <h2 className="font-semibold text-navy-950">Follow-ups</h2>
          <div className="mt-4">
            <FollowupsPanel
              customerId={customer.id}
              followups={customer.followups.map((f) => ({
                id: f.id,
                dueAt: f.dueAt.toISOString(),
                note: f.note,
                status: f.status,
              }))}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-navy-950/8 bg-white p-6">
          <h2 className="font-semibold text-navy-950">Notes</h2>
          <div className="mt-4">
            <NotesPanel
              customerId={customer.id}
              notes={customer.notes.map((n) => ({
                id: n.id,
                body: n.body,
                createdBy: n.createdBy,
                createdAt: n.createdAt.toISOString(),
              }))}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-navy-950/8 bg-white p-6">
          <h2 className="font-semibold text-navy-950">Activity Timeline</h2>
          <ul className="mt-4 space-y-3 border-l border-navy-950/10 pl-4">
            {customer.activities.map((a) => (
              <li key={a.id} className="relative text-sm">
                <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-gold-500" />
                <p className="text-navy-950">{a.description}</p>
                <p className="text-[11px] text-slate-400">
                  {ACTIVITY_TYPE_LABELS[a.type as ActivityTypeValue] ?? a.type} ·{" "}
                  {a.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })}
                  {a.createdBy ? ` · ${a.createdBy}` : ""}
                </p>
              </li>
            ))}
            {customer.activities.length === 0 && <p className="text-sm text-slate-500">No activity yet.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}
