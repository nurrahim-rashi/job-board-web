import { useState } from "react";

import { ChartTooltip } from "./ChartTooltip";
import { buildScale, chartInk, rampColor, useChartWidth } from "./chartUtils";

const MAX_BAR_WIDTH = 44;

const columnPath = (x: number, y: number, width: number, height: number) => {
  const radius = Math.min(4, height, width / 2);

  return [
    `M${x} ${y + height}`,
    `L${x} ${y + radius}`,
    `Q${x} ${y} ${x + radius} ${y}`,
    `L${x + width - radius} ${y}`,
    `Q${x + width} ${y} ${x + width} ${y + radius}`,
    `L${x + width} ${y + height}`,
    "Z",
  ].join(" ");
};

type ColumnChartProps = {
  data: Array<{ label: string; value: number; note?: string }>;
  name: string;
  height?: number;
  format?: (value: number) => string;
};

export function ColumnChart({ data, name, height = 220, format = String }: ColumnChartProps) {
  const { ref, width } = useChartWidth();
  const [active, setActive] = useState<number | null>(null);

  const padding = { top: 26, right: 12, bottom: 30, left: 46 };
  const plotWidth = Math.max(width - padding.left - padding.right, 60);
  const plotHeight = height - padding.top - padding.bottom;
  const baseline = padding.top + plotHeight;
  const scale = buildScale(Math.max(...data.map((entry) => entry.value), 0));

  const band = plotWidth / Math.max(data.length, 1);
  const barWidth = Math.min(band - 12, MAX_BAR_WIDTH);
  const y = (value: number) => baseline - (value / scale.max) * plotHeight;

  return (
    <div className="chart-plot" ref={ref}>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img" aria-label={name}>
        {scale.ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={padding.left}
              x2={padding.left + plotWidth}
              y1={y(tick)}
              y2={y(tick)}
              stroke={tick === 0 ? chartInk.axis : chartInk.grid}
            />
            <text x={padding.left - 10} y={y(tick) + 4} textAnchor="end" className="chart-axis">
              {format(tick)}
            </text>
          </g>
        ))}

        {data.map((entry, index) => {
          const barX = padding.left + band * index + (band - barWidth) / 2;
          const barY = y(entry.value);
          const barHeight = Math.max(baseline - barY, entry.value > 0 ? 2 : 0);

          return (
            <g
              key={entry.label}
              className={active === index ? "chart-column is-active" : "chart-column"}
              onPointerEnter={() => setActive(index)}
              onPointerLeave={() => setActive(null)}
            >
              <rect
                x={padding.left + band * index}
                y={padding.top}
                width={band}
                height={plotHeight}
                fill="transparent"
              />
              {barHeight > 0 ? (
                <path d={columnPath(barX, barY, barWidth, barHeight)} fill={rampColor(index, data.length)} />
              ) : null}
              <text x={barX + barWidth / 2} y={barY - 9} textAnchor="middle" className="chart-value">
                {format(entry.value)}
              </text>
              <text x={barX + barWidth / 2} y={height - 9} textAnchor="middle" className="chart-axis">
                {entry.label}
              </text>
            </g>
          );
        })}
      </svg>

      <ChartTooltip
        width={width}
        state={
          active === null
            ? null
            : {
                x: padding.left + band * active + band / 2,
                y: Math.max(y(data[active].value) - 16, 4),
                title: data[active].label,
                rows: [
                  {
                    name: data[active].note ?? name,
                    value: format(data[active].value),
                    color: rampColor(active, data.length),
                  },
                ],
              }
        }
      />
    </div>
  );
}
