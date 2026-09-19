import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdminShell } from "../components/Admin/AdminShell";
import { AdminSelect, type AdminSelectOption } from "../components/Admin/AdminSelect";
import { useJobPosting } from "../hooks/api/job-posting/useJobPosting";
import { useCreateJobPosting } from "../hooks/api/job-posting/useCreateJobPosting";
import { useUpdateJobPosting } from "../hooks/api/job-posting/useUpdateJobPosting";
import { useTogglePublishJobPosting } from "../hooks/api/job-posting/useTogglePublishJobPosting";
import { jobCategories, type CreateJobPayload, type JobCategory } from "../types/job-posting";
import { ArrowLeft, Close, Upload } from "../components/site/Icons";
import { getCountries, getWorldwideCities, getWorldwideStates, type Region } from "../services/region.service";
import { CurrencySelect } from "../components/site/CurrencySelect";
import { LocationFilterCombobox } from "../components/site/LocationFilterCombobox";

type FormState = {
  title: string;
  category: JobCategory;
  cityLocation: string;
  provinceLocation: string;
  countryLocation: string;
  description: string;
  deadline: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  tags: string[];
  published: boolean;
};

const draft: FormState = {
  title: "",
  category: jobCategories[0].value,
  cityLocation: "",
  provinceLocation: "",
  countryLocation: "Indonesia",
  description: "",
  deadline: "",
  salaryMin: "",
  salaryMax: "",
  salaryCurrency: "IDR",
  tags: [],
  published: false,
};

const categoryOptions: AdminSelectOption[] = jobCategories.map((item) => ({
  value: item.value,
  label: item.label,
}));

