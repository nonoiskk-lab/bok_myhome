import type { Prisma } from "@prisma/client";

export const propertyCardInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  location: true,
} satisfies Prisma.PropertyInclude;

export type PropertyCardData = Prisma.PropertyGetPayload<{ include: typeof propertyCardInclude }>;

export const propertyDetailInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  location: true,
  amenities: { include: { amenity: true } },
  agent: { include: { user: true } },
  documents: true,
} satisfies Prisma.PropertyInclude;

export type PropertyDetailData = Prisma.PropertyGetPayload<{
  include: typeof propertyDetailInclude;
}>;
