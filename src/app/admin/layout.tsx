import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Building2, Users, Home } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { COMPANY } from "@/lib/constants";
import { LogoutButton } from "@/components/admin/LogoutButton";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/properties", label: "Properties", icon: Building2 },
  { href: "/admin/leads", label: "Leads / CRM", icon: Users },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  if (!session) redirect("/login");

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-cream-100">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 md:px-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="sticky top-24 rounded-2xl border border-navy-950/8 bg-white p-4">
            <div className="mb-4 flex items-center gap-2 px-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-950 text-gold-400">
                <Home className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold text-navy-950">{COMPANY.name}</span>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-navy-900 hover:bg-navy-950/5"
                >
                  <item.icon className="h-4 w-4" /> {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 border-t border-navy-950/8 pt-4">
              <p className="px-3 text-xs text-slate-500">{session.name}</p>
              <p className="px-3 text-xs text-slate-400">{session.role.replace("_", " ")}</p>
              <LogoutButton />
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
