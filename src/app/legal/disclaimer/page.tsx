import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = { title: "Property Disclaimer" };

export default function DisclaimerPage() {
  return (
    <LegalPage title="Property Disclaimer" updated="September 2026">
      <h2>For Buyers</h2>
      <p>
        Property images, descriptions and pricing are provided for informational purposes. A
        &ldquo;Verified&rdquo; badge indicates our team reviewed basic listing accuracy — it is not a legal
        title verification. Buyers must independently verify ownership documents, encumbrance
        status and dues before making any payment or agreement.
      </p>
      <h2>For Sellers</h2>
      <p>
        Submitting a property for listing does not guarantee a sale within any timeframe.
        {" "}
        {COMPANY.name} may decline or remove a listing that does not meet our review standards.
      </p>
      <h2>Investment Estimates</h2>
      <p>
        Any references to &ldquo;potential&rdquo; rental yield, appreciation or investment score are estimates
        based on available market information at the time of publishing. They are not guarantees
        of future performance and should not be treated as financial advice.
      </p>
      <h2>Third-Party Services</h2>
      <p>
        References to home loan providers or other third-party services are for convenience only.
        {" "}
        {COMPANY.name} is not responsible for the terms, approval or performance of third-party
        services.
      </p>
    </LegalPage>
  );
}
