import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/format";
import { PROPERTY_TYPES } from "@/lib/constants";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB per image, base64-encoded client-side
const MAX_IMAGES = 5;

const sellSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,15}$/),
  email: z.string().trim().email().optional().or(z.literal("")),
  listingIntent: z.enum(["SELL", "RENT"]),
  propertyType: z.enum(PROPERTY_TYPES),
  locality: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(100).default("Dhanbad"),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  expectedPrice: z.coerce.number().positive(),
  area: z.coerce.number().positive().optional(),
  bedrooms: z.coerce.number().int().min(0).max(10).optional(),
  propertyAge: z.coerce.number().int().min(0).max(100).optional(),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  images: z.array(z.string()).max(MAX_IMAGES).optional(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = sellSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  for (const img of data.images ?? []) {
    if (img.length > MAX_IMAGE_BYTES * 1.4) {
      return NextResponse.json({ error: "One or more images exceed the 2MB limit." }, { status: 400 });
    }
    if (!img.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid image format." }, { status: 400 });
    }
  }

  const localitySlug = slugify(data.locality);
  const location = await prisma.location.upsert({
    where: { slug: localitySlug },
    update: {},
    create: { city: data.city, locality: data.locality, slug: localitySlug },
  });

  const count = await prisma.property.count();
  const propertyId = `BOK-${20000 + count}`;
  const title = `${data.propertyType.charAt(0) + data.propertyType.slice(1).toLowerCase()} for ${
    data.listingIntent === "RENT" ? "Rent" : "Sale"
  } in ${data.locality}`;

  const property = await prisma.property.create({
    data: {
      propertyId,
      slug: `${slugify(title)}-${propertyId.toLowerCase()}`,
      title,
      description: data.description || "Details to be added by our team after verification.",
      propertyType: data.propertyType,
      transactionType: data.listingIntent === "RENT" ? "RENT" : "BUY",
      status: "RESALE",
      listingStatus: "PENDING_VERIFICATION",
      price: data.expectedPrice,
      priceNegotiable: true,
      builtupArea: data.area,
      bedrooms: data.bedrooms,
      propertyAge: data.propertyAge,
      addressLine: data.address || undefined,
      locationId: location.id,
      images: {
        create: (data.images ?? []).map((url, i) => ({ url, sortOrder: i, isCover: i === 0 })),
      },
    },
  });

  await prisma.lead.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      message: `Seller submission for ${title} — expected price ₹${data.expectedPrice}.`,
      source: "SELLER_SUBMISSION",
      status: "NEW",
      propertyId: property.id,
    },
  });

  return NextResponse.json({ ok: true, propertyId: property.propertyId }, { status: 201 });
}
