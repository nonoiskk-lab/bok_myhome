import type { Prisma } from "@prisma/client";
import { ACTIVE_LISTING_STATUSES } from "@/lib/constants";

export interface PropertySearchParams {
  page?: string;
  q?: string;
  city?: string;
  locality?: string;
  type?: string; // comma separated PropertyType
  transaction?: string; // BUY | RESALE | RENT
  status?: string; // comma separated PropertyStatus
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string; // comma separated
  minArea?: string;
  maxArea?: string;
  furnishing?: string;
  facing?: string;
  verifiedOnly?: string;
  amenities?: string; // comma separated amenity names, all must match
  sort?: string; // newest | price-asc | price-desc | area-desc
}

export function buildPropertyWhere(params: PropertySearchParams): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = {
    listingStatus: { in: ACTIVE_LISTING_STATUSES },
  };

  if (params.q) {
    where.OR = [
      { title: { contains: params.q } },
      { description: { contains: params.q } },
      { addressLine: { contains: params.q } },
      { location: { locality: { contains: params.q } } },
      { location: { city: { contains: params.q } } },
    ];
  }

  if (params.city) {
    where.location = { ...(where.location as object), city: { equals: params.city } };
  }

  if (params.locality) {
    where.location = { ...(where.location as object), locality: { equals: params.locality } };
  }

  if (params.type) {
    where.propertyType = { in: params.type.split(",").filter(Boolean) };
  }

  if (params.transaction) {
    where.transactionType = params.transaction;
  }

  if (params.status) {
    where.status = { in: params.status.split(",").filter(Boolean) };
  }

  if (params.minPrice || params.maxPrice) {
    where.price = {
      ...(params.minPrice ? { gte: Number(params.minPrice) } : {}),
      ...(params.maxPrice ? { lte: Number(params.maxPrice) } : {}),
    };
  }

  if (params.bedrooms) {
    const values = params.bedrooms.split(",").map(Number).filter(Boolean);
    if (values.length) {
      const hasFivePlus = values.includes(5);
      where.OR = [
        ...(where.OR ?? []),
        ...(hasFivePlus ? [{ bedrooms: { gte: 5 } }] : []),
        ...(values.filter((v) => v !== 5).length
          ? [{ bedrooms: { in: values.filter((v) => v !== 5) } }]
          : []),
      ];
    }
  }

  if (params.minArea || params.maxArea) {
    where.builtupArea = {
      ...(params.minArea ? { gte: Number(params.minArea) } : {}),
      ...(params.maxArea ? { lte: Number(params.maxArea) } : {}),
    };
  }

  if (params.furnishing) {
    where.furnishing = { in: params.furnishing.split(",").filter(Boolean) };
  }

  if (params.facing) {
    where.facing = { in: params.facing.split(",").filter(Boolean) };
  }

  if (params.verifiedOnly === "true") {
    where.verified = true;
  }

  if (params.amenities) {
    const names = params.amenities.split(",").filter(Boolean);
    if (names.length) {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        ...names.map((name) => ({ amenities: { some: { amenity: { name } } } })),
      ];
    }
  }

  return where;
}

export function buildPropertyOrderBy(sort?: string): Prisma.PropertyOrderByWithRelationInput {
  switch (sort) {
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "area-desc":
      return { builtupArea: "desc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}
