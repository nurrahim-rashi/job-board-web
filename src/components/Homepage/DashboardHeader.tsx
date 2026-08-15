import { Bell, ChevronDown } from "../site/Icons";

export function DashboardHeader() {
  return <header className="dashboard-nav"><div><a className="dashboard-brand" href="#top"><span>✦</span>Polaris</a><nav><a href="#feed">Jobs</a><a href="#companies">Companies</a><a href="#applications">Applications</a><a href="#saved">Saved</a></nav><aside><button aria-label="Notifications"><Bell /><i /></button><button className="user-menu"><b>RA</b><span>Rashifa</span><ChevronDown /></button></aside></div></header>;
}
