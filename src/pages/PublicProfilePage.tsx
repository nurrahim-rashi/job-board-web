import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Navbar } from "../components/Navbar";
import {
  getPublicProfile,
  type PublicSeekerProfile,
} from "../services/profile.service";
import { useAuth } from "../stores/useAuth";
import { Pencil, Plus } from "../components/site/Icons";
import { getSubscriptionStatus, updateProfile } from "../services/auth.service";
import { getPublicCompanies, type PublicCompany } from "../services/company.service";
import {
  QuickExperienceModal,
  SelectedWorkModal,
} from "../components/Profile/ProfileEntryModals";
import { useParams } from "react-router-dom";
import { AnimatedMetric } from "../components/site/AnimatedMetric";

const experienceTime = (period: string) => {
  const [start = "", end = ""] = period.split(/\s+[–-]\s+/);
  if (end.toLowerCase() === "present") return Number.MAX_SAFE_INTEGER;
  return new Date(`${end || start || "Jan 1900"} 1`).getTime() || 0;
};

const workDateLabel = (value?: string) => {
  if (!value) return "";
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

export default function PublicProfilePage() {
  const currentUser = useAuth((state) => state.user);
  const { userId: publicUserId } = useParams();
  const userId = publicUserId ?? String(currentUser?.id ?? "");
  const [profile, setProfile] = useState<PublicSeekerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState<boolean | null>(null);
  const [companies, setCompanies] = useState<PublicCompany[]>([]);
  const [experienceModalOpen, setExperienceModalOpen] = useState(false);
  const [workModalOpen, setWorkModalOpen] = useState(false);
  const [editingExperienceIndex, setEditingExperienceIndex] = useState<number | null>(null);
  const [editingWorkIndex, setEditingWorkIndex] = useState<number | null>(null);
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [storyDraft, setStoryDraft] = useState("");

  useEffect(() => {
    setLoading(true);
    getPublicProfile(userId)
      .then(setProfile)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    const message = sessionStorage.getItem("profileUpdateMessage");
    if (!message) return;
    sessionStorage.removeItem("profileUpdateMessage");
    toast.success(message);
  }, []);

  useEffect(() => {
    if (
      currentUser?.role !== "JOB_SEEKER" ||
      String(currentUser.id) !== userId
    ) return;
    getSubscriptionStatus()
      .then(({ active }) => setSubscriptionActive(active))
      .catch(() => setSubscriptionActive(false));
  }, [currentUser?.id, currentUser?.role, userId]);

  useEffect(() => {
    if (profile?.role !== "JOB_SEEKER") return;
    getPublicCompanies().then(setCompanies).catch(() => setCompanies([]));
  }, [profile?.role]);

  async function refreshProfile() {
    setProfile(await getPublicProfile(userId));
  }

  if (notFound) {
    return (
      <div className="seeker-profile-not-found">
        <Navbar />
        <div>
          <h1>We couldn't find this profile</h1>
          <p>It may have been removed, or the link is wrong.</p>
          <a href="/jobs">Browse jobs</a>
        </div>
      </div>
    );
  }
  if (loading || !profile) {
    return (
      <div className="seeker-profile-page">
        <Navbar />
        <div className="seeker-profile-loading">Loading profile…</div>
      </div>
    );
  }

  const location = [profile.city, profile.province].filter(Boolean).join(", ");
  const experiences = [...(profile.experiences ?? [])].sort(
    (a, b) => experienceTime(b.period) - experienceTime(a.period),
  );
  const selectedWork = [...(profile.selectedWork ?? [])].sort(
    (a, b) => (b.date ?? "").localeCompare(a.date ?? ""),
  );
  const links = profile.profileLinks ?? [];
  const isOwnProfile = currentUser?.id === profile.id;
  const isCompanyAdmin = profile.role === "COMPANY_ADMIN";
  const roleLine = profile.professionalRole ||
    (profile.company ? "Company admin" : "Job seeker");
  const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

  return (
    <div className="seeker-profile-page">
      <section className="seeker-profile-hero">
        <div className="seeker-profile-stars" />
        <Navbar />
        <div className="seeker-profile-intro">
          {profile.avatar && (
            <img
              className="seeker-profile-avatar"
              src={
                profile.avatar.startsWith("http")
                  ? profile.avatar
                  : `${apiUrl}${profile.avatar}`
              }
              alt={`${profile.name}'s profile`}
            />
          )}
          <p>{profile.availability || "Job seeker profile"}</p>
          <h1>{profile.name}{profile.emailVerifiedAt && <span className="verified-profile-badge" title="Verified email" aria-label="Verified email">✓</span>}</h1>
          <h2>{roleLine}</h2>
          <div className="seeker-profile-pills">
            {location && <span>{location}</span>}
            {profile.lastEducation && <span>{profile.lastEducation}</span>}
            {profile.salaryExpectation && (
              <span>{profile.salaryExpectation}</span>
            )}
          </div>
          {isOwnProfile && (
            <a className="seeker-profile-edit" href="/profile">
              Edit profile
            </a>
          )}
        </div>
      </section>

      <section className="seeker-profile-content">
        {!isCompanyAdmin && <article className="seeker-paper-card profile-response-card">
          <div><span>Interview response rate</span><AnimatedMetric value={profile.applicationInsights.interviewResponseRate} suffix="%" /></div>
          <div><span>Letter response rate</span><AnimatedMetric value={profile.applicationInsights.letterResponseRate} suffix="%" /></div>
          <div className="profile-applied-roles"><span>Applied for</span><p>{profile.applicationInsights.appliedRoles.length ? profile.applicationInsights.appliedRoles.map((application, index) => <span key={`${application.slug}-${index}`}>{application.title}{index < profile.applicationInsights.appliedRoles.length - 1 ? ", " : ""}</span>) : "No roles yet"}</p></div>
        </article>}
        {!isCompanyAdmin && <article className="seeker-paper-card seeker-experience-card">
          <section>
            <div className="seeker-section-heading">
              <h2>Experience</h2>
              {isOwnProfile && <button type="button" onClick={() => { setEditingExperienceIndex(null); setExperienceModalOpen(true); }}><Plus /> Add experience</button>}
            </div>
            {experiences.length > 0 ? (
              <div className="seeker-profile-entries">
                {experiences.map((experience, index) => (
                  <div className="seeker-experience-entry" key={`${experience.title}-${index}`}>
                    {experience.companyId && companies.find((company) => company.id === experience.companyId)?.logo && (
                      <img
                        className="seeker-experience-logo"
                        src={(() => { const logo = companies.find((company) => company.id === experience.companyId)!.logo!; return logo.startsWith("http") ? logo : `${apiUrl}${logo}`; })()}
                        alt=""
                      />
                    )}
                    <div>
                    <header>
                      <h3>
                        {experience.title} ·{" "}
                        {experience.companyId ? (
                          <a href={`/companies/${experience.companyId}`}>
                            {experience.company}
                          </a>
                        ) : (
                          experience.company
                        )}
                      </h3>
                      <span className="seeker-entry-actions">
                        {experience.period}
                        {isOwnProfile && (
                          <button
                            type="button"
                            aria-label={`Edit ${experience.title} experience`}
                            onClick={() => {
                              setEditingExperienceIndex((profile.experiences ?? []).indexOf(experience));
                              setExperienceModalOpen(true);
                            }}
                          ><Pencil /></button>
                        )}
                      </span>
                    </header>
                    {experience.note && <p>{experience.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="seeker-profile-empty">
                <p>No experience has been added yet.</p>
              </div>
            )}
          </section>
        </article>}
        {!isCompanyAdmin && <article className="seeker-paper-card seeker-selected-work-card">
          <section>
            <div className="seeker-section-heading">
              <h2>Selected work</h2>
              {isOwnProfile && <button type="button" onClick={() => { setEditingWorkIndex(null); setWorkModalOpen(true); }}><Plus /> Add work</button>}
            </div>
            {selectedWork.length > 0 ? (
              <div className="seeker-profile-entries selected-work">
                {selectedWork.map((work, index) => (
                  <div key={`${work.name}-${index}`}>
                    <header>
                      <h3>
                        {work.url ? (
                          <a href={work.url} target="_blank" rel="noreferrer">
                            {work.name}
                          </a>
                        ) : work.name}
                      </h3>
                      {isOwnProfile && (
                        <button
                          className="seeker-entry-edit"
                          type="button"
                          aria-label={`Edit ${work.name}`}
                          onClick={() => {
                            setEditingWorkIndex((profile.selectedWork ?? []).indexOf(work));
                            setWorkModalOpen(true);
                          }}
                        ><Pencil /></button>
                      )}
                    </header>
                    {work.company && (
                      <small className="selected-work-company">
                        Associated with {work.company}
                      </small>
                    )}
                    {work.date && <small>{workDateLabel(work.date)}</small>}
                    {work.note && <p>{work.note}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="seeker-profile-empty">
                <p>No selected work has been added yet.</p>
              </div>
            )}
          </section>
        </article>}
        <article className="seeker-paper-card profile-about-card">
          <div className="seeker-profile-main">
            <div>
              {profile.company && (
                <section>
                  <h2>Company</h2>
                  <div className="seeker-profile-entries">
                    <div>
                      <h3>
                        <a href={`/companies/${profile.company.id}`}>
                          {profile.company.companyName}
                        </a>
                      </h3>
                      <p>{profile.professionalRole || "Company admin"}</p>
                    </div>
                  </div>
                </section>
              )}
              {!isCompanyAdmin && (
                <section>
                  <div className="seeker-section-heading">
                    <h2>My story</h2>
                    {isOwnProfile && <button type="button" aria-label="Edit my story" onClick={() => { setStoryDraft(profile.profileStory); setStoryModalOpen(true); }}><Pencil /></button>}
                  </div>
                  {profile.profileStory
                    ? <p>{profile.profileStory}</p>
                    : <div className="seeker-profile-empty compact"><p>No story has been added yet.</p></div>}
                </section>
              )}
            </div>

            <aside>
              {!isCompanyAdmin && (
                <section>
                  <div className="seeker-section-heading">
                    <h2>Skills</h2>
                    {isOwnProfile && <a href="/profile" aria-label="Add skills"><Plus /></a>}
                  </div>
                  {profile.skills.length > 0
                    ? <div className="seeker-profile-tags">{profile.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
                    : <div className="seeker-profile-empty compact"><p>No skills have been added yet.</p></div>}
                </section>
              )}
              {links.length > 0 && (
                <section>
                  <h2>Get in touch</h2>
                  <div className="seeker-profile-tags">
                    {links.map((link) => (
                      <a
                        key={link.label}
                        href={link.url}
                        target={
                          link.url.startsWith("mailto:") ? undefined : "_blank"
                        }
                        rel="noreferrer"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </aside>
          </div>
        </article>
        {isOwnProfile && !isCompanyAdmin && (
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
              <h2>Generate your profile into a CV in <span>seconds.</span></h2>
              <a
                className="button button-light"
                href={subscriptionActive === true ? "/profile/cv-generator" : "/pricing"}
              >
                Generate my CV
              </a>
            </div>
          </section>
        )}
        {experienceModalOpen && profile && (
          <QuickExperienceModal
            key={editingExperienceIndex ?? "new"}
            companies={companies}
            initial={editingExperienceIndex === null ? undefined : (profile.experiences ?? [])[editingExperienceIndex]}
            onDismiss={() => setExperienceModalOpen(false)}
            onSave={async (experience) => {
              try {
                const current = profile.experiences ?? [];
                const next = editingExperienceIndex === null
                  ? [...current, experience]
                  : current.map((item, index) => index === editingExperienceIndex ? experience : item);
                await updateProfile({
                  experiences: next.sort(
                    (a, b) => experienceTime(b.period) - experienceTime(a.period),
                  ),
                });
                await refreshProfile();
                setExperienceModalOpen(false);
                toast.success(editingExperienceIndex === null ? "Experience added." : "Experience updated.");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Unable to add experience.");
              }
            }}
          />
        )}
        {workModalOpen && profile && (
          <SelectedWorkModal
            key={editingWorkIndex ?? "new"}
            companies={[...new Set((profile.experiences ?? []).map((experience) => experience.company).filter(Boolean))]}
            initial={editingWorkIndex === null ? undefined : (profile.selectedWork ?? [])[editingWorkIndex]}
            onDismiss={() => setWorkModalOpen(false)}
            onSave={async (work) => {
              try {
                const current = profile.selectedWork ?? [];
                const next = editingWorkIndex === null
                  ? [...current, work]
                  : current.map((item, index) => index === editingWorkIndex ? work : item);
                await updateProfile({
                  selectedWork: next.sort(
                    (a, b) => (b.date ?? "").localeCompare(a.date ?? ""),
                  ),
                });
                await refreshProfile();
                setWorkModalOpen(false);
                toast.success(editingWorkIndex === null ? "Selected work added." : "Selected work updated.");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Unable to add selected work.");
              }
            }}
          />
        )}
        {storyModalOpen && profile && (
          <div className="experience-modal" onMouseDown={(event) => event.target === event.currentTarget && setStoryModalOpen(false)}>
            <form className="experience-modal-dialog" onSubmit={async (event) => { event.preventDefault(); try { await updateProfile({ profileStory: storyDraft }); await refreshProfile(); setStoryModalOpen(false); toast.success("Story updated."); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to update story."); } }}>
              <header><div><p className="eyebrow">About you</p><h2>Edit my story</h2></div><button type="button" onClick={() => setStoryModalOpen(false)}>×</button></header>
              <div className="profile-fields"><label className="profile-wide">My story<textarea autoFocus value={storyDraft} onChange={(event) => setStoryDraft(event.target.value)} /></label></div>
              <footer><button type="button" className="experience-modal-dismiss" onClick={() => setStoryModalOpen(false)}>Dismiss</button><button className="profile-submit">Save</button></footer>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
