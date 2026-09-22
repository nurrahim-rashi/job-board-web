import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ApplicationModal } from "../components/JobDetail/ApplicationModal";
import { Navbar } from "../components/Navbar";
import { AuthModal } from "../components/site/AuthModal";
import {
  getMyJobApplication,
  type JobApplicationStatus,
} from "../services/application.service";
import { getPublicJob, type PublicJobDetail } from "../services/job.service";
import { useAuth } from "../stores/useAuth";
import { isNewJob } from "../lib/job-age";
import { categoryLabel } from "../types/job-posting";
import { ShareJobModal } from "../components/JobDetail/ShareJobModal";
import { ExpandableContent } from "../components/site/ExpandableContent";
import { RichText } from "../components/site/RichText";
import { SalaryConverter } from "../components/JobDetail/SalaryConverter";
import {
  Bookmark,
  Calendar,
  MapPin,
  Share,
  Wallet,
} from "../components/site/Icons";
import { applicationStatusLabel } from "../lib/application-status";
import { formatJobLocation } from "../lib/location";
import { StatusBadge } from "../components/site/StatusBadge";
import { formatCurrencyRange } from "../lib/currency";
import { toast } from "react-hot-toast";

const salary = (job: PublicJobDetail) =>
  job.salaryMin || job.salaryMax
    ? `${formatCurrencyRange(job.salaryMin, job.salaryMax, job.salaryCurrency)} / month`
    : "Salary not disclosed";

