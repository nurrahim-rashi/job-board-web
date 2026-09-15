import { useEffect, useState } from "react";
import { getHomepageData } from "../../services/auth.service";
import { getMyApplications } from "../../services/application.service";
import { useAuth } from "../../stores/useAuth";
import { Stars } from "../site/Stars";

type Stats = { applications: number; active: number; interviews: number; profileCompletion: number };

export function SeekerDashboardHero({ stats }: { stats?: Stats }) {
  const user = useAuth((state) => state.user);
  const [loaded, setLoaded] = useState<Stats | null>(stats ?? null);

  useEffect(() => {
    if (stats) { setLoaded(stats); return; }
    Promise.all([getMyApplications(), getHomepageData()]).then(([applications, homepage]) => setLoaded({
      applications: applications.length,
      active: applications.filter((application) => ["PENDING", "PROCESS", "INTERVIEW", "TEST_ASSIGNED"].includes(application.status)).length,
      interviews: applications.filter((application) => application.interview).length,
      profileCompletion: homepage.profileCompletion,
    })).catch(() => setLoaded({ applications: 0, active: 0, interviews: 0, profileCompletion: 0 }));
  }, [stats]);

  return <section className="workspace-hero"><div className="night-sky" /><Stars /><div className="workspace-hero-inner">
    <p className="eyebrow light">Application workspace</p>
    <h1>See what&rsquo;s moving, {user?.name ?? "job seeker"}.</h1>
    <p>Track every application, interview, and next step in one place.</p>
    <dl className={`workspace-hero-stats ${loaded ? "" : "is-loading"}`}>
      <div><dt>Applications</dt><dd>{loaded?.applications ?? "—"}</dd><small>{loaded?.active ?? "—"} in progress</small></div>
      <div><dt>Interviews</dt><dd>{loaded?.interviews ?? "—"}</dd><small>Scheduled interviews</small></div>
      <div><dt>Profile strength</dt><dd>{loaded ? `${loaded.profileCompletion}%` : "—"}</dd><small>Complete your profile</small></div>
    </dl>
  </div></section>;
}
