import { Footer } from "../components/Footer";
import { FaqSection } from "../components/LandingPage/FaqSection";
import { HeroSection } from "../components/LandingPage/HeroSection";
import { ManifestoSection } from "../components/LandingPage/ManifestoSection";
import { RecentWorkSection } from "../components/LandingPage/RecentWorkSection";
import { ServicesSection } from "../components/LandingPage/ServicesSection";
import { TechnologiesSection } from "../components/LandingPage/TechnologiesSection";
import { TestimonialsSection } from "../components/LandingPage/TestimonialsSection";
import { Navbar } from "../components/Navbar";

export default function LandingPage() {
  return (
    <div id="top" className="polaris-page">
      <Navbar />
      <main>
        <HeroSection />
        <ManifestoSection />
        <TestimonialsSection />
        <TechnologiesSection />
        <ServicesSection />
        <RecentWorkSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
