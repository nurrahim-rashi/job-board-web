type LocationPart = string | null | undefined;

export function formatLocation(
  city: LocationPart,
  provinceOrState: LocationPart,
  country: LocationPart = "Indonesia",
) {
  const hasLocality = Boolean(city?.trim() || provinceOrState?.trim());
  const parts = [
    city?.trim(),
    provinceOrState?.trim(),
    country?.trim() || (hasLocality ? "Indonesia" : ""),
  ].filter(Boolean) as string[];

  return parts
    .filter(
      (part, index) =>
        parts.findIndex(
          (candidate) => candidate.toLocaleLowerCase() === part.toLocaleLowerCase(),
        ) === index,
    )
    .join(", ");
}

export function formatJobLocation(job: {
  cityLocation?: LocationPart;
  provinceLocation?: LocationPart;
  countryLocation?: LocationPart;
}) {
  return formatLocation(
    job.cityLocation,
    job.provinceLocation,
    job.countryLocation,
  );
}

export function formatCompanyLocation(company: {
  city?: LocationPart;
  province?: LocationPart;
  country?: LocationPart;
}) {
  return formatLocation(company.city, company.province, company.country);
}
