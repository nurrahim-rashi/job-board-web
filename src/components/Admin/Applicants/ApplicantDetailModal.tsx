import { useEffect, useState } from "react";

import { useApplicantDetail } from "../../../hooks/api/applicant/useApplicantDetail";
import { Close } from "../../site/Icons";
import { ApplicantAvatar } from "./ApplicantAvatar";
import { CvPreview } from "./CvPreview";
import { StatusDecision } from "./StatusDecision";
import { educationLabel, formatDateTime, formatRupiah } from "./applicantHelpers";
import { formatDate, questionCount } from "../adminData";
import { statusLabels, statusTones } from "../../../types/applicant";

export type DetailTab = "profile" | "cv";

type ApplicantDetailModalProps = {
  slug: string;
  applicationId: number | null;
  initialTab?: DetailTab;
  onClose: () => void;
};

export function ApplicantDetailModal({ slug, applicationId, initialTab = "profile", onClose }: ApplicantDetailModalProps) {
  const [tab, setTab] = useState<DetailTab>(initialTab);
  const { data, isPending, isError, error } = useApplicantDetail(slug, applicationId);

  useEffect(() => setTab(initialTab), [initialTab, applicationId]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (applicationId == null) return null;

  const address = data ? [data.applicant.address, data.applicant.city, data.applicant.province].filter(Boolean).join(", ") : "";

  return (
    <div className="admin-dialog applicant-dialog" role="dialog" aria-modal="true" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div>
        <button type="button" aria-label="Close" onClick={onClose}>
          <Close />
        </button>

        {isPending ? (
          <div className="applicant-dialog-state">Loading applicant…</div>
        ) : isError || !data ? (
          <div className="applicant-dialog-state">{error?.message ?? "Applicant not found."}</div>
        ) : (
          <>
            <header className="applicant-dialog-head">
              <ApplicantAvatar name={data.applicant.name} avatar={data.applicant.avatar} size="lg" />
              <div>
                <h2>{data.applicant.name}</h2>
                <p className="admin-note">{data.applicant.email}</p>
                <em className={`admin-chip ${statusTones[data.status]}`}>{statusLabels[data.status]}</em>
              </div>
            </header>

            <nav className="applicant-tabs">
              <button type="button" className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")}>
                Profile
              </button>
              <button type="button" className={tab === "cv" ? "active" : ""} onClick={() => setTab("cv")}>
                CV preview
              </button>
            </nav>

            {tab === "profile" ? (
              <div className="applicant-dialog-body">
                <dl className="applicant-facts">
                  <div>
                    <dt>Age</dt>
                    <dd>{data.applicant.age != null ? `${data.applicant.age} years` : "Not stated"}</dd>
                  </div>
                  <div>
                    <dt>Gender</dt>
                    <dd>{data.applicant.gender ? data.applicant.gender.toLowerCase() : "Not stated"}</dd>
                  </div>
                  <div>
                    <dt>Last education</dt>
                    <dd>{educationLabel(data.applicant.lastEducation)}</dd>
                  </div>
                  <div>
                    <dt>Expected salary</dt>
                    <dd>{formatRupiah(data.expectedSalary)}</dd>
                  </div>
                  <div>
                    <dt>Applied</dt>
                    <dd>{formatDateTime(data.appliedAt)}</dd>
                  </div>
                  <div>
                    <dt>Pre-selection test</dt>
                    <dd>{data.testResult ? `${data.testResult.score}/${questionCount}` : "Not taken"}</dd>
                  </div>
                  <div className="wide">
                    <dt>Location</dt>
                    <dd>{address || "Not stated"}</dd>
                  </div>
                </dl>

                {data.interview ? (
                  <div className="applicant-interview">
                    <p className="eyebrow">Interview</p>
                    <b>{formatDateTime(data.interview.interviewDate)}</b>
                    <small>
                      {data.interview.locationOrLink} · {data.interview.status.toLowerCase()}
                    </small>
                    {data.interview.notes ? <p className="admin-note">{data.interview.notes}</p> : null}
                  </div>
                ) : null}

                {data.rejectionReason ? (
                  <p className="admin-alert danger">Rejection reason: {data.rejectionReason}</p>
                ) : null}

                <StatusDecision slug={slug} applicationId={data.id} status={data.status} />
              </div>
            ) : (
              <div className="applicant-dialog-body">
                <CvPreview slug={slug} applicationId={data.id} name={data.applicant.name} />
                <p className="admin-note">Submitted {formatDate(data.appliedAt)} · {data.cvFile.split("/").pop()}</p>
                <StatusDecision slug={slug} applicationId={data.id} status={data.status} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
