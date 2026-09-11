import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ApplicationModal } from "../components/JobDetail/ApplicationModal";
import { Navbar } from "../components/Navbar";
import { AuthModal } from "../components/site/AuthModal";
import { getMyJobApplication } from "../services/application.service";
import { getPublicJob, type PublicJobDetail } from "../services/job.service";
import { useAuth } from "../stores/useAuth";

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  PENDING: "CV screening",
  TEST_ASSIGNED: "Test assigned",
  PROCESS: "In review",
  INTERVIEW: "Interview",
  ACCEPTED: "Accepted",
  REJECTED: "Not selected",
};

const salary = (job: PublicJobDetail) =>
  job.salaryMin || job.salaryMax
    ? `Rp ${(job.salaryMin ?? 0).toLocaleString("id-ID")} – ${(job.salaryMax ?? 0).toLocaleString("id-ID")} / month`
    : "Salary not disclosed";

export default function JobDetailPage() {
  const { slug = "" } = useParams();
  const user = useAuth((state) => state.user);
  const [job, setJob] = useState<PublicJobDetail | null>(null);
  const [error, setError] = useState("");
  const [applyOpen, setApplyOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [checkingApplication, setCheckingApplication] = useState(false);

  useEffect(() => {
    getPublicJob(slug).then(setJob).catch((requestError) => setError(requestError.message));
  }, [slug]);

  useEffect(() => {
    if (user?.role !== "JOB_SEEKER") {
      setApplicationStatus(null);
      setCheckingApplication(false);
      return;
    }
    setCheckingApplication(true);
    getMyJobApplication(slug)
      .then((application) => setApplicationStatus(application?.status ?? null))
      .catch(() => setApplicationStatus(null))
      .finally(() => setCheckingApplication(false));
  }, [slug, user?.role]);

  const apply = () => {
    if (!user) {
      sessionStorage.setItem("authReturnTo", window.location.pathname);
      setAuthOpen(true);
      return;
    }
    if (!user.emailVerifiedAt) {
      window.alert("Verify your email before applying.");
      window.location.assign("/profile");
      return;
    }
    if (!applicationStatus && !checkingApplication) setApplyOpen(true);
  };

  const applicationLabel = applicationStatus
    ? `Application: ${statusLabels[applicationStatus] ?? applicationStatus.replaceAll("_", " ")}`
    : checkingApplication
      ? "Checking application…"
      : "Apply now";

  if (error) {
    return <><Navbar /><main className="email-action"><section><h1>Job unavailable</h1><p>{error}</p></section></main></>;
  }
  if (!job) {
    return <><Navbar /><main className="email-action"><section><p>Loading job…</p></section></main></>;
  }

  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(`Apply for ${job.title} at ${job.company.companyName} on Polaris.`);
  const applyDisabled = Boolean(applicationStatus) || checkingApplication;

  return (
    <div id="top" className="job-detail-page">
      <Navbar />
      <main>
        <section className="job-hero">
          <div className="night-sky" />
          <div>
            <p className="eyebrow light">{job.category.replaceAll("_", " ")}</p>
            <section>
              <b>{job.company.companyName[0]}</b>
              <span><h1>{job.title}</h1><p>{job.company.companyName} · {job.cityLocation}</p></span>
            </section>
            <aside>
              <button className="button button-light" onClick={apply} disabled={applyDisabled}>{applicationLabel}</button>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${url}`} target="_blank" rel="noreferrer">LinkedIn</a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${url}`} target="_blank" rel="noreferrer">Facebook</a>
              <a href={`https://twitter.com/intent/tweet?text=${text}&url=${url}`} target="_blank" rel="noreferrer">X</a>
              <a href={`https://wa.me/?text=${text}%20${url}`} target="_blank" rel="noreferrer">WhatsApp</a>
            </aside>
            <dl>
              <div><dt>Salary</dt><dd>{salary(job)}</dd></div>
              <div><dt>Location</dt><dd>{job.cityLocation}</dd></div>
              <div><dt>Deadline</dt><dd>{new Date(job.deadline).toLocaleDateString()}</dd></div>
            </dl>
          </div>
        </section>

        <section className="job-body">
          <div className="job-layout">
            <article>
              <p className="eyebrow">About the role</p>
              <p className="job-intro">{job.description}</p>
              <div className="job-tags">{Array.isArray(job.tags) && job.tags.map((tag: unknown) => <span key={String(tag)}>{String(tag)}</span>)}</div>
              {job.hasPreSelectionTest && <section className="test-card"><b>Pre-selection test required</b><p>{job.testDurationMinutes ?? 30} minutes. You can start it after the company assigns your application.</p></section>}
            </article>
            <aside className="job-rail">
              <section>
                <p className="eyebrow">{applicationStatus ? "Your application" : "Apply"}</p>
                {applicationStatus ? <p>Current status: <strong>{statusLabels[applicationStatus] ?? applicationStatus}</strong></p> : <p>{job.applicantCount} people have applied so far.</p>}
                <button className="rail-apply" onClick={apply} disabled={applyDisabled}>{applicationLabel}</button>
              </section>
              <section>
                <p className="eyebrow">About {job.company.companyName}</p>
                <p>{job.company.profileContent}</p>
                <a href={`/companies/${job.company.id}`}>View company profile</a>
              </section>
            </aside>
          </div>
          {job.relatedJobs.length > 0 && <div className="browse-results"><h2>More roles from {job.company.companyName}</h2><div className="browse-job-grid">{job.relatedJobs.map((related) => <article className="browse-job-card" key={related.slug}><h2>{related.title}</h2><p>{related.cityLocation}</p><a href={`/jobs/${related.slug}`}>View role</a></article>)}</div></div>}
        </section>
      </main>
      <ApplicationModal open={applyOpen} title={job.title} slug={job.slug} onClose={() => setApplyOpen(false)} onSubmitted={() => { setApplicationStatus("PENDING"); setApplyOpen(false); }} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
