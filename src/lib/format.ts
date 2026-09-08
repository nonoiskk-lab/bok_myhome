// Indian-currency-aware formatting helpers used throughout the property UI.

export function formatIndianPrice(amount: number): string {
  if (amount >= 1_00_00_000) {
    return `₹${trimDecimal(amount / 1_00_00_000)} Cr`;
  }
  if (amount >= 1_00_000) {
    return `₹${trimDecimal(amount / 1_00_000)} Lakh`;
  }
  if (amount >= 1_000) {
    return `₹${trimDecimal(amount / 1_000)}K`;
  }
  return `₹${amount}`;
}

function trimDecimal(value: number): string {
  return value % 1 === 0 ? value.toFixed(0) : value.toFixed(2).replace(/0$/, "");
}

export function formatIndianNumber(amount: number): string {
  return new Intl.NumberFormat("en-IN").format(Math.round(amount));
}

export function formatArea(sqft?: number | null): string {
  if (!sqft) return "-";
  return `${formatIndianNumber(sqft)} sq.ft`;
}

export function toWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
