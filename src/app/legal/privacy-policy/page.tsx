import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="September 2026">
      <p>
        This Privacy Policy explains how {COMPANY.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects, uses and protects
        information you share with us through this website, including property enquiries, site
        visit requests and account registration.
      </p>
      <h2>Information We Collect</h2>
      <p>
        We collect information you provide directly — such as your name, phone number, email and
        property preferences — when you submit an enquiry, request a callback, book a site visit,
        register an account, or list a property for sale or rent.
      </p>
      <h2>How We Use Your Information</h2>
      <p>
        We use this information to respond to enquiries, coordinate site visits, share relevant
        property recommendations, and improve our services. We do not sell your personal
        information to third parties.
      </p>
      <h2>Sharing With Agents</h2>
      <p>
        Enquiry details may be shared with the specific agent assigned to a property or your
        enquiry so they can follow up with you directly.
      </p>
      <h2>Your Choices</h2>
      <p>
        You may request that we delete your account or enquiry data by contacting us at{" "}
        {COMPANY.email}.
      </p>
      <h2>Contact</h2>
      <p>Questions about this policy can be sent to {COMPANY.email} or {COMPANY.phone}.</p>
    </LegalPage>
  );
}
