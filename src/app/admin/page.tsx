import { prisma } from "@/lib/db";
import { Building2, CheckCircle2, Star, ShieldCheck, Users, Sparkles, CalendarCheck, TrendingUp, MessageCircle, Phone } from "lucide-react";

export const dynamic = "force-dynamic";

async function getMetrics() {
  const [
    totalProperties,
    activeListings,
    featured,
    verified,
    sold,
    totalLeads,
    newLeads,
    siteVisits,
    whatsappLeads,
    callLeads,
    bookedLeads,
  ] = await Promise.all([
    prisma.property.count(),
    prisma.property.count({ where: { listingStatus: { in: ["PUBLISHED", "VERIFIED", "UNDER_OFFER"] } } }),
    prisma.property.count({ where: { featured: true } }),
    prisma.property.count({ where: { verified: true } }),
    prisma.property.count({ where: { listingStatus: "SOLD" } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.lead.count({ where: { source: "SITE_VISIT_REQUEST" } }),
    prisma.lead.count({ where: { source: "WHATSAPP" } }),
    prisma.lead.count({ where: { source: "PHONE_CALL" } }),
    prisma.lead.count({ where: { status: { in: ["BOOKED", "SOLD"] } } }),
  ]);

  const conversionRate = totalLeads > 0 ? Math.round((bookedLeads / totalLeads) * 100) : 0;

  return {
    totalProperties,
    activeListings,
    featured,
    verified,
    sold,
    totalLeads,
    newLeads,
    siteVisits,
    whatsappLeads,
    callLeads,
    conversionRate,
  };
}

export default async function AdminDashboardPage() {
  const m = await getMetrics();

  const cards = [
    { label: "Total Properties", value: m.totalProperties, icon: Building2 },
    { label: "Active Listings", value: m.activeListings, icon: CheckCircle2 },
    { label: "Featured Properties", value: m.featured, icon: Star },
    { label: "Verified Properties", value: m.verified, icon: ShieldCheck },
    { label: "Sold Properties", value: m.sold, icon: Sparkles },
    { label: "Total Leads", value: m.totalLeads, icon: Users },
    { label: "New Leads", value: m.newLeads, icon: Users },
    { label: "Site Visit Requests", value: m.siteVisits, icon: CalendarCheck },
    { label: "WhatsApp Leads", value: m.whatsappLeads, icon: MessageCircle },
    { label: "Call Leads", value: m.callLeads, icon: Phone },
    { label: "Conversion Rate", value: `${m.conversionRate}%`, icon: TrendingUp },
  ];

  const [byType, recentLeads] = await Promise.all([
    prisma.property.groupBy({ by: ["propertyType"], _count: { _all: true } }),
    prisma.lead.findMany({
      include: { property: { select: { title: true, propertyId: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div>
      <h1 className="font-serif text-2xl text-navy-950">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-600">A live snapshot of listings, leads and conversions.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-navy-950/8 bg-white p-5">
            <c.icon className="h-5 w-5 text-gold-600" />
            <p className="mt-3 text-2xl font-bold text-navy-950">{c.value}</p>
            <p className="text-xs text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-navy-950/8 bg-white p-6">
          <h2 className="font-semibold text-navy-950">Properties by Type</h2>
          <div className="mt-4 space-y-3">
            {byType.map((row) => {
              const pct = m.totalProperties > 0 ? (row._count._all / m.totalProperties) * 100 : 0;
              return (
                <div key={row.propertyType}>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>{row.propertyType}</span>
                    <span>{row._count._all}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-navy-950/5">
                    <div className="h-2 rounded-full bg-gold-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-navy-950/8 bg-white p-6">
          <h2 className="font-semibold text-navy-950">Recent Leads</h2>
          <ul className="mt-4 divide-y divide-navy-950/8">
            {recentLeads.map((lead) => (
              <li key={lead.id} className="py-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-navy-950">{lead.name}</span>
                  <span className="text-xs text-slate-400">{lead.status}</span>
                </div>
                <p className="text-xs text-slate-500">
                  {lead.property?.title ?? "General enquiry"} · {lead.source.replace(/_/g, " ")}
                </p>
              </li>
            ))}
            {recentLeads.length === 0 && <p className="py-3 text-sm text-slate-500">No leads yet.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}
