import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TechMarquee from "@/components/TechMarquee";
import FastDelivery from "@/components/FastDelivery";
import SpecialOffer from "@/components/SpecialOffer";
import Categories from "@/components/Categories";
import StatsCounter from "@/components/StatsCounter";
import WhyChoose from "@/components/WhyChoose";
import About from "@/components/About";
import Projects from "@/components/Projects";
import HomeComparison from "@/components/HomeComparison";
import HomeDeliverables from "@/components/HomeDeliverables";
import HomeGuarantees from "@/components/HomeGuarantees";
import HomeEngagement from "@/components/HomeEngagement";
import HowWeWork from "@/components/HowWeWork";
import Testimonials from "@/components/Testimonials";
import ServicePicker from "@/components/ServicePicker";
import ClientsStrip from "@/components/ClientsStrip";
import QuickQuote from "@/components/QuickQuote";
import VisitorInsights from "@/components/VisitorInsights";
import Industries from "@/components/Industries";
import PricingSnapshot from "@/components/PricingSnapshot";
import HomeCapabilities from "@/components/HomeCapabilities";
import HomeQuickPaths from "@/components/HomeQuickPaths";
import HomeTechStack from "@/components/HomeTechStack";
import HomeGetStarted from "@/components/HomeGetStarted";
import LatestPosts from "@/components/LatestPosts";
import HomeFaq from "@/components/HomeFaq";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar active="Home" />
      <main>
        <Hero />
        <TechMarquee />
        <FastDelivery variant="home" />
        <SpecialOffer />
        <Categories />
        <ServicePicker />
        <StatsCounter />
        <WhyChoose />
        <About />
        <HomeDeliverables />
        <HomeGuarantees />
        <HomeComparison />
        <Projects />
        <Industries />
        <HomeCapabilities />
        <HomeTechStack />
        <PricingSnapshot />
        <div className="pt-20">
          <HomeGetStarted />
        </div>
        <HomeEngagement />
        <div className="pb-20 pt-4">
          <HowWeWork />
        </div>
        <Testimonials />
        <QuickQuote />
        <ClientsStrip />
        <VisitorInsights />
        <LatestPosts />
        <HomeQuickPaths />
        <HomeFaq />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
