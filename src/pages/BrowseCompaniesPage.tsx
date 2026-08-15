import { useMemo, useState } from "react";
import { CompaniesHero } from "../components/BrowseCompanies/CompaniesHero";
import { CompanyFilters } from "../components/BrowseCompanies/CompanyFilters";
import { CompanyResults } from "../components/BrowseCompanies/CompanyResults";
import {
  companies,
  companyCities,
} from "../components/BrowseCompanies/companiesData";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
export default function BrowseCompaniesPage() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("all");
  const [sort, setSort] = useState<"az" | "za">("az");
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return [...companies]
      .filter((company) => !term || company.name.toLowerCase().includes(term))
      .filter((company) => city === "all" || company.city === city)
      .sort(
        (left, right) =>
          (sort === "az" ? 1 : -1) * left.name.localeCompare(right.name),
      );
  }, [city, query, sort]);
  return (
    <div id="top" className="browse-companies-page">
      <Navbar />
      <main>
        <CompaniesHero />
        <CompanyFilters
          query={query}
          city={city}
          sort={sort}
          cities={companyCities}
          onQueryChange={setQuery}
          onCityChange={setCity}
          onSortChange={setSort}
        />
        <CompanyResults companies={results} />
      </main>
      <Footer />
    </div>
  );
}
