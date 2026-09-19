import { ArrowRight, FileText } from "../../site/Icons";
import { ApplicantAvatar } from "./ApplicantAvatar";
import { educationLabel, formatSalary } from "./applicantHelpers";
import { formatDate, goodScore } from "../adminData";
import { type ApplicantListItem } from "../../../types/applicant";
import { StatusBadge } from "../../site/StatusBadge";

type ApplicantListProps = {
  applicants: ApplicantListItem[];
  onOpen: (applicationId: number) => void;
  onPreviewCv: (applicationId: number) => void;
};

export function ApplicantList({ applicants, onOpen, onPreviewCv }: ApplicantListProps) {
  return (
    <div className="admin-table applicants">
      <div className="admin-row admin-row-head">
        <span>Applicant</span>
        <span>Age</span>
        <span>Education</span>
        <span>Expected salary</span>
        <span>Applied</span>
        <span>Test score</span>
        <span>Status</span>
        <span />
      </div>
      {applicants.map((item) => (
        <div key={item.id} className="admin-row">
          <span className="applicant-identity">
            <ApplicantAvatar name={item.applicant.name} avatar={item.applicant.avatar} />
            <b>{item.applicant.name}</b>
            {item.priorityReview && <em className="admin-chip good">Priority</em>}
          </span>
          <span>{item.applicant.age ?? "—"}</span>
          <span>{educationLabel(item.applicant.lastEducation)}</span>
          <span>{formatSalary(item.expectedSalary, item.expectedSalaryCurrency)}</span>
          <span>{formatDate(item.appliedAt)}</span>
          <span>
            {item.testScore == null ? (
              <em className="admin-chip">No test</em>
            ) : (
              <em className={`admin-chip ${item.testScore >= goodScore ? "good" : "wait"}`}>
                {item.testScore}/100
              </em>
            )}
          </span>
          <span>
            <StatusBadge status={item.status} />
          </span>
          <span className="admin-row-actions">
            <button type="button" onClick={() => onPreviewCv(item.id)} className="link">
              <FileText /> CV
            </button>
            <button type="button" onClick={() => onOpen(item.id)} className="link">
              Detail <ArrowRight />
            </button>
          </span>
        </div>
      ))}
    </div>
  );
}
