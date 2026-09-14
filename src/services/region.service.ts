import { axiosInstance } from "../lib/axios";

export type Region = { code: string; name: string };
type RegionResponse = { data: Region[] };

export async function getProvinces() {
  const response = await axiosInstance.get<RegionResponse>("/regions/provinces");
  return response.data.data;
}

export async function getRegencies(provinceCode: string) {
  const response = await axiosInstance.get<RegionResponse>(`/regions/regencies/${provinceCode}`);
  return response.data.data;
}
