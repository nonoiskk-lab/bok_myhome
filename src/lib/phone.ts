// Indian mobile number validation/normalization, shared by every lead-capture
// entry point (contact form, sell-your-property form, future ones).

const INDIAN_MOBILE = /^[6-9]\d{9}$/;

export interface NormalizedPhone {
  valid: boolean;
  /** Clean 10-digit form with no country code, spaces or punctuation. */
  digits: string;
  /** +91-prefixed form, for display/WhatsApp/Sheets — only when valid. */
  e164: string | null;
}

/**
 * Strips spaces/dashes/parens and an optional +91 / 91 / 0 prefix, then
 * validates the remaining 10 digits start with 6-9 (a real Indian mobile
 * range). Never invents or guesses digits — an invalid number stays invalid.
 */
export function normalizeIndianMobile(raw: string): NormalizedPhone {
  const cleaned = raw.trim().replace(/[\s\-()]/g, "");
  let digits = cleaned.replace(/\D/g, "");

  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  const valid = INDIAN_MOBILE.test(digits);
  return {
    valid,
    digits: valid ? digits : cleaned.replace(/\D/g, ""),
    e164: valid ? `+91${digits}` : null,
  };
}
