import { apiUrl } from "../../../lib/axios";

export function formatRupiah(value: string | number | null) {
  if (value == null || value === "") return "Not stated";
  return `Rp ${Number(value).toLocaleString("id-ID")}`;
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function educationLabel(value: string | null) {
  if (!value) return "Not stated";
  return value.replace(/_/g, " / ");
}

export function avatarUrl(avatar: string | null) {
  if (!avatar) return null;
  return avatar.startsWith("http") ? avatar : `${apiUrl}${avatar}`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
