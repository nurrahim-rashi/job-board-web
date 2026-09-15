import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { AdminShell } from "../components/Admin/AdminShell";
import { PageLoading } from "../components/site/PageLoading";
import { EditProfileHero } from "../components/Profile/EditProfileHero";
import { getProfile, updateProfile } from "../services/auth.service";
import { useAuth } from "../stores/useAuth";
import { removeCompanyMedia, uploadCompanyMedia } from "../services/company.service";
import { getProvinces, getRegencies, type Region } from "../services/region.service";

const lines = (value: FormDataEntryValue | null) =>
  String(value ?? "").split("\n").map((item) => item.trim()).filter(Boolean);

const companySizes = [
  "2–10 people",
  "11–50 people",
  "51–200 people",
  "201–500 people",
  "501–1,000 people",
  "1,001–5,000 people",
  "5,001–10,000 people",
  "10,001+ people",
];

const currentYear = new Date().getFullYear();
const foundedYears = Array.from({ length: currentYear - 1799 }, (_, index) => currentYear - index);

export default function CompanyEditProfilePage() {
  const user = useAuth((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<
    { name: string; url: string; description: string }[]
  >([]);
  const setUser = useAuth((state) => state.setUser);
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [provinceCode, setProvinceCode] = useState("");
  const [cities, setCities] = useState<Region[]>([]);
  const [companyCity, setCompanyCity] = useState("");

  useEffect(() => {
    getProfile()
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setProducts(user?.company?.products ?? []);
    setCompanyCity(user?.company?.city ?? "");
  }, [user?.company?.products]);

  useEffect(() => { getProvinces().then(setProvinces).catch(() => setProvinces([])); }, []);
  useEffect(() => { if (!provinceCode) { setCities([]); return; } getRegencies(provinceCode).then(setCities).catch(() => setCities([])); }, [provinceCode]);

  if (loading || !user?.company) return <PageLoading label="Loading company profile" variant="admin" />;

  async function saveCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await updateProfile({
        companyName: String(form.get("companyName") ?? ""),
        phone: String(form.get("phone") ?? ""),
        companyCity,
        companyTagline: String(form.get("companyTagline") ?? ""),
        companySize: String(form.get("companySize") ?? ""),
        companyFounded: Number(form.get("companyFounded")) || undefined,
        companyWebsite: String(form.get("companyWebsite") ?? "").trim(),
        companyProducts: products.map((product) => ({
          name: product.name.trim(),
          url: product.url.trim(),
          description: product.description.trim(),
        })),
        profileContent: String(form.get("profileContent") ?? ""),
        companyPerks: lines(form.get("companyPerks")),
      });
      toast.success("Company profile updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update company profile.");
    }
  }

  async function saveMedia(field: "logo" | "banner", file?: File) {
    if (!file?.size) return;
    try {
      setUser(await uploadCompanyMedia(field, file));
      toast.success(`Company ${field} updated.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Unable to update ${field}.`);
    }
  }

  async function clearMedia(field: "logo" | "banner") {
    try {
      setUser(await removeCompanyMedia(field));
      toast.success(`Company ${field} removed.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Unable to remove ${field}.`);
    }
  }

  const company = user.company;
  return (
    <AdminShell
      eyebrow="Company settings"
      title="Edit company"
      showHeader={false}
    >
      <EditProfileHero
        admin
        eyebrow="Company settings"
        title="Shape your company story."
        description="Update the information candidates see on your public company profile."
        action={<Link className="button button-light" to={`/companies/${company.id}`}>View company profile</Link>}
      />
      <div className="admin-profile-content">
        <section className="profile-card company-media-editor">
          <h2>Company visuals</h2>
          <div className="profile-fields">
            <div className="company-media-field"><label>Company logo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void saveMedia("logo", event.target.files?.[0])} /></label>{company.logo && <button className="file-remove" type="button" onClick={() => void clearMedia("logo")} aria-label="Remove company logo">×</button>}</div>
            <div className="company-media-field"><label>Hero banner<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void saveMedia("banner", event.target.files?.[0])} /></label>{company.banner && <button className="file-remove" type="button" onClick={() => void clearMedia("banner")} aria-label="Remove company banner">×</button>}</div>
          </div>
        </section>
        <form className="profile-card" onSubmit={saveCompany}>
          <h2>Company information</h2>
          <div className="profile-fields">
            <label>Company name<input name="companyName" defaultValue={company.companyName} required /></label>
            <label>Phone<input name="phone" defaultValue={company.phone} required /></label>
            <label>Company province<select value={provinceCode} onChange={(event) => { setProvinceCode(event.target.value); setCompanyCity(""); }} required><option value="">Select province</option>{provinces.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label>
            <label>Company city / regency<select value={companyCity} onChange={(event) => setCompanyCity(event.target.value)} required><option value="">{provinceCode ? "Select city / regency" : company.city || "Choose province first"}</option>{cities.map((item) => <option key={item.code} value={item.name}>{item.name}</option>)}</select></label>
            <label>Company size<select name="companySize" defaultValue={companySizes.includes(company.size) ? company.size : ""}><option value="">Select company size</option>{companySizes.map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
            <label>Founded year<select name="companyFounded" defaultValue={company.founded ?? ""}><option value="">Select year</option>{foundedYears.map((year) => <option key={year} value={year}>{year}</option>)}</select></label>
            <label className="profile-wide">Company website<input name="companyWebsite" type="url" defaultValue={company.website} placeholder="https://company.com" /></label>
            <label className="profile-wide">Tagline<input name="companyTagline" defaultValue={company.tagline} placeholder="A short line about your company" /></label>
            <label className="profile-wide">Company profile content<textarea name="profileContent" defaultValue={company.profileContent} /></label>
            <label className="profile-wide">Perks &amp; life there <small>one per line</small><textarea name="companyPerks" defaultValue={company.perks.join("\n")} /></label>
            <div className="profile-wide experience-editor selected-work-editor">
              <div className="experience-editor-heading">
                <div><strong>Company products</strong><small>Add products or services made by your company.</small></div>
                <button type="button" onClick={() => setProducts((current) => [...current, { name: "", url: "", description: "" }])}>Add product</button>
              </div>
              {products.length === 0 && <p>No company products added yet.</p>}
              {products.map((product, index) => (
                <section className="experience-editor-item" key={index}>
                  <label>Product name<input value={product.name} required placeholder="Uber Eats" onChange={(event) => setProducts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} /></label>
                  <label>Product link<input type="url" value={product.url} placeholder="https://..." onChange={(event) => setProducts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, url: event.target.value } : item))} /></label>
                  <label className="profile-wide">Description<textarea value={product.description} onChange={(event) => setProducts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, description: event.target.value } : item))} /></label>
                  <button className="experience-remove" type="button" onClick={() => setProducts((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
                </section>
              ))}
            </div>
          </div>
          <button className="profile-submit">Save company</button>
        </form>
      </div>
    </AdminShell>
  );
}
