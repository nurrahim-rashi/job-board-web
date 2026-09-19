import axios from "axios";

import { useAuth } from "../stores/useAuth";
import { normalizeDisplayNames } from "./text";
import {
  beginRequestButtonFeedback,
  endRequestButtonFeedback,
} from "./request-button-feedback";

export const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const axiosInstance = axios.create({
  baseURL: apiUrl,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => {
  beginRequestButtonFeedback(config);
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
      return Promise.reject(new Error(message ?? "Something went wrong. Please try again."));
    }

    return Promise.reject(error);
  },
);
