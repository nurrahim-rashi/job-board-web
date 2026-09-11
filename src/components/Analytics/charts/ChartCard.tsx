import type { ReactNode } from "react";

type ChartCardProps = {
  title: string;
  note?: string;
  legend?: ReactNode;
  footer?: ReactNode;
  span?: "half" | "full";
  children: ReactNode;
};

export function ChartCard({ title, note, legend, footer, span = "half", children }: ChartCardProps) {
  return (
    <article className={`chart-card ${span}`}>
      <header>
        <div>
          <h3>{title}</h3>
          {note ? <p>{note}</p> : null}
        </div>
        {legend}
      </header>
      {children}
      {footer ? <footer>{footer}</footer> : null}
    </article>
  );
}

export function ChartLegend({ items }: { items: Array<{ name: string; color: string; shape?: "line" | "rect" }> }) {
  return (
    <ul className="chart-legend">
      {items.map((item) => (
        <li key={item.name}>
          <i className={item.shape === "line" ? "line" : ""} style={{ background: item.color }} />
          {item.name}
        </li>
      ))}
    </ul>
  );
}

export function ChartEmpty({ label = "Nothing recorded in this range yet." }: { label?: string }) {
  return <p className="chart-empty">{label}</p>;
}
