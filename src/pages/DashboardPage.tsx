import { AdminPanel } from "../components/Dashboard/AdminPanel";
import { ApplicantPanel } from "../components/Dashboard/ApplicantPanel";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { DeveloperPanel } from "../components/Dashboard/DeveloperPanel";
import { useAuth } from "../stores/useAuth";
import { Link } from "react-router-dom";
import { Stars } from "../components/site/Stars";

export default function DashboardPage() {
  const role = useAuth((state) => state.user?.role);
  const user = useAuth((state) => state.user);
  return (
    <div className="workspace-dashboard">
      <Navbar />
      <main>
        {role === "JOB_SEEKER" && (
          <section className="workspace-hero">
            <div className="night-sky" />
            <Stars />
            <div className="workspace-hero-inner">
              <p className="eyebrow light">Your dashboard</p>
              <h1>Welcome back, {user?.name ?? "job seeker"}.</h1>
              <p>Keep every application, assessment, and next step in one place.</p>
              <div className="workspace-hero-actions">
                <Link className="button button-primary" to="/jobs">Browse jobs</Link>
                <Link className="button button-outline" to="/profile">Complete profile</Link>
              </div>
            </div>
          </section>
        )}
        {role === "JOB_SEEKER" && <ApplicantPanel />}
        {role === "COMPANY_ADMIN" && <AdminPanel />}
        {role === "DEVELOPER" && <DeveloperPanel />}
      </main>
      <Footer />
    </div>
  );
}
