import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { AnalyticsDashboard } from "../components/Analytics/AnalyticsDashboard";

export default function DeveloperAnalyticsPage() {
  return (
    <div className="workspace-dashboard">
      <Navbar />

      <main>
        <section className="role-panel analytics-page">
          <div className="analytics-intro">
            <p className="eyebrow">Developer tools</p>
            <h1>Website analytics</h1>
            <p>
              Everything the board knows about its own traffic: who signs up, what they earn,
              what they apply to, and how employers respond.
            </p>
          </div>

          <AnalyticsDashboard />
        </section>
      </main>

      <Footer />
    </div>
  );
}
