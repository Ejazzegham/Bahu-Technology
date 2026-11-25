import Navbar from "@/components/Navbar";
import ContactHero from "@/components/ContactHero";
import ContactQuickActions from "@/components/ContactQuickActions";
import ContactNextSteps from "@/components/ContactNextSteps";
import ContactHeroForm from "@/components/ContactHeroForm";
import ContactTopics from "@/components/ContactTopics";
import ContactPerks from "@/components/ContactPerks";
import ContactWhyReach from "@/components/ContactWhyReach";
import HomeFaq from "@/components/HomeFaq";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Bahu Technology",
  description:
    "Get in touch with Bahu Technology. Send us a message, find our office, or reach out by phone or email.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <Navbar active="Contact" />
      <main>
        <ContactHero />
        <ContactTopics />
        <ContactQuickActions />
        <ContactHeroForm />
        <ContactNextSteps />
        <ContactPerks />
        <ContactWhyReach />
        <HomeFaq />
        <CtaBanner
          title={
            <>
              Have a Project in Mind? <span className="text-gold">Let&apos;s Talk.</span>
            </>
          }
          subtitle="Share your vision with us, and we'll help you bring it to life with creative technology solutions."
          buttonText="LET'S TALK"
          icon="headset"
        />
      </main>
      <Footer />
    </>
  );
}
