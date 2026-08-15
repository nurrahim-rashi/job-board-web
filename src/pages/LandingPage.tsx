import { Footer } from "../components/Footer";
import { ApplicantBenefits } from "../components/LandingPage/ApplicantBenefits";
import { FaqSection } from "../components/LandingPage/FaqSection";
import { HeroSection } from "../components/LandingPage/HeroSection";
import { HiringConstellation } from "../components/LandingPage/HiringConstellation";
import { SubscribeSection } from "../components/LandingPage/SubscribeSection";
import { ServicesSection } from "../components/LandingPage/ServicesSection";
import { TestimonialsSection } from "../components/LandingPage/TestimonialsSection";
import { Navbar } from "../components/Navbar";

export default function LandingPage() {
  return (
    <div id="top" className="polaris-page">
      <Navbar />
      <main>
        <HeroSection />
        <ApplicantBenefits />
        <HiringConstellation />
        <ServicesSection />
        <SubscribeSection />
        <TestimonialsSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
