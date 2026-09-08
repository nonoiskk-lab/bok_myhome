import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileStickyBar } from "@/components/layout/MobileStickyBar";
import { COMPANY } from "@/lib/constants";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const serifDisplay = DM_Serif_Display({
  variable: "--font-serif-display",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bokmyhome.com"),
  title: {
    default: `${COMPANY.name} — Find a Property You'll Love in ${COMPANY.city}`,
    template: `%s | ${COMPANY.name}`,
  },
  description:
    "Buy, sell, resell and rent verified houses, flats, villas, plots and commercial properties in Dhanbad. Trusted local expertise, transparent listings, real support from search to sale.",
  keywords: [
    "properties in Dhanbad",
    "flats for sale in Dhanbad",
    "resale flats Dhanbad",
    "2 BHK flat Dhanbad",
    "3 BHK flat Dhanbad",
    "house for sale Dhanbad",
    "property dealer Dhanbad",
    "plots for sale Dhanbad",
  ],
  openGraph: {
    title: `${COMPANY.name} — Find a Property You'll Love`,
    description:
      "Buy, sell, resell and rent verified properties in Dhanbad with a trusted local team.",
    siteName: COMPANY.name,
    type: "website",
    locale: "en_IN",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: COMPANY.name,
  description:
    "Real estate marketplace for buying, selling, reselling and renting property in Dhanbad, Jharkhand.",
  url: "https://www.bokmyhome.com",
  telephone: COMPANY.phone,
  email: COMPANY.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: COMPANY.address,
    addressLocality: COMPANY.city,
    addressRegion: "Jharkhand",
    addressCountry: "IN",
  },
  areaServed: COMPANY.city,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${serifDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream-50 text-navy-950">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Header />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <Footer />
        <MobileStickyBar />
      </body>
    </html>
  );
}
