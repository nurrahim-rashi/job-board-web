import { DashboardFooter } from "../components/Homepage/DashboardFooter";
import { DashboardHeader } from "../components/Homepage/DashboardHeader";
import { DashboardHero } from "../components/Homepage/DashboardHero";
import { DashboardSidebar } from "../components/Homepage/DashboardSidebar";
import { JobFeedSection } from "../components/Homepage/JobFeedSection";

export default function Homepage() {
  return (
    <div id="top" className="dashboard-page">
      <DashboardHeader />
      <main>
        <DashboardHero />
        <div className="dashboard-layout">
          <JobFeedSection />
          <DashboardSidebar />
        </div>
      </main>
      <DashboardFooter />
    </div>
  );
}
