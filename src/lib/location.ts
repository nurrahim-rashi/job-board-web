type LocationPart = string | null | undefined;

/**
 * City and country only. Indonesian city names are long enough that adding the
 * province pushed these lines onto three rows in cards and lists. The province
 * is still used when there is no city to show.
 */
export function formatLocation(
  city: LocationPart,
  provinceOrState: LocationPart,
  country: LocationPart = "Indonesia",
) {
  const locality = city?.trim() || provinceOrState?.trim();
  const parts = [
    locality,
    country?.trim() || (locality ? "Indonesia" : ""),
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
