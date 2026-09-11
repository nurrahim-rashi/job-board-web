import { useState } from "react";

import { chartInk, seriesColors } from "./chartUtils";

const SIZE = 190;
const RADIUS = 74;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type DonutChartProps = {
  data: Array<{ label: string; value: number; share: number }>;
  centerValue: string;
  centerLabel: string;
};

export function DonutChart({ data, centerValue, centerLabel }: DonutChartProps) {
  const [active, setActive] = useState<number | null>(null);
  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  let offset = 0;

  return (
    <div className="donut-chart">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} role="img" aria-label={centerLabel}>
        <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke={chartInk.grid} strokeWidth="20" />
          {data.map((entry, index) => {
            const length = total > 0 ? (entry.value / total) * CIRCUMFERENCE : 0;
            const drawn = Math.max(length - 2, 0);
            const dash = `${drawn} ${CIRCUMFERENCE - drawn}`;
            const segment = (
              <circle
                key={entry.label}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={seriesColors[index % seriesColors.length]}
                strokeWidth={active === index ? 24 : 20}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                onPointerEnter={() => setActive(index)}
                onPointerLeave={() => setActive(null)}
              />
            );

            offset += length;
            return drawn > 0 ? segment : null;
          })}
        </g>
        <text x={SIZE / 2} y={SIZE / 2 - 2} textAnchor="middle" className="donut-value">
          {centerValue}
        </text>
        <text x={SIZE / 2} y={SIZE / 2 + 18} textAnchor="middle" className="chart-axis">
          {centerLabel}
        </text>
      </svg>

      <ul className="donut-legend">
        {data.map((entry, index) => (
          <li key={entry.label} className={active === index ? "is-active" : ""}>
            <i style={{ background: seriesColors[index % seriesColors.length] }} />
            <span>{entry.label}</span>
            <b>{entry.share}%</b>
            <small>{entry.value.toLocaleString("en-GB")}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
