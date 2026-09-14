import { AdminPanel } from "../components/Dashboard/AdminPanel";
import { ApplicantPanel } from "../components/Dashboard/ApplicantPanel";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { DeveloperPanel } from "../components/Dashboard/DeveloperPanel";
import { useAuth } from "../stores/useAuth";
import { Stars } from "../components/site/Stars";
import { useEffect, useState } from "react";
import { getMyApplications, type Application } from "../services/application.service";
import { getHomepageData } from "../services/auth.service";
import type { HomepageData } from "../types/auth";
import { SeekerDashboardShell } from "../components/Dashboard/SeekerDashboardShell";

export default function DashboardPage() {
  const role = useAuth((state) => state.user?.role);
  const user = useAuth((state) => state.user);
  const [applications, setApplications] = useState<Application[]>([]);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [applicationError, setApplicationError] = useState("");
  const [recommendations, setRecommendations] = useState<HomepageData["recommendations"]>([]);

  useEffect(() => {
    if (role !== "JOB_SEEKER") return;
    getMyApplications().then(setApplications).catch((error) => setApplicationError(error instanceof Error ? error.message : "Unable to load applications"));
    getHomepageData().then((data) => { setProfileCompletion(data.profileCompletion); setRecommendations(data.recommendations); }).catch(() => { setProfileCompletion(0); setRecommendations([]); });
  }, [role]);

  const activeApplications = applications.filter((application) => ["PENDING", "PROCESS", "INTERVIEW", "TEST_ASSIGNED"].includes(application.status));
  const interviews = applications.filter((application) => application.interview).length;
  const appliedSlugs = new Set(applications.map((application) => application.job.slug));
  const unappliedRecommendations = recommendations.filter((job) => !appliedSlugs.has(job.slug));
  if (role === "JOB_SEEKER") return <div className="workspace-dashboard seeker-dashboard-overview"><Navbar /><main>
      <section className="workspace-hero"><div className="night-sky" /><Stars /><div className="workspace-hero-inner">
        <p className="eyebrow light">Application workspace</p><h1>See what&rsquo;s moving, {user?.name ?? "job seeker"}.</h1><p>Track every application, interview, and next step in one place.</p>
        <dl className="workspace-hero-stats"><div><dt>Applications</dt><dd>{applications.length}</dd><small>{activeApplications.length} in progress</small></div><div><dt>Interviews</dt><dd>{interviews}</dd><small>Scheduled interviews</small></div><div><dt>Profile strength</dt><dd>{profileCompletion}%</dd><small>Complete your profile</small></div></dl>
      </div></section>
      <SeekerDashboardShell><ApplicantPanel applications={applications} recommendations={unappliedRecommendations} error={applicationError} /></SeekerDashboardShell>
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
