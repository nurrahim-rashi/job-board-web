import { AdminShell } from "../components/Admin/AdminShell";
import { AnalyticsDashboard } from "../components/Analytics/AnalyticsDashboard";

export default function AdminAnalyticsPage() {
  return (
    <AdminShell
      eyebrow="Website analytics"
      title="Read the market before you post"
      lead="Demographics, salary expectations and applicant interest across the whole board, so a posting is priced and placed on evidence rather than a hunch."
    >
      <AnalyticsDashboard />
    </AdminShell>
  );
}
