import { useEffect, useMemo, useState } from "react";

import { useDeleteInterview } from "../../../hooks/api/interview/useDeleteInterview";
import { useInterviews } from "../../../hooks/api/interview/useInterviews";
import type { Interview } from "../../../types/interview";
import { Calendar } from "../../site/Icons";
import { ConfirmDialog } from "../ConfirmDialog";
import { EditInterviewModal } from "./EditInterviewModal";
import {
  emptyInterviewFilters,
  hasActiveInterviewFilters,
  InterviewFilters,
  toInterviewQuery,
  type InterviewFilterState,
} from "./InterviewFilters";
import { InterviewList } from "./InterviewList";
import { ScheduleInterviewModal } from "./ScheduleInterviewModal";
import { daysUntil, formatSchedule } from "./interviewHelpers";

const PAGE_SIZE = 10;
const ROSTER_LIMIT = 50;

type InterviewSectionProps = { slug: string };

export function InterviewSection({ slug }: InterviewSectionProps) {
  const [filters, setFilters] = useState<InterviewFilterState>(emptyInterviewFilters);
  const [page, setPage] = useState(1);
  const [scheduling, setScheduling] = useState(false);
  const [editing, setEditing] = useState<Interview | null>(null);
  const [deleting, setDeleting] = useState<Interview | null>(null);

  const deleteInterview = useDeleteInterview();

  useEffect(() => setPage(1), [filters]);

  const query = useMemo(() => ({ ...toInterviewQuery(filters), page, limit: PAGE_SIZE }), [filters, page]);
  const { data, isPending, isError, error, isFetching } = useInterviews(slug, query);

  const roster = useInterviews(slug, { limit: ROSTER_LIMIT, sortOrder: "asc" });
  const booked = roster.data?.interviews ?? [];

  const interviews = data?.interviews ?? [];
  const meta = data?.meta;
  const totalPage = meta?.totalPage ?? 1;

  const upcoming = booked.filter((item) => item.status === "SCHEDULED" && daysUntil(item.interviewDate) >= 0);
  const tomorrow = upcoming.filter((item) => daysUntil(item.interviewDate) === 1);
  const nextUp = upcoming[0];

  return (
    <section className="admin-card applicant-section">
      <div className="admin-detail-head">
        <div>
          <p className="eyebrow">Interviews</p>
          <h2>
            {meta ? `${meta.total} schedule${meta.total === 1 ? "" : "s"}` : "Interview schedules"}
            {isFetching ? <small> · refreshing…</small> : null}
          </h2>
          <p className="admin-note">
            Pick the applicants you want to meet and give each one their own slot. Everyone is emailed on the spot, and
            both the applicant and your company inbox get a reminder the day before.
          </p>
        </div>
        <button type="button" className="admin-btn primary" onClick={() => setScheduling(true)}>
          <Calendar /> Schedule interviews
        </button>
      </div>

      <div className="admin-stats interview-stats">
        <article>
          <span>Upcoming</span>
          <b>{upcoming.length}</b>
          <small>{nextUp ? `Next: ${formatSchedule(nextUp.interviewDate)}` : "Nothing booked yet"}</small>
        </article>
        <article>
          <span>Tomorrow</span>
          <b>{tomorrow.length}</b>
          <small>Reminder emails go out today</small>
        </article>
        <article>
          <span>Completed</span>
          <b>{booked.filter((item) => item.status === "COMPLETED").length}</b>
          <small>{booked.filter((item) => item.status === "CANCELLED").length} cancelled</small>
        </article>
      </div>

      <InterviewFilters filters={filters} onChange={setFilters} onReset={() => setFilters(emptyInterviewFilters)} />

      {isPending ? (
        <div className="admin-empty">
          <h2>Loading interview schedules…</h2>
        </div>
      ) : isError ? (
        <div className="admin-empty">
          <h2>{error.message}</h2>
        </div>
      ) : interviews.length ? (
        <>
          <InterviewList interviews={interviews} onEdit={setEditing} onDelete={setDeleting} />
          {totalPage > 1 ? (
            <div className="admin-pager">
              <button
                type="button"
                className="admin-btn ghost"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPage}
              </span>
              <button
                type="button"
                className="admin-btn ghost"
                disabled={page >= totalPage}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="admin-empty">
          <h2>{hasActiveInterviewFilters(filters) ? "No interviews match those filters." : "No interviews scheduled."}</h2>
          {hasActiveInterviewFilters(filters) ? (
            <button type="button" className="admin-btn ghost" onClick={() => setFilters(emptyInterviewFilters)}>
              Clear filters
            </button>
          ) : (
            <>
              <p className="admin-note">
                Shortlist a few applicants and book them in. Each one gets their own time slot and an email invitation.
              </p>
              <button type="button" className="admin-btn primary" onClick={() => setScheduling(true)}>
                <Calendar /> Schedule interviews
              </button>
            </>
          )}
        </div>
      )}

      <ScheduleInterviewModal
        slug={slug}
        open={scheduling}
        scheduledIds={booked.map((item) => item.applicationId)}
        onClose={() => setScheduling(false)}
      />

      <EditInterviewModal
        slug={slug}
        interview={editing}
        onClose={() => setEditing(null)}
        onDelete={(interview) => {
          setEditing(null);
          setDeleting(interview);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this interview?"
        body={
          deleting
            ? `${deleting.applicant.name} is booked for ${formatSchedule(deleting.interviewDate)}. Deleting the schedule emails them that the interview is off and frees the slot.`
            : ""
        }
        confirmLabel={deleteInterview.isPending ? "Deleting…" : "Delete schedule"}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return;
          deleteInterview.mutate(
            { slug, interviewId: deleting.id },
            { onSuccess: () => setDeleting(null) },
          );
        }}
      />
    </section>
  );
}
