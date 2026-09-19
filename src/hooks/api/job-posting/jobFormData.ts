import type { UpdateJobPayload } from "../../../types/job-posting";

export const toJobFormData = (payload: UpdateJobPayload) => {
  const form = new FormData();

  if (payload.title !== undefined) form.append("title", payload.title);
  if (payload.description !== undefined) form.append("description", payload.description);
  if (payload.category !== undefined) form.append("category", payload.category);
  if (payload.cityLocation !== undefined) form.append("cityLocation", payload.cityLocation);
  if (payload.provinceLocation !== undefined) form.append("provinceLocation", payload.provinceLocation);
  if (payload.countryLocation !== undefined) form.append("countryLocation", payload.countryLocation);
  if (payload.deadline !== undefined) form.append("deadline", payload.deadline);
  if (payload.salaryMin !== undefined) form.append("salaryMin", String(payload.salaryMin));
  if (payload.salaryMax !== undefined) form.append("salaryMax", String(payload.salaryMax));
  if (payload.tags?.length) form.append("tags", payload.tags.join(","));
  if (payload.banner) form.append("banner", payload.banner);
  if (payload.removeBanner) form.append("removeBanner", "true");

  return form;
};

export const multipart = { headers: { "Content-Type": undefined } };
