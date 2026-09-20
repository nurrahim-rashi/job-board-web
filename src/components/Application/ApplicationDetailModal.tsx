import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { getMyApplicationDetail, submitExpectedSalary, type Application } from "../../services/application.service";
import { categoryLabel } from "../../types/job-posting";
import { Close, FileText, MapPin, Pencil } from "../site/Icons";
import { updateProfile } from "../../services/auth.service";
import { useAuth } from "../../stores/useAuth";
import { DataSkeleton } from "../site/DataSkeleton";
import { formatJobLocation } from "../../lib/location";
import { StatusBadge } from "../site/StatusBadge";
import { formatCurrency } from "../../lib/currency";

const money = (value: number | null, currency: string) =>
  value == null ? "Not provided" : formatCurrency(value, currency);
const dateTime = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
const date = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
const isLink = (value: string) => /^https?:\/\//i.test(value);

export function ApplicationDetailModal({
  applicationId,
  onClose,
}: {
  applicationId: number | null;
  onClose: () => void;
}) {
  const [application, setApplication] = useState<Application | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [salaryError, setSalaryError] = useState("");
  const [submittingSalary, setSubmittingSalary] = useState(false);
  const [editingSalary, setEditingSalary] = useState(false);
  const [addingExperience, setAddingExperience] = useState(false);
  const [experienceAdded, setExperienceAdded] = useState(false);
  const [experienceError, setExperienceError] = useState("");
  const user = useAuth((state) => state.user);

  useEffect(() => {
    if (applicationId == null) return;
    let active = true;
    setApplication(null);
    setError("");
    setSalaryError("");
    setEditingSalary(false);
    setExperienceAdded(false);
    setExperienceError("");
    setLoading(true);
    getMyApplicationDetail(applicationId)
      .then((data) => {
        if (active) {
          setApplication(data);
          setEditingSalary(
            data.expectedSalary == null &&
              Boolean(data.expectedSalaryRequestedAt),
          );
        }
      })
      .catch(
        (requestError) =>
          active &&
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load application",
          ),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [applicationId]);

  useEffect(() => {
    if (applicationId == null) return;
    const closeOnEscape = (event: KeyboardEvent) =>
      event.key === "Escape" && onClose();
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [applicationId, onClose]);

  if (applicationId == null) return null;
  const cvUrl = application?.cvFile.startsWith("http")
    ? application.cvFile
    : `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}${application?.cvFile ?? ""}`;
  const acceptedExperienceExists = Boolean(
    application &&
    user?.experiences?.some(
      (experience) =>
        experience.title.trim().toLocaleLowerCase() ===
          application.job.title.trim().toLocaleLowerCase() &&
        (experience.companyId === application.job.company.id ||
          experience.company.trim().toLocaleLowerCase() ===
            application.job.company.companyName.trim().toLocaleLowerCase()),
    ),
  );
  async function saveExpectedSalary(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!application) return;
    const expectedSalary = Number(
      new FormData(event.currentTarget).get("expectedSalary"),
    );
    if (!Number.isInteger(expectedSalary) || expectedSalary <= 0) {
      setSalaryError("Expected salary is required.");
      return;
    }
    setSubmittingSalary(true);
    setSalaryError("");
    try {
      const result = await submitExpectedSalary(application.id, expectedSalary);
      setApplication({ ...application, expectedSalary: result.expectedSalary, expectedSalaryCurrency: result.expectedSalaryCurrency });
      setEditingSalary(false);
    } catch (requestError) {
      setSalaryError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to submit expected salary",
      );
    } finally {
      setSubmittingSalary(false);
    }
  }

  async function addAcceptedExperience() {
    if (!application || !user) return;
    const exists = (user.experiences ?? []).some(
      (experience) =>
        experience.companyId === application.job.company.id &&
        experience.title.toLocaleLowerCase() ===
          application.job.title.toLocaleLowerCase(),
    );
    if (exists) {
      setExperienceAdded(true);
      return;
    }
    setAddingExperience(true);
    setExperienceError("");
    try {
      const start = new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "numeric",
      }).format(new Date());
      await updateProfile({
        experiences: [
          ...(user.experiences ?? []),
          {
            title: application.job.title,
            company: application.job.company.companyName,
            companyId: application.job.company.id,
            period: `${start} – Present`,
            note: "",
          },
        ],
      });
      setExperienceAdded(true);
    } catch (requestError) {
      setExperienceError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to add this experience",
      );
    } finally {
      setAddingExperience(false);
    }
  }

  return createPortal(
    <div
      className="application-detail-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="application-detail-title"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <article className="application-detail-modal">
        <button
          className="application-detail-close"
          type="button"
          aria-label="Close application details"
          onClick={onClose}
        >
          <Close />
        </button>
        {loading ? (
          <DataSkeleton count={6} className="application-detail-skeleton" />
        ) : error || !application ? (
          <div className="application-detail-state">
            <h2>Could not load application</h2>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <header>
              <p className="eyebrow">Your application</p>
              <h2 id="application-detail-title">{application.job.title}</h2>
              <p>
                {application.job.company.companyName} ·{" "}
                {formatJobLocation(application.job)}
              </p>
              <StatusBadge status={application.status} />
            </header>
            <dl className="application-detail-facts">
              <div>
                <dt>Job category</dt>
                <dd>{categoryLabel(application.job.category)}</dd>
              </div>
              <div>
                <dt>Applied on</dt>
                <dd>{dateTime(application.createdAt)}</dd>
              </div>
              <div>
                <dt>Expected salary</dt>
                <dd>
                  {money(application.expectedSalary, application.job.salaryCurrency)}{" "}
                  <button
                    className="application-inline-edit"
                    type="button"
                    aria-label={
                      editingSalary
                        ? "Close expected salary editor"
                        : "Edit expected salary"
                    }
                    title={
                      editingSalary ? "Close editor" : "Edit expected salary"
                    }
                    onClick={() => setEditingSalary((value) => !value)}
                  >
                    <Pencil />
                  </button>
                </dd>
              </div>
              <div>
                <dt>Application updated</dt>
                <dd>{dateTime(application.updatedAt)}</dd>
              </div>
              <div>
                <dt>Job deadline</dt>
                <dd>{date(application.job.deadline)}</dd>
              </div>
            </dl>
            {editingSalary && (
              <form
                className="application-salary-request"
                onSubmit={saveExpectedSalary}
              >
                <span className="application-alert-icon" aria-hidden="true">
                  {application.expectedSalaryRequestedAt ? "!" : application.job.salaryCurrency}
                </span>
                <div>
                  <h3>
                    {application.expectedSalaryRequestedAt &&
                    application.expectedSalary == null
                      ? `${application.job.company.companyName} requested your expected salary`
                      : "Edit expected salary"}
                  </h3>
                  <p>
                    Enter your expected monthly salary for this application.
                  </p>
                  <label htmlFor="requested-expected-salary">
                    Expected monthly salary ({application.job.salaryCurrency})
                  </label>
                  <input
                    id="requested-expected-salary"
                    name="expectedSalary"
                    type="number"
                    min="1"
                    step="1"
                    required
                    defaultValue={application.expectedSalary ?? ""}
                    placeholder="e.g. 12000000"
                  />
                  {salaryError && (
                    <small className="auth-error">{salaryError}</small>
                  )}
                </div>
                <button type="submit" disabled={submittingSalary}>
                  {submittingSalary ? "Saving…" : "Save salary"}
                </button>
              </form>
            )}
            {application.status === "TEST_ASSIGNED" && (
              <section className="application-next-step">
                <p className="eyebrow">Action required</p>
                <h3>Your pre-selection test is ready</h3>
                <p>
                  Complete the assigned test to keep your application moving.
                </p>
                <a href={`/jobs/${application.job.slug}/pre-selection-test`}>
                  Start test
                </a>
              </section>
            )}
            {application.status === "PENDING" && (
              <section className="application-priority-card">
                <p className="eyebrow">Polaris Pro</p>
                <h3>Get priority review on future applications</h3>
                <p>
                  Stand out closer to the top of the company&rsquo;s review
                  queue.
                </p>
                <a href="/pricing">Upgrade to Polaris Pro</a>
              </section>
            )}
            {application.status === "INTERVIEW" && !application.interview && (
              <section className="application-interview pending">
                <p className="eyebrow">Interview stage</p>
                <h3>Waiting for the company to schedule your interview</h3>
                <p>
                  You have reached the interview stage. The date, location, or
                  meeting link will appear here once the company confirms it.
                </p>
              </section>
            )}
            {application.interview && (
              <section className="application-interview">
                <p className="eyebrow">Interview details</p>
                <h3>{dateTime(application.interview.interviewDate)}</h3>
                <p className="application-interview-place">
                  <MapPin />
                  {isLink(application.interview.locationOrLink) ? <a href={application.interview.locationOrLink} target="_blank" rel="noreferrer">Open interview link</a> : application.interview.locationOrLink}
                </p>
                <div className="application-interview-status">
                  <span>Status</span>
                  <StatusBadge status={application.interview.status} />
                </div>
                {application.interview.notes && <p>{application.interview.notes}</p>}
              </section>
            )}
            {application.status === "ACCEPTED" &&
              !acceptedExperienceExists &&
              !experienceAdded && (
                <section className="application-accepted-card">
                  <p className="eyebrow">Congratulations</p>
                  <h3>Did you take this role?</h3>
                  <p>
                    Add it to your Polaris experience with the company linked
                    automatically.
                  </p>
                  {experienceError && (
                    <small className="auth-error">{experienceError}</small>
                  )}
                  <button
                    type="button"
                    disabled={addingExperience}
                    onClick={() => void addAcceptedExperience()}
                  >
                    {addingExperience ? "Adding…" : "I now work here"}
                  </button>
                </section>
              )}
            {application.rejectionReason && (
              <section className="application-rejection">
                <b>Company feedback</b>
                <p>{application.rejectionReason}</p>
              </section>
            )}
            <footer>
              <a href={cvUrl} target="_blank" rel="noreferrer">
                <FileText />
                View submitted CV
              </a>
              <a href={`/jobs/${application.job.slug}`}>Open job details</a>
            </footer>
          </>
        )}
      </article>
    </div>,
    document.body,
  );
}
