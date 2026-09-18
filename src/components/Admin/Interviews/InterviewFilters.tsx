import { interviewStatusLabels, interviewStatuses, type InterviewQuery } from "../../../types/interview";
import { Search } from "../../site/Icons";
import { AdminSelect, type AdminSelectOption } from "../AdminSelect";
import { statusColor } from "../../../lib/status";

const statusOptions: AdminSelectOption[] = [
  { value: "all", label: "All statuses" },
  ...interviewStatuses.map((status) => ({
    value: status,
    label: interviewStatusLabels[status],
    color: statusColor(status),
  })),
];

const sortOptions: AdminSelectOption[] = [
  { value: "asc", label: "Soonest first" },
  { value: "desc", label: "Latest first" },
];

export type InterviewFilterState = {
  status: string;
  dateFrom: string;
  dateTo: string;
  sortOrder: "asc" | "desc";
};

export const emptyInterviewFilters: InterviewFilterState = {
  status: "all",
  dateFrom: "",
  dateTo: "",
  sortOrder: "asc",
};

export function toInterviewQuery(filters: InterviewFilterState): InterviewQuery {
  const from = filters.dateFrom ? new Date(`${filters.dateFrom}T00:00:00`) : null;
  const to = filters.dateTo ? new Date(`${filters.dateTo}T23:59:59`) : null;
  const ordered = !from || !to || to.getTime() >= from.getTime();

  return {
    ...(filters.status !== "all" && { status: filters.status as InterviewQuery["status"] }),
    ...(from && { dateFrom: from.toISOString() }),
    ...(to && ordered && { dateTo: to.toISOString() }),
    sortOrder: filters.sortOrder,
  };
}

export function hasActiveInterviewFilters(filters: InterviewFilterState) {
  return filters.status !== "all" || Boolean(filters.dateFrom || filters.dateTo);
}

export function interviewRangeWarning(filters: InterviewFilterState) {
  if (!filters.dateFrom || !filters.dateTo) return null;
  return new Date(filters.dateTo) < new Date(filters.dateFrom)
    ? "The end date is before the start date, so it is ignored."
    : null;
}

type InterviewFiltersProps = {
  filters: InterviewFilterState;
  onChange: (filters: InterviewFilterState) => void;
  onReset: () => void;
};

export function InterviewFilters({ filters, onChange, onReset }: InterviewFiltersProps) {
  const set = <Key extends keyof InterviewFilterState>(key: Key, value: InterviewFilterState[Key]) =>
    onChange({ ...filters, [key]: value });

  const warning = interviewRangeWarning(filters);

  return (
    <section className="applicant-filters">
      <div className="applicant-filters-top">
        <div className="interview-filter-hint">
          <Search /> Narrow the schedule down
        </div>
        <AdminSelect
          ariaLabel="Filter by interview status"
          value={filters.status}
          onChange={(status) => set("status", status)}
          options={statusOptions}
        />
        <AdminSelect
          label="Sort"
          value={filters.sortOrder}
          onChange={(order) => set("sortOrder", order as "asc" | "desc")}
          options={sortOptions}
        />
      </div>

      <div className="applicant-filters-grid">
        <div className="applicant-field">
          <span>From date</span>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(event) => set("dateFrom", event.target.value)}
            aria-label="Interviews from"
          />
        </div>
        <div className="applicant-field">
          <span>To date</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(event) => set("dateTo", event.target.value)}
            aria-label="Interviews until"
          />
        </div>
        <div className="applicant-field end">
          <button
            type="button"
            className="admin-btn ghost"
            onClick={onReset}
            disabled={!hasActiveInterviewFilters(filters)}
          >
            Clear filters
          </button>
        </div>
      </div>

      {warning ? <p className="applicant-filters-warning">{warning}</p> : null}
    </section>
  );
}
