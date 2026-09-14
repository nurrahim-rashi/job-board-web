const preservedAcronym = /^[A-Z0-9&.]{2,4}$/;

export function titleCaseName(value: string) {
  return value
    .trim()
    .split(/(\s+|-)/)
    .map((part) => {
      if (!part.trim() || part === "-") return part;
      if (preservedAcronym.test(part)) return part;
      return part.charAt(0).toLocaleUpperCase("en-US") + part.slice(1).toLocaleLowerCase("en-US");
    })
    .join("");
}

export function normalizeDisplayNames(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeDisplayNames);
  if (!value || typeof value !== "object") return value;
  if (Object.getPrototypeOf(value) !== Object.prototype) return value;

  const record = value as Record<string, unknown>;
  return Object.fromEntries(Object.entries(record).map(([key, entry]) => {
    if (typeof entry === "string" && key === "companyName") {
      return [key, titleCaseName(entry)];
    }
    if (typeof entry === "string" && key === "name" && !/^[A-Z][A-Z_]+$/.test(entry)) {
      return [key, titleCaseName(entry)];
    }
    return [key, normalizeDisplayNames(entry)];
  }));
}
