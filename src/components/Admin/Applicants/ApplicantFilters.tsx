import { Search } from "../../site/Icons";
import { AdminSelect, type AdminSelectOption } from "../AdminSelect";
import { applicationStatuses, educationOptions, statusLabels, type ApplicantQuery, type ApplicationStatus } from "../../../types/applicant";
import { statusColor } from "../../../lib/status";

export type FilterState = {
  name: string;
  minAge: string;
  maxAge: string;
  minSalary: string;
  maxSalary: string;
  education: string;
  status: string;
  sort: SortKey;
};

export type SortKey = "earliest" | "latest" | "salaryLow" | "salaryHigh" | "name";

export const emptyFilters: FilterState = {
  name: "",
  minAge: "",
  maxAge: "",
  minSalary: "",
  maxSalary: "",
  education: "",
  status: "all",
  sort: "earliest",
};

const sorting: Record<SortKey, Pick<ApplicantQuery, "sortBy" | "sortOrder">> = {
  earliest: { sortBy: "createdAt", sortOrder: "asc" },
  latest: { sortBy: "createdAt", sortOrder: "desc" },
  salaryLow: { sortBy: "expectedSalary", sortOrder: "asc" },
  salaryHigh: { sortBy: "expectedSalary", sortOrder: "desc" },
  name: { sortBy: "name", sortOrder: "asc" },
};

const statusOptions: AdminSelectOption[] = [
  { value: "all", label: "All statuses" },
  ...applicationStatuses.map((status) => ({
    value: status,
    label: statusLabels[status],
    color: statusColor(status),
  })),
];

const sortOptions: AdminSelectOption[] = [
  { value: "earliest", label: "Earliest applied" },
  { value: "latest", label: "Latest applied" },
  { value: "salaryLow", label: "Lowest expected salary" },
  { value: "salaryHigh", label: "Highest expected salary" },
  { value: "name", label: "Name A–Z" },
];

const educationQuery = (value: string) => {
  const typed = value.trim();
  return educationOptions.find((option) => option.label.toLowerCase() === typed.toLowerCase())?.query ?? typed;
};

export const AGE_MIN = 15;
export const AGE_MAX = 80;

const number = (value: string, min: number, max: number) => {
  const parsed = Math.round(Number(value));
  if (!value.trim() || !Number.isFinite(parsed)) return undefined;
  return Math.min(Math.max(parsed, min), max);
};

export function toQuery(filters: FilterState): ApplicantQuery {
  const minAge = number(filters.minAge, AGE_MIN, AGE_MAX);
  const maxAge = number(filters.maxAge, AGE_MIN, AGE_MAX);
  const minSalary = number(filters.minSalary, 1, Number.MAX_SAFE_INTEGER);
  const maxSalary = number(filters.maxSalary, 1, Number.MAX_SAFE_INTEGER);
  const ageOk = minAge === undefined || maxAge === undefined || maxAge >= minAge;
  const salaryOk = minSalary === undefined || maxSalary === undefined || maxSalary >= minSalary;

  return {
    ...(filters.name.trim() && { name: filters.name.trim() }),
    ...(minAge !== undefined && { minAge }),
    ...(maxAge !== undefined && ageOk && { maxAge }),
    ...(minSalary !== undefined && { minSalary }),
    ...(maxSalary !== undefined && salaryOk && { maxSalary }),
    ...(educationQuery(filters.education) && { education: educationQuery(filters.education) }),
    ...(filters.status !== "all" && { status: filters.status as ApplicationStatus }),
    ...sorting[filters.sort],
  };
}

export function rangeWarnings(filters: FilterState) {
  const warnings: string[] = [];
  const minAge = number(filters.minAge, AGE_MIN, AGE_MAX);
  const maxAge = number(filters.maxAge, AGE_MIN, AGE_MAX);
  const minSalary = number(filters.minSalary, 1, Number.MAX_SAFE_INTEGER);
  const maxSalary = number(filters.maxSalary, 1, Number.MAX_SAFE_INTEGER);
  if (minAge !== undefined && maxAge !== undefined && maxAge < minAge) {
    warnings.push("Maximum age is below the minimum, so it is ignored.");
  }
  if (minSalary !== undefined && maxSalary !== undefined && maxSalary < minSalary) {
    warnings.push("Maximum salary is below the minimum, so it is ignored.");
  }
  return warnings;
}

export function hasActiveFilters(filters: FilterState) {
  return (
    Boolean(filters.name.trim() || filters.education.trim()) ||
    Boolean(filters.minAge || filters.maxAge || filters.minSalary || filters.maxSalary) ||
    filters.status !== "all"
  );
}

type ApplicantFiltersProps = {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
};

export function ApplicantFilters({ filters, onChange, onReset }: ApplicantFiltersProps) {
  const set = <Key extends keyof FilterState>(key: Key, value: FilterState[Key]) =>
    onChange({ ...filters, [key]: value });

  const warnings = rangeWarnings(filters);

  return (
    <section className="applicant-filters">
      <div className="applicant-filters-top">
        <label className="admin-search">
          <Search />
          <input
            value={filters.name}
            onChange={(event) => set("name", event.target.value)}
            placeholder="Search applicant name"
          />
        </label>
        <AdminSelect
          ariaLabel="Filter by status"
          value={filters.status}
          onChange={(status) => set("status", status)}
          options={statusOptions}
        />
        <AdminSelect
          label="Sort"
          value={filters.sort}
          onChange={(sort) => set("sort", sort as SortKey)}
          options={sortOptions}
        />
      </div>

      <div className="applicant-filters-grid">
        <div className="applicant-field">
          <span>Age</span>
          <div className="applicant-range">
            <input
              type="number"
              min={AGE_MIN}
              max={AGE_MAX}
              value={filters.minAge}
              onChange={(event) => set("minAge", event.target.value)}
              placeholder="Min"
              aria-label="Minimum age"
            />
            <i>–</i>
            <input
              type="number"
              min={AGE_MIN}
              max={AGE_MAX}
              value={filters.maxAge}
              onChange={(event) => set("maxAge", event.target.value)}
              placeholder="Max"
              aria-label="Maximum age"
            />
          </div>
        </div>

        <div className="applicant-field">
          <span>Expected salary (Rp)</span>
          <div className="applicant-range">
            <input
              type="number"
              min={0}
              step={500000}
              value={filters.minSalary}
              onChange={(event) => set("minSalary", event.target.value)}
              placeholder="Min"
              aria-label="Minimum expected salary"
            />
            <i>–</i>
            <input
              type="number"
              min={0}
              step={500000}
              value={filters.maxSalary}
              onChange={(event) => set("maxSalary", event.target.value)}
              placeholder="Max"
              aria-label="Maximum expected salary"
            />
          </div>
        </div>

        <div className="applicant-field">
          <span>Education</span>
          <input
            list="applicant-education"
            value={filters.education}
            onChange={(event) => set("education", event.target.value)}
            placeholder="e.g. S1"
            aria-label="Last education"
          />
          <datalist id="applicant-education">
            {educationOptions.map((option) => (
              <option key={option.label} value={option.label} />
            ))}
          </datalist>
        </div>

        <div className="applicant-field end">
          <button type="button" className="admin-btn ghost" onClick={onReset} disabled={!hasActiveFilters(filters)}>
            Clear filters
          </button>
        </div>
      </div>

      {warnings.map((warning) => (
        <p key={warning} className="applicant-filters-warning">
          {warning}
        </p>
      ))}
    </section>
  );
}
