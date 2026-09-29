import axios from "axios";

import { useAuth } from "../stores/useAuth";
import { normalizeDisplayNames } from "./text";
import {
  beginRequestButtonFeedback,
  endRequestButtonFeedback,
} from "./request-button-feedback";

export class ApiRequestError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
  }
}

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const defaultApiUrl = import.meta.env.PROD
  ? "https://job-board-backend-sage.vercel.app"
  : "http://localhost:8000";

// Never fall back to the frontend origin in production. An empty Vercel build
// variable previously made POST /auth/register hit the static frontend and
// return 405 instead of reaching the API.
export const apiUrl = (configuredApiUrl || defaultApiUrl).replace(/\/+$/, "");

export const axiosInstance = axios.create({
  baseURL: apiUrl,
});

axiosInstance.interceptors.request.use((config) => {
  beginRequestButtonFeedback(config);
  // Let the browser generate the multipart boundary. A JSON content type here
  // makes Multer receive an empty req.file even when a valid image was chosen.
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    config.headers.delete("Content-Type");
  }
  const token = useAuth.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    endRequestButtonFeedback(response.config);
    response.data = normalizeDisplayNames(response.data);
    return response;
  },
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      endRequestButtonFeedback(error.config);
      const message = (error.response?.data as { message?: string } | undefined)?.message;
      const code = (error.response?.data as { code?: string } | undefined)?.code;
      return Promise.reject(new ApiRequestError(message ?? "Something went wrong. Please try again.", code));
    }

    return Promise.reject(error);
  },
);
