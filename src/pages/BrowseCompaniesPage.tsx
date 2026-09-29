import { parseAsFloat, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { toast } from "react-hot-toast";

const searchParams = {
  q: parseAsString.withDefault(""),
  country: parseAsString.withDefault("all"),
  provinceName: parseAsString.withDefault("all"),
  city: parseAsString.withDefault("all"),
  sort: parseAsStringLiteral(["az", "za", "nearest"]).withDefault("az"),
  latitude: parseAsFloat,
  longitude: parseAsFloat,
};

export default function BrowseCompaniesPage() {
  const [{
    q: query,
    country,
    provinceName: province,
    city,
    sort: requestedSort,
    latitude,
    longitude,
  }, setParams] = useQueryStates(searchParams);
  const coords = useMemo(() => {
    if (latitude === null || longitude === null ||
        !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
        Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
    return { lat: latitude, lng: longitude };
  }, [latitude, longitude]);
  const sort = requestedSort === "nearest" && !coords ? "az" : requestedSort;
  const setQuery = (value: string) => {
    void setParams({ q: value });
  };
  const setCountry = (value: string) => {
    void setParams({ country: value });
  };
  const setProvince = (value: string) => {
    void setParams({ provinceName: value });
  };
  const setCity = (value: string) => {
    void setParams({ city: value });
  };
  const setSort = (value: "az" | "za" | "nearest") => {
    void setParams({ sort: value });
  };
  const setCoords = (value: { lat: number; lng: number } | null) => {
    void setParams({ latitude: value?.lat ?? null, longitude: value?.lng ?? null });
  };
  const [companies, setCompanies] = useState<PublicCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [countries, setCountries] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [provincesLoading, setProvincesLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);
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
        provinceName: province === "all" ? undefined : province,
        city: city === "all" ? undefined : city,
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
      toast.error(
        "Location is not supported by this browser. Choose a location manually.",
      );
      return;
    }
    locationSnapshot.current = { country, province, city, sort };
    setLocating(true);
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) =>
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
        const resolved = await reverseGeocodeLocation(
          coordinates.lat,
          coordinates.lng,
        );
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
      toast.error(
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
