import { useState, type FormEvent } from "react";
import type { PublicCompany } from "../../services/company.service";
import type { AuthUser } from "../../types/auth";
import { Calendar } from "../site/Icons";

type Experience = NonNullable<AuthUser["experiences"]>[number];
type SelectedWork = NonNullable<AuthUser["selectedWork"]>[number];

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
}: {
  companies: PublicCompany[];
  initial?: Experience;
  onDismiss: () => void;
  onSave: (experience: Experience) => void | Promise<void>;
}) {
  const [initialStart = "", initialEnd = ""] = initial?.period.split(/\s+[–-]\s+/) ?? [];
  const [title, setTitle] = useState(initial?.title ?? "");
  const [companyId, setCompanyId] = useState<number | undefined>(initial?.companyId);
  const [company, setCompany] = useState(initial?.company ?? "");
  const [start, setStart] = useState(monthValue(initialStart));
  const [end, setEnd] = useState(monthValue(initialEnd));
  const [current, setCurrent] = useState(initialEnd.toLowerCase() === "present");
  const [note, setNote] = useState(initial?.note ?? "");
  const [saving, setSaving] = useState(false);

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

  return (
    <div className="experience-modal" onMouseDown={(event) => event.target === event.currentTarget && onDismiss()}>
      <form className="experience-modal-dialog" role="dialog" aria-modal="true" onSubmit={submit}>
        <header><div><p className="eyebrow">Profile experience</p><h2>{initial ? "Edit experience" : "Add experience"}</h2></div><button type="button" onClick={onDismiss}>×</button></header>
        <div className="profile-fields">
          <label>Role <small>required</small><input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
          <label>Company <small>required</small><select value={companyId ?? "unlisted"} onChange={(event) => { const id = event.target.value === "unlisted" ? undefined : Number(event.target.value); setCompanyId(id); setCompany(id ? companies.find((item) => item.id === id)?.companyName ?? "" : ""); }}><option value="unlisted">Company not listed</option>{companies.map((item) => <option key={item.id} value={item.id}>{item.companyName}</option>)}</select></label>
          {!companyId && <label className="profile-wide">Company name <small>required</small><input value={company} onChange={(event) => setCompany(event.target.value)} required /></label>}
          <label>Start month<span className="cute-date-input"><Calendar /><input type="month" value={start} onChange={(event) => setStart(event.target.value)} /></span></label>
          <label>End month<span className="cute-date-input"><Calendar /><input type="month" value={current ? "" : end} min={start || undefined} disabled={current} onChange={(event) => setEnd(event.target.value)} /></span></label>
          <label className="profile-wide experience-current"><input type="checkbox" checked={current} onChange={(event) => { setCurrent(event.target.checked); if (event.target.checked) setEnd(""); }} />I currently work here</label>
          <label className="profile-wide">Description<textarea value={note} onChange={(event) => setNote(event.target.value)} /></label>
        </div>
        <footer><button type="button" className="experience-modal-dismiss" onClick={onDismiss}>Dismiss</button><button className="profile-submit" disabled={saving}>{saving ? "Saving…" : "Save"}</button></footer>
      </form>
    </div>
  );
}

export function SelectedWorkModal({
  companies,
  initial,
  onDismiss,
  onSave,
}: {
  companies: string[];
  initial?: SelectedWork;
  onDismiss: () => void;
  onSave: (work: SelectedWork) => void | Promise<void>;
}) {
  const [work, setWork] = useState<SelectedWork>(initial ?? { name: "", note: "", url: "", company: "", date: "" });
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!work.name.trim()) return;
    setSaving(true);
    try { await onSave({ ...work, name: work.name.trim(), note: work.note.trim() }); }
    finally { setSaving(false); }
  }

  return (
    <div className="experience-modal" onMouseDown={(event) => event.target === event.currentTarget && onDismiss()}>
      <form className="experience-modal-dialog" role="dialog" aria-modal="true" onSubmit={submit}>
        <header><div><p className="eyebrow">Portfolio</p><h2>{initial ? "Edit selected work" : "Add selected work"}</h2></div><button type="button" onClick={onDismiss}>×</button></header>
        <div className="profile-fields">
          <label>Project name <small>required</small><input autoFocus value={work.name} onChange={(event) => setWork({ ...work, name: event.target.value })} required /></label>
          <label>Project link<input type="url" value={work.url} onChange={(event) => setWork({ ...work, url: event.target.value })} placeholder="https://example.com/project" /></label>
          <label>Project date<span className="cute-date-input"><Calendar /><input type="month" value={work.date} onChange={(event) => setWork({ ...work, date: event.target.value })} /></span></label>
          <label>Associated company<select value={work.company} onChange={(event) => setWork({ ...work, company: event.target.value })}><option value="">Not associated</option>{companies.map((company) => <option key={company} value={company}>{company}</option>)}</select></label>
          <label className="profile-wide">Description<textarea value={work.note} onChange={(event) => setWork({ ...work, note: event.target.value })} /></label>
        </div>
        <footer><button type="button" className="experience-modal-dismiss" onClick={onDismiss}>Dismiss</button><button className="profile-submit" disabled={saving}>{saving ? "Saving…" : "Save"}</button></footer>
      </form>
    </div>
  );
}
