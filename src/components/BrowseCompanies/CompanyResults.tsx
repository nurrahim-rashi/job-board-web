import { ArrowRight, BadgeCheck, Building } from "../site/Icons";
import { Reveal } from "../../hooks/useReveal";
import type { Company } from "./companiesData";
export function CompanyResults({ companies }: { companies: Company[] }) {
  return (
    <section className="company-results">
      <div>
        <p>
          {companies.length} compan{companies.length === 1 ? "y" : "ies"} found
        </p>
        <div className="company-grid">
          {companies.map((company, index) => (
            <Reveal key={company.slug} delay={Math.min(index, 6) * 60}>
              <article>
                <header>
                  <span>{company.name[0]}</span>
                  <div>
                    <h2>
                      {company.name}
                      {company.verified && <BadgeCheck />}
                    </h2>
                    <p>
                      {company.industry} · {company.city}
                    </p>
                  </div>
                </header>
                <p className="company-about">{company.about}</p>
                <small>
                  <Building />
                  {company.size} people · since {company.founded}
                </small>
                <a href="/jobs">
                  {company.openRoles} open role
                  {company.openRoles === 1 ? "" : "s"}
                  <ArrowRight />
                </a>
              </article>
            </Reveal>
          ))}
        </div>
        {companies.length === 0 && (
          <div className="company-empty">
            <h2>No companies match that search.</h2>
            <p>Try another name or location.</p>
          </div>
        )}
      </div>
    </section>
  );
}
