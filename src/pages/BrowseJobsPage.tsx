import { useEffect, useRef, useState } from "react";
import { Footer } from "../components/Footer";
import {
  BrowseFilters,
  type DateFilter,
  type SortKey,
} from "../components/BrowseJobs/BrowseFilters";
import { BrowseHero } from "../components/BrowseJobs/BrowseHero";
import { JobsResults } from "../components/BrowseJobs/JobsResults";
import { Navbar } from "../components/Navbar";
import { getPublicJobs, type PublicJob } from "../services/job.service";
import {
  getCountries,
  getWorldwideCities,
  getWorldwideStates,
  reverseGeocodeLocation,
  type Region,
} from "../services/region.service";
import { toast } from "react-hot-toast";

const categories = [
  "TECHNOLOGY",
  "FINANCE",
  "MARKETING",
  "SALES",
  "DESIGN",
  "HUMAN_RESOURCES",
  "OPERATIONS",
  "EDUCATION",
  "HEALTHCARE",
  "OTHER",
];
export default function BrowseJobsPage() {
  const initialSearch = new URLSearchParams(window.location.search);
  const [query, setQuery] = useState(initialSearch.get("q") ?? "");
  const [category, setCategory] = useState(
    initialSearch.get("category") ?? "all",
  );
  const [country, setCountry] = useState(initialSearch.get("country") ?? "all");
  const [province, setProvince] = useState(
    initialSearch.get("provinceName") ?? "all",
  );
  const [location, setLocation] = useState(initialSearch.get("city") ?? "all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("any");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [locating, setLocating] = useState(false);
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [countries, setCountries] = useState<Region[]>([]);
  const [locations, setLocations] = useState<Region[]>([]);
  const [provincesLoading, setProvincesLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const locationSnapshot = useRef<{
    country: string;
    province: string;
    city: string;
    sort: SortKey;
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
      setLocations([]);
      setLocationsLoading(false);
      return;
    }
    setLocationsLoading(true);
    getWorldwideCities(country, province)
      .then(setLocations)
      .catch(() => setLocations([]))
      .finally(() => setLocationsLoading(false));
  }, [country, province]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      getPublicJobs({
        title: query || undefined,
        category: category === "all" ? undefined : category,
        country: country === "all" ? undefined : country,
        provinceName: province === "all" ? undefined : province,
        city: location === "all" ? undefined : location,
        dateFrom:
          dateFilter === "range"
            ? from || undefined
            : dateFilter === "7d"
              ? new Date(Date.now() - 7 * 86_400_000).toISOString()
              : dateFilter === "30d"
                ? new Date(Date.now() - 30 * 86_400_000).toISOString()
                : undefined,
        dateTo: dateFilter === "range" ? to || undefined : undefined,
        sort,
        latitude: coords?.lat,
        longitude: coords?.lng,
        limit: 50,
      })
        .then(setJobs)
        .catch(() => setJobs([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [
    category,
    coords,
    country,
    dateFilter,
    from,
    location,
    province,
    query,
    sort,
    to,
  ]);
  const locate = async () => {
    if (coords) {
      const previous = locationSnapshot.current;
      setCoords(null);
      setCountry(previous?.country ?? "all");
      setProvince(previous?.province ?? "all");
      setLocation(previous?.city ?? "all");
      setSort(previous?.sort ?? "newest");
      locationSnapshot.current = null;
      return;
    }
    if (!navigator.geolocation) {
      toast.error(
        "Location is not supported by this browser. Choose a location manually.",
      );
      return;
    }
    locationSnapshot.current = { country, province, city: location, sort };
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
        setLocation(resolved.city);
      } catch {
        setCountry("all");
        setProvince("all");
        setLocation("all");
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
  const reset = () => {
    setQuery("");
    setCategory("all");
    setCountry("all");
    setProvince("all");
    setLocation("all");
    setDateFilter("any");
    setFrom("");
    setTo("");
    setSort(coords ? "nearest" : "newest");
  };
  return (
    <div id="top" className="browse-jobs-page">
      <Navbar />
      <main>
        <BrowseHero
          locating={locating}
          located={Boolean(coords)}
          onLocate={locate}
        />
        <BrowseFilters
          query={query}
          category={category}
          country={country}
          province={province}
          location={location}
          dateFilter={dateFilter}
          from={from}
          to={to}
          sort={sort}
          categories={categories}
          countries={countries}
          provinces={provinces}
          locations={locations}
          provincesLoading={provincesLoading}
          locationsLoading={locationsLoading}
          showNearest={Boolean(coords)}
          activeFilters={Boolean(
            query ||
            category !== "all" ||
            country !== "all" ||
            province !== "all" ||
            location !== "all" ||
            dateFilter !== "any",
          )}
          onQueryChange={setQuery}
          onCategoryChange={setCategory}
          onCountryChange={(value) => {
            if (coords) setSort("newest");
            setCoords(null);
            locationSnapshot.current = null;
            setCountry(value);
            setProvince("all");
            setLocation("all");
          }}
          onProvinceChange={(value) => {
            if (coords) setSort("newest");
            setCoords(null);
            locationSnapshot.current = null;
            setProvince(value);
            setLocation("all");
          }}
          onLocationChange={(value) => {
            if (coords) setSort("newest");
            setCoords(null);
            locationSnapshot.current = null;
            setLocation(value);
          }}
          onDateFilterChange={setDateFilter}
          onFromChange={setFrom}
          onToChange={setTo}
          onSortChange={setSort}
          onReset={reset}
        />
        <JobsResults jobs={jobs} loading={loading} onReset={reset} />
      </main>
      <Footer />
    </div>
  );
}
