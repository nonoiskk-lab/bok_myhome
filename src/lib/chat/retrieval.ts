// Turns a free-text customer question into a small, grounded slice of the
// real property database — passed to the LLM as context so it only ever
// talks about listings that actually exist, never invented ones.

import { prisma } from "@/lib/db";
import { formatIndianPrice, formatArea } from "@/lib/format";
import {
  ACTIVE_LISTING_STATUSES,
  COMPANY,
  FURNISHING_LABELS,
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
  PROPERTY_TYPES,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPES,
  type FurnishingValue,
  type PropertyStatusValue,
  type PropertyTypeValue,
  type TransactionTypeValue,
} from "@/lib/constants";

function parseBudget(text: string): number | null {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(lakh|lac|cr|crore|k)\b/i);
  if (!match) return null;
  const amount = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  const multiplier = unit.startsWith("cr") ? 1_00_00_000 : unit === "k" ? 1_000 : 1_00_000;
  return amount * multiplier;
}

function parseBhk(text: string): number | null {
  const match = text.match(/(\d)\s*-?\s*bhk/i);
  return match ? parseInt(match[1], 10) : null;
}

function parseTransactionType(text: string): TransactionTypeValue | null {
  const t = text.toLowerCase();
  if (/\brent\b|\bkiraya\b|\bkiraye\b/.test(t)) return "RENT";
  if (/\bresale\b|\bresell\b/.test(t)) return "RESALE";
  if (TRANSACTION_TYPES.some((v) => t.includes(v.toLowerCase()))) return "BUY";
  return null;
}

function parsePropertyType(text: string): PropertyTypeValue | null {
  const t = text.toLowerCase();
  if (/\bplot\b|\bland\b/.test(t)) return "PLOT";
  if (/\bvilla\b/.test(t)) return "VILLA";
  if (/\bhouse\b|\bmakan\b/.test(t)) return "HOUSE";
  if (/\bshop\b/.test(t)) return "SHOP";
  if (/\boffice\b/.test(t)) return "OFFICE";
  if (/\bcommercial\b/.test(t)) return "COMMERCIAL";
  if (/\bflat\b|\bapartment\b/.test(t)) return "APARTMENT";
  return PROPERTY_TYPES.find((v) => t.includes(v.toLowerCase())) ?? null;
}

export async function buildChatContext(userMessage: string): Promise<string> {
  const budget = parseBudget(userMessage);
  const bhk = parseBhk(userMessage);
  const transactionType = parseTransactionType(userMessage);
  const propertyType = parsePropertyType(userMessage);

  const localities = await prisma.location
    .findMany({
      where: { city: COMPANY.city },
      select: { locality: true },
      distinct: ["locality"],
    })
    .catch(() => []);

  const mentionedLocality = localities.find((l) =>
    userMessage.toLowerCase().includes(l.locality.toLowerCase())
  )?.locality;

  const where: Record<string, unknown> = {
    listingStatus: { in: ACTIVE_LISTING_STATUSES },
    ...(transactionType ? { transactionType } : {}),
    ...(propertyType ? { propertyType } : {}),
    ...(bhk ? { bedrooms: bhk } : {}),
    ...(budget ? { price: { lte: budget * 1.15 } } : {}),
    ...(mentionedLocality ? { location: { locality: mentionedLocality } } : {}),
  };

  let properties = await prisma.property
    .findMany({
      where,
      include: { location: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    })
    .catch(() => []);

  let matchedFilters = true;
  if (properties.length === 0) {
    matchedFilters = false;
    properties = await prisma.property
      .findMany({
        where: { listingStatus: { in: ACTIVE_LISTING_STATUSES } },
        include: { location: true },
        orderBy: { featured: "desc" },
        take: 6,
      })
      .catch(() => []);
  }

  const propertyLines = properties.map((p) => {
    const bits = [
      p.propertyId,
      p.title,
      PROPERTY_TYPE_LABELS[p.propertyType as PropertyTypeValue] ?? p.propertyType,
      TRANSACTION_TYPE_LABELS[p.transactionType as TransactionTypeValue] ?? p.transactionType,
      formatIndianPrice(p.price),
      p.bedrooms ? `${p.bedrooms} BHK` : null,
      formatArea(p.builtupArea),
      `${p.location.locality}, ${p.location.city}`,
      PROPERTY_STATUS_LABELS[p.status as PropertyStatusValue] ?? p.status,
      p.furnishing ? FURNISHING_LABELS[p.furnishing as FurnishingValue] : null,
    ].filter(Boolean);
    return `- ${bits.join(" | ")} (page: /properties/${p.slug})`;
  });

  const sections = [
    `Company: ${COMPANY.name}, ${COMPANY.address}. Phone/WhatsApp: ${COMPANY.phone}. Email: ${COMPANY.email}.`,
    localities.length
      ? `Areas served in ${COMPANY.city}: ${localities.map((l) => l.locality).join(", ")}.`
      : null,
    properties.length
      ? `${
          matchedFilters ? "Listings matching this query" : "No exact match — some current listings instead"
        } (use ONLY these for any price/address/size — never invent one):\n${propertyLines.join("\n")}`
      : "No listings are currently in the database.",
  ].filter(Boolean);

  return sections.join("\n\n");
}
