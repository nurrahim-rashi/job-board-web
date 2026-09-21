import { useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import type { PublicCompany } from "../../services/company.service";
import type { AuthUser } from "../../types/auth";
import type { AssessmentSkillOption } from "../../lib/assessment-api";
import { Calendar, Close, Trash } from "../site/Icons";
import { suppressBrowserAutofill } from "../../lib/form";

type Experience = NonNullable<AuthUser["experiences"]>[number];
type SelectedWork = NonNullable<AuthUser["selectedWork"]>[number];

const workMonth = (value?: string) => value?.match(/^(\d{4}-\d{2})/)?.[1] ?? "";

const monthLabel = (value: string) => {
  if (!value) return "";
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

const monthValue = (value: string) => {
  if (!value || value.toLowerCase() === "present") return "";
  const parsed = new Date(`${value} 1`);
  if (Number.isNaN(parsed.getTime())) return "";
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
};

export function QuickExperienceModal({
  companies,
  initial,
  onDismiss,
  onSave,
  onDelete,
}: {
  companies: PublicCompany[];
  initial?: Experience;
  onDismiss: () => void;
  onSave: (experience: Experience) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}) {
  const [initialStart = "", initialEnd = ""] =
    initial?.period.split(/\s+[–-]\s+/) ?? [];
  const [title, setTitle] = useState(initial?.title ?? "");
  const [companyId, setCompanyId] = useState<number | undefined>(
    initial?.companyId,
  );
  const [company, setCompany] = useState(initial?.company ?? "");
  const [start, setStart] = useState(monthValue(initialStart));
  const [end, setEnd] = useState(monthValue(initialEnd));
  const [current, setCurrent] = useState(
    initialEnd.toLowerCase() === "present",
  );
  const [note, setNote] = useState(initial?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !company.trim()) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        company: company.trim(),
        companyId,
        period: [monthLabel(start), current ? "Present" : monthLabel(end)]
          .filter(Boolean)
          .join(" – "),
        note: note.trim(),
      });
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div
      className="experience-modal"
      onMouseDown={(event) =>
        event.target === event.currentTarget && onDismiss()
      }
    >
      <form
        className="experience-modal-dialog"
        role="dialog"
        aria-modal="true"
        onSubmit={submit}
      >
        <header>
          <div>
            <p className="eyebrow">Profile experience</p>
            <h2>{initial ? "Edit experience" : "Add experience"}</h2>
          </div>
          <button type="button" onClick={onDismiss}>
            ×
          </button>
        </header>
        <div className="profile-fields">
          <label>
            Role <small>required</small>
            <input
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </label>
          <label>
            Company <small>required</small>
            <select
              value={companyId ?? "unlisted"}
              onChange={(event) => {
                const id =
                  event.target.value === "unlisted"
                    ? undefined
                    : Number(event.target.value);
                setCompanyId(id);
                setCompany(
                  id
                    ? (companies.find((item) => item.id === id)?.companyName ??
                        "")
                    : "",
                );
              }}
            >
              <option value="unlisted">Company not listed</option>
              {companies.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.companyName}
                </option>
              ))}
            </select>
          </label>
          {!companyId && (
            <label className="profile-wide">
              Company name <small>required</small>
              <input
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                required
              />
            </label>
          )}
          <label>
            Start month
            <span className="cute-date-input">
              <Calendar />
              <input
                type="month"
                value={start}
                onChange={(event) => setStart(event.target.value)}
              />
            </span>
          </label>
          <label>
            End month
            <span className="cute-date-input">
              <Calendar />
              <input
                type="month"
                value={current ? "" : end}
                min={start || undefined}
                disabled={current}
                onChange={(event) => setEnd(event.target.value)}
              />
            </span>
          </label>
          <label className="profile-wide experience-current">
            <input
              type="checkbox"
              checked={current}
              onChange={(event) => {
                setCurrent(event.target.checked);
                if (event.target.checked) setEnd("");
              }}
            />
            I currently work here
          </label>
          <label className="profile-wide">
            Description
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
        </div>
        <footer>
          {initial && onDelete && (
            <button
              type="button"
              className="experience-modal-delete"
              disabled={saving || deleting}
              onClick={async () => {
                setDeleting(true);
                try {
                  await onDelete();
                } finally {
                  setDeleting(false);
                }
              }}
            >
              <Trash />
              {deleting ? "Deleting…" : "Delete experience"}
            </button>
          )}
          <button
            type="button"
            className="experience-modal-dismiss"
            onClick={onDismiss}
          >
            Dismiss
          </button>
          <button className="profile-submit" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </footer>
      </form>
    </div>,
    document.body,
  );
}

