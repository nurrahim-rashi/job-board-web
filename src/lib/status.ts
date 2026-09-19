export const statusCodes = [
  "DRAFT",
  "PENDING",
  "TEST_ASSIGNED",
  "PROCESS",
  "INTERVIEW",
  "ACCEPTED",
  "REJECTED",
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type PlatformStatus = (typeof statusCodes)[number];

export const statusPalette: Record<
  PlatformStatus,
  { label: string; color: string; background: string; border: string }
> = {
  DRAFT: {
    label: "Draft",
    color: "#475569",
    background: "#f1f5f9",
    border: "#cbd5e1",
  },
  PENDING: {
    label: "Pending",
    color: "#9a6700",
    background: "#fff4cc",
    border: "#e9cb68",
  },
  TEST_ASSIGNED: {
    label: "Test Assigned",
    color: "#6d28d9",
    background: "#f1eafe",
    border: "#cbb8f6",
  },
  PROCESS: {
    label: "Process",
    color: "#1d4ed8",
    background: "#e8f0ff",
    border: "#afc6f7",
  },
  INTERVIEW: {
    label: "Interview",
    color: "#0e7490",
    background: "#e3f7fb",
    border: "#9bdce8",
  },
  ACCEPTED: {
    label: "Accepted",
    color: "#15803d",
    background: "#e6f6eb",
    border: "#a9ddb8",
  },
  REJECTED: {
    label: "Rejected",
    color: "#b42318",
    background: "#fdecea",
    border: "#f0b6b0",
  },
  SCHEDULED: {
    label: "Scheduled",
    color: "#4338ca",
    background: "#ecebff",
    border: "#bbb7f4",
  },
  COMPLETED: {
    label: "Completed",
    color: "#047857",
    background: "#e5f7f1",
    border: "#a3dbc8",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "#be123c",
    background: "#fde9ef",
    border: "#f4b5c7",
  },
};

export function isPlatformStatus(status: string): status is PlatformStatus {
  return status in statusPalette;
}

export function platformStatusLabel(status: string) {
  return isPlatformStatus(status)
    ? statusPalette[status].label
    : status
        .replaceAll("_", " ")
        .toLocaleLowerCase("en-US")
        .replace(/\b\w/g, (letter) => letter.toLocaleUpperCase("en-US"));
}

export function statusColor(status: string) {
  return isPlatformStatus(status) ? statusPalette[status].color : "#64748b";
}
