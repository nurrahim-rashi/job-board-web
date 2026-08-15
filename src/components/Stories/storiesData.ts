export type Story = {
  name: string;
  role: string;
  org: string;
  city: string;
  quote: string;
  stat: string;
  statLabel: string;
  initials: string;
};
export const applicantStories: Story[] = [
  {
    name: "Ayu Prameswari",
    role: "Product Designer",
    org: "Fieldnote",
    city: "Jakarta Selatan",
    quote:
      "I had been applying for four months with zero replies. On Polaris every listing showed the salary upfront, so I only spent effort where the range actually worked for me. Third application, offer signed.",
    stat: "11 days",
    statLabel: "search to offer",
    initials: "AP",
  },
  {
    name: "Bagas Wirawan",
    role: "Backend Engineer",
    org: "Nusantara Pay",
    city: "Surabaya",
    quote:
      "The skill assessment badge did the talking for me. I skipped two screening rounds because the team already had verified proof I could do the work.",
    stat: "2 rounds",
    statLabel: "skipped with a verified badge",
    initials: "BW",
  },
  {
    name: "Nadia Kusuma",
    role: "UX Researcher",
    org: "Wren",
    city: "Bandung",
    quote:
      "Radius search sounds small until you use it. I filtered to jobs within my own city and suddenly the list was 12 real options instead of 400 impossible commutes.",
    stat: "12 roles",
    statLabel: "within her radius",
    initials: "NK",
  },
  {
    name: "Rizky Ananda",
    role: "Data Analyst",
    org: "Kessel",
    city: "Tangerang Selatan",
    quote:
      "The CV Generator rewrote my scattered experience into something an ATS could actually read. I went from silence to three interviews in one week.",
    stat: "3 interviews",
    statLabel: "in the first week",
    initials: "RA",
  },
  {
    name: "Salma Hafizah",
    role: "Customer Success Lead",
    org: "Tidewell",
    city: "Jakarta Selatan",
    quote:
      "Being able to see every application status in one tracker meant I stopped guessing. No more refreshing an inbox hoping for news.",
    stat: "100%",
    statLabel: "applications answered",
    initials: "SH",
  },
];
export const companyStories: Story[] = [
  {
    name: "Dimas Prayoga",
    role: "Head of Product",
    org: "Fieldnote",
    city: "Jakarta Selatan",
    quote:
      "We used to read 300 CVs for one design seat. The pre-selection test filtered honestly, so the five people we met were all people we would have hired.",
    stat: "5 of 5",
    statLabel: "shortlist worth meeting",
    initials: "DP",
  },
  {
    name: "Clarissa Tanudjaja",
    role: "People Lead",
    org: "Halden Labs",
    city: "Jakarta Pusat",
    quote:
      "Publishing the salary range felt risky. It was the opposite: better candidates, fewer wasted calls, and no awkward surprise at the offer stage.",
    stat: "-42%",
    statLabel: "time spent screening",
    initials: "CT",
  },
  {
    name: "Yoga Mahendra",
    role: "Engineering Manager",
    org: "Kessel",
    city: "Tangerang Selatan",
    quote:
      "The dashboard told us which step candidates dropped off at. We fixed one confusing task and our completion rate doubled.",
    stat: "2x",
    statLabel: "test completion rate",
    initials: "YM",
  },
  {
    name: "Ratih Anggraini",
    role: "Founder",
    org: "Wren",
    city: "Bandung",
    quote:
      "We are ten people with no recruiter. Polaris gave us the structure a hiring team would have — and a researcher who has been with us a year now.",
    stat: "12 days",
    statLabel: "post to signed",
    initials: "RA",
  },
  {
    name: "Fajar Nugroho",
    role: "VP People",
    org: "Nusantara Pay",
    city: "Surabaya",
    quote:
      "Verified badges and reviews cut both ways, and that is the point. Candidates trust us more because they can read what our own people said.",
    stat: "4.6 / 5",
    statLabel: "employee review score",
    initials: "FN",
  },
];
export const milestones = [
  ["1,240", "matches made on Polaris"],
  ["9 days", "median search to offer"],
  ["92%", "listings with a salary range"],
  ["4.7 / 5", "average story rating"],
];
