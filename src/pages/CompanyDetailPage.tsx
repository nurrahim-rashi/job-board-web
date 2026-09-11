import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import {
  getPublicCompany,
  type PublicCompanyDetail,
} from "../services/company.service";
import { useAuth } from "../stores/useAuth";

function formatSalary(minimum: number | null, maximum: number | null) {
  if (!minimum && !maximum) return "Salary not disclosed";
  const format = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;
  if (!minimum) return `Up to ${format(maximum!)}`;
  if (!maximum) return `From ${format(minimum)}`;
  return `${format(minimum)}–${format(maximum)}`;
}

function CompanyNotFound() {
  return (
    <div className="company-profile-not-found">
      <Navbar />
      <div>
        <h1>We couldn't find this company</h1>
        <p>It may have been removed, or the link is wrong.</p>
        <a href="/companies">Browse all companies</a>
      </div>
    </div>
  );
}

export default function CompanyDetailPage() {
  const { companyId = "" } = useParams();
  const user = useAuth((state) => state.user);
  const [company, setCompany] = useState<PublicCompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    getPublicCompany(companyId)
      .then(setCompany)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [companyId]);

  if (notFound) return <CompanyNotFound />;
  if (loading || !company) {
    return (
      <div className="company-profile-page">
        <Navbar />
        <div className="company-profile-loading">Loading company…</div>
      </div>
    );
  }

  const founded = company.founded ?? new Date(company.createdAt).getFullYear();
  const size = company.size || "Independent company";
  const tagline = company.tagline || company.profileContent;
  const canEdit =
    user?.role === "COMPANY_ADMIN" && String(user.company?.id) === companyId;

  return (
    <div className="company-profile-page">
      <section className="company-profile-hero">
        <div className="company-profile-stars" />
        <Navbar />
        <div className="company-profile-intro">
          <p>
            {company.city} · {size} · Est. {founded}
          </p>
          <h1>{company.companyName}</h1>
          <p className="company-profile-tagline">{tagline}</p>
          <p className="company-profile-about">{company.profileContent}</p>
          {canEdit && (
            <a className="company-profile-edit" href="/company/profile/edit">
              Edit company
            </a>
          )}
        </div>
      </section>

      <section className="company-profile-content">
        <div>
          {(company.values.length > 0 || company.perks.length > 0) && (
            <article className="company-paper-card company-culture-card">
              {company.values.length > 0 && (
                <section>
                  <h2>What they believe</h2>
                  <ul>
                    {company.values.map((value) => (
                      <li key={value}>
                        <i />
                        <span>{value}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {company.perks.length > 0 && (
                <section>
                  <h2>Perks &amp; life there</h2>
                  <ul>
                    {company.perks.map((perk) => (
                      <li key={perk}>
                        <i />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </article>
          )}

          <article className="company-paper-card company-open-roles">
            <header>
              <h2>Open roles</h2>
              <span>
                {company.jobPostings.length} open role
                {company.jobPostings.length === 1 ? "" : "s"}
              </span>
            </header>
            <div className="company-role-list">
              {company.jobPostings.map((job) => (
                <a key={job.id} href={`/jobs/${job.slug}`}>
                  <span>
                    <strong>{job.title}</strong>
                    <small>
                      {job.category.replaceAll("_", " ")} · {job.cityLocation}
                    </small>
                  </span>
                  <span>
                    <small>{formatSalary(job.salaryMin, job.salaryMax)}</small>
                    <b>View role →</b>
                  </span>
                </a>
              ))}
              {!company.jobPostings.length && <p>No open roles right now.</p>}
            </div>
            <footer>
              <a href="/companies">Back to all companies</a>
            </footer>
          </article>
        </div>
      </section>
    </div>
  );
}
