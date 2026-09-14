import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import {
  getPublicCompany,
  type PublicCompanyDetail,
} from "../services/company.service";
import { useAuth } from "../stores/useAuth";
import { isNewJob } from "../lib/job-age";
import { categoryLabel } from "../types/job-posting";
import { AnimatedMetric } from "../components/site/AnimatedMetric";

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
  const products = company.products ?? [];
  const canEdit =
    user?.role === "COMPANY_ADMIN" && String(user.company?.id) === companyId;

  return (
    <div className="company-profile-page">
      <section
        className="company-profile-hero"
        style={company.banner ? { backgroundImage: `linear-gradient(rgb(13 19 41 / .72), rgb(23 36 67 / .9)), url(${company.banner.startsWith("http") ? company.banner : `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}${company.banner}`})` } : undefined}
      >
        <div className="company-profile-stars" />
        <Navbar />
        <div className="company-profile-intro">
          {company.logo && <img className="company-profile-logo" src={company.logo.startsWith("http") ? company.logo : `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}${company.logo}`} alt={`${company.companyName} logo`} />}
          <p>
            {company.city} · {size} · Est. {founded}
          </p>
          <h1>{company.companyName}</h1>
          <p className="company-profile-tagline">{tagline}</p>
          {company.website && (
            <a className="company-profile-website" href={company.website} target="_blank" rel="noreferrer">
              Visit website ↗
            </a>
          )}
          {canEdit && (
            <a className="company-profile-edit" href="/company/profile/edit">
              Edit company
            </a>
          )}
        </div>
      </section>

      <section className="company-profile-content">
        <div>
          <article className="company-paper-card company-metrics-card">
            <div><span>Response rate</span><AnimatedMetric value={company.metrics.responseRate} suffix="%" /></div>
            <div><span>Acceptance rate</span><AnimatedMetric value={company.metrics.acceptanceRate} suffix="%" /></div>
            <div><span>Usually responds within</span>{company.metrics.respondsWithinDays ? <AnimatedMetric value={company.metrics.respondsWithinDays} suffix={company.metrics.respondsWithinDays === 1 ? " day" : " days"} /> : <strong>No data yet</strong>}</div>
            {user?.role === "JOB_SEEKER" && company.viewerApplications.length > 0 && <p>You applied for {company.viewerApplications.map((application, index) => <span key={application.slug}>{application.title}{index < company.viewerApplications.length - 1 ? ", " : ""}</span>)}</p>}
          </article>
          <article className="company-paper-card company-culture-card">
            <section>
              <h2>About the company</h2>
              {company.profileContent
                ? <p>{company.profileContent}</p>
                : <div className="company-profile-empty"><p>No company profile has been added yet.</p></div>}
            </section>
            <section>
              <h2>Perks &amp; life there</h2>
              {company.perks.length > 0 ? <ul>
                {company.perks.map((perk) => (
                  <li key={perk}><i /><span>{perk}</span></li>
                ))}
              </ul> : <div className="company-profile-empty"><p>No perks have been added yet.</p></div>}
            </section>
          </article>

          <article className="company-paper-card company-products-card">
              <header>
                <h2>Products</h2>
                <span>{products.length} product{products.length === 1 ? "" : "s"}</span>
              </header>
              {products.length > 0 ? <div className="company-products-grid">
                {products.map((product, index) => (
                  <section key={`${product.name}-${index}`}>
                    <h3>
                      {product.url ? (
                        <a href={product.url} target="_blank" rel="noreferrer">{product.name} ↗</a>
                      ) : product.name}
                    </h3>
                    {product.description && <p>{product.description}</p>}
                  </section>
                ))}
              </div> : <div className="company-profile-empty"><p>No products have been added yet.</p></div>}
          </article>

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
                    <strong>{job.title} {isNewJob(job.createdAt) && <i className="new-job-badge">NEW</i>}</strong>
                    <small>
                      {categoryLabel(job.category)} · {job.cityLocation}
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
