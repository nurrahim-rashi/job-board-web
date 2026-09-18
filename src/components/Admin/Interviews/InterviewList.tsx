import { type Interview } from "../../../types/interview";
import { ArrowRight, MapPin, Video } from "../../site/Icons";
import { StatusBadge } from "../../site/StatusBadge";
import { ApplicantAvatar } from "../Applicants/ApplicantAvatar";
import { countdownLabel, formatDay, isMeetingLink, reminderState } from "./interviewHelpers";

type InterviewListProps = {
  interviews: Interview[];
  onEdit: (interview: Interview) => void;
  onDelete: (interview: Interview) => void;
};

export function InterviewList({ interviews, onEdit, onDelete }: InterviewListProps) {
  return (
    <div className="admin-table interviews">
      <div className="admin-row admin-row-head">
        <span>Applicant</span>
        <span>Schedule</span>
        <span>Where</span>
        <span>Status</span>
        <span />
      </div>
      {interviews.map((interview) => {
        const reminder = reminderState(interview);
        const online = isMeetingLink(interview.locationOrLink);

        return (
          <div key={interview.id} className="admin-row">
            <span className="applicant-identity">
              <ApplicantAvatar name={interview.applicant.name} avatar={interview.applicant.avatar} />
              <b>{interview.applicant.name}</b>
            </span>
            <span className="interview-when">
              <b>{formatDay(interview.interviewDate)}</b>
              <small>{countdownLabel(interview.interviewDate)}</small>
            </span>
            <span className="interview-where">
              {online ? <Video /> : <MapPin />}
              {online ? (
                <a href={interview.locationOrLink} target="_blank" rel="noreferrer">
                  Meeting link
                </a>
              ) : (
                <span title={interview.locationOrLink}>{interview.locationOrLink}</span>
              )}
            </span>
            <span>
              <StatusBadge status={interview.status} />
              <small>H-1 · {reminder.label}</small>
            </span>
            <span className="admin-row-actions">
              <button type="button" className="link" onClick={() => onEdit(interview)}>
                Manage <ArrowRight />
              </button>
              <button type="button" onClick={() => onDelete(interview)}>
                Delete
              </button>
            </span>
          </div>
        );
      })}
    </div>
  );
}
