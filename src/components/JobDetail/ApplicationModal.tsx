import { useState, type FormEvent } from "react";
import { Close, Upload } from "../site/Icons";
import { submitApplication } from "../../services/application.service";

export function ApplicationModal({ open, title, slug, onClose, onSubmitted }: { open: boolean; title: string; slug: string; onClose: () => void; onSubmitted: () => void }) {
  const [file, setFile] = useState<File | null>(null); const [error, setError] = useState(""); const [submitting, setSubmitting] = useState(false);
  if (!open) return null;
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!file) return; setSubmitting(true); setError(""); try { await submitApplication(slug, file, Number(new FormData(event.currentTarget).get("salary")) || undefined); onSubmitted(); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to submit application"); } finally { setSubmitting(false); } }
  return <div className="apply-modal"><form onSubmit={submit}><button type="button" aria-label="Close" onClick={onClose}><Close /></button><h2>Apply — {title}</h2><label htmlFor="cv">Upload CV (PDF, max 1MB)</label><label className="file-input" htmlFor="cv"><Upload />{file?.name ?? "Choose a file"}</label><input id="cv" type="file" accept="application/pdf" required onChange={(event) => setFile(event.target.files?.[0] ?? null)} /><label htmlFor="salary">Expected salary (IDR / month)</label><input id="salary" name="salary" inputMode="numeric" placeholder="25000000" />{error && <p className="auth-error">{error}</p>}<button type="submit" disabled={submitting}>{submitting ? "Submitting…" : "Submit application"}</button></form></div>;
}
