import { AdminPanel } from "../components/Dashboard/AdminPanel";
import { ApplicantPanel } from "../components/Dashboard/ApplicantPanel";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { DeveloperPanel } from "../components/Dashboard/DeveloperPanel";
import { useAuth } from "../stores/useAuth";
import { useEffect, useState } from "react";
import { getMyApplications, type Application } from "../services/application.service";
import { getHomepageData } from "../services/auth.service";
import type { HomepageData } from "../types/auth";
import { SeekerDashboardShell } from "../components/Dashboard/SeekerDashboardShell";
import { SeekerDashboardHero } from "../components/Dashboard/SeekerDashboardHero";

export default function DashboardPage() {
  const role = useAuth((state) => state.user?.role);
  const [applications, setApplications] = useState<Application[]>([]);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [applicationError, setApplicationError] = useState("");
  const [recommendations, setRecommendations] = useState<HomepageData["recommendations"]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== "JOB_SEEKER") return;
    setLoading(true);
    Promise.all([getMyApplications().then(setApplications), getHomepageData().then((data) => { setProfileCompletion(data.profileCompletion); setRecommendations(data.recommendations); })]).catch((error) => setApplicationError(error instanceof Error ? error.message : "Unable to load dashboard")).finally(() => setLoading(false));
  }, [role]);

  const activeApplications = applications.filter((application) => ["PENDING", "PROCESS", "INTERVIEW", "TEST_ASSIGNED"].includes(application.status));
  const interviews = applications.filter((application) => application.interview).length;
  const appliedSlugs = new Set(applications.map((application) => application.job.slug));
  const unappliedRecommendations = recommendations.filter((job) => !appliedSlugs.has(job.slug));
  if (role === "JOB_SEEKER") return <div className="workspace-dashboard seeker-dashboard-overview"><Navbar /><main>
      <SeekerDashboardHero stats={{ applications: applications.length, active: activeApplications.length, interviews, profileCompletion }} />
      <SeekerDashboardShell><ApplicantPanel applications={applications} recommendations={unappliedRecommendations} loading={loading} error={applicationError} /></SeekerDashboardShell>
    </main><Footer /></div>;
  return (
    <div className="workspace-dashboard">
      <Navbar />
      <main>
        {role === "COMPANY_ADMIN" && <AdminPanel />}
        {role === "DEVELOPER" && <DeveloperPanel />}
      </main>
      <Footer />
    </div>
  );
}
