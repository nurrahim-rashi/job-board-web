import { useEffect, useRef, useState, type DragEvent, type FormEvent } from "react";
import { getSubscriptionStatus, updateProfile } from "../../services/auth.service";
import { submitApplication } from "../../services/application.service";
import { useAuth } from "../../stores/useAuth";
import { Close, Pencil, Upload } from "../site/Icons";
import { educationOptions } from "../../constants/education";
import { getProvinces, getRegencies, type Region } from "../../services/region.service";
import { fetchSkillNames } from "../../lib/assessment-api";

type Props = { open: boolean; title: string; slug: string; onClose: () => void; onSubmitted: () => void };

export function ApplicationModal({ open, title, slug, onClose, onSubmitted }: Props) {
  const user = useAuth((state) => state.user);
  const [step, setStep] = useState<"application" | "profile">("application");
  const [file, setFile] = useState<File | null>(null);
  const [salary, setSalary] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [choosingCv, setChoosingCv] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editSecondary, setEditSecondary] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [provinceCode, setProvinceCode] = useState("");
  const [cities, setCities] = useState<Region[]>([]);
  const [skillNames, setSkillNames] = useState<string[]>([]);
  const [skillQuery, setSkillQuery] = useState("");
  const [draftSkills, setDraftSkills] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setStep("application"); setFile(null); setSalary(""); setError("");
    setCheckingSubscription(true);
    getSubscriptionStatus().then(({ active }) => setChoosingCv(active)).catch(() => setChoosingCv(false)).finally(() => setCheckingSubscription(false));
    getProvinces().then(setProvinces).catch(() => setProvinces([]));
    fetchSkillNames().then(setSkillNames).catch(() => setSkillNames([]));
  }, [open]);

  useEffect(() => {
    if (!provinceCode) return setCities([]);
    getRegencies(provinceCode).then(setCities).catch(() => setCities([]));
  }, [provinceCode]);

  if (!open || !user) return null;

  function chooseFile(selected?: File) {
    if (!selected) return;
    if (selected.type !== "application/pdf") return setError("CV must be a PDF file.");
    if (selected.size > 1024 * 1024) return setError("CV must be 1MB or smaller.");
    setFile(selected); setError("");
  }

  function dropFile(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files[0]);
  }

  function beginEdit(field: string, value: string, secondary = "") {
    setEditingField(field); setEditValue(value); setEditSecondary(secondary); setError("");
    if (field === "location") setProvinceCode(provinces.find((province) => province.name === secondary)?.code ?? "");
    if (field === "skills") { setDraftSkills(user?.skills ?? []); setSkillQuery(""); }
  }

  async function saveProfileField() {
    if (!editingField) return;
    setSavingProfile(true); setError("");
    try {
      const payload = editingField === "location" ? { city: editValue, province: provinces.find((province) => province.code === provinceCode)?.name ?? editSecondary }
        : editingField === "skills" ? { skills: draftSkills }
        : { [editingField]: editValue };
      await updateProfile(payload);
      setEditingField(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update profile");
    } finally { setSavingProfile(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || step !== "profile") return;
    setSubmitting(true); setError("");
    try {
      await submitApplication(slug, file, Number(salary) || undefined);
      onSubmitted();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to submit application");
    } finally { setSubmitting(false); }
  }

  return <div className="apply-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <form className={step === "profile" ? "apply-profile-step" : ""} onSubmit={submit}>
      <button type="button" aria-label="Close" onClick={onClose}><Close /></button>
      <div className="apply-step-label"><span className={step === "application" ? "active" : "done"}>1</span><i /><span className={step === "profile" ? "active" : ""}>2</span></div>
      <p className="eyebrow">{step === "application" ? "Application details" : "Final review"}</p>
      <h2>{step === "application" ? `Apply for ${title}` : "Your profile"}</h2>
      {step === "application" ? checkingSubscription ? <p>Checking your CV options…</p> : choosingCv ? <>
        <p>How would you like to add your CV?</p>
        <div className="cv-choice"><button type="button" onClick={() => setChoosingCv(false)}><Upload /> Upload CV</button><a href="/profile/cv-generator">Generate a new CV</a></div>
      </> : <>
        <label>CV <small>PDF, maximum 1MB</small></label>
        <div className="file-upload-row"><label className={`file-input apply-file-drop ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`} htmlFor="application-cv" onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={dropFile}>
          <Upload /><span><b>{file?.name ?? "Choose your CV"}</b><small>{file ? `${(file.size / 1024).toFixed(0)} KB · Ready to upload` : "Click to browse or drag and drop your PDF"}</small></span>
        </label>{file && <button className="file-remove" type="button" aria-label="Remove selected CV" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}><Close /></button>}</div>
        <input ref={fileInputRef} id="application-cv" className="apply-file-native" type="file" accept="application/pdf,.pdf" hidden tabIndex={-1} onChange={(event) => chooseFile(event.target.files?.[0])} />
        <label htmlFor="salary">Expected salary <small>optional, IDR/month</small></label>
        <input id="salary" inputMode="numeric" value={salary} onChange={(event) => setSalary(event.target.value.replace(/\D/g, ""))} placeholder="25000000" />
        {error && <p className="auth-error">{error}</p>}
        <button className="apply-continue" type="button" onClick={() => file ? (setError(""), setStep("profile")) : setError("Choose a CV before continuing.")}>Continue to your profile</button>
      </> : <>
        <p className="apply-review-copy">Review the profile that will accompany your CV before submitting.</p>
        <div className="apply-profile-review">
          <section><header><span>Name</span><button type="button" onClick={() => beginEdit("name", user.name)}><Pencil /></button></header>{editingField === "name" ? <ProfileEdit value={editValue} onChange={setEditValue} onSave={saveProfileField} saving={savingProfile} /> : <strong>{user.name}</strong>}</section>
          <section><header><span>Email</span><button type="button" onClick={() => beginEdit("email", user.email)}><Pencil /></button></header>{editingField === "email" ? <ProfileEdit type="email" value={editValue} onChange={setEditValue} onSave={saveProfileField} saving={savingProfile} /> : <strong>{user.email}</strong>}</section>
          <section><header><span>Education</span><button type="button" onClick={() => beginEdit("lastEducation", user.lastEducation ?? "")}><Pencil /></button></header>{editingField === "lastEducation" ? <div className="apply-inline-edit"><select value={editValue} onChange={(event) => setEditValue(event.target.value)}><option value="">Not added</option>{educationOptions.map((option) => <option key={option}>{option}</option>)}</select><button type="button" onClick={() => void saveProfileField()}>{savingProfile ? "Saving…" : "Save"}</button></div> : <strong>{user.lastEducation || "Not added"}</strong>}</section>
          <section><header><span>Age</span><button type="button" onClick={() => beginEdit("birthDate", user.birthDate?.slice(0, 10) ?? "")}><Pencil /></button></header>{editingField === "birthDate" ? <ProfileEdit type="date" value={editValue} onChange={setEditValue} onSave={saveProfileField} saving={savingProfile} /> : <strong>{ageFromBirthday(user.birthDate)}</strong>}</section>
          <section className="wide"><header><span>Location</span><button type="button" onClick={() => beginEdit("location", user.city ?? "", user.province ?? "")}><Pencil /></button></header>{editingField === "location" ? <div className="apply-inline-edit two"><select value={provinceCode} onChange={(event) => { setProvinceCode(event.target.value); setEditValue(""); }}><option value="">Select province</option>{provinces.map((province) => <option key={province.code} value={province.code}>{province.name}</option>)}</select><select value={editValue} disabled={!provinceCode} onChange={(event) => setEditValue(event.target.value)}><option value="">{provinceCode ? "Select city / regency" : "Choose province first"}</option>{cities.map((city) => <option key={city.code} value={city.name}>{city.name}</option>)}</select><button type="button" onClick={() => void saveProfileField()}>{savingProfile ? "Saving…" : "Save"}</button></div> : <strong>{[user.city, user.province].filter(Boolean).join(", ") || "Not added"}</strong>}</section>
          <section className="wide"><header><span>My story</span><button type="button" onClick={() => beginEdit("profileStory", user.profileStory)}><Pencil /></button></header>{editingField === "profileStory" ? <ProfileEdit textarea value={editValue} onChange={setEditValue} onSave={saveProfileField} saving={savingProfile} /> : <strong>{user.profileStory || "No story added yet."}</strong>}</section>
          <section className="wide"><header><span>Skills</span><button type="button" onClick={() => beginEdit("skills", "")}><Pencil /></button></header>{editingField === "skills" ? <div className="apply-skill-editor"><div className="apply-skill-chips">{draftSkills.map((skill) => <button type="button" key={skill} onClick={() => setDraftSkills((items) => items.filter((item) => item !== skill))}>{skill} ×</button>)}</div><input value={skillQuery} onChange={(event) => setSkillQuery(event.target.value)} placeholder="Type to search skills" />{skillQuery && <div className="apply-skill-results">{skillNames.filter((skill) => skill.toLowerCase().includes(skillQuery.toLowerCase()) && !draftSkills.includes(skill)).slice(0, 6).map((skill) => <button type="button" key={skill} onClick={() => { setDraftSkills((items) => [...items, skill]); setSkillQuery(""); }}>{skill}</button>)}</div>}<button className="apply-skill-save" type="button" onClick={() => void saveProfileField()}>{savingProfile ? "Saving…" : "Save skills"}</button></div> : <strong>{user.skills.length ? user.skills.join(", ") : "No skills added yet."}</strong>}</section>
          <section className="wide"><header><span>Experience</span><a href="/profile" target="_blank" rel="noreferrer" aria-label="Edit experience"><Pencil /></a></header><div>{user.experiences?.length ? user.experiences.map((experience, index) => <p key={`${experience.title}-${index}`}><b>{experience.title}</b> at {experience.company} · {experience.period}</p>) : "No experience added yet."}</div></section>
          <section className="wide"><header><span>Selected work</span><a href="/profile" target="_blank" rel="noreferrer" aria-label="Edit selected work"><Pencil /></a></header><div>{user.selectedWork?.length ? user.selectedWork.map((work, index) => <p key={`${work.name}-${index}`}><b>{work.name}</b>{work.company ? ` · ${work.company}` : ""}</p>) : "No selected work added yet."}</div></section>
        </div>
        <a className="apply-edit-profile" href="/profile" target="_blank" rel="noreferrer">Edit full profile ↗</a>
        {error && <p className="auth-error">{error}</p>}
        <div className="apply-review-actions"><button type="button" onClick={() => setStep("application")}>Back</button><button type="submit" disabled={submitting}>{submitting ? "Submitting…" : "Submit application"}</button></div>
      </>}
    </form>
  </div>;
}

function ProfileEdit({ value, onChange, onSave, saving, type = "text", textarea = false, placeholder }: { value: string; onChange: (value: string) => void; onSave: () => Promise<void>; saving: boolean; type?: string; textarea?: boolean; placeholder?: string }) {
  return <div className="apply-inline-edit">{textarea ? <textarea value={value} onChange={(event) => onChange(event.target.value)} /> : <input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />}<button type="button" disabled={saving} onClick={() => void onSave()}>{saving ? "Saving…" : "Save"}</button></div>;
}

function ageFromBirthday(birthday: string | null) {
  if (!birthday) return "Not added";
  const born = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - born.getFullYear();
  if (today.getMonth() < born.getMonth() || (today.getMonth() === born.getMonth() && today.getDate() < born.getDate())) age -= 1;
  return `${Math.max(0, age)} years old`;
}
