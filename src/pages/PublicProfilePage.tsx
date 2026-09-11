import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import {
  getPublicProfile,
  type PublicSeekerProfile,
} from "../services/profile.service";
import { useAuth } from "../stores/useAuth";

export default function PublicProfilePage() {
  const { userId = "" } = useParams();
  const currentUser = useAuth((state) => state.user);
  const [profile, setProfile] = useState<PublicSeekerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    getPublicProfile(userId)
      .then(setProfile)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [userId]);

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
  const experiences = profile.experiences ?? [];
  const selectedWork = profile.selectedWork ?? [];
  const links = profile.profileLinks ?? [];
  const isOwnProfile = currentUser?.id === profile.id;
  const roleLine = profile.professionalRole ||
    (profile.company ? "Company admin" : "Job seeker");
  const hasCareerContent = Boolean(
    profile.profileStory || experiences.length || selectedWork.length,
  );
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
              src={`${apiUrl}${profile.avatar}`}
              alt={`${profile.name}'s profile`}
            />
          )}
          <p>{profile.availability || "Job seeker profile"}</p>
          <h1>{profile.name}</h1>
          <h2>{roleLine}</h2>
          {profile.profileIntro && (
            <p className="seeker-profile-summary">{profile.profileIntro}</p>
          )}
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
        <article className="seeker-paper-card">
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
              {!profile.company && !hasCareerContent && (
                <section>
                  <h2>About</h2>
                  <p>
                    {profile.lastEducation
                      ? `Education: ${profile.lastEducation}`
                      : "This job seeker has not added their career story yet."}
                  </p>
                </section>
              )}
              {profile.profileStory && (
                <section>
                  <h2>My story</h2>
                  <p>{profile.profileStory}</p>
                </section>
              )}
              {experiences.length > 0 && (
                <section>
                  <h2>Experience</h2>
                  <div className="seeker-profile-entries">
                    {experiences.map((experience, index) => (
                      <div key={`${experience.title}-${index}`}>
                        <header>
                          <h3>
                            {experience.title} · {experience.company}
                          </h3>
                          <span>{experience.period}</span>
                        </header>
                        <p>{experience.note}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {selectedWork.length > 0 && (
                <section>
                  <h2>Selected work</h2>
                  <div className="seeker-profile-entries selected-work">
                    {selectedWork.map((work, index) => (
                      <div key={`${work.name}-${index}`}>
                        <h3>{work.name}</h3>
                        <p>{work.note}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <aside>
              {(location || profile.lastEducation) && (
                <section>
                  <h2>Profile details</h2>
                  <ul>
                    {location && (
                      <li>
                        <i />
                        {location}
                      </li>
                    )}
                    {profile.lastEducation && (
                      <li>
                        <i />
                        {profile.lastEducation}
                      </li>
                    )}
                  </ul>
                </section>
              )}
              {profile.lookingFor.length > 0 && (
                <section>
                  <h2>Looking for</h2>
                  <ul>
                    {profile.lookingFor.map((item) => (
                      <li key={item}>
                        <i />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {profile.skills.length > 0 && (
                <section>
                  <h2>Skills</h2>
                  <div className="seeker-profile-tags">
                    {profile.skills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
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
      </section>
    </div>
  );
}
