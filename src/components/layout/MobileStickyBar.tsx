import { MessageCircle, Phone, Search, Heart, User } from "lucide-react";
import Link from "next/link";
import { COMPANY } from "@/lib/constants";
import { buildWhatsAppLink } from "@/lib/whatsapp";

// Mobile-first sticky action bar: always-reachable call/WhatsApp CTAs plus a
// compact bottom nav, per the brief's mobile-priorities section.
export function MobileStickyBar() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-navy-950/10 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.06)] md:hidden"
      aria-label="Quick actions"
    >
      <Link href="/properties" className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-navy-950">
        <Search className="h-5 w-5" />
        <span className="text-[10px] font-medium">Search</span>
      </Link>
      <Link href="/favorites" className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-navy-950">
        <Heart className="h-5 w-5" />
        <span className="text-[10px] font-medium">Saved</span>
      </Link>
      <a
        href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}
        data-event="call_click"
        className="flex flex-1 flex-col items-center justify-center gap-0.5 bg-navy-950 py-2 text-cream-50"
      >
        <Phone className="h-5 w-5" />
        <span className="text-[10px] font-medium">Call</span>
      </a>
      <a
        href={buildWhatsAppLink("Hi, I'd like help finding a property.")}
        target="_blank"
        rel="noopener noreferrer"
        data-event="whatsapp_click"
        className="flex flex-1 flex-col items-center justify-center gap-0.5 bg-green-500 py-2 text-white"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-[10px] font-medium">WhatsApp</span>
      </a>
      <Link href="/login" className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-navy-950">
        <User className="h-5 w-5" />
        <span className="text-[10px] font-medium">Account</span>
      </Link>
    </nav>
  );
}
