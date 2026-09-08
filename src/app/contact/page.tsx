import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { LeadForm } from "@/components/forms/LeadForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CallButton } from "@/components/CallButton";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with ${COMPANY.name} — call, WhatsApp or send us your property requirements.`,
};

export default function ContactPage() {
  return (
    <div className="container-page py-12">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Contact</p>
      <h1 className="mt-2 font-serif text-3xl text-navy-950 sm:text-4xl">Talk to a Property Expert</h1>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <div className="space-y-4">
            <ContactRow icon={Phone} label="Phone" value={COMPANY.phone} />
            <ContactRow icon={Mail} label="Email" value={COMPANY.email} />
            <ContactRow icon={MapPin} label="Office" value={COMPANY.address} />
            <ContactRow icon={Clock} label="Business Hours" value="Mon–Sat, 10:00 AM – 7:00 PM" />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <CallButton variant="solid" />
            <WhatsAppButton message="Hi, I'd like to speak with a property expert." />
          </div>

          <div className="mt-8 aspect-video w-full overflow-hidden rounded-2xl bg-navy-950/5">
            <iframe
              title="Office location map"
              className="h-full w-full"
              loading="lazy"
              src="https://www.openstreetmap.org/export/embed.html?bbox=86.40%2C23.78%2C86.46%2C23.82&layer=mapnik"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-navy-950/8 bg-white p-6 sm:p-8">
          <h2 className="font-semibold text-navy-950">Send Us a Message</h2>
          <p className="mt-1 text-sm text-slate-500">We typically respond within a few hours.</p>
          <div className="mt-4">
            <LeadForm source="CONTACT_FORM" messagePlaceholder="Tell us what you're looking for" submitLabel="Send Message" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-950/5 text-navy-950">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-navy-950">{value}</p>
      </div>
    </div>
  );
}
