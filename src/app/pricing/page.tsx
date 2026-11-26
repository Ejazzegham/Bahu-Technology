import Navbar from "@/components/Navbar";
import PricingHero from "@/components/PricingHero";
import FastDelivery from "@/components/FastDelivery";
import PricingExplorer from "@/components/PricingExplorer";
import PricingTrustBar from "@/components/PricingTrustBar";
import HowWeWork from "@/components/HowWeWork";
import PricingFAQ from "@/components/PricingFAQ";
import WhyChoose from "@/components/WhyChoose";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Bahu Technology",
  description:
    "Explore Bahu Technology's pricing packages for logo design, web development, mobile apps, branding, and more.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <Navbar active="Pricing" />
      <main>
        <PricingHero />
        <FastDelivery variant="pricing" />
        <PricingExplorer />
        <PricingTrustBar />
        <HowWeWork />
        <WhyChoose />
        <PricingFAQ />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