export default function JobDetailPage() {
  const { slug = "" } = useParams();
  const user = useAuth((state) => state.user);
  const [job, setJob] = useState<PublicJobDetail | null>(null);
  const [error, setError] = useState("");
  const [applyOpen, setApplyOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [application, setApplication] = useState<JobApplicationStatus | null>(
    null,
  );
  const [checkingApplication, setCheckingApplication] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "JOB_SEEKER") return setSaved(false);
    const savedJobs = JSON.parse(
      localStorage.getItem(`polaris-saved-jobs-${user.id}`) ?? "[]",
    ) as string[];
    setSaved(savedJobs.includes(slug));
  }, [slug, user]);

  const toggleSaved = () => {
    if (!user || user.role !== "JOB_SEEKER") return;
    const key = `polaris-saved-jobs-${user.id}`;
    const savedJobs = JSON.parse(localStorage.getItem(key) ?? "[]") as string[];
    const next = savedJobs.includes(slug)
      ? savedJobs.filter((item) => item !== slug)
      : [...savedJobs, slug];
    localStorage.setItem(key, JSON.stringify(next));
    setSaved(next.includes(slug));
  };

  useEffect(() => {
    getPublicJob(slug)
      .then(setJob)
      .catch((requestError) => setError(requestError.message));
  }, [slug]);

  useEffect(() => {
    if (user?.role !== "JOB_SEEKER") {
      setApplication(null);
      setCheckingApplication(false);
      return;
    }
    setCheckingApplication(true);
    getMyJobApplication(slug)
      .then(setApplication)
      .catch(() => setApplication(null))
      .finally(() => setCheckingApplication(false));
  }, [slug, user?.role]);

  useEffect(() => {
    if (
      user?.role !== "JOB_SEEKER" ||
      sessionStorage.getItem("postAuthAction") !== `apply:${slug}`
    )
      return;
    sessionStorage.removeItem("postAuthAction");
    if (user.emailVerifiedAt) setApplyOpen(true);
  }, [slug, user]);

  const apply = () => {
    if (!user) {
      sessionStorage.setItem("authReturnTo", window.location.pathname);
      sessionStorage.setItem("postAuthAction", `apply:${slug}`);
      setAuthOpen(true);
      return;
    }
    if (!user.emailVerifiedAt) {
      toast.error("Verify your email before applying.");
      window.location.assign("/profile");
      return;
    }
    if (!application && !checkingApplication) setApplyOpen(true);
  };

  const applicationStatus = application?.status ?? null;

  const applicationLabel = applicationStatus
    ? `Application: ${applicationStatusLabel(applicationStatus)}`
    : checkingApplication
      ? "Checking application…"
      : "Apply now";

  if (error) {
    return (
      <>
        <Navbar />
        <main className="email-action">
          <section>
            <h1>Job unavailable</h1>
            <p>{error}</p>
          </section>
        </main>
      </>
    );
  }
  if (!job) {
    return (
      <div
        className="job-detail-page job-detail-loading"
        aria-busy="true"
        aria-label="Loading job details"
      >
        <Navbar />
        <main>
          <section className="job-hero job-loading-hero">
            <div className="night-sky" />
            <div>
              <i className="job-skeleton eyebrow-skeleton" />
              <i className="job-skeleton title-skeleton" />
              <i className="job-skeleton subtitle-skeleton" />
              <div className="job-loading-actions">
                <i className="job-skeleton button-skeleton" />
                <i className="job-skeleton button-skeleton small" />
              </div>
            </div>
          </section>
          <section className="job-body">
            <div className="job-layout">
              <article className="job-role-card">
                <i className="job-skeleton eyebrow-skeleton dark" />
                <div className="job-loading-facts">
                  {Array.from({ length: 3 }, (_, index) => (
                    <i className="job-skeleton fact-skeleton" key={index} />
                  ))}
                </div>
                <i className="job-skeleton copy-skeleton wide" />
                <i className="job-skeleton copy-skeleton" />
                <i className="job-skeleton copy-skeleton medium" />
              </article>
              <aside className="job-rail">
                <i className="job-skeleton rail-skeleton" />
                <i className="job-skeleton rail-skeleton tall" />
              </aside>
            </div>
          </section>
        </main>
      </div>
    );
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
              <span>
                <h1>
                  {job.title}{" "}
                  {isNewJob(job.createdAt) && (
                    <i className="new-job-badge">NEW</i>
                  )}
                </h1>
                <p>
                  {job.company.companyName} · {formatJobLocation(job)}
                </p>
              </span>
            </section>
            <aside>
              {user?.role === "JOB_SEEKER" && (
                <button
                  type="button"
                  className={saved ? "saved" : ""}
                  aria-pressed={saved}
                  onClick={toggleSaved}
                >
                  <Bookmark />
                  {saved ? "Saved" : "Save job"}
                </button>
              )}
              <button type="button" onClick={() => setShareOpen(true)}>
                <Share />
                Share
              </button>
            </aside>
          </div>
        </section>

        <section className="job-body">
          <div className="job-layout">
            <div className="job-main-column">
              <article className="job-role-card">
                <p className="eyebrow">About the role</p>
                <section className="job-inline-facts">
                  <div>
                    <Wallet />
                    <span>
                      <small>Salary</small>
                      <b>{salary(job)}</b>
                    </span>
                  </div>
                  <div>
                    <MapPin />
                    <span>
                      <small>Location</small>
                      <b>{formatJobLocation(job)}</b>
                    </span>
                  </div>
                  <div>
                    <Calendar />
                    <span>
                      <small>Deadline</small>
                      <b>
                        {new Date(job.deadline).toLocaleDateString("en-GB", {
                          dateStyle: "long",
                        })}
                      </b>
                    </span>
                  </div>
                </section>
                {(job.salaryMin !== null || job.salaryMax !== null) && (
                  <SalaryConverter
                    salaryMin={job.salaryMin}
                    salaryMax={job.salaryMax}
                    salaryCurrency={job.salaryCurrency}
                  />
                )}
              </article>
              <article className="job-role-card job-description-card">
                <ExpandableContent maxHeight={430}>
                  <section className="job-description-section">
                    <h2>Job description</h2>
                    <p className="job-intro">{job.description}</p>
                  </section>
                  <div className="job-tags">
                    {Array.isArray(job.tags) &&
                      job.tags.map((tag: unknown) => (
                        <span key={String(tag)}>{String(tag)}</span>
                      ))}
                  </div>
                </ExpandableContent>
              </article>
            </div>
            <aside className="job-rail">
              {user?.role !== "COMPANY_ADMIN" && (
                <section>
                  <p className="eyebrow">
                    {applicationStatus ? "Your application" : "Apply"}
                  </p>
                  {application ? (
                    <>
                      <div className="job-application-current-status">
                        <span>Current status</span>
                        <StatusBadge status={applicationStatus!} />
                      </div>
                      <ApplicationTimeline application={application} />
                    </>
                  ) : (
                    <p>{job.applicantCount} people have applied so far.</p>
                  )}
                  <button
                    className="rail-apply"
                    onClick={apply}
                    disabled={applyDisabled}
                  >
                    {applicationLabel}
                  </button>
                </section>
              )}
              <section className="job-company-card">
                <p className="eyebrow">About {job.company.companyName}</p>
                <RichText html={job.company.profileContent} />
                <dl className="company-post-meta">
                  <div>
                    <dt>Posted by</dt>
                    <dd>
                      <a href={`/profile/${job.company.postedBy.id}`}>
                        {job.company.postedBy.name}
                      </a>{" "}
                      from {job.company.companyName}
                    </dd>
                  </div>
                  <div>
                    <dt>When</dt>
                    <dd>
                      {new Date(job.createdAt).toLocaleDateString("en-GB", {
                        dateStyle: "long",
                      })}
                    </dd>
                  </div>
                </dl>
                <a href={`/companies/${job.company.id}`}>
                  View company profile
                </a>
                {job.relatedJobs.length > 0 && (
                  <div className="company-more-roles">
                    <p className="eyebrow">More roles</p>
                    {job.relatedJobs.map((related) => (
                      <a href={`/jobs/${related.slug}`} key={related.slug}>
                        <span>
                          <b>
                            {related.title}{" "}
                            {isNewJob(related.createdAt) && (
                              <i className="new-job-badge">NEW</i>
                            )}
                          </b>
                          <small>{formatJobLocation(related)}</small>
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </section>
            </aside>
          </div>
        </section>
      </main>
      <ApplicationModal
        open={applyOpen}
        title={job.title}
        slug={job.slug}
        salaryCurrency={job.salaryCurrency}
        onClose={() => setApplyOpen(false)}
        onSubmitted={() => {
          void getMyJobApplication(slug).then(setApplication);
          setApplyOpen(false);
        }}
      />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <ShareJobModal
        open={shareOpen}
        title={job.title}
        company={job.company.companyName}
        url={window.location.href}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}

function ApplicationTimeline({
  application,
}: {
  application: JobApplicationStatus;
}) {
  const terminal =
    application.status === "ACCEPTED" || application.status === "REJECTED";
  const pastReview = ["INTERVIEW", "ACCEPTED"].includes(application.status);
  const formatDate = (date?: string | null) =>
    date
      ? new Date(date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null;
  const steps = [
    {
      label: "Application submitted",
      detail: `${formatDate(application.createdAt)} · Completed`,
      state: "done",
    },
    ...(application.job.hasPreSelectionTest
      ? [
          {
            label: application.testResult?.submittedAt
              ? "Pre-selection test completed"
              : "Pre-selection test",
            detail: application.testResult?.submittedAt
              ? formatDate(application.testResult.submittedAt)
              : application.status === "TEST_ASSIGNED"
                ? "Ready to take · estimated 1–3 days"
                : "Estimated within 1–3 days",
            state: application.testResult?.submittedAt
              ? "done"
              : application.status === "TEST_ASSIGNED"
                ? "current"
                : "upcoming",
          },
        ]
      : []),
    {
      label: "Application review",
      detail:
        application.status === "PROCESS"
          ? "Being reviewed · estimated 2–5 business days"
          : "Estimated within 2–5 business days",
      state:
        application.status === "PROCESS"
          ? "current"
          : pastReview
            ? "done"
            : "upcoming",
    },
    {
      label: "Interview",
      detail: application.interview
        ? `${formatDate(application.interview.interviewDate)} · ${application.interview.locationOrLink}`
        : application.status === "INTERVIEW"
          ? "Schedule is being prepared · estimated within 3 days"
          : "Usually 5–10 days after applying",
      state:
        application.status === "INTERVIEW"
          ? "current"
          : terminal && application.interview
            ? "done"
            : "upcoming",
    },
    {
      label:
        application.status === "ACCEPTED"
          ? "Application accepted"
          : application.status === "REJECTED"
            ? "Application closed"
            : "Final decision",
      detail: terminal
        ? formatDate(application.updatedAt)
        : "Usually within 2–5 days after the interview",
      state: terminal
        ? application.status === "ACCEPTED"
          ? "done"
          : "rejected"
        : "upcoming",
    },
  ];

  return (
    <ol className="application-timeline">
      {steps.map((step) => (
        <li className={step.state} key={step.label}>
          <i aria-hidden="true" />
          <div>
            <b>{step.label}</b>
            {step.detail && <small>{step.detail}</small>}
          </div>
        </li>
      ))}
    </ol>
  );
}
