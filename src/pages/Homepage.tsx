import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { HeroSection } from "../components/Homepage/Hero";
import { Sidebar } from "../components/Homepage/Sidebar";
import { JobFeedSection } from "../components/Homepage/JobFeedSection";

export default function Homepage() {
  return (
    <div id="top" className="dashboard-page">
      <Navbar />
      <main>
        <HeroSection />
        <div className="dashboard-layout">
          <JobFeedSection />
          <Sidebar />
        </div>
      </main>
      <Footer />
    </div>
  );
}
