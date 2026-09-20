import { Link } from "react-router-dom";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { PasswordField } from "../components/site/PasswordField";
import toast from "react-hot-toast";
import { Navbar } from "../components/Navbar";
import { PageLoading } from "../components/site/PageLoading";
import { AdminShell } from "../components/Admin/AdminShell";
import { EditProfileHero } from "../components/Profile/EditProfileHero";
import { SelectedWorkModal } from "../components/Profile/ProfileEntryModals";
import {
  SocialLinksFields,
  socialLinksFromFormData,
} from "../components/Profile/SocialLinks";
import { Calendar, MapPin, Upload } from "../components/site/Icons";
import {
  changePassword,
  getProfile,
  getSubscriptionStatus,
  resendVerification,
  removeAvatar,
  updateProfile,
  uploadAvatar,
} from "../services/auth.service";
import { useAuth } from "../stores/useAuth";
import { useProfileView } from "../stores/useProfileView";
import type { AuthUser } from "../types/auth";
import { fetchAssessmentBadges, fetchSkillNames } from "../lib/assessment-api";
import { getPublicJobs } from "../services/job.service";
import { getCountries, getEducationOptions, getWorldwideCities, getWorldwideStates, reverseGeocodeLocation, type Region } from "../services/region.service";
import { splitPersonName } from "../lib/person-name";
import { CountryCombobox } from "../components/site/CountryCombobox";
import { LocationFilterCombobox } from "../components/site/LocationFilterCombobox";
import { EducationCombobox } from "../components/Profile/EducationCombobox";
import { CurrencySelect } from "../components/site/CurrencySelect";
import type { AssessmentBadge } from "../types/assessment";
import {
  getPublicCompanies,
  type PublicCompany,
} from "../services/company.service";
import {
  educationOptions,
  isEducationLevel,
  normalizeEducation,
} from "../constants/education";
import {
  availabilityOptions,
  isAvailability,
  normalizeAvailability,
} from "../constants/availability";

const periodParts = (period: string) => {
  const [start = "", end = ""] = period.split(/\s+[–-]\s+/);
  return { start, end, current: end.toLowerCase() === "present" };
};

const monthInputValue = (value: string) => {
  if (!value || value.toLowerCase() === "present") return "";
  if (/^\d{4}-\d{2}$/.test(value)) return value;
  const parsed = new Date(`${value} 1`);
  if (Number.isNaN(parsed.getTime())) return "";
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
};

