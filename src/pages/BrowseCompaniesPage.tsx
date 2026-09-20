import { useEffect, useRef, useState } from "react";
import { CompaniesHero } from "../components/BrowseCompanies/CompaniesHero";
import { CompanyFilters } from "../components/BrowseCompanies/CompanyFilters";
import { CompanyResults } from "../components/BrowseCompanies/CompanyResults";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import {
  getPublicCompanies,
  type PublicCompany,
} from "../services/company.service";
import {
  getCountries,
  getWorldwideCities,
  getWorldwideStates,
  reverseGeocodeLocation,
  type Region,
} from "../services/region.service";

export default function BrowseCompaniesPage() {
  const initialSearch = new URLSearchParams(window.location.search);
  const [query, setQuery] = useState(initialSearch.get("q") ?? "");
  const [country, setCountry] = useState(
    initialSearch.get("country") ?? "all",
  );
  const [province, setProvince] = useState(
    initialSearch.get("provinceName") ?? "all",
  );
  const [city, setCity] = useState(initialSearch.get("city") ?? "all");
  const [sort, setSort] = useState<"az" | "za" | "nearest">("az");
  const [companies, setCompanies] = useState<PublicCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [countries, setCountries] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [provincesLoading, setProvincesLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [locating, setLocating] = useState(false);
  const locationSnapshot = useRef<{
    country: string;
    province: string;
    city: string;
    sort: "az" | "za" | "nearest";
  } | null>(null);
  useEffect(() => {
    getCountries()
      .then(setCountries)
      .catch(() => setCountries([]));
  }, []);
  useEffect(() => {
    if (country === "all") {
      setProvinces([]);
      setProvincesLoading(false);
      return;
    }
    setProvincesLoading(true);
    getWorldwideStates(country)
      .then(setProvinces)
      .catch(() => setProvinces([]))
      .finally(() => setProvincesLoading(false));
  }, [country]);
  useEffect(() => {
    if (country === "all" || province === "all") {
      setCities([]);
      setCitiesLoading(false);
      return;
    }
    setCitiesLoading(true);
    getWorldwideCities(country, province)
      .then(setCities)
      .catch(() => setCities([]))
      .finally(() => setCitiesLoading(false));
  }, [country, province]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      getPublicCompanies({
        search: query || undefined,
        country: country === "all" ? undefined : country,
        provinceName: coords || province === "all" ? undefined : province,
        city: coords || city === "all" ? undefined : city,
        sort: sort === "az" ? "asc" : sort === "za" ? "desc" : "nearest",
        latitude: coords?.lat,
        longitude: coords?.lng,
      })
        .then(setCompanies)
        .catch(() => setCompanies([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [city, coords, country, province, query, sort]);
  const locate = async () => {
    if (coords) {
      const previous = locationSnapshot.current;
      setCoords(null);
      setCountry(previous?.country ?? "all");
      setProvince(previous?.province ?? "all");
      setCity(previous?.city ?? "all");
      setSort(previous?.sort ?? "az");
      locationSnapshot.current = null;
      return;
    }
    if (!navigator.geolocation) {
      window.alert(
        "Location is not supported by this browser. Choose a location manually.",
      );
      return;
    }
    locationSnapshot.current = { country, province, city, sort };
    setLocating(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12_000,
          maximumAge: 60_000,
        }),
      );
      const coordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setCoords(coordinates);
      setSort("nearest");
      try {
        const resolved = await reverseGeocodeLocation(coordinates.lat, coordinates.lng);
        const detectedCountry =
          countries.find(
            (item) =>
              item.code.toLocaleUpperCase("en") === resolved.countryCode,
          )?.name ?? resolved.country;
        setCountry(detectedCountry);
        setProvince(resolved.province);
        setCity(resolved.city);
      } catch {
        setCountry("all");
        setProvince("all");
        setCity("all");
      }
    } catch {
      locationSnapshot.current = null;
      window.alert(
        "We could not access your location. Allow location permission or choose a province and city manually.",
      );
    } finally {
      setLocating(false);
    }
  };
  return (
    <div id="top" className="browse-companies-page">
      <Navbar />
      <main>
        <CompaniesHero />
        <CompanyFilters
          query={query}
          country={country}
          province={province}
          city={city}
          sort={sort}
          countries={countries}
          provinces={provinces}
          cities={cities}
          provincesLoading={provincesLoading}
          citiesLoading={citiesLoading}
          locating={locating}
          located={Boolean(coords)}
          onLocate={locate}
          onQueryChange={setQuery}
          onCountryChange={(value) => {
            setCoords(null);
            locationSnapshot.current = null;
            setCountry(value);
            setProvince("all");
            setCity("all");
            if (sort === "nearest") setSort("az");
          }}
          onProvinceChange={(value) => {
            setCoords(null);
            locationSnapshot.current = null;
            setProvince(value);
            setCity("all");
            if (sort === "nearest") setSort("az");
          }}
          onCityChange={(value) => {
            if (coords && sort === "nearest") setSort("az");
            setCoords(null);
            locationSnapshot.current = null;
            setCity(value);
          }}
          onSortChange={setSort}
        />
        <CompanyResults companies={companies} loading={loading} />
      </main>
      <Footer />
    </div>
  );
}
