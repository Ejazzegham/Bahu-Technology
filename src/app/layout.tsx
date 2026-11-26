import type { Metadata } from "next";
import localFont from "next/font/local";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import BackToTop from "@/components/BackToTop";
import GlobalMotion from "@/components/GlobalMotion";
import { getSettingsOnce } from "@/lib/firestore/settings";
import "./globals.css";

// Fonts are bundled in src/app/fonts so builds never depend on fetching
// from Google Fonts (which can fail on the build server).
const poppins = localFont({
  src: [
    { path: "./fonts/poppins-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/poppins-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/poppins-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "./fonts/poppins-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});

const inter = localFont({
  src: [
    { path: "./fonts/inter-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/inter-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/inter-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
});

// Premium serif used only by the home-page Special Offer (title + price).
const playfair = localFont({
  src: [
    { path: "./fonts/playfair-display-latin-800-normal.woff2", weight: "800", style: "normal" },
    { path: "./fonts/playfair-display-latin-900-normal.woff2", weight: "900", style: "normal" },
    { path: "./fonts/playfair-display-latin-800-italic.woff2", weight: "800", style: "italic" },
  ],
  variable: "--font-serif",
  display: "swap",
});

// Bold script used by the "Special Offer" badge on the home page.
const lobster = localFont({
  src: [{ path: "./fonts/lobster-latin-400-normal.woff2", weight: "400", style: "normal" }],
  variable: "--font-script",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getSettingsOnce();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://bahutechnology.com"),
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical: "/" },
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: "website",
      siteName: "Bahu Technology",
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettingsOnce();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bahutechnology.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Bahu Technology",
    description: settings.seo.description,
    url: siteUrl,
    telephone: settings.contactPhone,
    email: settings.contactEmail,
    address: {
      "@type": "PostalAddress",
      addressLocality: settings.address,
    },
    sameAs: Object.values(settings.social).filter(Boolean),
    image: settings.appearance.logoUrl,
  };

  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable} ${playfair.variable} ${lobster.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body antialiased">
        <GlobalMotion />
        {children}
        <BackToTop />
        <WhatsAppFloatingButton />
      </body>
    </html>
  );
}
