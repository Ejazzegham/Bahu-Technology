import Navbar from "@/components/Navbar";
import AboutHero from "@/components/AboutHero";
import AboutStory from "@/components/AboutStory";
import AboutWhyJourney from "@/components/AboutWhyJourney";
import AboutMissionVision from "@/components/AboutMissionVision";
import AboutToolbox from "@/components/AboutToolbox";
import AboutJourney from "@/components/AboutJourney";
import AboutTeam from "@/components/AboutTeam";
import StatsCounter from "@/components/StatsCounter";
import WhyChoose from "@/components/WhyChoose";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Bahu Technology",
  description:
    "Learn about Bahu Technology — a creative digital agency and software development studio helping businesses grow with innovative design and robust technology.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <Navbar active="About" />
      <main>
        <AboutHero />
        <AboutStory />
        <AboutMissionVision />
        <AboutWhyJourney />
        <AboutJourney />
        <AboutTeam />
        <AboutToolbox />
        <StatsCounter />
        <WhyChoose />
        <CtaBanner
          title={
            <>
              Have a Project in Mind? <span className="text-gold">Let&apos;s Talk.</span>
            </>
          }
          subtitle="Share your vision with us, and we'll help you bring it to life with creative technology solutions."
          buttonText="LET'S TALK"
          icon="plane"
        />
      </main>
      <Footer />
    </>
  );
}
