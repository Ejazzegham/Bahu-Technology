import Navbar from "@/components/Navbar";
import AllServicesHero from "@/components/AllServicesHero";
import AllServicesGrid from "@/components/AllServicesGrid";
import AllServicesIncluded from "@/components/AllServicesIncluded";
import HowWeWork from "@/components/HowWeWork";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Services — Web Design, Mobile Apps, Graphic Design & Software | Bahu Technology",
  description:
    "Explore every Bahu Technology service in one place: web design & development, mobile apps, graphic design and custom desktop software — with premium features included in every project.",
  alternates: { canonical: "/services" },
};

export default function AllServicesPage() {
  return (
    <>
      <Navbar active="Services" />
      <main>
        <AllServicesHero />
        <AllServicesGrid />
        <AllServicesIncluded />
        <div className="pb-20 pt-4">
          <HowWeWork />
        </div>
        <CtaBanner
          title={
            <>
              Not sure which service you need? <span className="text-gold">Let&apos;s figure it out.</span>
            </>
          }
          subtitle="Tell us about your idea — we'll recommend the right mix of design, development and branding."
          buttonText="GET A FREE QUOTE"
          icon="logo"
        />
      </main>
      <Footer />
    </>
  );
}
