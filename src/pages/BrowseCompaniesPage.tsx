import { useEffect, useMemo, useState } from "react";
import { CompaniesHero } from "../components/BrowseCompanies/CompaniesHero";
import { CompanyFilters } from "../components/BrowseCompanies/CompanyFilters";
import { CompanyResults } from "../components/BrowseCompanies/CompanyResults";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { getPublicCompanies, type PublicCompany } from "../services/company.service";

export default function BrowseCompaniesPage() {
  const [query, setQuery] = useState(""); const [city, setCity] = useState("all"); const [sort, setSort] = useState<"az" | "za">("az"); const [companies, setCompanies] = useState<PublicCompany[]>([]);
  useEffect(() => { const timer = window.setTimeout(() => { getPublicCompanies({ search: query || undefined, city: city === "all" ? undefined : city, sort: sort === "az" ? "asc" : "desc" }).then(setCompanies).catch(() => setCompanies([])); }, 250); return () => window.clearTimeout(timer); }, [city, query, sort]);
  const cities = useMemo(() => [...new Set(companies.map((company) => company.city))].sort(), [companies]);
  return <div id="top" className="browse-companies-page"><Navbar /><main><CompaniesHero /><CompanyFilters query={query} city={city} sort={sort} cities={cities} onQueryChange={setQuery} onCityChange={setCity} onSortChange={setSort} /><CompanyResults companies={companies} /></main><Footer /></div>;
}
