import Link from "next/link";
import {
  Users,
  UserPlus,
  CalendarClock,
  CalendarCheck,
  Trophy,
  XCircle,
  Flame,
  ClipboardList,
  Search,
  Phone,
  MessageCircle,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getISTDayRange } from "@/lib/crm";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { toWhatsAppPhone, formatIndianPrice } from "@/lib/format";
import { formatDistanceToNow } from "date-fns";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  LEAD_PRIORITIES,
  LEAD_PRIORITY_LABELS,
  LEAD_SOURCES,
  WON_STATUSES,
  LOST_STATUSES,
  type LeadStatusValue,
  type LeadPriorityValue,
} from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

type Sort = "newest" | "oldest" | "updated" | "followup" | "priority";

function statusTone(status: string) {
  if ((WON_STATUSES as readonly string[]).includes(status)) return "green" as const;
  if ((LOST_STATUSES as readonly string[]).includes(status)) return "red" as const;
  if (status === "NEW") return "navy" as const;
  return "gold" as const;
}

function priorityTone(priority: string) {
  if (priority === "HIGH") return "red" as const;
  if (priority === "LOW") return "green" as const;
  return "gold" as const;
}

async function getDashboardStats() {
  const { start: todayStart, end: todayEnd } = getISTDayRange();

  const [
    totalCustomers,
    newLeadsToday,
    followupsToday,
    upcomingFollowups,
    converted,
    lost,
    highPriority,
    openRequirements,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.count({ where: { createdAt: { gte: todayStart, lt: todayEnd } } }),
    prisma.followup.count({ where: { status: "PENDING", dueAt: { gte: todayStart, lt: todayEnd } } }),
    prisma.followup.count({ where: { status: "PENDING", dueAt: { gte: todayEnd } } }),
    prisma.customer.count({ where: { status: { in: WON_STATUSES as string[] } } }),
    prisma.customer.count({ where: { status: { in: LOST_STATUSES as string[] } } }),
    prisma.customer.count({
      where: { priority: "HIGH", status: { notIn: [...WON_STATUSES, ...LOST_STATUSES] as string[] } },
    }),
    prisma.lead.count({ where: { status: { notIn: [...WON_STATUSES, ...LOST_STATUSES] as string[] } } }),
  ]);

  return {
    totalCustomers,
    newLeadsToday,
    followupsToday,
    upcomingFollowups,
    converted,
    lost,
    highPriority,
    openRequirements,
  };
}

function buildOrderBy(sort: Sort) {
  switch (sort) {
    case "oldest":
      return { createdAt: "asc" as const };
    case "updated":
      return { updatedAt: "desc" as const };
    case "followup":
      return { nextFollowUpAt: "asc" as const };
    case "priority":
      return { priority: "asc" as const }; // HIGH < LOW < MEDIUM alphabetically isn't ideal, refined below
    case "newest":
    default:
      return { createdAt: "desc" as const };
  }
}

