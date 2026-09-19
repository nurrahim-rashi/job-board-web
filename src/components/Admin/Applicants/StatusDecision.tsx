import { useState } from "react";

import { useUpdateApplicantStatus } from "../../../hooks/api/applicant/useUpdateApplicantStatus";
import { Check, Close } from "../../site/Icons";
import { StatusBadge } from "../../site/StatusBadge";
import { statusPalette } from "../../../lib/status";
import { nextStatuses, type ApplicationStatus, type DecisionStatus } from "../../../types/applicant";

const actionLabels: Record<DecisionStatus, string> = {
  PROCESS: "Move to process",
  INTERVIEW: "Invite to interview",
  ACCEPTED: "Accept",
  REJECTED: "Reject",
};

type StatusDecisionProps = {
  slug: string;
  applicationId: number;
  status: ApplicationStatus;
  onInviteToInterview?: () => void;
};

export function StatusDecision({ slug, applicationId, status, onInviteToInterview }: StatusDecisionProps) {
  const updateStatus = useUpdateApplicantStatus();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  const allowed = nextStatuses[status];

  if (!allowed.length) {
    return (
      <p className="admin-note">
        This applicant is already <StatusBadge status={status} /> — the decision is final.
      </p>
    );
  }

  const decide = (next: DecisionStatus) => {
    if (next === "REJECTED") {
      setRejecting(true);
      return;
    }
    // Scheduling the interview already moves the applicant to INTERVIEW, so the
    // invitation hands over to the scheduler instead of flipping the status on its own.
    if (next === "INTERVIEW" && onInviteToInterview) {
      onInviteToInterview();
      return;
    }
    updateStatus.mutate({ slug, applicationId, status: next });
  };

  const confirmReject = () => {
    if (!reason.trim()) return;
    updateStatus.mutate(
      { slug, applicationId, status: "REJECTED", rejectionReason: reason.trim() },
      {
        onSuccess: () => {
          setRejecting(false);
          setReason("");
        },
      },
    );
  };

  return (
    <div className="applicant-decision">
      <p className="eyebrow">Decision</p>
      <div className="applicant-decision-actions">
        {allowed.map((next) => (
          <button
            key={next}
            type="button"
            className={`admin-btn ${next === "REJECTED" ? "danger" : next === "ACCEPTED" ? "primary" : "ghost"}`}
            style={{
              backgroundColor: statusPalette[next].background,
              borderColor: statusPalette[next].border,
              color: statusPalette[next].color,
            }}
            disabled={updateStatus.isPending}
            onClick={() => decide(next)}
          >
            {next === "ACCEPTED" ? <Check /> : next === "REJECTED" ? <Close /> : null}
            {actionLabels[next]}
          </button>
        ))}
      </div>

      {rejecting ? (
        <div className="applicant-reject">
          <label htmlFor="rejection-reason">
            Rejection reason <small>Shared with the applicant · required</small>
          </label>
          <textarea
            id="rejection-reason"
            value={reason}
            maxLength={500}
            rows={3}
            placeholder="Let them know why this did not work out."
            onChange={(event) => setReason(event.target.value)}
          />
          <div className="applicant-reject-actions">
            <small>{reason.length}/500</small>
            <button
              type="button"
              className="admin-btn ghost"
              onClick={() => {
                setRejecting(false);
                setReason("");
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="admin-btn danger"
              disabled={!reason.trim() || updateStatus.isPending}
              onClick={confirmReject}
            >
              Confirm rejection
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
