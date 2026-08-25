import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { DashboardHero } from "../components/Homepage/Hero";
import { DashboardSidebar } from "../components/Homepage/Sidebar";
import { JobFeedSection } from "../components/Homepage/JobFeedSection";

export default function Homepage() {
  return (
    <div id="top" className="dashboard-page">
      <Navbar />
      <main>
        <DashboardHero />
        <div className="dashboard-layout">
          <JobFeedSection />
          <DashboardSidebar />
        </div>
      </main>
      <Footer />
    </div>
  );
}
