import { AdminPanel } from "../components/Dashboard/AdminPanel";
import { ApplicantPanel } from "../components/Dashboard/ApplicantPanel";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { DeveloperPanel } from "../components/Dashboard/DeveloperPanel";
import { useAuth } from "../stores/useAuth";

export default function DashboardPage() {
  const role = useAuth((state) => state.user?.role);
  return (
    <div className="workspace-dashboard">
      <Navbar />
      <main>
        {role === "JOB_SEEKER" && <ApplicantPanel />}
        {role === "COMPANY_ADMIN" && <AdminPanel />}
        {role === "DEVELOPER" && <DeveloperPanel />}
      </main>
      <Footer />
    </div>
  );
}
