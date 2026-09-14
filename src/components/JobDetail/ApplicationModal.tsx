import { useEffect, useRef, useState, type FormEvent } from "react";
import { getSubscriptionStatus } from "../../services/auth.service";
import { submitApplication } from "../../services/application.service";
import { Close, Upload } from "../site/Icons";

type ApplicationModalProps = {
  open: boolean;
  title: string;
  slug: string;
  onClose: () => void;
  onSubmitted: () => void;
};

export function ApplicationModal({
  open,
  title,
  slug,
  onClose,
  onSubmitted,
}: ApplicationModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [choosingCv, setChoosingCv] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setCheckingSubscription(true);
    getSubscriptionStatus()
      .then(({ active }) => setChoosingCv(active))
      .catch(() => setChoosingCv(false))
      .finally(() => setCheckingSubscription(false));
  }, [open]);

  if (!open) return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;
    setSubmitting(true);
    setError("");
    try {
      const salary = Number(new FormData(event.currentTarget).get("salary"));
      await submitApplication(slug, file, salary || undefined);
      onSubmitted();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to submit application",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="apply-modal">
      <form onSubmit={submit}>
        <button type="button" aria-label="Close" onClick={onClose}>
          <Close />
        </button>
        <h2>Apply — {title}</h2>
        {checkingSubscription ? (
          <p>Checking your CV options…</p>
        ) : choosingCv ? (
          <>
            <p>How would you like to add your CV?</p>
            <div className="cv-choice">
              <button type="button" onClick={() => setChoosingCv(false)}>
                <Upload /> Upload CV
              </button>
              <a href="/profile/cv-generator">Generate a new CV</a>
            </div>
          </>
        ) : (
          <>
            <label htmlFor="cv">Upload CV (PDF, max 1MB)</label>
            <div className="file-upload-row"><label className="file-input" htmlFor="cv">
              <Upload /> {file?.name ?? "Choose a file"}
            </label>{file && <button className="file-remove" type="button" aria-label="Remove selected CV" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}><Close /></button>}</div>
            <input ref={fileInputRef} id="cv" type="file" accept="application/pdf" required onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
            <label htmlFor="salary">Expected salary (IDR / month)</label>
            <input id="salary" name="salary" inputMode="numeric" placeholder="25000000" />
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit application"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
