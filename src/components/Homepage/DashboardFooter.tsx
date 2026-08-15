import { Stars } from "../site/Stars";

const columns = [
  { head: "For you", items: ["All jobs", "Saved roles", "Applications"] },
  { head: "Companies", items: ["All companies", "Post a job", "Pricing"] },
  { head: "Account", items: ["Profile", "Notifications", "Sign out"] },
];

const user = { name: "Rashifa", role: "Product Designer" };

export function DashboardFooter() {
  return (
    <footer className="dashboard-footer">
      <Stars />
      <div className="dashboard-footer-content">
        <div className="dashboard-footer-links">
          <div>
            <p className="dashboard-footer-brand">Polaris</p>
            <p>Work you&rsquo;re proud of.</p>
          </div>
          {columns.map((column) => (
            <div key={column.head}>
              <b>{column.head}</b>
              <ul>
                {column.items.map((item) => (
                  <li key={item}>
                    <a href="#top">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <small>
          © 2024–{new Date().getFullYear()} Polaris Jobs. Signed in as {user.name} · {user.role}
        </small>
      </div>
    </footer>
  );
}
