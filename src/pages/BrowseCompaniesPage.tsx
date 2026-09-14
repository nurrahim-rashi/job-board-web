import { useEffect, useState } from "react";
import { CompaniesHero } from "../components/BrowseCompanies/CompaniesHero";
import { CompanyFilters } from "../components/BrowseCompanies/CompanyFilters";
import { CompanyResults } from "../components/BrowseCompanies/CompanyResults";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { getPublicCompanies, type PublicCompany } from "../services/company.service";
import { getProvinces, getRegencies, type Region } from "../services/region.service";

export default function BrowseCompaniesPage() {
  const [query, setQuery] = useState(""); const [province, setProvince] = useState("all"); const [city, setCity] = useState("all"); const [sort, setSort] = useState<"az" | "za" | "nearest">("az"); const [companies, setCompanies] = useState<PublicCompany[]>([]); const [provinces, setProvinces] = useState<Region[]>([]); const [cities, setCities] = useState<Region[]>([]); const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null); const [locating, setLocating] = useState(false);
  useEffect(() => { getProvinces().then(setProvinces).catch(() => setProvinces([])); }, []);
  useEffect(() => { setCity("all"); if (province === "all") { setCities([]); return; } getRegencies(province).then(setCities).catch(() => setCities([])); }, [province]);
  useEffect(() => { const timer = window.setTimeout(() => { getPublicCompanies({ search: query || undefined, city: city === "all" ? undefined : city, sort: sort === "az" ? "asc" : sort === "za" ? "desc" : "nearest", latitude: coords?.lat, longitude: coords?.lng }).then(setCompanies).catch(() => setCompanies([])); }, 250); return () => window.clearTimeout(timer); }, [city, coords, query, sort]);
  const locate = () => { if (!navigator.geolocation) { window.alert("Location is not supported by this browser. Choose a location manually."); return; } setLocating(true); navigator.geolocation.getCurrentPosition((position) => { setCoords({ lat: position.coords.latitude, lng: position.coords.longitude }); setSort("nearest"); setProvince("all"); setCity("all"); setLocating(false); }, () => { setLocating(false); window.alert("We could not access your location. Allow location permission or choose a province and city manually."); }, { timeout: 8000 }); };
  return <div id="top" className="browse-companies-page"><Navbar /><main><CompaniesHero /><CompanyFilters query={query} province={province} city={city} sort={sort} provinces={provinces} cities={cities} locating={locating} located={Boolean(coords)} onLocate={locate} onQueryChange={setQuery} onProvinceChange={(value) => { setCoords(null); setProvince(value); if (sort === "nearest") setSort("az"); }} onCityChange={(value) => { setCoords(null); setCity(value); }} onSortChange={setSort} /><CompanyResults companies={companies} /></main><Footer /></div>;
}
