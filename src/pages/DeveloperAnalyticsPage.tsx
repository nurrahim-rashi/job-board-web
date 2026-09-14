import { AnalyticsDashboard } from "../components/Analytics/AnalyticsDashboard";
import { DeveloperShell } from "../components/Developer/DeveloperShell";

export default function DeveloperAnalyticsPage() {
  return (
    <DeveloperShell
      eyebrow="Developer tools"
      title="Website analytics"
      lead="Everything the board knows about its own traffic: who signs up, what they earn, what they apply to, and how employers respond."
    >
      <section className="role-panel analytics-page">
        <AnalyticsDashboard />
      </section>
    </DeveloperShell>
  );
}
