import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { PropertyRowActions } from "@/components/admin/PropertyRowActions";
import { formatIndianPrice } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { LISTING_STATUS_LABELS, type ListingStatusValue } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminPropertiesPage() {
  const properties = await prisma.property.findMany({
    include: { location: true, images: { where: { isCover: true }, take: 1 } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-navy-950">Properties</h1>
          <p className="mt-1 text-sm text-slate-600">{properties.length} listings</p>
        </div>
        <Link
          href="/admin/properties/new"
          className="flex items-center gap-2 rounded-full bg-navy-950 px-4 py-2 text-sm font-semibold text-cream-50 hover:bg-navy-800"
        >
          <Plus className="h-4 w-4" /> Add Property
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-navy-950/8 bg-white">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-navy-950/8 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="p-4">Property</th>
              <th className="p-4">Location</th>
              <th className="p-4">Price</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id} className="border-b border-navy-950/8 last:border-0">
                <td className="p-4">
                  <Link href={`/properties/${p.slug}`} target="_blank" className="font-medium text-navy-950 hover:text-gold-600">
                    {p.title}
                  </Link>
                  <p className="text-xs text-slate-400">{p.propertyId}</p>
                </td>
                <td className="p-4 text-slate-600">
                  {p.location.locality}, {p.location.city}
                </td>
                <td className="p-4 font-medium text-navy-950">{formatIndianPrice(p.price)}</td>
                <td className="p-4">
                  <Badge tone={p.listingStatus === "SOLD" ? "red" : p.verified ? "green" : "slate"}>
                    {LISTING_STATUS_LABELS[p.listingStatus as ListingStatusValue] ?? p.listingStatus}
                  </Badge>
                </td>
                <td className="p-4">
                  <PropertyRowActions
                    id={p.id}
                    featured={p.featured}
                    verified={p.verified}
                    listingStatus={p.listingStatus}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
