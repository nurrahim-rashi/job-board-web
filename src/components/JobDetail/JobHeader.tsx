import { ArrowLeft } from "../site/Icons";

export function JobHeader() {
  return <header className="job-nav"><a href="/" className="dashboard-brand"><span>✦</span>Polaris</a><a href="/" className="back-link"><ArrowLeft /> Back to jobs</a></header>;
}
