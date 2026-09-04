import { ArrowRight, FileText } from "../../site/Icons";
import { ApplicantAvatar } from "./ApplicantAvatar";
import { educationLabel, formatRupiah } from "./applicantHelpers";
import { formatDate, questionCount } from "../adminData";
import { statusLabels, statusTones, type ApplicantListItem } from "../../../types/applicant";

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
          </span>
          <span>{item.applicant.age ?? "—"}</span>
          <span>{educationLabel(item.applicant.lastEducation)}</span>
          <span>{formatRupiah(item.expectedSalary)}</span>
          <span>{formatDate(item.appliedAt)}</span>
          <span>
            {item.testScore == null ? (
              <em className="admin-chip">No test</em>
            ) : (
              <em className={`admin-chip ${item.testScore >= 18 ? "good" : "wait"}`}>
                {item.testScore}/{questionCount}
              </em>
            )}
          </span>
          <span>
            <em className={`admin-chip ${statusTones[item.status]}`}>{statusLabels[item.status]}</em>
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
