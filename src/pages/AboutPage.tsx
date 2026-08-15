import { Footer } from "../components/Footer";
import { AboutHero } from "../components/AboutPage/AboutHero";
import { ContactSection } from "../components/AboutPage/ContactSection";
import { MissionSection } from "../components/AboutPage/MissionSection";
import { TeamSection } from "../components/AboutPage/TeamSection";
import { Navbar } from "../components/Navbar";
export default function AboutPage() {
  return (
    <div id="top" className="about-page">
      <Navbar />
      <main>
        <AboutHero />
        <MissionSection />
        <TeamSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
