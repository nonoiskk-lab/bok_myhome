import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions" updated="September 2026">
      <p>
        By using this website, you agree to the following terms. Please read them carefully before
        submitting a property enquiry, listing a property, or creating an account.
      </p>
      <h2>Listing Accuracy</h2>
      <p>
        Property details are provided by owners, agents or our team and are subject to change. We
        make reasonable efforts to verify listings marked &ldquo;Verified&rdquo; but do not guarantee complete
        accuracy of every detail, and buyers should independently confirm information before
        transacting.
      </p>
      <h2>No Brokerage Guarantee</h2>
      <p>
        {COMPANY.name} facilitates connections between buyers, sellers, landlords and tenants. We
        are not a party to any resulting sale or rental agreement unless explicitly stated.
      </p>
      <h2>User Conduct</h2>
      <p>
        You agree not to submit false information, misuse contact forms, or use this site for any
        unlawful purpose.
      </p>
      <h2>Limitation of Liability</h2>
      <p>
        {COMPANY.name} is not liable for losses arising from reliance on listing information,
        third-party services, or communications between users.
      </p>
      <h2>Changes to These Terms</h2>
      <p>We may update these terms from time to time. Continued use of the site constitutes acceptance of the revised terms.</p>
    </LegalPage>
  );
}
