import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";
import {
  FACING_OPTIONS,
  FURNISHING_OPTIONS,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  TRANSACTION_TYPES,
} from "@/lib/constants";

const propertySchema = z.object({
  title: z.string().trim().min(3),
  description: z.string().trim().min(10),
  propertyType: z.enum(PROPERTY_TYPES),
  transactionType: z.enum(TRANSACTION_TYPES),
  status: z.enum(PROPERTY_STATUSES),
  price: z.coerce.number().positive(),
  priceNegotiable: z.boolean().optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  builtupArea: z.coerce.number().positive().optional(),
  carpetArea: z.coerce.number().positive().optional(),
  floor: z.coerce.number().int().optional(),
  totalFloors: z.coerce.number().int().optional(),
  propertyAge: z.coerce.number().int().min(0).optional(),
  facing: z.enum(FACING_OPTIONS).optional(),
  furnishing: z.enum(FURNISHING_OPTIONS).optional(),
  parking: z.coerce.number().int().min(0).optional(),
  addressLine: z.string().trim().optional(),
  locality: z.string().trim().min(2),
  city: z.string().trim().min(2),
  featured: z.boolean().optional(),
  premium: z.boolean().optional(),
  verified: z.boolean().optional(),
  imageUrls: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = propertySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const location = await prisma.location.upsert({
    where: { slug: slugify(data.locality) },
    update: {},
    create: { city: data.city, locality: data.locality, slug: slugify(data.locality) },
  });

  const count = await prisma.property.count();
  const propertyId = `BOK-${30000 + count}`;
  const pricePerSqft = data.builtupArea ? Math.round(data.price / data.builtupArea) : undefined;

  const property = await prisma.property.create({
    data: {
      propertyId,
      slug: `${slugify(data.title)}-${propertyId.toLowerCase()}`,
      title: data.title,
      description: data.description,
      propertyType: data.propertyType,
      transactionType: data.transactionType,
      status: data.status,
      listingStatus: "PUBLISHED",
      price: data.price,
      priceNegotiable: data.priceNegotiable ?? false,
      pricePerSqft,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      builtupArea: data.builtupArea,
      carpetArea: data.carpetArea,
      floor: data.floor,
      totalFloors: data.totalFloors,
      propertyAge: data.propertyAge,
      facing: data.facing,
      furnishing: data.furnishing,
      parking: data.parking,
      addressLine: data.addressLine,
      featured: data.featured ?? false,
      premium: data.premium ?? false,
      verified: data.verified ?? false,
      locationId: location.id,
      images: {
        create: (data.imageUrls?.length ? data.imageUrls : ["/images/properties/prop-1.svg"]).map(
          (url, i) => ({ url, sortOrder: i, isCover: i === 0 })
        ),
      },
    },
  });

  return NextResponse.json({ ok: true, id: property.id, slug: property.slug }, { status: 201 });
}