const monthLabel = (value: string) => {
  if (!value) return "";
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

const experienceTime = (period: string) => {
  const { start, end, current } = periodParts(period);
  if (current) return Number.MAX_SAFE_INTEGER;
  return new Date(`${end || start || "Jan 1900"} 1`).getTime() || 0;
};

const sortExperiences = <T extends { period: string }>(items: T[]) =>
  [...items].sort((a, b) => experienceTime(b.period) - experienceTime(a.period));

const sortSelectedWorks = <T extends { date?: string }>(items: T[]) =>
  [...items].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

const selectedWorkMonth = (value?: string) => value?.match(/^(\d{4}-\d{2})/)?.[1] ?? "";

const emptyExperienceDraft = {
  title: "",
  company: "",
  companyId: undefined as number | undefined,
  start: "",
  end: "",
  current: false,
  note: "",
};

const educationParts = (value: string | null) => {
  const match = value?.match(/^(.+?) in (.+?) at (.+)$/i);
  return {
    level: normalizeEducation(match?.[1] ?? value),
    major: match?.[2] ?? "",
    institution: match?.[3] ?? "",
  };
};

export default function ProfilePage() {
  const user = useAuth((state) => state.user);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState("");
  const [badges, setBadges] = useState<AssessmentBadge[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(true);
  const [experiences, setExperiences] = useState<
    NonNullable<AuthUser["experiences"]>
  >([]);
  const [selectedWorks, setSelectedWorks] = useState<
    NonNullable<AuthUser["selectedWork"]>
  >([]);
  const [avatarFileName, setAvatarFileName] = useState("");
  const [companies, setCompanies] = useState<PublicCompany[]>([]);
  const [isPublicProfile, setIsPublicProfile] = useState(true);
  const [experienceModalOpen, setExperienceModalOpen] = useState(false);
  const [experienceDraft, setExperienceDraft] = useState(emptyExperienceDraft);
  const [experienceDraftError, setExperienceDraftError] = useState("");
  const [selectedWorkModalOpen, setSelectedWorkModalOpen] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState<boolean | null>(null);
  const [skillNames, setSkillNames] = useState<string[]>([]);
  const [roleSuggestions, setRoleSuggestions] = useState<string[]>([]);
  const [countries, setCountries] = useState<Region[]>([]);
  const [profileCountry, setProfileCountry] = useState("");
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [profileProvince, setProfileProvince] = useState("");
  const [profileCities, setProfileCities] = useState<Region[]>([]);
  const [profileCity, setProfileCity] = useState("");
  const [usingDeviceLocation, setUsingDeviceLocation] = useState(false);
  const [locating, setLocating] = useState(false);
  const [degreeSuggestions, setDegreeSuggestions] = useState<string[]>([...educationOptions]);
  const [majorSuggestions, setMajorSuggestions] = useState<string[]>([]);
  const [institutionSuggestions, setInstitutionSuggestions] = useState<string[]>([]);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getProfile()
      .catch(() => {
        window.location.assign("/");
      })
      .finally(() => setProfileLoading(false));
  }, []);

  useEffect(() => {
    if (user?.role !== "JOB_SEEKER") {
      setBadgesLoading(false);
      return;
    }

    fetchAssessmentBadges()
      .then((response) => {
        setBadges(response.data);
      })
      .catch(() => {
        setBadges([]);
      })
      .finally(() => {
        setBadgesLoading(false);
      });
  }, [user?.role]);

  useEffect(() => {
    if (user?.role !== "JOB_SEEKER") return;
    getSubscriptionStatus()
      .then(({ active }) => setSubscriptionActive(active))
      .catch(() => setSubscriptionActive(false));
  }, [user?.role]);

  useEffect(() => {
    if (user?.role !== "JOB_SEEKER") return;
    Promise.all([getEducationOptions("degrees"), getEducationOptions("majors")])
      .then(([degrees, majors]) => {
        if (degrees.length) setDegreeSuggestions(degrees);
        setMajorSuggestions(majors);
      })
      .catch(() => undefined);
  }, [user?.role]);

  useEffect(() => {
    if (user?.role !== "JOB_SEEKER") return;
    Promise.all([fetchSkillNames(), getPublicJobs({ limit: 50 })])
      .then(([skills, jobs]) => {
        setSkillNames(skills);
        setRoleSuggestions([...new Set(jobs.map((job) => job.title))].sort());
      })
      .catch(() => undefined);
  }, [user?.role]);

  useEffect(() => {
    setExperiences(sortExperiences(user?.experiences ?? []));
  }, [user?.experiences]);

  useEffect(() => {
    if (user) setIsPublicProfile(user.isPublicProfile);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setProfileCity(user.city ?? "");
    setProfileProvince(user.province ?? "");
    setProfileCountry(user.country ?? user.company?.country ?? "Indonesia");
    getCountries().then(setCountries).catch(() => setCountries([]));
  }, [user?.id]);

  useEffect(() => {
    if (!profileCountry) { setProvinces([]); return; }
    getWorldwideStates(profileCountry).then(setProvinces).catch(() => setProvinces([]));
  }, [profileCountry]);

  useEffect(() => {
    if (!profileCountry || !profileProvince) { setProfileCities([]); return; }
    getWorldwideCities(profileCountry, profileProvince).then(setProfileCities).catch(() => setProfileCities([]));
  }, [profileCountry, profileProvince]);

  useEffect(() => {
    if (user?.role !== "JOB_SEEKER") return;
    getPublicCompanies()
      .then(setCompanies)
      .catch(() => setCompanies([]));
  }, [user?.role]);

  useEffect(() => {
    if (!user?.experiences || companies.length === 0) return;
    setExperiences(
      sortExperiences(user.experiences.map((experience) => {
        if (experience.companyId) return experience;
        const match = companies.find(
          (company) =>
            company.companyName.trim().toLocaleLowerCase() ===
            experience.company.trim().toLocaleLowerCase(),
        );
        return match
          ? { ...experience, companyId: match.id, company: match.companyName }
          : experience;
      })),
    );
  }, [companies, user?.experiences]);

  useEffect(() => {
    setSelectedWorks(sortSelectedWorks(user?.selectedWork ?? []));
  }, [user?.selectedWork]);

  if (!user || profileLoading) return <PageLoading label="Loading profile" variant={user?.role === "COMPANY_ADMIN" ? "admin" : "public"} />;
  const isCompany = user.role === "COMPANY_ADMIN";
  const personName = splitPersonName(user.name);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const educationLevel = String(form.get("educationLevel") ?? "").trim();
      const educationMajor = String(form.get("educationMajor") ?? "").trim();
      const educationInstitution = String(form.get("educationInstitution") ?? "").trim();
      const lastEducation = `${educationLevel} in ${educationMajor} at ${educationInstitution}`;
      const availability = String(form.get("availability") ?? "");
      if (!isCompany && (!isEducationLevel(educationLevel) || !educationMajor || !educationInstitution)) {
        throw new Error("Education level, major, and school or university are required.");
      }
      if (!isCompany && (!form.get("birthDate") || !form.get("gender") || !String(form.get("address") ?? "").trim() || !profileCity || !profileProvince || !profileCountry)) throw new Error("Birth date, gender, education, and complete address are required.");
      if (!isCompany && availability && !isAvailability(availability)) {
        throw new Error("Please select a valid availability status.");
      }
      if (
        !isCompany &&
        experiences.some(
          (experience) => !experience.title.trim() || !experience.company.trim(),
        )
      ) {
        throw new Error("Every experience needs a title and company.");
      }
      const updated = await updateProfile({
        name: [String(form.get("firstName") ?? "").trim(), String(form.get("lastName") ?? "").trim()].filter(Boolean).join(" "),
        email: String(form.get("email") ?? ""),
        city: profileCity || undefined,
        province: profileProvince || undefined,
        country: profileCountry || undefined,
        professionalRole: String(form.get("professionalRole") ?? "") || undefined,
        profileLinks: socialLinksFromFormData(form),
        ...(!isCompany ? {
          isPublicProfile: form.get("isPublicProfile") === "on",
          birthDate: String(form.get("birthDate") ?? "") || undefined,
          gender: (String(form.get("gender") ?? "") || undefined) as AuthUser["gender"] | undefined,
          lastEducation: lastEducation || undefined,
          address: String(form.get("address") ?? "") || undefined,
          availability: availability || undefined,
          salaryExpectation: String(form.get("salaryExpectation") ?? "") || undefined,
          salaryExpectationCurrency: String(form.get("salaryExpectationCurrency") ?? "IDR"),
          profileStory: String(form.get("profileStory") ?? "") || undefined,
          skills: form.getAll("skills").map(String).filter(Boolean),
          experiences: sortExperiences(experiences).map((experience) => ({
            title: experience.title.trim(),
            company: experience.company.trim(),
            companyId: experience.companyId,
            period: experience.period.trim(),
            note: experience.note.trim(),
          })),
          selectedWork: sortSelectedWorks(selectedWorks).map((work) => ({
            name: work.name.trim(),
            note: work.note.trim(),
            url: work.url?.trim() || "",
            company: work.company?.trim() || undefined,
            date: selectedWorkMonth(work.date) || undefined,
          })),
        } : {}),
      });
      sessionStorage.setItem(
        "profileUpdateMessage",
        updated.emailVerifiedAt
          ? "Profile updated."
          : "Profile updated. Please verify your email.",
      );
      useProfileView.getState().openProfile(updated.id);
      window.location.assign("/profile/view");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update profile.",
      );
    }
  }

  function dismissExperienceModal() {
    setExperienceModalOpen(false);
    setExperienceDraft(emptyExperienceDraft);
    setExperienceDraftError("");
  }

  function saveExperienceDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!experienceDraft.title.trim() || !experienceDraft.company.trim()) {
      setExperienceDraftError("Role and company are required.");
      return;
    }
    const period = [
      monthLabel(experienceDraft.start),
      experienceDraft.current ? "Present" : monthLabel(experienceDraft.end),
    ].filter(Boolean).join(" – ");
    setExperiences((current) => sortExperiences([
      ...current,
      {
        title: experienceDraft.title.trim(),
        company: experienceDraft.company.trim(),
        companyId: experienceDraft.companyId,
        period,
        note: experienceDraft.note.trim(),
      },
    ]));
    dismissExperienceModal();
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    // React clears currentTarget once the event finishes dispatching, so the
    // form has to be captured before the first await or reset() throws on null.
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      await changePassword(
        String(form.get("currentPassword")),
        String(form.get("newPassword")),
      );
      formElement.reset();
      toast.success("Password updated.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update password.",
      );
    }
  }

  async function uploadPhoto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = new FormData(event.currentTarget).get("avatar");
    if (!(file instanceof File) || !file.size) return;
    try {
      await uploadAvatar(file);
      toast.success("Profile photo updated.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to upload photo.",
      );
    }
  }

  async function deleteProfilePhoto() {
    try {
      await removeAvatar();
      setAvatarFileName("");
      if (avatarInputRef.current) avatarInputRef.current.value = "";
      toast.success("Profile photo deleted.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to delete profile photo.",
      );
    }
  }

  async function toggleDeviceLocation() {
    if (usingDeviceLocation) {
      setUsingDeviceLocation(false);
      toast.success("You can edit your location manually again.");
      return;
    }
    if (!navigator.geolocation) {
      toast.error("Location access is not supported by this browser.");
      return;
    }
    setLocating(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12_000,
          maximumAge: 60_000,
        }),
      );
      const location = await reverseGeocodeLocation(
        position.coords.latitude,
        position.coords.longitude,
      );
      setProfileCountry(location.country);
      setProfileProvince(location.province);
      setProfileCity(location.city);
      setUsingDeviceLocation(true);
      toast.success(`Using ${location.city}, ${location.province}, ${location.country}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to determine your location.");
    } finally {
      setLocating(false);
    }
  }

  const profileContent = (
      <main className={isCompany ? "admin-profile-content" : "profile-shell profile-edit-content"}>
        {!user.emailVerifiedAt && (
          <aside className="verification-banner">
            <div>
              <strong>Your email is not verified.</strong>
              <span>
                Verify it to apply for jobs and purchase subscriptions.
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                resendVerification(user.email)
                  .then(() => toast.success("Verification email sent."))
                  .catch((requestError) => setError(requestError.message))
              }
            >
              Resend verification
            </button>
          </aside>
        )}
        {error && <p className="profile-error">{error}</p>}
        <form className="profile-card avatar-card" onSubmit={uploadPhoto}>
          <h2>Profile photo</h2>
          {user.avatar && (
            <div className="avatar-preview">
              <img
                src={
                  user.avatar.startsWith("http")
                    ? user.avatar
                    : `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}${user.avatar}`
                }
                alt="Your profile"
              />
              <button
                className="avatar-delete"
                type="button"
                onClick={() => void deleteProfilePhoto()}
              >
                Delete picture
              </button>
            </div>
          )}
          <div className="file-upload-row"><label className="profile-file-picker">
            <input
              ref={avatarInputRef}
              name="avatar"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.gif,.avif,.heic,.heif"
              onChange={(event) =>
                setAvatarFileName(event.target.files?.[0]?.name ?? "")
              }
              required
            />
            <span className="profile-file-picker-icon"><Upload /></span>
            <span>
              <strong>{avatarFileName || "Choose a profile photo"}</strong>
              <small>
                {avatarFileName
                  ? "Looking good. Ready to upload!"
                  : "Drop it here or click to browse · JPG, PNG, WEBP, GIF, AVIF, or HEIC · max 3MB"}
              </small>
            </span>
          </label>{avatarFileName && <button className="file-remove" type="button" aria-label="Remove selected profile photo" onClick={() => { setAvatarFileName(""); if (avatarInputRef.current) avatarInputRef.current.value = ""; }}><span aria-hidden="true">×</span></button>}</div>
          <button className="profile-submit">Upload photo</button>
        </form>

        {user.role === "JOB_SEEKER" && (
          <section className="profile-card">
            <h2>Earned skill badges</h2>

            {badgesLoading ? (
              <p>Loading badges...</p>
            ) : badges.length === 0 ? (
              <>
                <p>You haven't earned any skill assessment badges yet.</p>

                <Link
                  className="button button-primary"
                  to="/dashboard/assessments"
                >
                  Browse assessments
                </Link>
              </>
            ) : (
              <div className="panel-grid">
                {badges.map((badge) => (
                  <article className="panel-card" key={badge.assessmentId}>
                    <p className="eyebrow">{badge.skillName}</p>

                    <h2>{badge.badgeName}</h2>

                    <p>
                      Assessment: <strong>{badge.assessmentTitle}</strong>
                    </p>

                    <p>
                      Score: <strong>{badge.score}</strong>
                    </p>

                    <p>
                      Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>

                    <Link
                      className="button button-primary"
                      to={`/dashboard/assessments/results/${badge.resultId}`}
                    >
                      View result
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        <form id="personal-profile-form" className="profile-card" onSubmit={saveProfile}>
          <h2>Personal information</h2>
          {!isCompany && (
            <div className="profile-visibility-card">
              <div>
                <strong>Show public profile</strong>
                <p>Allow companies and other people to view your profile page.</p>
              </div>
              <label className="profile-toggle">
                <input
                  name="isPublicProfile"
                  type="checkbox"
                  checked={isPublicProfile}
                  onChange={(event) => setIsPublicProfile(event.target.checked)}
                />
                <span aria-hidden="true" />
                <b>{isPublicProfile ? "Public" : "Private"}</b>
              </label>
            </div>
          )}
          <div className="profile-fields">
            <label>
              First name
              <input name="firstName" defaultValue={personName.firstName} required />
            </label>
            <label>
              Last name
              <input name="lastName" defaultValue={personName.lastName} placeholder="Add your last name" required />
            </label>
            <label>
              Email
              <input
                name="email"
                type="email"
                defaultValue={user.email}
                required
              />
            </label>
            {isCompany && (
              <>
                <label>
                  Role at company
                  <input
                    name="professionalRole"
                    defaultValue={user.professionalRole}
                    placeholder="Hiring Manager"
                  />
                </label>
                <label>Country<CountryCombobox value={profileCountry || "all"} countries={countries} onChange={(country) => { setProfileCountry(country === "all" ? "" : country); setProfileProvince(""); setProfileCity(""); setUsingDeviceLocation(false); }} /></label>
                <label>Province / state<LocationFilterCombobox value={profileProvince || "all"} options={provinces.map((item) => ({ value: item.name, label: `${item.name}, ${profileCountry}` }))} placeholder="Select province / state" loadingLabel="Loading provinces / states…" disabled={!profileCountry} onChange={(province) => { setProfileProvince(province === "all" ? "" : province); setProfileCity(""); setUsingDeviceLocation(false); }} /></label>
                <label>City<LocationFilterCombobox value={profileCity || "all"} options={profileCities.map((item) => ({ value: item.name, label: `${item.name}, ${profileProvince}, ${profileCountry}` }))} placeholder="Select city" loadingLabel="Loading cities…" disabled={!profileProvince} onChange={(city) => { setProfileCity(city === "all" ? "" : city); setUsingDeviceLocation(false); }} /></label>
                <SocialLinksFields links={user.profileLinks ?? []} />
              </>
            )}
            {!isCompany && (
              <>
                <label>
                  Date of birth
                  <span className="cute-date-input">
                    <Calendar />
                    <input
                      name="birthDate"
                      type="date"
                      required
                      defaultValue={user.birthDate?.slice(0, 10) ?? ""}
                    />
                  </span>
                </label>
                <label>
                  Gender
                  <select name="gender" defaultValue={user.gender ?? ""} required>
                    <option value="">Select</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </label>
                <label>
                  Education level
                  <select
                    name="educationLevel"
                    defaultValue={educationParts(user.lastEducation).level}
                    required
                  >
                    <option value="">Select education level</option>
                    {degreeSuggestions.map((education) => (
                      <option key={education} value={education}>
                        {education}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Major / field of study
                  <EducationCombobox
                    name="educationMajor"
                    defaultValue={educationParts(user.lastEducation).major}
                    suggestions={majorSuggestions}
                    placeholder="Start typing a major"
                    onQuery={(query) => getEducationOptions("majors", query).then(setMajorSuggestions).catch(() => undefined)}
                    required
                  />
                </label>
                <label>
                  School / university
                  <EducationCombobox
                    name="educationInstitution"
                    defaultValue={educationParts(user.lastEducation).institution}
                    placeholder="Start typing a school or university"
                    suggestions={institutionSuggestions}
                    onQuery={(query) => {
                      if (query.trim().length < 2) return setInstitutionSuggestions([]);
                      void getEducationOptions(
                        "institutions",
                        query,
                        profileCountry || undefined,
                      )
                        .then(setInstitutionSuggestions)
                        .catch(() => setInstitutionSuggestions([]));
                    }}
                    required
                  />
                </label>
                <label>Country<CountryCombobox value={profileCountry || "all"} countries={countries} onChange={(country) => { setProfileCountry(country === "all" ? "" : country); setProfileProvince(""); setProfileCity(""); setUsingDeviceLocation(false); }} /></label>
                <label>Province / state<LocationFilterCombobox value={profileProvince || "all"} options={provinces.map((item) => ({ value: item.name, label: `${item.name}, ${profileCountry}` }))} placeholder="Select province / state" loadingLabel="Loading provinces / states…" disabled={!profileCountry} onChange={(province) => { setProfileProvince(province === "all" ? "" : province); setProfileCity(""); setUsingDeviceLocation(false); }} /></label>
                <label>City<LocationFilterCombobox value={profileCity || "all"} options={profileCities.map((item) => ({ value: item.name, label: `${item.name}, ${profileProvince}, ${profileCountry}` }))} placeholder="Select city" loadingLabel="Loading cities…" disabled={!profileProvince} onChange={(city) => { setProfileCity(city === "all" ? "" : city); setUsingDeviceLocation(false); }} /></label>
                <div className="profile-wide profile-location-action">
                  <button type="button" className={usingDeviceLocation ? "location-active" : ""} aria-pressed={usingDeviceLocation} disabled={locating} onClick={() => void toggleDeviceLocation()}>
                    <MapPin />{locating ? "Finding your location…" : usingDeviceLocation ? "Stop using my location" : "Use my current location"}
                  </button>
                  {usingDeviceLocation && <small>Location was filled from your device. Editing a field switches back to manual mode.</small>}
                </div>
                <label className="profile-wide">
                  Address
                  <textarea name="address" defaultValue={user.address ?? ""} required />
                </label>
                <label>
                  Professional role
                  <input name="professionalRole" list="profile-role-suggestions" defaultValue={user.professionalRole} placeholder="Start typing a role" />
                  <datalist id="profile-role-suggestions">{roleSuggestions.map((role) => <option key={role} value={role} />)}</datalist>
                </label>
                <label>
                  Availability
                  <select
                    name="availability"
                    defaultValue={normalizeAvailability(user.availability)}
                  >
                    <option value="">Select availability</option>
                    {availabilityOptions.map((availability) => (
                      <option key={availability} value={availability}>
                        {availability}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Salary expectation currency
                  <CurrencySelect
                    name="salaryExpectationCurrency"
                    defaultValue={user.salaryExpectationCurrency ?? "IDR"}
                  />
                </label>
                <label>
                  Salary expectation
                  <input name="salaryExpectation" defaultValue={user.salaryExpectation} placeholder="25,000,000–35,000,000 / month" />
                </label>
                <label className="profile-wide">
                  My story
                  <textarea name="profileStory" defaultValue={user.profileStory} placeholder="Tell companies about your journey and the work you care about." />
                </label>
                <label className="profile-wide">
                  Skills <small>select all that apply</small>
                  <select name="skills" multiple defaultValue={user.skills} className="profile-skills-select">
                    {skillNames.map((skill) => <option key={skill} value={skill}>{skill}</option>)}
                  </select>
                </label>
                <div className="profile-wide experience-editor">
                  <div className="experience-editor-heading">
                    <div>
                      <strong>Experience</strong>
                      <small>Add each role separately.</small>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExperienceModalOpen(true)}
                    >
                      Add experience
                    </button>
                  </div>
                  {experiences.length === 0 && (
                    <p>No experience added yet.</p>
                  )}
                  {experiences.map((experience, index) => {
                    const period = periodParts(experience.period);
                    const updatePeriod = (start: string, end: string) => {
                      const nextPeriod = [
                        monthLabel(start),
                        end === "Present" ? end : monthLabel(end),
                      ].filter(Boolean).join(" – ");
                      setExperiences((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, period: nextPeriod }
                            : item,
                        ),
                      );
                    };

                    return (
                    <section className="experience-editor-item" key={index}>
                      <label>
                        Job title
                        <input
                          value={experience.title}
                          onChange={(event) =>
                            setExperiences((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, title: event.target.value }
                                  : item,
                              ),
                            )
                          }
                          required
                        />
                      </label>
                      <label>
                        Company
                        <select
                          value={experience.companyId ?? "unlisted"}
                          onChange={(event) =>
                            setExperiences((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index
                                  ? event.target.value === "unlisted"
                                    ? { ...item, companyId: undefined, company: "" }
                                    : {
                                        ...item,
                                        companyId: Number(event.target.value),
                                        company:
                                          companies.find(
                                            (company) => company.id === Number(event.target.value),
                                          )?.companyName ?? "",
                                      }
                                  : item,
                              ),
                            )
                          }
                        >
                          <option value="unlisted">Company not listed</option>
                          {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                              {company.companyName}
                            </option>
                          ))}
                        </select>
                      </label>
                      {!experience.companyId && (
                        <label>
                          Company name
                          <input
                            value={experience.company}
                            onChange={(event) =>
                              setExperiences((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, company: event.target.value }
                                    : item,
                                ),
                              )
                            }
                            placeholder="Type the company name"
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
                            value={monthInputValue(period.start)}
                            onChange={(event) =>
                              updatePeriod(
                                event.target.value,
                                period.current ? "Present" : monthInputValue(period.end),
                              )
                            }
                            required
                          />
                        </span>
                      </label>
                      <label>
                        End month
                        <span className="cute-date-input">
                          <Calendar />
                          <input
                            type="month"
                            value={period.current ? "" : monthInputValue(period.end)}
                            disabled={period.current}
                            min={monthInputValue(period.start) || undefined}
                            onChange={(event) =>
                              updatePeriod(
                                monthInputValue(period.start),
                                event.target.value,
                              )
                            }
                          />
                        </span>
                      </label>
                      <label className="profile-wide experience-current">
                        <input
                          type="checkbox"
                          checked={period.current}
                          onChange={(event) =>
                            updatePeriod(
                              monthInputValue(period.start),
                              event.target.checked ? "Present" : "",
                            )
                          }
                        />
                        I currently work here
                      </label>
                      <label className="profile-wide">
                        Description
                        <textarea
                          value={experience.note}
                          onChange={(event) =>
                            setExperiences((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, note: event.target.value }
                                  : item,
                              ),
                            )
                          }
                        />
                      </label>
                      <button
                        className="experience-remove"
                        type="button"
                        onClick={() =>
                          setExperiences((current) =>
                            current.filter((_, itemIndex) => itemIndex !== index),
                          )
                        }
                      >
                        Remove
                      </button>
                    </section>
                    );
                  })}
                </div>
                <div className="profile-wide experience-editor selected-work-editor">
                  <div className="experience-editor-heading">
                    <div>
                      <strong>Selected work</strong>
                      <small>Show projects connected to your experience.</small>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedWorkModalOpen(true)}
                    >
                      Add selected work
                    </button>
                  </div>
                  {selectedWorks.length === 0 && <p>No selected work added yet.</p>}
                  {selectedWorks.map((work, index) => (
                    <section className="experience-editor-item" key={index}>
                      <label>
                        Project name
                        <input
                          value={work.name}
                          required
                          onChange={(event) =>
                            setSelectedWorks((current) => current.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, name: event.target.value } : item,
                            ))
                          }
                        />
                      </label>
                      <label>
                        Project link
                        <input
                          type="url"
                          value={work.url ?? ""}
                          placeholder="https://example.com/project"
                          onChange={(event) =>
                            setSelectedWorks((current) => current.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, url: event.target.value } : item,
                            ))
                          }
                        />
                      </label>
                      <label>
                        Project date
                        <span className="cute-date-input">
                          <Calendar />
                          <input
                            type="month"
                            value={work.date ?? ""}
                            onChange={(event) =>
                              setSelectedWorks((current) =>
                                sortSelectedWorks(current.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, date: event.target.value }
                                    : item,
                                )),
                              )
                            }
                          />
                        </span>
                      </label>
                      <label className="profile-wide">
                        Associated company
                        <select
                          value={work.company ?? ""}
                          onChange={(event) =>
                            setSelectedWorks((current) => current.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, company: event.target.value } : item,
                            ))
                          }
                        >
                          <option value="">Not associated with a company</option>
                          {[...new Set(experiences.map((experience) => experience.company.trim()).filter(Boolean))].map((company) => (
                            <option key={company} value={company}>Associated with {company}</option>
                          ))}
                        </select>
                      </label>
                      <label className="profile-wide">
                        Description
                        <textarea
                          value={work.note}
                          onChange={(event) =>
                            setSelectedWorks((current) => current.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, note: event.target.value } : item,
                            ))
                          }
                        />
                      </label>
                      <button
                        className="experience-remove"
                        type="button"
                        onClick={() => setSelectedWorks((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                      >
                        Remove
                      </button>
                    </section>
                  ))}
                </div>
                <SocialLinksFields links={user.profileLinks ?? []} />
              </>
            )}
          </div>
          <button className="profile-submit">Save changes</button>
        </form>
        {experienceModalOpen && createPortal(
          <div
            className="experience-modal"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) dismissExperienceModal();
            }}
          >
            <form
              className="experience-modal-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="experience-modal-title"
              onSubmit={saveExperienceDraft}
            >
              <header>
                <div>
                  <p className="eyebrow">Profile experience</p>
                  <h2 id="experience-modal-title">Add experience</h2>
                </div>
                <button type="button" onClick={dismissExperienceModal} aria-label="Close">×</button>
              </header>
              {experienceDraftError && <p className="profile-error">{experienceDraftError}</p>}
              <div className="profile-fields">
                <label>
                  Role <small>required</small>
                  <input
                    autoFocus
                    value={experienceDraft.title}
                    onChange={(event) => setExperienceDraft((draft) => ({ ...draft, title: event.target.value }))}
                    placeholder="Product Designer"
                    required
                  />
                </label>
                <label>
                  Company <small>required</small>
                  <select
                    value={experienceDraft.companyId ?? "unlisted"}
                    onChange={(event) => {
                      const companyId = event.target.value === "unlisted"
                        ? undefined
                        : Number(event.target.value);
                      setExperienceDraft((draft) => ({
                        ...draft,
                        companyId,
                        company: companyId
                          ? companies.find((company) => company.id === companyId)?.companyName ?? ""
                          : "",
                      }));
                    }}
                  >
                    <option value="unlisted">Company not listed</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>{company.companyName}</option>
                    ))}
                  </select>
                </label>
                {!experienceDraft.companyId && (
                  <label className="profile-wide">
                    Company name <small>required</small>
                    <input
                      value={experienceDraft.company}
                      onChange={(event) => setExperienceDraft((draft) => ({ ...draft, company: event.target.value }))}
                      placeholder="Type the company name"
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
                      value={experienceDraft.start}
                      onChange={(event) => setExperienceDraft((draft) => ({ ...draft, start: event.target.value }))}
                    />
                  </span>
                </label>
                <label>
                  End month
                  <span className="cute-date-input">
                    <Calendar />
                    <input
                      type="month"
                      value={experienceDraft.current ? "" : experienceDraft.end}
                      min={experienceDraft.start || undefined}
                      disabled={experienceDraft.current}
                      onChange={(event) => setExperienceDraft((draft) => ({ ...draft, end: event.target.value }))}
                    />
                  </span>
                </label>
                <label className="profile-wide experience-current">
                  <input
                    type="checkbox"
                    checked={experienceDraft.current}
                    onChange={(event) => setExperienceDraft((draft) => ({ ...draft, current: event.target.checked, end: "" }))}
                  />
                  I currently work here
                </label>
                <label className="profile-wide">
                  Description
                  <textarea
                    value={experienceDraft.note}
                    onChange={(event) => setExperienceDraft((draft) => ({ ...draft, note: event.target.value }))}
                  />
                </label>
              </div>
              <footer>
                <button type="button" className="experience-modal-dismiss" onClick={dismissExperienceModal}>Dismiss</button>
                <button type="submit" className="profile-submit">Save for now</button>
              </footer>
            </form>
          </div>,
          document.body,
        )}
        {selectedWorkModalOpen && (
          <SelectedWorkModal
            companies={[...new Set(experiences.map((experience) => experience.company.trim()).filter(Boolean))]}
            onDismiss={() => setSelectedWorkModalOpen(false)}
            onSave={(work) => {
              setSelectedWorks((current) => sortSelectedWorks([...current, work]));
              setSelectedWorkModalOpen(false);
            }}
          />
        )}
        {user.authProvider === "EMAIL" && (
          <form className="profile-card" onSubmit={updatePassword}>
            <h2>Change password</h2>
            <div className="profile-fields">
              <label>
                Current password
                <PasswordField name="currentPassword" required />
              </label>
              <label>
                New password
                <PasswordField name="newPassword" minLength={6} required />
              </label>
            </div>
            <button className="profile-submit">Update password</button>
          </form>
        )}
        {!isCompany && (
          <section className="profile-cv-cta">
            <div className="stars" aria-hidden="true">
              {Array.from({ length: 38 }, (_, index) => (
                <i
                  key={index}
                  style={{
                    left: `${(index * 37 + 9) % 100}%`,
                    top: `${(index * 53 + 12) % 100}%`,
                    width: index % 7 === 0 ? 3 : 1.5,
                    height: index % 7 === 0 ? 3 : 1.5,
                    animationDelay: `${(index % 11) * 0.32}s`,
                  }}
                />
              ))}
            </div>
            <div className="profile-cv-cta-content">
              <p>POLARIS CV</p>
              <h2>
                Generate your profile into a CV in <span>seconds.</span>
              </h2>
              <Link
                className="button button-light"
                to={
                  subscriptionActive === true
                    ? "/profile/cv-generator"
                    : "/pricing"
                }
              >
                Generate my CV
              </Link>
            </div>
          </section>
        )}
      </main>
  );

  if (isCompany) {
    return (
      <AdminShell
        eyebrow="Your account"
        title="Profile settings"
        showHeader={false}
      >
        <EditProfileHero
          admin
          eyebrow="Your account"
          title="Edit your profile"
          description="Keep your personal details and company role up to date."
          action={<Link className="button button-light" to="/profile/view" onClick={() => useProfileView.getState().openProfile(user.id)}>View public profile</Link>}
        />
        {profileContent}
      </AdminShell>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />
      <EditProfileHero
        eyebrow="Your account"
        title="Build a profile that stands out."
        action={<Link className="button button-light" to="/profile/view" onClick={() => useProfileView.getState().openProfile(user.id)}>View public profile</Link>}
      />
      {profileContent}
    </div>
  );
}
