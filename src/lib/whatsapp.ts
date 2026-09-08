import { COMPANY } from "@/lib/constants";

export function buildWhatsAppLink(message: string, phone: string = COMPANY.whatsapp): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encoded}`;
}

export function propertyWhatsAppMessage(opts: {
  propertyId: string;
  title: string;
  locality?: string;
}): string {
  const location = opts.locality ? ` in ${opts.locality}` : "";
  return `Hi, I'm interested in ${opts.title} (Property ID #${opts.propertyId})${location}. Please share price and availability.`;
}

export function sellPropertyWhatsAppMessage(): string {
  return `Hi, I'd like to list my property for sale with ${COMPANY.name}. Please share details on how to proceed.`;
}