export function SelectedWorkModal({
  companies,
  initial,
  onDismiss,
  onSave,
  onDelete,
}: {
  companies: string[];
  initial?: SelectedWork;
  onDismiss: () => void;
  onSave: (work: SelectedWork) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}) {
  const [work, setWork] = useState<SelectedWork>(
    initial
      ? { ...initial, date: workMonth(initial.date) }
      : { name: "", note: "", url: "", company: "", date: "" },
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!work.name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        ...work,
        name: work.name.trim(),
        note: work.note.trim(),
        date: workMonth(work.date) || undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div
      className="experience-modal"
      onMouseDown={(event) =>
        event.target === event.currentTarget && onDismiss()
      }
    >
      <form
        className="experience-modal-dialog"
        role="dialog"
        aria-modal="true"
        onSubmit={submit}
      >
        <header>
          <div>
            <p className="eyebrow">Portfolio</p>
            <h2>{initial ? "Edit selected work" : "Add selected work"}</h2>
          </div>
          <button type="button" onClick={onDismiss}>
            ×
          </button>
        </header>
        <div className="profile-fields">
          <label>
            Project name <small>required</small>
            <input
              autoFocus
              value={work.name}
              onChange={(event) =>
                setWork({ ...work, name: event.target.value })
              }
              required
            />
          </label>
          <label>
            Project link
            <input
              type="url"
              value={work.url}
              onChange={(event) =>
                setWork({ ...work, url: event.target.value })
              }
              placeholder="https://example.com/project"
            />
          </label>
          <label>
            Project date
            <span className="cute-date-input">
              <Calendar />
              <input
                type="month"
                value={work.date}
                onChange={(event) =>
                  setWork({ ...work, date: event.target.value })
                }
              />
            </span>
          </label>
          <label>
            Associated company
            <select
              value={work.company}
              onChange={(event) =>
                setWork({ ...work, company: event.target.value })
              }
            >
              <option value="">Not associated</option>
              {companies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </label>
          <label className="profile-wide">
            Description
            <textarea
              value={work.note}
              onChange={(event) =>
                setWork({ ...work, note: event.target.value })
              }
            />
          </label>
        </div>
        <footer>
          {initial && onDelete && (
            <button
              type="button"
              className="experience-modal-delete"
              disabled={saving || deleting}
              onClick={async () => {
                setDeleting(true);
                try {
                  await onDelete();
                } finally {
                  setDeleting(false);
                }
              }}
            >
              <Trash />
              {deleting ? "Deleting…" : "Delete work"}
            </button>
          )}
          <button
            type="button"
            className="experience-modal-dismiss"
            onClick={onDismiss}
          >
            Dismiss
          </button>
          <button className="profile-submit" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </footer>
      </form>
    </div>,
    document.body,
  );
}

export function SkillsModal({
  availableSkills,
  assessmentSkills = [],
  subscriptionActive,
  initialSkills,
  onDismiss,
  onGetSkillBadge,
  onSave,
}: {
  availableSkills: string[];
  assessmentSkills?: AssessmentSkillOption[];
  subscriptionActive?: boolean | null;
  initialSkills: string[];
  onDismiss: () => void;
  onGetSkillBadge?: (assessmentId: number) => void | Promise<void>;
  onSave: (skills: string[]) => void | Promise<void>;
}) {
  const [skills, setSkills] = useState(initialSkills);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [openingAssessmentId, setOpeningAssessmentId] = useState<
    number | null
  >(null);
  const [assessmentError, setAssessmentError] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const hasSkill = (candidate: string) =>
    skills.some((skill) => skill.toLowerCase() === candidate.toLowerCase());
  const exactAvailable = availableSkills.find(
    (skill) => skill.toLowerCase() === normalizedQuery,
  );
  const suggestions = normalizedQuery
    ? availableSkills
        .filter(
          (skill) =>
            skill.toLowerCase().includes(normalizedQuery) && !hasSkill(skill),
        )
        .slice(0, 7)
    : availableSkills.filter((skill) => !hasSkill(skill)).slice(0, 7);
  const badgeOpportunities = assessmentSkills.filter(
    (assessment, index, items) =>
      (skills.some(
        (skill) =>
          skill.toLowerCase() === assessment.skillName.toLowerCase(),
      ) ||
        assessment.skillName.toLowerCase() === normalizedQuery) &&
      items.findIndex(
        (item) =>
          item.skillName.toLowerCase() === assessment.skillName.toLowerCase(),
      ) === index,
  );

  const addSkill = (skill: string) => {
    const value = skill.trim();
    if (!value || hasSkill(value) || skills.length >= 50) return;
    setSkills((items) => [...items, value]);
    setQuery("");
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave(skills);
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div
      className="experience-modal"
      onMouseDown={(event) =>
        event.target === event.currentTarget && onDismiss()
      }
    >
      <form
        className="experience-modal-dialog skills-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="skills-modal-title"
        onSubmit={submit}
      >
        <header>
          <div>
            <p className="eyebrow">Profile skills</p>
            <h2 id="skills-modal-title">Add your skills</h2>
          </div>
          <button type="button" onClick={onDismiss} aria-label="Close skills">
            ×
          </button>
        </header>
        <div className="skill-modal-editor">
          {skills.length > 0 && (
            <div className="skill-modal-chips" aria-label="Selected skills">
              {skills.map((skill) => (
                <button
                  type="button"
                  key={skill}
                  onClick={() =>
                    setSkills((items) => items.filter((item) => item !== skill))
                  }
                  aria-label={`Remove ${skill}`}
                >
                  <span>{skill}</span>
                  <Close />
                </button>
              ))}
            </div>
          )}
          <label htmlFor="profile-skill-search">Search or create a skill</label>
          <input
            id="profile-skill-search"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" || !query.trim()) return;
              event.preventDefault();
              addSkill(exactAvailable ?? query);
            }}
            placeholder="e.g. TypeScript, Product Design"
            {...suppressBrowserAutofill}
          />
          <div className="skill-modal-results">
            {suggestions.map((skill) => (
              <button type="button" key={skill} onClick={() => addSkill(skill)}>
                <span>{skill}</span>
                <small>Add</small>
              </button>
            ))}
            {normalizedQuery && !exactAvailable && !hasSkill(query.trim()) && (
              <button
                type="button"
                className="skill-modal-custom"
                onClick={() => addSkill(query)}
              >
                <span>Add “{query.trim()}”</span>
                <small>Custom skill</small>
              </button>
            )}
            {normalizedQuery &&
              suggestions.length === 0 &&
              (exactAvailable || hasSkill(query.trim())) && (
                <p>This skill is already selected.</p>
              )}
          </div>
          <small className="skill-modal-note">
            Custom skills are added only to your profile.
          </small>
          {onGetSkillBadge && badgeOpportunities.length > 0 && (
            <div className="skill-badge-opportunities">
              {badgeOpportunities.map((assessment) => (
                <div key={assessment.id}>
                  <span>
                    <strong>{assessment.skillName}</strong>
                    <small>An assessment is available for this skill.</small>
                  </span>
                  <button
                    type="button"
                    disabled={
                      subscriptionActive === null ||
                      openingAssessmentId !== null
                    }
                    onClick={async () => {
                      setOpeningAssessmentId(assessment.id);
                      setAssessmentError("");
                      try {
                        await onGetSkillBadge(assessment.id);
                      } catch (error) {
                        setAssessmentError(
                          error instanceof Error
                            ? error.message
                            : "Unable to open this assessment.",
                        );
                        setOpeningAssessmentId(null);
                      }
                    }}
                  >
                    {subscriptionActive === null
                      ? "Checking plan…"
                      : openingAssessmentId === assessment.id
                        ? subscriptionActive
                          ? "Starting test…"
                          : "Opening plans…"
                      : "Get skill badge"}
                  </button>
                </div>
              ))}
              {assessmentError && (
                <p className="skill-badge-error" role="alert">
                  {assessmentError}
                </p>
              )}
            </div>
          )}
        </div>
        <footer>
          <button
            type="button"
            className="experience-modal-dismiss"
            onClick={onDismiss}
          >
            Dismiss
          </button>
          <button className="profile-submit" disabled={saving}>
            {saving ? "Saving…" : "Save skills"}
          </button>
        </footer>
      </form>
    </div>,
    document.body,
  );
}
