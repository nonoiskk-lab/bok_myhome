"use client";

import { useState } from "react";
import { CalendarClock, PhoneCall } from "lucide-react";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CallButton } from "@/components/CallButton";
import { Modal } from "@/components/ui/Modal";
import { LeadForm } from "@/components/forms/LeadForm";
import { propertyWhatsAppMessage } from "@/lib/whatsapp";

export function PropertyCTABar({
  propertyId,
  propertyDbId,
  title,
  locality,
}: {
  propertyId: string;
  propertyDbId: string;
  title: string;
  locality: string;
}) {
  const [modal, setModal] = useState<"visit" | "callback" | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <CallButton variant="solid" className="w-full" />
        <WhatsAppButton
          className="w-full"
          message={propertyWhatsAppMessage({ propertyId, title, locality })}
        />
        <button
          onClick={() => setModal("visit")}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-navy-950/20 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:border-navy-950"
        >
          <CalendarClock className="h-4 w-4" /> Schedule Visit
        </button>
        <button
          onClick={() => setModal("callback")}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-navy-950/20 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:border-navy-950"
        >
          <PhoneCall className="h-4 w-4" /> Request Callback
        </button>
      </div>

      <Modal open={modal === "visit"} onClose={() => setModal(null)} title="Schedule a Site Visit">
        <LeadForm
          source="SITE_VISIT_REQUEST"
          propertyId={propertyDbId}
          showVisitDate
          messagePlaceholder="Preferred time of day (e.g. weekday evening)"
          submitLabel="Book Site Visit"
          onSuccess={() => setTimeout(() => setModal(null), 1500)}
        />
      </Modal>

      <Modal open={modal === "callback"} onClose={() => setModal(null)} title="Request a Callback">
        <LeadForm
          source="CALLBACK_REQUEST"
          propertyId={propertyDbId}
          showMessage={false}
          submitLabel="Request Callback"
          onSuccess={() => setTimeout(() => setModal(null), 1500)}
        />
      </Modal>
    </>
  );
}
