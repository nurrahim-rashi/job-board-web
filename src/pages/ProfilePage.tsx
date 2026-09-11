import { Link } from "react-router-dom";
import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Navbar } from "../components/Navbar";
import {
  changePassword,
  getProfile,
  resendVerification,
  updateProfile,
  uploadAvatar,
} from "../services/auth.service";
import { useAuth } from "../stores/useAuth";
import type { AuthUser } from "../types/auth";
import { fetchAssessmentBadges } from "../lib/assessment-api";
import type { AssessmentBadge } from "../types/assessment";

const lines = (value: FormDataEntryValue | null) =>
  String(value ?? "").split("\n").map((item) => item.trim()).filter(Boolean);

const columns = (value: FormDataEntryValue | null) =>
  lines(value).map((item) => item.split("|").map((part) => part.trim()));

export default function ProfilePage() {
  const user = useAuth((state) => state.user);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState("");
  const [badges, setBadges] = useState<AssessmentBadge[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(true);

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

  if (!user || profileLoading) return null;
  const isCompany = user.role === "COMPANY_ADMIN";

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const updated = await updateProfile({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        city: String(form.get("city") ?? "") || undefined,
        province: String(form.get("province") ?? "") || undefined,
        professionalRole: String(form.get("professionalRole") ?? "") || undefined,
        profileIntro: String(form.get("profileIntro") ?? "") || undefined,
        profileLinks: columns(form.get("profileLinks")).map(([label, url]) => ({ label, url })).filter((item) => item.label && item.url),
        ...(!isCompany ? {
          birthDate: String(form.get("birthDate") ?? "") || undefined,
          gender: (String(form.get("gender") ?? "") || undefined) as AuthUser["gender"] | undefined,
          lastEducation: String(form.get("lastEducation") ?? "") || undefined,
          address: String(form.get("address") ?? "") || undefined,
          availability: String(form.get("availability") ?? "") || undefined,
          salaryExpectation: String(form.get("salaryExpectation") ?? "") || undefined,
          profileStory: String(form.get("profileStory") ?? "") || undefined,
          lookingFor: lines(form.get("lookingFor")),
          skills: String(form.get("skills") ?? "").split(/[,\n]/).map((item) => item.trim()).filter(Boolean),
          experiences: columns(form.get("experiences")).map(([title, company, period = "", note = ""]) => ({ title, company, period, note })).filter((item) => item.title && item.company),
          selectedWork: columns(form.get("selectedWork")).map(([name, note = ""]) => ({ name, note })).filter((item) => item.name),
        } : {}),
      });
      toast.success(
        updated.emailVerifiedAt
          ? "Profile updated."
          : "Profile updated. Please verify your email.",
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update profile.",
      );
    }
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await changePassword(
        String(form.get("currentPassword")),
        String(form.get("newPassword")),
      );
      event.currentTarget.reset();
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

  return (
    <div className="profile-page">
      <Navbar />
      <main className="profile-shell">
        <header>
          <p className="eyebrow">Your account</p>
          <h1>Profile settings</h1>
          <p>
            Keep your details current so applications and company information
            stay accurate.
          </p>
          <Link className="button button-primary" to={`/profile/${user.id}`}>
            View public profile
          </Link>
        </header>
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
            <img
              src={`${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}${user.avatar}`}
              alt="Your profile"
            />
          )}
          <label>
            JPG, JPEG, or PNG · max 1MB
            <input
              name="avatar"
              type="file"
              accept="image/jpeg,image/png"
              required
            />
          </label>
          <button className="profile-submit">Upload photo</button>
        </form>

        {!isCompany && (
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

        {user.role === "JOB_SEEKER" && (
          <section className="profile-card">
            <p className="eyebrow">CV Generator</p>
            <h2>Create your CV</h2>
            <p>
              Create and download an ATS-friendly CV using your profile
              information and additional professional details.
            </p>

            <Link className="button button-primary" to="/profile/cv-generator">
              Generate CV
            </Link>
          </section>
        )}

        <form className="profile-card" onSubmit={saveProfile}>
          <h2>Personal information</h2>
          <div className="profile-fields">
            <label>
              Name
              <input name="name" defaultValue={user.name} required />
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
                <label>
                  City
                  <input name="city" defaultValue={user.city ?? ""} />
                </label>
                <label>
                  Province
                  <input name="province" defaultValue={user.province ?? ""} />
                </label>
                <label className="profile-wide">
                  Profile intro
                  <textarea
                    name="profileIntro"
                    defaultValue={user.profileIntro}
                    placeholder="Tell people about your role at the company."
                  />
                </label>
                <label className="profile-wide">
                  Profile links <small>one per line: Label | URL</small>
                  <textarea
                    name="profileLinks"
                    defaultValue={(user.profileLinks ?? []).map((item) => `${item.label} | ${item.url}`).join("\n")}
                  />
                </label>
              </>
            )}
            {!isCompany && (
              <>
                <label>
                  Date of birth
                  <input
                    name="birthDate"
                    type="date"
                    defaultValue={user.birthDate?.slice(0, 10) ?? ""}
                  />
                </label>
                <label>
                  Gender
                  <select name="gender" defaultValue={user.gender ?? ""}>
                    <option value="">Select</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </label>
                <label>
                  Last education
                  <input
                    name="lastEducation"
                    defaultValue={user.lastEducation ?? ""}
                  />
                </label>
                <label>
                  City
                  <input name="city" defaultValue={user.city ?? ""} />
                </label>
                <label>
                  Province
                  <input name="province" defaultValue={user.province ?? ""} />
                </label>
                <label className="profile-wide">
                  Address
                  <textarea name="address" defaultValue={user.address ?? ""} />
                </label>
                <label>
                  Professional role
                  <input name="professionalRole" defaultValue={user.professionalRole} placeholder="Senior Product Designer" />
                </label>
                <label>
                  Availability
                  <input name="availability" defaultValue={user.availability} placeholder="Open to opportunities" />
                </label>
                <label>
                  Salary expectation
                  <input name="salaryExpectation" defaultValue={user.salaryExpectation} placeholder="Rp 25–35 juta / month" />
                </label>
                <label className="profile-wide">
                  Profile intro
                  <textarea name="profileIntro" defaultValue={user.profileIntro} placeholder="A short introduction shown at the top of your public profile." />
                </label>
                <label className="profile-wide">
                  My story
                  <textarea name="profileStory" defaultValue={user.profileStory} placeholder="Tell companies about your journey and the work you care about." />
                </label>
                <label className="profile-wide">
                  Looking for <small>one item per line</small>
                  <textarea name="lookingFor" defaultValue={user.lookingFor.join("\n")} placeholder={"Product-led team\nRemote-friendly role"} />
                </label>
                <label className="profile-wide">
                  Skills <small>separate with commas</small>
                  <textarea name="skills" defaultValue={user.skills.join(", ")} placeholder="Product design, Figma, Design systems" />
                </label>
                <label className="profile-wide">
                  Experience <small>one per line: Title | Company | Period | Note</small>
                  <textarea name="experiences" defaultValue={(user.experiences ?? []).map((item) => `${item.title} | ${item.company} | ${item.period} | ${item.note}`).join("\n")} />
                </label>
                <label className="profile-wide">
                  Selected work <small>one per line: Name | Note</small>
                  <textarea name="selectedWork" defaultValue={(user.selectedWork ?? []).map((item) => `${item.name} | ${item.note}`).join("\n")} />
                </label>
                <label className="profile-wide">
                  Profile links <small>one per line: Label | URL</small>
                  <textarea name="profileLinks" defaultValue={(user.profileLinks ?? []).map((item) => `${item.label} | ${item.url}`).join("\n")} placeholder={"Portfolio | https://example.com\nEmail | mailto:you@example.com"} />
                </label>
              </>
            )}
          </div>
          <button className="profile-submit">Save changes</button>
        </form>
        {user.authProvider === "EMAIL" && (
          <form className="profile-card" onSubmit={updatePassword}>
            <h2>Change password</h2>
            <div className="profile-fields">
              <label>
                Current password
                <input name="currentPassword" type="password" required />
              </label>
              <label>
                New password
                <input
                  name="newPassword"
                  type="password"
                  minLength={8}
                  required
                />
              </label>
            </div>
            <button className="profile-submit">Update password</button>
          </form>
        )}
      </main>
    </div>
  );
}
