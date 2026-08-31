import { Link } from "react-router-dom";
import { useEffect, useState, type FormEvent } from "react";
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

export default function ProfilePage() {
  const storedUser = useAuth((state) => state.user);
  const [user, setUser] = useState<AuthUser | null>(storedUser);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [badges, setBadges] = useState<AssessmentBadge[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then(setUser)
      .catch(() => {
        window.location.assign("/");
      });
  }, []);

  useEffect(() => {
    if (storedUser?.role !== "JOB_SEEKER") {
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
  }, [storedUser?.role]);

  if (!user) return null;
  const isCompany = user.role === "COMPANY_ADMIN";

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    const form = new FormData(event.currentTarget);
    try {
      const updated = await updateProfile({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        birthDate: String(form.get("birthDate") ?? "") || undefined,
        gender: (String(form.get("gender") ?? "") || undefined) as
          | AuthUser["gender"]
          | undefined,
        lastEducation: String(form.get("lastEducation") ?? "") || undefined,
        address: String(form.get("address") ?? "") || undefined,
        city: String(form.get("city") ?? "") || undefined,
        province: String(form.get("province") ?? "") || undefined,
        companyName: String(form.get("companyName") ?? "") || undefined,
        phone: String(form.get("phone") ?? "") || undefined,
        companyCity: String(form.get("companyCity") ?? "") || undefined,
        profileContent: String(form.get("profileContent") ?? "") || undefined,
      });
      setUser(updated);
      setNotice(
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
    setNotice("");
    const form = new FormData(event.currentTarget);
    try {
      await changePassword(
        String(form.get("currentPassword")),
        String(form.get("newPassword")),
      );
      event.currentTarget.reset();
      setNotice("Password updated.");
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
      const updated = await uploadAvatar(file);
      setUser(updated);
      setNotice("Profile photo updated.");
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
                  .then(() => setNotice("Verification email sent."))
                  .catch((requestError) => setError(requestError.message))
              }
            >
              Resend verification
            </button>
          </aside>
        )}
        {notice && <p className="profile-notice">{notice}</p>}
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
              </>
            )}
            {isCompany && (
              <>
                <label>
                  Company name
                  <input
                    name="companyName"
                    defaultValue={user.company?.companyName ?? ""}
                    required
                  />
                </label>
                <label>
                  Phone
                  <input
                    name="phone"
                    defaultValue={user.company?.phone ?? ""}
                    required
                  />
                </label>
                <label>
                  Company city
                  <input
                    name="companyCity"
                    defaultValue={user.company?.city ?? ""}
                    required
                  />
                </label>
                <label className="profile-wide">
                  Company profile content
                  <textarea
                    name="profileContent"
                    defaultValue={user.company?.profileContent ?? ""}
                    placeholder="Write your company profile…"
                  />
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
