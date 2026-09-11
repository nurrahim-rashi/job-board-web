import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { getProfile, updateProfile } from "../services/auth.service";
import { useAuth } from "../stores/useAuth";

const lines = (value: FormDataEntryValue | null) =>
  String(value ?? "").split("\n").map((item) => item.trim()).filter(Boolean);

export default function CompanyEditProfilePage() {
  const user = useAuth((state) => state.user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !user?.company) return null;

  async function saveCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await updateProfile({
        companyName: String(form.get("companyName") ?? ""),
        phone: String(form.get("phone") ?? ""),
        companyCity: String(form.get("companyCity") ?? ""),
        companyTagline: String(form.get("companyTagline") ?? ""),
        companySize: String(form.get("companySize") ?? ""),
        companyFounded: Number(form.get("companyFounded")) || undefined,
        profileContent: String(form.get("profileContent") ?? ""),
        companyValues: lines(form.get("companyValues")),
        companyPerks: lines(form.get("companyPerks")),
      });
      toast.success("Company profile updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update company profile.");
    }
  }

  const company = user.company;
  return (
    <div className="profile-page">
      <Navbar />
      <main className="profile-shell">
        <header>
          <p className="eyebrow">Company settings</p>
          <h1>Edit company</h1>
          <p>Update the information shown on your public company profile.</p>
          <Link className="button button-primary" to={`/companies/${company.id}`}>View company profile</Link>
        </header>
        <form className="profile-card" onSubmit={saveCompany}>
          <h2>Company information</h2>
          <div className="profile-fields">
            <label>Company name<input name="companyName" defaultValue={company.companyName} required /></label>
            <label>Phone<input name="phone" defaultValue={company.phone} required /></label>
            <label>Company city<input name="companyCity" defaultValue={company.city} required /></label>
            <label>Company size<input name="companySize" defaultValue={company.size} placeholder="51–200 people" /></label>
            <label>Founded<input name="companyFounded" type="number" min="1800" max="2100" defaultValue={company.founded ?? ""} placeholder="2018" /></label>
            <label className="profile-wide">Tagline<input name="companyTagline" defaultValue={company.tagline} placeholder="A short line about your company" /></label>
            <label className="profile-wide">Company profile content<textarea name="profileContent" defaultValue={company.profileContent} /></label>
            <label className="profile-wide">Company values <small>one per line</small><textarea name="companyValues" defaultValue={company.values.join("\n")} /></label>
            <label className="profile-wide">Perks &amp; life there <small>one per line</small><textarea name="companyPerks" defaultValue={company.perks.join("\n")} /></label>
          </div>
          <button className="profile-submit">Save company</button>
        </form>
      </main>
    </div>
  );
}
