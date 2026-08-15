import { Footer } from "../components/Footer";
import { AboutHero } from "../components/AboutPage/AboutHero";
import { ContactSection } from "../components/AboutPage/ContactSection";
import { MissionSection } from "../components/AboutPage/MissionSection";
import { StatsSection } from "../components/AboutPage/StatsSection";
import { TeamSection } from "../components/AboutPage/TeamSection";
import { ValuesSection } from "../components/AboutPage/ValuesSection";
import { Navbar } from "../components/Navbar";
export default function AboutPage() { return <div id="top" className="about-page"><Navbar /><main><AboutHero /><MissionSection /><StatsSection /><ValuesSection /><TeamSection /><ContactSection /></main><Footer /></div>; }