const dateInputLimit = (daysFromToday: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export default function AdminJobFormPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const existing = useJobPosting(slug);
  const createJob = useCreateJobPosting();
  const updateJob = useUpdateJobPosting(slug ?? "");
  const togglePublish = useTogglePublishJobPosting();

  const [form, setForm] = useState<FormState>(draft);
  const [banner, setBanner] = useState<File | null>(null);
  const [removeExistingBanner, setRemoveExistingBanner] = useState(false);
  const [tag, setTag] = useState("");
  const [countries, setCountries] = useState<Region[]>([]);
  const [states, setStates] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [statesLoading, setStatesLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const job = existing.data;

  useEffect(() => {
    let active = true;
    getCountries()
      .then((items) => active && setCountries(items))
      .catch(() => active && setCountries([]));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!form.countryLocation) {
      setStates([]);
      return;
    }
    let active = true;
    setStatesLoading(true);
    getWorldwideStates(form.countryLocation)
      .then((items) => active && setStates(items))
      .catch(() => active && setStates([]))
      .finally(() => active && setStatesLoading(false));
    return () => { active = false; };
  }, [form.countryLocation]);

  useEffect(() => {
    if (!form.countryLocation || !form.provinceLocation) {
      setCities([]);
      return;
    }
    let active = true;
    setCitiesLoading(true);
    getWorldwideCities(form.countryLocation, form.provinceLocation)
      .then((items) => active && setCities(items))
      .catch(() => active && setCities([]))
      .finally(() => active && setCitiesLoading(false));
    return () => { active = false; };
  }, [form.countryLocation, form.provinceLocation]);

  useEffect(() => {
    if (!job) return;
    setRemoveExistingBanner(false);
    setForm({
      title: job.title,
      category: job.category,
      cityLocation: job.cityLocation,
      provinceLocation: job.provinceLocation ?? "",
      countryLocation: job.countryLocation ?? "Indonesia",
      description: job.description,
      deadline: job.deadline.slice(0, 10),
      salaryMin: job.salaryMin?.toString() ?? "",
      salaryMax: job.salaryMax?.toString() ?? "",
      salaryCurrency: job.salaryCurrency ?? "IDR",
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

  function buildPayload(): CreateJobPayload & { removeBanner?: boolean } {
    return {
      title: form.title,
      description: form.description,
      category: form.category,
      cityLocation: form.cityLocation,
      provinceLocation: form.provinceLocation || undefined,
      countryLocation: form.countryLocation,
      deadline: form.deadline,
      ...(form.salaryMin && { salaryMin: Number(form.salaryMin) }),
      ...(form.salaryMax && { salaryMax: Number(form.salaryMax) }),
      salaryCurrency: form.salaryCurrency,
      ...(form.tags.length && { tags: form.tags }),
      ...(banner && { banner }),
      ...(editing && removeExistingBanner && !banner
        ? { removeBanner: true }
        : {}),
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
      navigate(`/admin/jobs/${job.slug}`);
      return;
    }

    const created = await createJob.mutateAsync(payload).catch(() => null);
    if (!created?.data) return;
    if (form.published) {
      await togglePublish.mutateAsync({ slug: created.data.slug, isPublished: true }).catch(() => null);
    }
    navigate(`/admin/jobs/${created.data.slug}`);
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
          <Link className="admin-btn ghost" to="/admin">
            Back to job postings
          </Link>
        </div>
      </AdminShell>
    );
  }

  const countryOptions = countries.map((country) => ({
    value: country.name,
    label: country.name,
  }));
  const stateOptions = states.map((state) => ({
    value: state.name,
    label: `${state.name}, ${form.countryLocation}`,
  }));
  const cityOptions = cities.map((city) => ({
    value: city.name,
    label: `${city.name}, ${form.provinceLocation}, ${form.countryLocation}`,
  }));

  return (
    <AdminShell
      eyebrow={editing ? "Edit posting" : "New posting"}
      title={editing ? form.title : "Create a job posting"}
      lead="Fields marked optional can be filled in later — drafts are only visible to your team."
      actions={
        <Link className="admin-btn ghost" to="/admin">
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
            <AdminSelect
              variant="field"
              label="Category"
              value={form.category}
              onChange={(next) => set("category", next as JobCategory)}
              options={categoryOptions}
            />
            <label>
              Work country
              <LocationFilterCombobox
                value={form.countryLocation || "all"}
                options={countryOptions}
                placeholder="Choose country"
                loadingLabel="Loading countries…"
                loading={!countries.length}
                onChange={(next) => {
                  set("countryLocation", next === "all" ? "" : next);
                  set("provinceLocation", "");
                  set("cityLocation", "");
                }}
              />
            </label>
            <label>
              Work province / state
              <LocationFilterCombobox
                value={form.provinceLocation || "all"}
                options={stateOptions}
                placeholder="Choose province / state"
                loadingLabel="Loading provinces / states…"
                loading={statesLoading}
                disabled={!form.countryLocation}
                onChange={(next) => {
                  set("provinceLocation", next === "all" ? "" : next);
                  set("cityLocation", "");
                }}
              />
            </label>
            <label>
              Work city
              <LocationFilterCombobox
                value={form.cityLocation || "all"}
                options={cityOptions}
                placeholder="Choose city"
                loadingLabel="Loading cities…"
                loading={citiesLoading}
                disabled={!form.provinceLocation}
                onChange={(next) => set("cityLocation", next === "all" ? "" : next)}
              />
            </label>
            <label>
              Application deadline
              <input type="date" min={dateInputLimit(0)} max={dateInputLimit(360)} value={form.deadline} onChange={(event) => set("deadline", event.target.value)} required />
              <small>Choose today or any date within the next 360 days.</small>
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
            <label className="wide">
              Salary currency
              <CurrencySelect
                value={form.salaryCurrency}
                onChange={(currency) => set("salaryCurrency", currency)}
                disabled={saving}
              />
            </label>
            <label>
              Salary minimum <small>optional</small>
              <input type="number" inputMode="numeric" min="1" max="2147483647" value={form.salaryMin} onChange={(event) => set("salaryMin", event.target.value)} placeholder="18000000" />
            </label>
            <label>
              Salary maximum <small>optional</small>
              <input type="number" inputMode="numeric" min="1" max="2147483647" value={form.salaryMax} onChange={(event) => set("salaryMax", event.target.value)} placeholder="26000000" />
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
          <div className="file-upload-row"><label className="admin-upload">
            <Upload />
            {banner?.name || (!removeExistingBanner && job?.banner) || "Upload a banner image (JPG, PNG, WEBP, GIF, AVIF, or HEIC; max 2MB)"}
            <input ref={bannerInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.gif,.avif,.heic,.heif" onChange={(event) => { setBanner(event.target.files?.[0] ?? null); setRemoveExistingBanner(false); }} />
          </label>{(banner || (!removeExistingBanner && job?.banner)) && <button className="file-remove" type="button" aria-label={banner ? "Remove selected banner" : "Delete uploaded banner"} onClick={() => { if (banner) setBanner(null); else setRemoveExistingBanner(true); if (bannerInputRef.current) bannerInputRef.current.value = ""; }}><Close /></button>}</div>
        </div>

        <footer className="admin-form-footer">
          <label className="admin-toggle">
            <button type="button" className={`admin-switch ${form.published ? "on" : ""}`} onClick={() => set("published", !form.published)}>
              <i />
            </button>
            <span>{form.published ? "Publish immediately" : "Save as draft"}</span>
          </label>
          <div>
            <Link className="admin-btn ghost" to="/admin">
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
