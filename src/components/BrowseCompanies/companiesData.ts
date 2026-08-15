export type Company = {
  slug: string;
  name: string;
  industry: string;
  city: string;
  about: string;
  size: number;
  founded: number;
  verified: boolean;
  openRoles: number;
};
export const companies: Company[] = [
  {
    slug: "fieldnote",
    name: "Fieldnote",
    industry: "Fintech",
    city: "Jakarta Selatan",
    about:
      "A small product team building calmer financial tools for independent businesses.",
    size: 22,
    founded: 2021,
    verified: true,
    openRoles: 2,
  },
  {
    slug: "tidewell",
    name: "Tidewell",
    industry: "Health technology",
    city: "Jakarta Barat",
    about:
      "A remote-first team making preventive care easier to access across Indonesia.",
    size: 36,
    founded: 2020,
    verified: true,
    openRoles: 1,
  },
  {
    slug: "kessel",
    name: "Kessel",
    industry: "B2B SaaS",
    city: "Jakarta Pusat",
    about:
      "Workflow software for teams that prefer thoughtful systems over noisy dashboards.",
    size: 40,
    founded: 2019,
    verified: true,
    openRoles: 2,
  },
  {
    slug: "wren",
    name: "Wren",
    industry: "Consumer technology",
    city: "Bandung",
    about:
      "A ten-person studio creating everyday tools with a high bar for design and craft.",
    size: 10,
    founded: 2022,
    verified: true,
    openRoles: 1,
  },
  {
    slug: "pollen",
    name: "Pollen",
    industry: "Marketing technology",
    city: "Jakarta Selatan",
    about:
      "A brand intelligence platform for teams who want clearer signals from their customers.",
    size: 18,
    founded: 2023,
    verified: false,
    openRoles: 1,
  },
  {
    slug: "halden-labs",
    name: "Halden Labs",
    industry: "Developer tools",
    city: "Surabaya",
    about:
      "A distributed engineering team building infrastructure that stays simple under pressure.",
    size: 12,
    founded: 2021,
    verified: true,
    openRoles: 2,
  },
];
export const companyCities = [
  ...new Set(companies.map((company) => company.city)),
].sort();
