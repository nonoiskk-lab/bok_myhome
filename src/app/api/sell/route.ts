import { NextResponse, after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/format";
import { PROPERTY_TYPES } from "@/lib/constants";
import { normalizeIndianMobile } from "@/lib/phone";
import { captureLead } from "@/lib/crm";
import { syncLead } from "@/lib/leads/sync";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB per image, base64-encoded client-side
const MAX_IMAGES = 5;

const sellSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(1).max(20),
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
  const phone = normalizeIndianMobile(data.phone);
  if (!phone.valid) {
    return NextResponse.json(
      { error: { formErrors: [], fieldErrors: { phone: ["Please enter a valid 10-digit Indian mobile number"] } } },
      { status: 400 }
    );
  }

  for (const img of data.images ?? []) {
    if (img.length > MAX_IMAGE_BYTES * 1.4) {
      return NextResponse.json({ error: "One or more images exceed the 2MB limit." }, { status: 400 });
    }
    if (!img.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid image format." }, { status: 400 });
    }
  }

  const recentDuplicate = await prisma.lead.findFirst({
    where: {
      phone: phone.digits,
      source: "SELLER_SUBMISSION",
      createdAt: { gte: new Date(Date.now() - 2 * 60 * 1000) },
    },
    orderBy: { createdAt: "desc" },
    include: { property: { select: { propertyId: true } } },
  });
  if (recentDuplicate?.property) {
    return NextResponse.json({ ok: true, propertyId: recentDuplicate.property.propertyId }, { status: 200 });
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

  let result;
  try {
    result = await captureLead({
      name: data.name,
      phone: phone.digits,
      email: data.email || undefined,
      message: `Seller submission for ${title} — expected price ₹${data.expectedPrice}.`,
      budget: data.expectedPrice,
      source: "SELLER_SUBMISSION",
      propertyId: property.id,
    });
  } catch (err) {
    console.error("[api/sell] failed to save lead for new property listing:", err);
    return NextResponse.json(
      { error: "Something went wrong while submitting your details. Please try again." },
      { status: 500 }
    );
  }

  after(() => syncLead(result.leadId));

  return NextResponse.json({ ok: true, propertyId: property.propertyId }, { status: 201 });
}