export default async function CrmPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const q = typeof raw.q === "string" ? raw.q.trim() : "";
  const status = typeof raw.status === "string" ? raw.status : "";
  const priority = typeof raw.priority === "string" ? raw.priority : "";
  const source = typeof raw.source === "string" ? raw.source : "";
  const sort = (typeof raw.sort === "string" ? raw.sort : "newest") as Sort;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (source) where.source = source;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { mobile: { contains: q } },
      { email: { contains: q, mode: "insensitive" } },
      { company: { contains: q, mode: "insensitive" } },
      { id: { equals: q } },
    ];
  }

  const [stats, customers] = await Promise.all([
    getDashboardStats(),
    prisma.customer.findMany({
      where,
      include: { leads: { orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: buildOrderBy(sort),
      take: 200,
    }),
  ]);

  const priorityRank: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  if (sort === "priority") {
    customers.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
  }

  const cards = [
    { label: "Total Customers", value: stats.totalCustomers, icon: Users },
    { label: "New Leads Today", value: stats.newLeadsToday, icon: UserPlus },
    { label: "Follow-ups Today", value: stats.followupsToday, icon: CalendarClock },
    { label: "Upcoming Follow-ups", value: stats.upcomingFollowups, icon: CalendarCheck },
    { label: "Converted", value: stats.converted, icon: Trophy },
    { label: "Lost", value: stats.lost, icon: XCircle },
    { label: "High Priority Leads", value: stats.highPriority, icon: Flame },
    { label: "Open Requirements", value: stats.openRequirements, icon: ClipboardList },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl text-navy-950">CRM</h1>
      <p className="mt-1 text-sm text-slate-600">Every customer enquiry, in one place.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-navy-950/8 bg-white p-4">
            <c.icon className="h-4.5 w-4.5 text-gold-600" />
            <p className="mt-2 text-xl font-bold text-navy-950">{c.value}</p>
            <p className="text-[11px] text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      <form className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-navy-950/8 bg-white p-3" method="GET">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search name, mobile, email, company, customer ID"
            className="w-full rounded-lg border border-navy-950/15 py-2 pl-9 pr-3 text-sm focus:border-gold-500 focus:outline-none"
          />
        </div>
        <select name="status" defaultValue={status} className="rounded-lg border border-navy-950/15 px-2.5 py-2 text-sm">
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {LEAD_STATUS_LABELS[s as LeadStatusValue]}
            </option>
          ))}
        </select>
        <select name="priority" defaultValue={priority} className="rounded-lg border border-navy-950/15 px-2.5 py-2 text-sm">
          <option value="">All priorities</option>
          {LEAD_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {LEAD_PRIORITY_LABELS[p as LeadPriorityValue]}
            </option>
          ))}
        </select>
        <select name="source" defaultValue={source} className="rounded-lg border border-navy-950/15 px-2.5 py-2 text-sm">
          <option value="">All sources</option>
          {LEAD_SOURCES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <select name="sort" defaultValue={sort} className="rounded-lg border border-navy-950/15 px-2.5 py-2 text-sm">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="updated">Last updated</option>
          <option value="followup">Follow-up date</option>
          <option value="priority">Priority</option>
        </select>
        <button type="submit" className="rounded-lg bg-navy-950 px-4 py-2 text-sm font-semibold text-cream-50">
          Apply
        </button>
        {(q || status || priority || source || sort !== "newest") && (
          <Link href="/admin/crm" className="text-xs text-slate-500 hover:text-gold-600">
            Clear
          </Link>
        )}
      </form>

      {/* Desktop table */}
      <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-navy-950/8 bg-white md:block">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-navy-950/8 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="p-4">Customer</th>
              <th className="p-4">Latest Requirement</th>
              <th className="p-4">Status</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Next Follow-up</th>
              <th className="p-4">Source</th>
              <th className="p-4">Created</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => {
              const latest = c.leads[0];
              return (
                <tr key={c.id} className="border-b border-navy-950/8 last:border-0 hover:bg-navy-950/[0.02]">
                  <td className="p-4">
                    <Link href={`/admin/crm/${c.id}`} className="font-medium text-navy-950 hover:text-gold-600">
                      {c.name}
                    </Link>
                    <p className="text-xs text-slate-400">{c.mobile}</p>
                  </td>
                  <td className="p-4 text-slate-600">
                    {latest?.message ? latest.message.slice(0, 60) : "General enquiry"}
                    {latest?.budget ? (
                      <span className="ml-1 text-xs text-slate-400">· {formatIndianPrice(latest.budget)}</span>
                    ) : null}
                  </td>
                  <td className="p-4">
                    <Badge tone={statusTone(c.status)}>{LEAD_STATUS_LABELS[c.status as LeadStatusValue] ?? c.status}</Badge>
                  </td>
                  <td className="p-4">
                    <Badge tone={priorityTone(c.priority)}>{LEAD_PRIORITY_LABELS[c.priority as LeadPriorityValue] ?? c.priority}</Badge>
                  </td>
                  <td className="p-4 text-xs text-slate-500">
                    {c.nextFollowUpAt
                      ? new Date(c.nextFollowUpAt).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td className="p-4 text-xs text-slate-500">{c.source.replace(/_/g, " ")}</td>
                  <td className="p-4 text-xs text-slate-500">{formatDistanceToNow(c.createdAt, { addSuffix: true })}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <a href={`tel:${c.mobile}`} aria-label="Call" className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-950 hover:bg-navy-950/5">
                        <Phone className="h-4 w-4" />
                      </a>
                      <a
                        href={buildWhatsAppLink(`Hi ${c.name}, following up on your enquiry with BOK MyHome.`, toWhatsAppPhone(c.mobile))}
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
              );
            })}
            {customers.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-sm text-slate-500">
                  No customers match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mt-4 space-y-3 md:hidden">
        {customers.map((c) => {
          const latest = c.leads[0];
          return (
            <Link
              key={c.id}
              href={`/admin/crm/${c.id}`}
              className="block rounded-2xl border border-navy-950/8 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium text-navy-950">{c.name}</p>
                  <p className="text-xs text-slate-400">{c.mobile}</p>
                </div>
                <Badge tone={statusTone(c.status)}>{LEAD_STATUS_LABELS[c.status as LeadStatusValue] ?? c.status}</Badge>
              </div>
              <p className="mt-2 truncate text-xs text-slate-600">{latest?.message || "General enquiry"}</p>
              <div className="mt-2 flex items-center justify-between">
                <Badge tone={priorityTone(c.priority)}>{LEAD_PRIORITY_LABELS[c.priority as LeadPriorityValue] ?? c.priority}</Badge>
                <span className="text-[11px] text-slate-400">{formatDistanceToNow(c.createdAt, { addSuffix: true })}</span>
              </div>
            </Link>
          );
        })}
        {customers.length === 0 && (
          <p className="rounded-2xl border border-navy-950/8 bg-white p-8 text-center text-sm text-slate-500">
            No customers match these filters.
          </p>
        )}
      </div>
    </div>
  );
}
