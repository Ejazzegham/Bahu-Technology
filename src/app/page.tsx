import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TechMarquee from "@/components/TechMarquee";
import Categories from "@/components/Categories";
import StatsCounter from "@/components/StatsCounter";
import WhyChoose from "@/components/WhyChoose";
import About from "@/components/About";
import Projects from "@/components/Projects";
import HowWeWork from "@/components/HowWeWork";
import Testimonials from "@/components/Testimonials";
import ServicePicker from "@/components/ServicePicker";
import ClientsStrip from "@/components/ClientsStrip";
import QuickQuote from "@/components/QuickQuote";
import VisitorInsights from "@/components/VisitorInsights";
import Industries from "@/components/Industries";
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
        <Categories />
        <ServicePicker />
        <StatsCounter />
        <WhyChoose />
        <About />
        <Projects />
        <Industries />
        <div className="pb-20 pt-4">
          <HowWeWork />
        </div>
        <Testimonials />
        <QuickQuote />
        <ClientsStrip />
        <VisitorInsights />
        <LatestPosts />
        <HomeFaq />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
