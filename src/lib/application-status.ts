const labels: Record<string, string> = {
  DRAFT: "Draft",
  PENDING: "Pending",
  TEST_ASSIGNED: "Test Assigned",
  PROCESS: "Process",
  INTERVIEW: "Interview",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};

export function applicationStatusLabel(status: string) {
  return labels[status]
    ?? status.replaceAll("_", " ").toLocaleLowerCase("en-US").replace(/\b\w/g, (letter) => letter.toLocaleUpperCase("en-US"));
}
