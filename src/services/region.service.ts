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
