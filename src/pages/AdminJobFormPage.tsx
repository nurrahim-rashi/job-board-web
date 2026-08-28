import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { AdminShell } from "../components/Admin/AdminShell";
import { useJobPosting } from "../hooks/api/job-posting/useJobPosting";
import { useCreateJobPosting } from "../hooks/api/job-posting/useCreateJobPosting";
import { useUpdateJobPosting } from "../hooks/api/job-posting/useUpdateJobPosting";
import { useTogglePublishJobPosting } from "../hooks/api/job-posting/useTogglePublishJobPosting";
import { jobCategories, type CreateJobPayload, type JobCategory } from "../types/job-posting";
import { ArrowLeft, Close, Upload } from "../components/site/Icons";

type FormState = {
  title: string;
  category: JobCategory;
  cityLocation: string;
  description: string;
  deadline: string;
  salaryMin: string;
  salaryMax: string;
  tags: string[];
  published: boolean;
};

const draft: FormState = {
  title: "",
  category: jobCategories[0].value,
  cityLocation: "",
  description: "",
  deadline: "",
  salaryMin: "",
  salaryMax: "",
  tags: [],
  published: false,
};

export default function AdminJobFormPage() {
  const { slug } = useParams();
  const { search } = useLocation();
  const navigate = useNavigate();
  const existing = useJobPosting(slug);
  const createJob = useCreateJobPosting();
  const updateJob = useUpdateJobPosting(slug ?? "");
  const togglePublish = useTogglePublishJobPosting();

  const [form, setForm] = useState<FormState>(draft);
  const [banner, setBanner] = useState<File | null>(null);
  const [tag, setTag] = useState("");

  const job = existing.data;

  useEffect(() => {
    if (!job) return;
    setForm({
      title: job.title,
      category: job.category,
      cityLocation: job.cityLocation,
      description: job.description,
      deadline: job.deadline.slice(0, 10),
      salaryMin: job.salaryMin?.toString() ?? "",
      salaryMax: job.salaryMax?.toString() ?? "",
      tags: job.tags ?? [],
      published: job.isPublished,
    });
  }, [job]);

  const editing = Boolean(slug);
  const saving = createJob.isPending || updateJob.isPending || togglePublish.isPending;
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));

  function addTag() {
    const value = tag.trim();
    if (!value || form.tags.includes(value)) return;
    set("tags", [...form.tags, value]);
    setTag("");
  }

  function buildPayload(): CreateJobPayload {
    return {
      title: form.title,
      description: form.description,
      category: form.category,
      cityLocation: form.cityLocation,
      deadline: form.deadline,
      ...(form.salaryMin && { salaryMin: Number(form.salaryMin) }),
      ...(form.salaryMax && { salaryMax: Number(form.salaryMax) }),
      ...(form.tags.length && { tags: form.tags }),
      ...(banner && { banner }),
    };
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = buildPayload();

    if (editing && job) {
      const updated = await updateJob.mutateAsync(payload).catch(() => null);
      if (!updated) return;
      if (form.published !== job.isPublished) {
        await togglePublish.mutateAsync({ slug: job.slug, isPublished: form.published }).catch(() => null);
      }
      navigate({ pathname: `/admin/jobs/${job.slug}`, search });
      return;
    }

    const created = await createJob.mutateAsync(payload).catch(() => null);
    if (!created?.data) return;
    if (form.published) {
      await togglePublish.mutateAsync({ slug: created.data.slug, isPublished: true }).catch(() => null);
    }
    navigate({ pathname: `/admin/jobs/${created.data.slug}`, search });
  }

  if (editing && existing.isPending) {
    return (
      <AdminShell eyebrow="Job postings" title="Loading posting…">
        <div className="admin-empty">
          <h2>Fetching the latest version of this posting.</h2>
        </div>
      </AdminShell>
    );
  }

  if (editing && existing.isError) {
    return (
      <AdminShell eyebrow="Job postings" title="Posting not found">
        <div className="admin-empty">
          <h2>{existing.error.message}</h2>
          <Link className="admin-btn ghost" to={{ pathname: "/admin", search }}>
            Back to job postings
          </Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      eyebrow={editing ? "Edit posting" : "New posting"}
      title={editing ? form.title : "Create a job posting"}
      lead="Fields marked optional can be filled in later — drafts are only visible to your team."
      actions={
        <Link className="admin-btn ghost" to={{ pathname: "/admin", search }}>
          <ArrowLeft /> Back
        </Link>
      }
    >
      <form className="admin-form" onSubmit={submit}>
        <div className="admin-card">
          <h2>Role details</h2>
          <div className="admin-fields">
            <label className="wide">
              Job title
              <input value={form.title} onChange={(event) => set("title", event.target.value)} placeholder="Senior Product Designer" required />
            </label>
            <label>
              Category
              <select value={form.category} onChange={(event) => set("category", event.target.value as JobCategory)}>
                {jobCategories.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              City location
              <input value={form.cityLocation} onChange={(event) => set("cityLocation", event.target.value)} placeholder="Jakarta Selatan" required />
            </label>
            <label>
              Application deadline
              <input type="date" value={form.deadline} onChange={(event) => set("deadline", event.target.value)} required />
            </label>
            <label className="wide">
              Description
              <textarea value={form.description} onChange={(event) => set("description", event.target.value)} placeholder="What the role does, who they work with, and what success looks like." required />
            </label>
          </div>
        </div>

        <div className="admin-card">
          <h2>Salary & tags</h2>
          <div className="admin-fields">
            <label>
              Salary minimum <small>optional</small>
              <input inputMode="numeric" value={form.salaryMin} onChange={(event) => set("salaryMin", event.target.value)} placeholder="18000000" />
            </label>
            <label>
              Salary maximum <small>optional</small>
              <input inputMode="numeric" value={form.salaryMax} onChange={(event) => set("salaryMax", event.target.value)} placeholder="26000000" />
            </label>
            <label className="wide">
              Tags
              <div className="admin-tag-input">
                <input
                  value={tag}
                  onChange={(event) => setTag(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter") return;
                    event.preventDefault();
                    addTag();
                  }}
                  placeholder="Type a skill and press enter"
                />
                <button type="button" onClick={addTag}>
                  Add
                </button>
              </div>
            </label>
          </div>
          {form.tags.length ? (
            <div className="admin-tags">
              {form.tags.map((item) => (
                <span key={item}>
                  {item}
                  <button type="button" aria-label={`Remove ${item}`} onClick={() => set("tags", form.tags.filter((value) => value !== item))}>
                    <Close />
                  </button>
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="admin-card">
          <h2>Banner <small>optional</small></h2>
          <label className="admin-upload">
            <Upload />
            {banner?.name || job?.banner || "Upload a banner image (JPG or PNG, max 2MB)"}
            <input type="file" accept="image/png,image/jpeg" onChange={(event) => setBanner(event.target.files?.[0] ?? null)} />
          </label>
        </div>

        <footer className="admin-form-footer">
          <label className="admin-toggle">
            <button type="button" className={`admin-switch ${form.published ? "on" : ""}`} onClick={() => set("published", !form.published)}>
              <i />
            </button>
            <span>{form.published ? "Publish immediately" : "Save as draft"}</span>
          </label>
          <div>
            <Link className="admin-btn ghost" to={{ pathname: "/admin", search }}>
              Cancel
            </Link>
            <button type="submit" className="admin-btn primary" disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Create posting"}
            </button>
          </div>
        </footer>
      </form>
    </AdminShell>
  );
}
