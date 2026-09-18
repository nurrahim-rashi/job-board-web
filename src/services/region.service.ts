import { axiosInstance } from "../lib/axios";

export type Region = { code: string; name: string };
type RegionResponse = { data: Region[] };

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
  return response.data.data;
}

export async function getCountries() {
  const response = await axiosInstance.get<RegionResponse>("/regions/countries");
  return response.data.data;
}

export async function getWorldwideStates(country: string) {
  const response = await axiosInstance.get<RegionResponse>("/regions/states", {
    params: { country },
  });
  return response.data.data;
}

export async function getWorldwideCities(country: string, state: string) {
  const response = await axiosInstance.get<RegionResponse>("/regions/cities", {
    params: { country, state },
  });
  return response.data.data;
}

export async function getRegencies(provinceCode: string) {
  const response = await axiosInstance.get<RegionResponse>(`/regions/regencies/${provinceCode}`);
  return response.data.data;
}

export async function searchWorldwideLocations(query: string) {
  const response = await axiosInstance.get<{ data: WorldwideLocation[] }>(
    "/regions/search",
    { params: { q: query } },
  );
  return response.data.data;
}
