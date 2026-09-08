import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Used by the client-side favorites/compare pages, which only know property
// ids (stored in localStorage) and need the corresponding property data.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids");
  if (!idsParam) return NextResponse.json({ properties: [] });

  const ids = idsParam.split(",").filter(Boolean).slice(0, 20);
  if (ids.length === 0) return NextResponse.json({ properties: [] });

  const properties = await prisma.property.findMany({
    where: { id: { in: ids } },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      location: true,
      amenities: { include: { amenity: true } },
    },
  });

  // Preserve the caller's ordering (most-recently-added first, etc.)
  const byId = new Map(properties.map((p) => [p.id, p]));
  const ordered = ids.map((id) => byId.get(id)).filter(Boolean);

  return NextResponse.json({ properties: ordered });
}
