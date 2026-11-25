import Navbar from "@/components/Navbar";
import PortfolioHero from "@/components/PortfolioHero";
import PortfolioFeatured from "@/components/PortfolioFeatured";
import PortfolioGrid from "@/components/PortfolioGrid";
import PortfolioStatsCta from "@/components/PortfolioStatsCta";
import PortfolioProcess from "@/components/PortfolioProcess";
import PortfolioFaq from "@/components/PortfolioFaq";
import Testimonials from "@/components/Testimonials";
import TechMarquee from "@/components/TechMarquee";
import Footer from "@/components/Footer";
import { getAllProjects } from "@/lib/projects";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio — Bahu Technology",
  description:
    "Explore Bahu Technology's recent projects across graphic design, web, mobile, and desktop software development.",
  alternates: { canonical: "/portfolio" },
};

export default async function PortfolioPage() {
  const projects = await getAllProjects();

  return (
    <>
      <Navbar active="Portfolio" />
      <main>
        <PortfolioHero />
        <PortfolioFeatured projects={projects} />
        <PortfolioGrid projects={projects} />
        <PortfolioProcess />
        <Testimonials />
        <PortfolioFaq />
        <PortfolioStatsCta />
        <TechMarquee />
      </main>
      <Footer />
    </>
  );
}
