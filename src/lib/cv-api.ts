import { axiosInstance } from "./axios";
import type { GenerateCvInput } from "../types/cv";

export const generateCv = async (data: GenerateCvInput): Promise<Blob> => {
  const response = await axiosInstance.post("/cv/generate", data, {
    responseType: "blob",
  });

  return response.data as Blob;
};
