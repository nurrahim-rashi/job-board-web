import { useEffect, useMemo, useState } from "react";

import { useApplicants } from "../../../hooks/api/applicant/useApplicants";
import { useInterviews } from "../../../hooks/api/interview/useInterviews";
import { Clipboard } from "../../site/Icons";
import { ScheduleInterviewModal, type PreselectedApplicant } from "../Interviews/ScheduleInterviewModal";
import { ApplicantDetailModal, type DetailTab } from "./ApplicantDetailModal";
import { AssignTestModal } from "./AssignTestModal";
import { ApplicantFilters, emptyFilters, hasActiveFilters, toQuery, type FilterState } from "./ApplicantFilters";
import { ApplicantList } from "./ApplicantList";

const PAGE_SIZE = 10;
const ROSTER_LIMIT = 50;

type ApplicantSectionProps = { slug: string; salaryCurrency: string; hasPreSelectionTest: boolean; testDurationMinutes: number | null };

export function ApplicantSection({ slug, salaryCurrency, hasPreSelectionTest, testDurationMinutes }: ApplicantSectionProps) {
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [debounced, setDebounced] = useState<FilterState>(emptyFilters);
  const [page, setPage] = useState(1);
  const [opened, setOpened] = useState<{ id: number; tab: DetailTab } | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [scheduling, setScheduling] = useState<PreselectedApplicant | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(filters), 300);
    return () => clearTimeout(timer);
  }, [filters]);

  useEffect(() => setPage(1), [debounced]);

  const query = useMemo(() => ({ ...toQuery(debounced), page, limit: PAGE_SIZE }), [debounced, page]);
  const { data, isPending, isError, error, isFetching } = useApplicants(slug, query);

  const roster = useInterviews(scheduling ? slug : undefined, { limit: ROSTER_LIMIT, sortOrder: "asc" });

  const applicants = data?.applicants ?? [];
  const meta = data?.meta;
  const totalPage = meta?.totalPage ?? 1;

  const reset = () => setFilters(emptyFilters);

  return (
    <section className="admin-card applicant-section">
      <div className="admin-detail-head">
        <div>
          <p className="eyebrow">Applicants</p>
          <h2>
            {meta ? `${meta.total} ${meta.total === 1 ? "person" : "people"} applied` : "Applicants"}
            {isFetching ? <small> · refreshing…</small> : null}
          </h2>
          <p className="admin-note">Listed from the earliest submission by default. Filter, open a profile, preview the CV, then decide.</p>
        </div>
        {hasPreSelectionTest ? (
          <button type="button" className="admin-btn ghost" onClick={() => setAssigning(true)}>
            <Clipboard /> Send pre-selection test
          </button>
        ) : null}
      </div>

      <ApplicantFilters filters={filters} salaryCurrency={salaryCurrency} onChange={setFilters} onReset={reset} />

      {isPending ? (
        <div className="admin-empty">
          <h2>Loading applicants…</h2>
        </div>
      ) : isError ? (
        <div className="admin-empty">
          <h2>{error.message}</h2>
        </div>
      ) : applicants.length ? (
        <>
          <ApplicantList
            applicants={applicants}
            onOpen={(id) => setOpened({ id, tab: "profile" })}
            onPreviewCv={(id) => setOpened({ id, tab: "cv" })}
          />
          {totalPage > 1 ? (
            <div className="admin-pager">
              <button type="button" className="admin-btn ghost" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
                Previous
              </button>
              <span>
                Page {page} of {totalPage}
              </span>
              <button type="button" className="admin-btn ghost" disabled={page >= totalPage} onClick={() => setPage((current) => current + 1)}>
                Next
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="admin-empty">
          <h2>{hasActiveFilters(debounced) ? "No applicants match those filters." : "No applications yet."}</h2>
          {hasActiveFilters(debounced) ? (
            <button type="button" className="admin-btn ghost" onClick={reset}>
              Clear filters
            </button>
          ) : (
            <p className="admin-note">Publish the posting and share the link to start receiving applicants.</p>
          )}
        </div>
      )}

      <AssignTestModal
        slug={slug}
        open={assigning}
        durationMinutes={testDurationMinutes}
        onClose={() => setAssigning(false)}
      />

      <ApplicantDetailModal
        slug={slug}
        applicationId={opened?.id ?? null}
        hasPreSelectionTest={hasPreSelectionTest}
        initialTab={opened?.tab}
        onScheduleInterview={(applicant) => {
          setOpened(null);
          setScheduling(applicant);
        }}
        onClose={() => setOpened(null)}
      />

      <ScheduleInterviewModal
        slug={slug}
        open={Boolean(scheduling)}
        scheduledIds={(roster.data?.interviews ?? []).map((item) => item.applicationId)}
        preselect={scheduling}
        onClose={() => setScheduling(null)}
      />
    </section>
  );
}
