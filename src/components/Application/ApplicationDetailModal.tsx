import { useEffect, useState, type FormEvent } from "react";
import { getMyApplicationDetail, submitExpectedSalary, type Application } from "../../services/application.service";
import { categoryLabel } from "../../types/job-posting";
import { Close, FileText, MapPin } from "../site/Icons";

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  PENDING: "CV screening",
  TEST_ASSIGNED: "Test assigned",
  PROCESS: "In review",
  INTERVIEW: "Interview",
  ACCEPTED: "Accepted",
  REJECTED: "Not selected",
};

const money = (value: number | null) => value == null ? "Not provided" : `IDR ${value.toLocaleString("id-ID")}`;
const dateTime = (value: string) => new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(value));
const date = (value: string) => new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "Asia/Jakarta" }).format(new Date(value));
const isLink = (value: string) => /^https?:\/\//i.test(value);

export function ApplicationDetailModal({ applicationId, onClose }: { applicationId: number | null; onClose: () => void }) {
  const [application, setApplication] = useState<Application | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [salaryError, setSalaryError] = useState("");
  const [submittingSalary, setSubmittingSalary] = useState(false);

  useEffect(() => {
    if (applicationId == null) return;
    let active = true;
    setApplication(null);
    setError("");
    setSalaryError("");
    setLoading(true);
    getMyApplicationDetail(applicationId)
      .then((data) => active && setApplication(data))
      .catch((requestError) => active && setError(requestError instanceof Error ? requestError.message : "Unable to load application"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [applicationId]);

  useEffect(() => {
    if (applicationId == null) return;
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [applicationId, onClose]);

  if (applicationId == null) return null;
  const cvUrl = application?.cvFile.startsWith("http") ? application.cvFile : `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}${application?.cvFile ?? ""}`;

  async function saveExpectedSalary(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!application) return;
    const expectedSalary = Number(new FormData(event.currentTarget).get("expectedSalary"));
    if (!Number.isInteger(expectedSalary) || expectedSalary <= 0) {
      setSalaryError("Expected salary is required.");
      return;
    }
    setSubmittingSalary(true);
    setSalaryError("");
    try {
      const result = await submitExpectedSalary(application.id, expectedSalary);
      setApplication({ ...application, expectedSalary: result.expectedSalary });
    } catch (requestError) {
      setSalaryError(requestError instanceof Error ? requestError.message : "Unable to submit expected salary");
    } finally {
      setSubmittingSalary(false);
    }
  }

  return <div className="application-detail-backdrop" role="dialog" aria-modal="true" aria-labelledby="application-detail-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <article className="application-detail-modal">
      <button className="application-detail-close" type="button" aria-label="Close application details" onClick={onClose}><Close /></button>
      {loading ? <div className="application-detail-state is-loading">Loading application…</div> : error || !application ? <div className="application-detail-state"><h2>Could not load application</h2><p>{error}</p></div> : <>
        <header>
          <p className="eyebrow">Your application</p>
          <h2 id="application-detail-title">{application.job.title}</h2>
          <p>{application.job.company.companyName} · {application.job.cityLocation}</p>
          <em className={`application-status ${application.status === "REJECTED" ? "bad" : application.status === "ACCEPTED" || application.status === "INTERVIEW" ? "good" : "wait"}`}>{statusLabels[application.status] ?? application.status}</em>
        </header>
        <dl className="application-detail-facts">
          <div><dt>Job category</dt><dd>{categoryLabel(application.job.category)}</dd></div>
          <div><dt>Applied on</dt><dd>{dateTime(application.createdAt)}</dd></div>
          <div><dt>Expected salary</dt><dd>{money(application.expectedSalary)}</dd></div>
          <div><dt>Application updated</dt><dd>{dateTime(application.updatedAt)}</dd></div>
          <div><dt>Job deadline</dt><dd>{date(application.job.deadline)}</dd></div>
        </dl>
        {application.expectedSalary == null && application.expectedSalaryRequestedAt && <form className="application-salary-request" onSubmit={saveExpectedSalary}>
          <span className="application-alert-icon" aria-hidden="true">!</span>
          <div><h3>{application.job.company.companyName} requested your expected salary</h3><p>Enter your expected monthly salary to complete this application information.</p><label htmlFor="requested-expected-salary">Expected salary (IDR/month)</label><input id="requested-expected-salary" name="expectedSalary" type="number" min="1" step="1" required placeholder="e.g. 12000000" />{salaryError && <small className="auth-error">{salaryError}</small>}</div>
          <button type="submit" disabled={submittingSalary}>{submittingSalary ? "Saving…" : "Submit salary"}</button>
        </form>}
        {application.status === "INTERVIEW" && !application.interview && <section className="application-interview pending"><p className="eyebrow">Interview stage</p><h3>Waiting for the company to schedule your interview</h3><p>You have reached the interview stage. The date, location, or meeting link will appear here once the company confirms it.</p></section>}
        {application.interview && <section className="application-interview"><p className="eyebrow">Interview details</p><h3>{dateTime(application.interview.interviewDate)}</h3><p className="application-interview-place"><MapPin />{isLink(application.interview.locationOrLink) ? <a href={application.interview.locationOrLink} target="_blank" rel="noreferrer">Open interview link</a> : application.interview.locationOrLink}</p><small>Status: {application.interview.status.toLocaleLowerCase().replaceAll("_", " ")}</small>{application.interview.notes && <p>{application.interview.notes}</p>}</section>}
        {application.rejectionReason && <section className="application-rejection"><b>Company feedback</b><p>{application.rejectionReason}</p></section>}
        <footer><a href={cvUrl} target="_blank" rel="noreferrer"><FileText />View submitted CV</a><a href={`/jobs/${application.job.slug}`}>Open job details</a></footer>
      </>}
    </article>
  </div>;
}
