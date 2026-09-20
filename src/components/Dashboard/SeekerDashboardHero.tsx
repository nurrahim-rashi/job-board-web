import { useEffect, useState } from "react";
import { getHomepageData } from "../../services/auth.service";
import { getMyApplications } from "../../services/application.service";
import { useAuth } from "../../stores/useAuth";
import { Stars } from "../site/Stars";

type Stats = {
  applications: number;
  active: number;
  interviews: number;
  profileCompletion: number;
};

export function SeekerDashboardHero({ stats }: { stats?: Stats }) {
  const user = useAuth((state) => state.user);
  const [loaded, setLoaded] = useState<Stats | null>(stats ?? null);
  const firstName = user?.name.trim().split(/\s+/)[0] || "there";

  useEffect(() => {
    if (stats) {
      setLoaded(stats);
      return;
    }
    Promise.all([getMyApplications(), getHomepageData()])
      .then(([applications, homepage]) =>
        setLoaded({
          applications: applications.length,
          active: applications.filter((application) =>
            ["PENDING", "PROCESS", "INTERVIEW", "TEST_ASSIGNED"].includes(
              application.status,
            ),
          ).length,
          interviews: applications.filter(
            (application) => application.interview,
          ).length,
          profileCompletion: homepage.profileCompletion,
        }),
      )
      .catch(() =>
        setLoaded({
          applications: 0,
          active: 0,
          interviews: 0,
          profileCompletion: 0,
        }),
      );
  }, [stats]);

  return (
    <section className="workspace-hero">
      <div className="night-sky" />
      <Stars />
      <div className="workspace-hero-inner">
        <p className="eyebrow light">Application workspace</p>
        <h1>See what&rsquo;s moving, {firstName}.</h1>
        <dl className={`workspace-hero-stats ${loaded ? "" : "is-loading"}`}>
          <div>
            <dt>Applications</dt>
            <dd>{loaded?.applications ?? "N/A"}</dd>
            <small>{loaded?.active ?? "N/A"} in progress</small>
          </div>
          <div>
            <dt>Interviews</dt>
            <dd>{loaded?.interviews ?? "N/A"}</dd>
            <small>Scheduled interviews</small>
          </div>
          <div>
            <dt>Profile strength</dt>
            <dd>{loaded ? `${loaded.profileCompletion}%` : "N/A"}</dd>
            <small>Complete your profile</small>
          </div>
        </dl>
      </div>
    </section>
  );
}
