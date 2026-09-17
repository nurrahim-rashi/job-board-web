import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import {
  getPublicCompany,
  type PublicCompanyDetail,
} from "../services/company.service";
import { useAuth } from "../stores/useAuth";
import { isNewJob } from "../lib/job-age";
import { categoryLabel } from "../types/job-posting";
import { DataSkeleton } from "../components/site/DataSkeleton";
import { QualityScoreCard } from "../components/Profile/QualityScoreCard";
import { PageLoading } from "../components/site/PageLoading";
import { ExpandableContent } from "../components/site/ExpandableContent";
import { useMatchedCardMinHeights } from "../hooks/useMatchedCardMinHeights";
import { CompanyReviews } from "../components/CompanyReview/CompanyReviews";

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
  const columnsRef = useRef<HTMLDivElement>(null);
  const { companyId = "" } = useParams();
  const user = useAuth((state) => state.user);
  const [company, setCompany] = useState<PublicCompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [rolePage, setRolePage] = useState(1);
  useMatchedCardMinHeights(
    columnsRef,
    ":scope > .profile-left-column > article",
    ":scope > .profile-right-column > article",
    !loading && Boolean(company),
  );

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    getPublicCompany(companyId)
      .then(setCompany)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [companyId]);

  useEffect(() => {
    setRolePage(1);
  }, [companyId]);

  if (notFound) return <CompanyNotFound />;
  if (loading || !company) {
    if (
      user?.role === "COMPANY_ADMIN" &&
      String(user.company?.id) === companyId
    )
      return <PageLoading label="Loading company profile" variant="admin" />;
    return (
      <div className="company-profile-page">
        <Navbar />
        <section className="company-profile-loading-shell">
          <div className="data-skeleton-hero" />
          <DataSkeleton count={4} layout="profile" />
        </section>
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
        style={
          company.banner
            ? {
                backgroundImage: `linear-gradient(rgb(13 19 41 / .72), rgb(23 36 67 / .9)), url(${company.banner.startsWith("http") ? company.banner : `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}${company.banner}`})`,
              }
            : undefined
        }
      >
        <div className="company-profile-stars" />
        <Navbar />
        <div className="company-profile-intro">
          {company.logo && (
            <img
              className="company-profile-logo"
              src={
                company.logo.startsWith("http")
                  ? company.logo
                  : `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}${company.logo}`
              }
              alt={`${company.companyName} logo`}
            />
          )}
          <p>
            {company.city} · {size} · Est. {founded}
          </p>
          <h1>{company.companyName}</h1>
          <p className="company-profile-tagline">{tagline}</p>
          {company.website && (
            <a
              className="company-profile-website"
              href={company.website}
              target="_blank"
              rel="noreferrer"
            >
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
        <div className="company-profile-columns" ref={columnsRef}>
          <div className="profile-left-column">
            <article className="company-paper-card company-culture-card company-about-card">
              <section>
                <h2>About the company</h2>
                <ExpandableContent maxHeight={300}>
                  {company.profileContent ? (
                    <p>{company.profileContent}</p>
                  ) : (
                    <div className="company-profile-empty">
                      <p>No company profile has been added yet.</p>
                    </div>
                  )}
                </ExpandableContent>
              </section>
            </article>
            <article className="company-paper-card company-culture-card company-perks-card">
              <section>
                <h2>Perks &amp; life there</h2>
                <ExpandableContent maxHeight={320}>
                  {company.perks.length > 0 ? (
                    <ul>
                      {company.perks.map((perk) => (
                        <li key={perk}>
                          <i />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="company-profile-empty">
                      <p>No perks have been added yet.</p>
                    </div>
                  )}
                </ExpandableContent>
              </section>
            </article>

            <article className="company-paper-card company-products-card">
              <header>
                <h2>Products</h2>
                <span>
                  {products.length} product{products.length === 1 ? "" : "s"}
                </span>
              </header>
              <ExpandableContent maxHeight={390}>
                {products.length > 0 ? (
                  <div className="company-products-grid">
                    {products.map((product, index) => (
                      <section key={`${product.name}-${index}`}>
                        <h3>
                          {product.url ? (
                            <a
                              href={product.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {product.name} ↗
                            </a>
                          ) : (
                            product.name
                          )}
                        </h3>
                        {product.description && <p>{product.description}</p>}
                      </section>
                    ))}
                  </div>
                ) : (
                  <div className="company-profile-empty">
                    <p>No products have been added yet.</p>
                  </div>
                )}
              </ExpandableContent>
            </article>
          </div>
          <aside className="profile-right-column">
            <QualityScoreCard
              animated={false}
              company
              title="Company quality score"
              score={company.quality.score}
              metrics={company.quality.metrics}
            />
            <article className="company-paper-card company-open-roles">
              <header>
                <h2>Open roles</h2>
                <span>
                  {company.jobPostings.length} open role
                  {company.jobPostings.length === 1 ? "" : "s"}
                </span>
              </header>
              <div className="company-role-list">
                {company.jobPostings
                  .slice(rolePage - 1, rolePage)
                  .map((job) => (
                    <a key={job.id} href={`/jobs/${job.slug}`}>
                      <span>
                        <strong>
                          {job.title}{" "}
                          {isNewJob(job.createdAt) && (
                            <i className="new-job-badge">NEW</i>
                          )}
                        </strong>
                        <small>
                          {categoryLabel(job.category)} · {job.cityLocation}
                        </small>
                      </span>
                      <span>
                        <small>
                          {formatSalary(job.salaryMin, job.salaryMax)}
                        </small>
                        <b>View role →</b>
                      </span>
                    </a>
                  ))}
                {!company.jobPostings.length && <p>No open roles right now.</p>}
              </div>
              {company.jobPostings.length > 1 && (
                <footer className="company-role-pagination">
                  <button
                    type="button"
                    disabled={rolePage === 1}
                    onClick={() => setRolePage((page) => Math.max(1, page - 1))}
                  >
                    Previous
                  </button>
                  <span>
                    {rolePage} / {company.jobPostings.length}
                  </span>
                  <button
                    type="button"
                    disabled={rolePage === company.jobPostings.length}
                    onClick={() =>
                      setRolePage((page) =>
                        Math.min(company.jobPostings.length, page + 1),
                      )
                    }
                  >
                    Next
                  </button>
                </footer>
              )}
            </article>
            <article className="company-paper-card company-contact-card">
              <h2>Company admin</h2>
              <div className="company-contact-person">
                {company.companyAdmin.avatar ? (
                  <img
                    src={
                      company.companyAdmin.avatar.startsWith("http")
                        ? company.companyAdmin.avatar
                        : `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}${company.companyAdmin.avatar}`
                    }
                    alt=""
                  />
                ) : (
                  <span>{company.companyAdmin.name.charAt(0)}</span>
                )}
                <div>
                  <a href={`/profile/${company.companyAdmin.id}`}>
                    {company.companyAdmin.name}
                  </a>
                  <small>
                    {company.companyAdmin.professionalRole || "Company admin"}{" "}
                    at {company.companyName}
                  </small>
                </div>
              </div>
            </article>
          </aside>
        </div>

        <CompanyReviews companyId={companyId} />
      </section>
    </div>
  );
}
