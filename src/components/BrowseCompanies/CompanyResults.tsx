import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, Building, MapPin } from "../site/Icons";
import { Reveal } from "../../hooks/useReveal";
import type { PublicCompany } from "../../services/company.service";
import { DataSkeleton } from "../site/DataSkeleton";
import { formatCompanyLocation } from "../../lib/location";
import { hasTopTierQuality } from "../../lib/quality";

export function CompanyResults({
  companies,
  loading = false,
}: {
  companies: PublicCompany[];
  loading?: boolean;
}) {
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const totalPages = Math.max(1, Math.ceil(companies.length / pageSize));
  useEffect(() => setPage(1), [companies]);
  if (loading)
    return (
      <section className="company-results">
        <div>
          <div className="data-skeleton-heading" />
          <DataSkeleton count={6} layout="cards" />
        </div>
      </section>
    );
  return (
    <section className="company-results">
      <div>
        <p>
          {companies.length} compan{companies.length === 1 ? "y" : "ies"} found
        </p>
        <div className="company-grid">
          {companies
            .slice((page - 1) * pageSize, page * pageSize)
            .map((company, index) => (
              <Reveal key={company.id} delay={Math.min(index, 6) * 60}>
                <article>
                  <header>
                    {company.logo ? (
                      <img
                        src={
                          company.logo.startsWith("http")
                            ? company.logo
                            : `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}${company.logo}`
                        }
                        alt=""
                      />
                    ) : (
                      <span>{company.companyName[0]}</span>
                    )}
                    <div>
                      <h2>
                        {company.companyName}
                        {company.verified && (
                          <BadgeCheck aria-label="Verified company email" />
                        )}
                      </h2>
                      <p>
                        {formatCompanyLocation(company)}
                      </p>
                    </div>
                  </header>
                  {hasTopTierQuality(company.qualityScore) && (
                    <span className="top-tier-company-badge">
                      💎 Top Tier Company
                    </span>
                  )}
                  <p className="company-about">{company.profileContent}</p>
                  {company.distance != null && (
                    <small>
                      <MapPin />
                      {company.distance.toFixed(1)} km away
                    </small>
                  )}
                  <small>
                    <Building />
                    Member since {new Date(company.createdAt).getFullYear()}
                  </small>
                  <a href={`/companies/${company.id}`}>
                    {company._count.jobPostings} open role
                    {company._count.jobPostings === 1 ? "" : "s"}
                    <ArrowRight />
                  </a>
                </article>
              </Reveal>
            ))}
        </div>
        {companies.length > 0 && (
          <div className="browse-pagination">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((value) => value - 1)}
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </button>
          </div>
        )}
        {companies.length === 0 && (
          <div className="company-empty">
            <h2>No companies match that location.</h2>
            <p>Choose another region or allow device location.</p>
          </div>
        )}
      </div>
    </section>
  );
}
