import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ApplicationModal } from "../components/JobDetail/ApplicationModal";
import { Navbar } from "../components/Navbar";
import { AuthModal } from "../components/site/AuthModal";
import { getMyJobApplication } from "../services/application.service";
import { getPublicJob, type PublicJobDetail } from "../services/job.service";
import { useAuth } from "../stores/useAuth";
import { isNewJob } from "../lib/job-age";
import { categoryLabel } from "../types/job-posting";
import { ShareJobModal } from "../components/JobDetail/ShareJobModal";
import { Calendar, MapPin, Share, Wallet } from "../components/site/Icons";

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
  const [shareOpen, setShareOpen] = useState(false);
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
    return <div className="job-detail-page job-detail-loading" aria-busy="true" aria-label="Loading job details"><Navbar /><main><section className="job-hero job-loading-hero"><div className="night-sky" /><div><i className="job-skeleton eyebrow-skeleton" /><i className="job-skeleton title-skeleton" /><i className="job-skeleton subtitle-skeleton" /><div className="job-loading-actions"><i className="job-skeleton button-skeleton" /><i className="job-skeleton button-skeleton small" /></div></div></section><section className="job-body"><div className="job-layout"><article className="job-role-card"><i className="job-skeleton eyebrow-skeleton dark" /><div className="job-loading-facts">{Array.from({ length: 3 }, (_, index) => <i className="job-skeleton fact-skeleton" key={index} />)}</div><i className="job-skeleton copy-skeleton wide" /><i className="job-skeleton copy-skeleton" /><i className="job-skeleton copy-skeleton medium" /></article><aside className="job-rail"><i className="job-skeleton rail-skeleton" /><i className="job-skeleton rail-skeleton tall" /></aside></div></section></main></div>;
  }

  const applyDisabled = Boolean(applicationStatus) || checkingApplication;

  return (
    <div id="top" className="job-detail-page">
      <Navbar />
      <main>
        <section className="job-hero">
          <div className="night-sky" />
          <div>
            <p className="eyebrow light">{categoryLabel(job.category)}</p>
            <section>
              <b>{job.company.companyName[0]}</b>
              <span><h1>{job.title} {isNewJob(job.createdAt) && <i className="new-job-badge">NEW</i>}</h1><p>{job.company.companyName} · {job.cityLocation}</p></span>
            </section>
            <aside>
              <button className="button button-light" onClick={apply} disabled={applyDisabled}>{applicationLabel}</button>
              <button type="button" onClick={() => setShareOpen(true)}><Share />Share</button>
            </aside>
          </div>
        </section>

        <section className="job-body">
          <div className="job-layout">
            <article className="job-role-card">
              <p className="eyebrow">About the role</p>
              <section className="job-inline-facts">
                <div><Wallet /><span><small>Salary</small><b>{salary(job)}</b></span></div>
                <div><MapPin /><span><small>Location</small><b>{job.cityLocation}</b></span></div>
                <div><Calendar /><span><small>Deadline</small><b>{new Date(job.deadline).toLocaleDateString("en-GB", { dateStyle: "long" })}</b></span></div>
              </section>
              <section className="job-description-section">
                <h2>Job description</h2>
                <p className="job-intro">{job.description}</p>
              </section>
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
                <dl className="company-post-meta">
                  <div><dt>Posted by</dt><dd><a href={`/profile/${job.company.postedBy.id}`}>{job.company.postedBy.name}</a> from {job.company.companyName}</dd></div>
                  <div><dt>When</dt><dd>{new Date(job.createdAt).toLocaleDateString("en-GB", { dateStyle: "long" })}</dd></div>
                </dl>
                <a href={`/companies/${job.company.id}`}>View company profile</a>
                {job.relatedJobs.length > 0 && <div className="company-more-roles"><p className="eyebrow">More roles</p>{job.relatedJobs.map((related) => <a href={`/jobs/${related.slug}`} key={related.slug}><span><b>{related.title} {isNewJob(related.createdAt) && <i className="new-job-badge">NEW</i>}</b><small>{related.cityLocation}</small></span></a>)}</div>}
              </section>
            </aside>
          </div>
        </section>
      </main>
      <ApplicationModal open={applyOpen} title={job.title} slug={job.slug} onClose={() => setApplyOpen(false)} onSubmitted={() => { setApplicationStatus("PENDING"); setApplyOpen(false); }} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <ShareJobModal open={shareOpen} title={job.title} company={job.company.companyName} url={window.location.href} onClose={() => setShareOpen(false)} />
    </div>
  );
}
