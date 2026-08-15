export function Footer() {
  const columns = [
    { title: "Candidates", links: ["Roles", "Weekly drop", "Salary data"] },
    { title: "Teams", links: ["Post a job", "Sourcing", "Pricing"] },
    { title: "Company", links: ["Stories", "Help Center", "Privacy"] },
  ];

  return (
    <footer id="apply" className="site-footer">
      <div className="footer-content">
        <div className="footer-cta footer-static-cta">
          <h2>Let&rsquo;s find the right one</h2>
          <p>
            Tell us what you&rsquo;re looking for, or what you&rsquo;re hiring
            for. Rough ideas are fine.
          </p>
          <a className="button button-light" href="mailto:hello@polaris.jobs">
            Get in touch
          </a>
        </div>
        <section className="footer-links">
          <article>
            <h3>✦ Polaris</h3>
            <p>Work you&rsquo;re proud of.</p>
          </article>
          {columns.map((column) => (
            <article key={column.title}>
              <b>{column.title}</b>
              {column.links.map((link) => (
                <a href="#top" key={link}>
                  {link}
                </a>
              ))}
            </article>
          ))}
        </section>
        <small>© 2026 ✦ Polaris. Find what's worth for you.</small>
      </div>
    </footer>
  );
}
