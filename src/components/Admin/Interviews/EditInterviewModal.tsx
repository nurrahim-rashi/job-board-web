import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";

import { useUpdateInterview } from "../../../hooks/api/interview/useUpdateInterview";
import {
  type Interview,
  type InterviewStatus,
} from "../../../types/interview";
import { statusColor } from "../../../lib/status";
import { Check, Close, Mail } from "../../site/Icons";
import { StatusBadge } from "../../site/StatusBadge";
import { AdminSelect, type AdminSelectOption } from "../AdminSelect";
import { ApplicantAvatar } from "../Applicants/ApplicantAvatar";
import { countdownLabel, formatSchedule, minDateTime, reminderState, toIso, toLocalInput } from "./interviewHelpers";

const statusOptions: AdminSelectOption[] = [
  { value: "SCHEDULED", label: "Scheduled", color: statusColor("SCHEDULED") },
  { value: "COMPLETED", label: "Completed", color: statusColor("COMPLETED") },
  { value: "CANCELLED", label: "Cancelled", color: statusColor("CANCELLED") },
];

type EditInterviewModalProps = {
  slug: string;
  interview: Interview | null;
  onClose: () => void;
  onDelete: (interview: Interview) => void;
};

export function EditInterviewModal({ slug, interview, onClose, onDelete }: EditInterviewModalProps) {
  const updateInterview = useUpdateInterview();
  const [when, setWhen] = useState("");
  const [where, setWhere] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<InterviewStatus>("SCHEDULED");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!interview) return;
    setWhen(toLocalInput(interview.interviewDate));
    setWhere(interview.locationOrLink);
    setNotes(interview.notes ?? "");
    setStatus(interview.status);
    setTouched(false);
  }, [interview]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!interview) return null;

  const time = new Date(when).getTime();
  const rescheduled = when !== toLocalInput(interview.interviewDate);
  const problems: string[] = [];
  if (!when || Number.isNaN(time)) problems.push("Pick a date and time.");
  else if (rescheduled && time <= Date.now()) problems.push("A new interview date must be in the future.");
  if (!where.trim()) problems.push("Add a location or meeting link.");

  const changed =
    rescheduled ||
    where.trim() !== interview.locationOrLink ||
    notes.trim() !== (interview.notes ?? "") ||
    status !== interview.status;

  const cancelling = status === "CANCELLED" && interview.status !== "CANCELLED";
  const reminder = reminderState(interview);

  function save() {
    setTouched(true);

    if (problems.length) {
      toast.error(problems[0]);
      return;
    }

    if (!changed) return;

    updateInterview.mutate(
      {
        slug,
        interviewId: interview!.id,
        ...(rescheduled && { interviewDate: toIso(when) }),
        ...(where.trim() !== interview!.locationOrLink && { locationOrLink: where.trim() }),
        ...(notes.trim() !== (interview!.notes ?? "") && { notes: notes.trim() || null }),
        ...(status !== interview!.status && { status }),
      },
      { onSuccess: onClose },
    );
  }

  return createPortal(
    <div
      className="admin-dialog interview-dialog edit"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div>
        <button type="button" aria-label="Close" onClick={onClose}>
          <Close />
        </button>

        <header className="applicant-dialog-head">
          <ApplicantAvatar name={interview.applicant.name} avatar={interview.applicant.avatar} size="lg" />
          <div>
            <h2>{interview.applicant.name}</h2>
            <p className="admin-note">{interview.applicant.email}</p>
            <StatusBadge status={interview.status} />
          </div>
        </header>

        <div className="interview-dialog-body">
          <p className="interview-current">
            Currently booked for <b>{formatSchedule(interview.interviewDate)}</b> · {countdownLabel(interview.interviewDate)}
          </p>

          {interview.proposedDate ? (
            <aside className="admin-alert interview-reschedule-warning" role="alert">
              <i aria-hidden="true">!</i>
              <div>
                <small>Reschedule request</small>
                <strong>Applicant asked to reschedule the interview</strong>
                <span>Proposed time: <b>{formatSchedule(interview.proposedDate)}</b></span>
                <span>{interview.proposalNote ? <>Reason: &ldquo;{interview.proposalNote}&rdquo;</> : "The applicant did not provide a reason."}</span>
              </div>
            </aside>
          ) : null}

          <div className="admin-fields">
            <label>
              <span>Date and time</span>
              <input
                type="datetime-local"
                value={when}
                min={minDateTime()}
                onChange={(event) => setWhen(event.target.value)}
              />
            </label>
            <AdminSelect
              variant="field"
              label="Status"
              value={status}
              onChange={(next) => setStatus(next as InterviewStatus)}
              options={statusOptions}
            />
            <label className="wide">
              <span>Location or meeting link</span>
              <input
                value={where}
                maxLength={255}
                placeholder="https://meet.google.com/… or Polaris HQ, 4th floor"
                onChange={(event) => setWhere(event.target.value)}
              />
            </label>
            <label className="wide">
              <span>
                Notes <small>Optional · shown in the email</small>
              </span>
              <textarea
                value={notes}
                maxLength={500}
                rows={3}
                placeholder="e.g. Technical round with the engineering lead"
                onChange={(event) => setNotes(event.target.value)}
              />
            </label>
          </div>

          <p className="interview-reminder-note">
            <Mail /> H-1 reminder: <em className={`admin-chip ${reminder.tone}`}>{reminder.label}</em>
            {rescheduled ? <small>Rescheduling sends a fresh reminder for the new date.</small> : null}
          </p>

          {cancelling ? (
            <p className="admin-alert danger">
              Cancelling emails {interview.applicant.name} right away and frees this slot for someone else.
            </p>
          ) : rescheduled ? (
            <p className="admin-alert">The new schedule is emailed to the applicant as soon as you save.</p>
          ) : null}

          {touched
            ? problems.map((problem) => (
                <p key={problem} className="interview-draft-error">
                  {problem}
                </p>
              ))
            : null}
        </div>

        <footer className="interview-dialog-footer">
          <button type="button" className="admin-btn danger" onClick={() => onDelete(interview)}>
            Delete
          </button>
          <button type="button" className="admin-btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="admin-btn primary"
            disabled={!changed || updateInterview.isPending}
            onClick={save}
          >
            <Check />
            {updateInterview.isPending ? "Saving…" : "Save changes"}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
