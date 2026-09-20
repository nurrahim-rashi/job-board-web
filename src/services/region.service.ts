import { axiosInstance } from "../lib/axios";

export type Region = { code: string; name: string };
type RegionResponse = { data: Region[] };

function regionData(response: { data: unknown }) {
  const payload = response.data as Partial<RegionResponse> | null;
  if (!payload || !Array.isArray(payload.data)) {
    throw new Error("Unable to load locations");
  }
  return payload.data;
}

export type WorldwideLocation = {
  id: string;
  name: string;
  label: string;
  type: "city" | "state" | "country";
  province: string | null;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
};

export async function getProvinces() {
  const response = await axiosInstance.get<RegionResponse>("/regions/provinces");
  return regionData(response);
}

export async function getCountries() {
  const response = await axiosInstance.get<RegionResponse>("/regions/countries");
  return regionData(response);
}

export async function getWorldwideStates(country: string) {
  const response = await axiosInstance.get<RegionResponse>("/regions/states", {
    params: { country },
  });
  return regionData(response);
}

export async function getWorldwideCities(country: string, state: string) {
  const response = await axiosInstance.get<RegionResponse>("/regions/cities", {
    params: { country, state },
  });
  return regionData(response);
}

export async function getRegencies(provinceCode: string) {
  const response = await axiosInstance.get<RegionResponse>(`/regions/regencies/${provinceCode}`);
  return regionData(response);
}

export async function searchWorldwideLocations(query: string) {
  const response = await axiosInstance.get<{ data: WorldwideLocation[] }>(
    "/regions/search",
    { params: { q: query } },
  );
  const payload = response.data as { data?: WorldwideLocation[] } | null;
  if (!payload || !Array.isArray(payload.data)) {
    throw new Error("Unable to search locations");
  }
  return payload.data;
}

export type EducationOptionKind = "degrees" | "majors" | "institutions";

export async function getEducationOptions(
  kind: EducationOptionKind,
  query = "",
  country?: string,
) {
  const response = await axiosInstance.get<{ data: string[] }>(
    `/regions/education/${kind}`,
    { params: { ...(query ? { q: query } : {}), ...(country ? { country } : {}) } },
  );
  const payload = response.data as { data?: string[] } | null;
  return Array.isArray(payload?.data) ? payload.data : [];
}

export type ReverseGeocodedLocation = {
  city: string;
  province: string;
  country: string;
  countryCode: string;
};

const indonesianProvinceByIsoCode: Record<string, string> = {
  "ID-AC": "Aceh",
  "ID-SU": "Sumatera Utara",
  "ID-SB": "Sumatera Barat",
  "ID-RI": "Riau",
  "ID-JA": "Jambi",
  "ID-SS": "Sumatera Selatan",
  "ID-BE": "Bengkulu",
  "ID-LA": "Lampung",
  "ID-BB": "Kepulauan Bangka Belitung",
  "ID-KR": "Kepulauan Riau",
  "ID-JK": "DKI Jakarta",
  "ID-JB": "Jawa Barat",
  "ID-JT": "Jawa Tengah",
  "ID-YO": "Daerah Istimewa Yogyakarta",
  "ID-JI": "Jawa Timur",
  "ID-BT": "Banten",
  "ID-BA": "Bali",
  "ID-NB": "Nusa Tenggara Barat",
  "ID-NT": "Nusa Tenggara Timur",
  "ID-KB": "Kalimantan Barat",
  "ID-KT": "Kalimantan Tengah",
  "ID-KS": "Kalimantan Selatan",
  "ID-KI": "Kalimantan Timur",
  "ID-KU": "Kalimantan Utara",
  "ID-SA": "Sulawesi Utara",
  "ID-ST": "Sulawesi Tengah",
  "ID-SN": "Sulawesi Selatan",
  "ID-SG": "Sulawesi Tenggara",
  "ID-GO": "Gorontalo",
  "ID-SR": "Sulawesi Barat",
  "ID-MA": "Maluku",
  "ID-MU": "Maluku Utara",
  "ID-PB": "Papua Barat",
  "ID-PA": "Papua",
  "ID-PD": "Papua Barat Daya",
  "ID-PE": "Papua Pegunungan",
  "ID-PS": "Papua Selatan",
  "ID-PT": "Papua Tengah",
};

type AdministrativeArea = {
  name?: string;
  description?: string;
  adminLevel?: number;
  isoCode?: string;
};

export async function reverseGeocodeLocation(latitude: number, longitude: number) {
  try {
    const response = await axiosInstance.get<{ data: ReverseGeocodedLocation }>(
      "/regions/reverse",
      { params: { latitude, longitude } },
    );
    if (response.data?.data) return response.data.data;
  } catch {
    // The no-key BigDataCloud endpoint is intentionally client-side only. It is
    // a fallback for current device coordinates when server geocoders are down.
  }

  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    localityLanguage: "id",
  });
  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?${params.toString()}`,
  );
  if (!response.ok) throw new Error("Unable to determine your location");
  const result = (await response.json()) as {
    city?: string;
    locality?: string;
    localAdminArea?: string;
    principalSubdivision?: string;
    principalSubdivisionCode?: string;
    countryName?: string;
    countryCode?: string;
    localityInfo?: { administrative?: AdministrativeArea[] };
  };
  const country = result.countryName || "";
  const isIndonesia = result.countryCode?.toUpperCase() === "ID";
  const administrative = result.localityInfo?.administrative ?? [];
  const administrativeCity = administrative.find(
    (area) =>
      area.adminLevel === 5 ||
      /kabupaten|regency|\bkota\b|\bcity\b/i.test(
        `${area.name ?? ""} ${area.description ?? ""}`,
      ),
  )?.name;
  const city = isIndonesia
    ? administrativeCity || result.city || result.localAdminArea || result.locality || ""
    : result.city || result.locality || result.localAdminArea || "";
  const subdivisionCode = result.principalSubdivisionCode?.toUpperCase() ?? "";
  const province = isIndonesia
    ? indonesianProvinceByIsoCode[subdivisionCode] || result.principalSubdivision || ""
    : result.principalSubdivision || result.localAdminArea || city;
  if (!city || !province || !country)
    throw new Error("Unable to determine your location");
  return {
    city,
    province,
    country,
    countryCode: result.countryCode?.toUpperCase() ?? "",
  };
}

export type GeocodedCoordinates = {
  latitude: string;
  longitude: string;
};

export async function geocodeLocation(
  city: string,
  province: string,
  country: string,
) {
  const response = await axiosInstance.get<{ data: GeocodedCoordinates }>(
    "/regions/geocode",
    { params: { city, province, country } },
  );
  if (!response.data?.data) throw new Error("Unable to find this location");
  return response.data.data;
}
