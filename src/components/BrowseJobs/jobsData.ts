export type BrowseJob = {
  slug: string;
  title: string;
  company: string;
  city: string;
  category: string;
  type: string;
  salary: string;
  postedAt: string;
  tags: string[];
  lat: number;
  lng: number;
};

export const jobs: BrowseJob[] = [
  { slug: "senior-product-designer", title: "Senior Product Designer", company: "Fieldnote", city: "Jakarta Selatan", category: "Design", type: "Hybrid", salary: "Rp 22–30 jt/month", postedAt: "2026-08-12", tags: ["Design systems", "Figma"], lat: -6.2615, lng: 106.8106 },
  { slug: "backend-engineer", title: "Backend Engineer", company: "Tidewell", city: "Jakarta Barat", category: "Engineering", type: "Remote", salary: "Rp 18–27 jt/month", postedAt: "2026-08-10", tags: ["Go", "PostgreSQL"], lat: -6.1683, lng: 106.7588 },
  { slug: "product-manager", title: "Product Manager", company: "Kessel", city: "Jakarta Pusat", category: "Product", type: "Hybrid", salary: "Rp 20–29 jt/month", postedAt: "2026-08-08", tags: ["B2B", "0→1"], lat: -6.1865, lng: 106.8341 },
  { slug: "frontend-engineer", title: "Frontend Engineer", company: "Wren", city: "Bandung", category: "Engineering", type: "Remote", salary: "Rp 16–24 jt/month", postedAt: "2026-08-05", tags: ["React", "TypeScript"], lat: -6.9175, lng: 107.6191 },
  { slug: "content-strategist", title: "Content Strategist", company: "Pollen", city: "Jakarta Selatan", category: "Marketing", type: "Hybrid", salary: "Rp 12–18 jt/month", postedAt: "2026-07-29", tags: ["SEO", "Brand"], lat: -6.2445, lng: 106.7991 },
  { slug: "people-operations-lead", title: "People Operations Lead", company: "Halden Labs", city: "Surabaya", category: "People", type: "On-site", salary: "Rp 14–21 jt/month", postedAt: "2026-07-21", tags: ["Hiring", "Culture"], lat: -7.2575, lng: 112.7521 },
];

export const categories = [...new Set(jobs.map((job) => job.category))];
export const locations = [...new Set(jobs.map((job) => job.city))];

export function relativePosted(date: string) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000));
  return days === 0 ? "Posted today" : `Posted ${days} day${days === 1 ? "" : "s"} ago`;
}

export function distanceKm(origin: { lat: number; lng: number }, job: BrowseJob) {
  const radians = (value: number) => (value * Math.PI) / 180;
  const radius = 6371;
  const deltaLat = radians(job.lat - origin.lat);
  const deltaLng = radians(job.lng - origin.lng);
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(radians(origin.lat)) * Math.cos(radians(job.lat)) * Math.sin(deltaLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
