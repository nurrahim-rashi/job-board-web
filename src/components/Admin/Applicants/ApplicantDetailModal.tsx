import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";

import { useApplicantDetail } from "../../../hooks/api/applicant/useApplicantDetail";
import { useAssignTest } from "../../../hooks/api/pre-selection-test/useAssignTest";
import { Clipboard, Close } from "../../site/Icons";
import { ApplicantAvatar } from "./ApplicantAvatar";
import { CvPreview } from "./CvPreview";
import { StatusDecision } from "./StatusDecision";
import { TestAnswerSheet } from "./TestAnswerSheet";
import { educationLabel, formatDateTime, formatRupiah } from "./applicantHelpers";
import { formatDate } from "../adminData";
import { StatusBadge } from "../../site/StatusBadge";
import { axiosInstance } from "../../../lib/axios";
import type { PreselectedApplicant } from "../Interviews/ScheduleInterviewModal";
import { formatLocation } from "../../../lib/location";

export type DetailTab = "profile" | "cv" | "test";

type ApplicantDetailModalProps = {
  slug: string;
  applicationId: number | null;
  hasPreSelectionTest: boolean;
  initialTab?: DetailTab;
  onScheduleInterview: (applicant: PreselectedApplicant) => void;
  onClose: () => void;
};

export function ApplicantDetailModal({ slug, applicationId, hasPreSelectionTest, initialTab = "profile", onScheduleInterview, onClose }: ApplicantDetailModalProps) {
  const [tab, setTab] = useState<DetailTab>(initialTab);
  const { data, isPending, isError, error, refetch } = useApplicantDetail(slug, applicationId);
  const assignTest = useAssignTest(slug);
  const [requestingSalary, setRequestingSalary] = useState(false);

  const requestExpectedSalary = async () => {
    if (applicationId == null) return;
    setRequestingSalary(true);
    try {
      const response = await axiosInstance.patch<{ message?: string }>(`/job-posting/${slug}/applicants/${applicationId}/request-expected-salary`);
      toast.success(response.data.message ?? "Expected salary requested");
      await refetch();
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Unable to request expected salary");
    } finally {
      setRequestingSalary(false);
    }
  };

  useEffect(() => setTab(initialTab), [initialTab, applicationId]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (applicationId == null) return null;

  const address = data
    ? [
        data.applicant.address,
        formatLocation(data.applicant.city, data.applicant.province, "Indonesia"),
      ]
        .filter(Boolean)
        .join(", ")
    : "";
  const invite = data ? () => onScheduleInterview({ applicationId: data.id, name: data.applicant.name }) : undefined;

  return createPortal(
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
                <StatusBadge status={data.status} />
              </div>
              <a
                className="admin-btn ghost applicant-view-profile"
                href={`/profile/${data.applicant.id}`}
              >
                View applicant
              </a>
            </header>

            <nav className="applicant-tabs">
              <button type="button" className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")}>
                Profile
              </button>
              <button type="button" className={tab === "cv" ? "active" : ""} onClick={() => setTab("cv")}>
                CV preview
              </button>
              {data.testResult ? (
                <button type="button" className={tab === "test" ? "active" : ""} onClick={() => setTab("test")}>
                  Test answers
                </button>
              ) : null}
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
                    <dd>{data.testResult ? `${data.testResult.score}/100` : "Not taken"}</dd>
                  </div>
                  <div className="wide">
                    <dt>Location</dt>
                    <dd>{address || "Not stated"}</dd>
                  </div>
                </dl>

                {data.expectedSalary == null || data.expectedSalary === "" ? (
                  <div className="applicant-salary-nudge">
                    <span className="application-alert-icon" aria-hidden="true">!</span>
                    <div>
                      <b>Expected salary not provided</b>
                      <small>{data.expectedSalaryRequestedAt ? "The applicant has already been nudged." : "Ask the applicant to complete their expected salary."}</small>
                    </div>
                    <button type="button" className="admin-btn ghost" disabled={requestingSalary || Boolean(data.expectedSalaryRequestedAt)} onClick={() => void requestExpectedSalary()}>{requestingSalary ? "Sending…" : data.expectedSalaryRequestedAt ? "Request sent" : "Request salary"}</button>
                  </div>
                ) : null}

                {data.interview ? (
                  <div className="applicant-interview">
                    <p className="eyebrow">Interview</p>
                    <b>{formatDateTime(data.interview.interviewDate)}</b>
                    <small>
                      {data.interview.locationOrLink}
                    </small>
                    <StatusBadge status={data.interview.status} />
                    {data.interview.notes ? <p className="admin-note">{data.interview.notes}</p> : null}
                    {data.interview.proposedDate ? <p className="admin-alert"><b>Applicant proposed {formatDateTime(data.interview.proposedDate)}</b>{data.interview.proposalNote ? ` · ${data.interview.proposalNote}` : ""}</p> : null}
                  </div>
                ) : null}

                {data.rejectionReason ? (
                  <p className="admin-alert danger">Rejection reason: {data.rejectionReason}</p>
                ) : null}

                {hasPreSelectionTest && data.status === "PENDING" ? (
                  <button
                    type="button"
                    className="admin-btn ghost"
                    disabled={assignTest.isPending}
                    onClick={() => assignTest.mutate([data.id])}
                  >
                    <Clipboard /> {assignTest.isPending ? "Sending…" : "Send pre-selection test"}
                  </button>
                ) : null}

                <StatusDecision slug={slug} applicationId={data.id} status={data.status} onInviteToInterview={invite} />
              </div>
            ) : tab === "cv" ? (
              <div className="applicant-dialog-body">
                <CvPreview slug={slug} applicationId={data.id} name={data.applicant.name} />
                <p className="admin-note">Submitted {formatDate(data.appliedAt)} · {data.cvFile.split("/").pop()}</p>
                <StatusDecision slug={slug} applicationId={data.id} status={data.status} onInviteToInterview={invite} />
              </div>
            ) : (
              <div className="applicant-dialog-body">
                <TestAnswerSheet slug={slug} applicationId={data.id} />
              </div>
            )}
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
