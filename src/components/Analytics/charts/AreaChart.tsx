import { useId, useState, type KeyboardEvent, type PointerEvent } from "react";

import { ChartTooltip } from "./ChartTooltip";
import { buildScale, chartInk, useChartWidth } from "./chartUtils";

type AreaChartProps = {
  data: Array<{ label: string; value: number }>;
  name: string;
  color: string;
  height?: number;
  format?: (value: number) => string;
};

export function AreaChart({ data, name, color, height = 196, format = String }: AreaChartProps) {
  const { ref, width } = useChartWidth();
  const [active, setActive] = useState<number | null>(null);
  const gradientId = useId();

  const padding = { top: 18, right: 18, bottom: 28, left: 46 };
  const plotWidth = Math.max(width - padding.left - padding.right, 60);
  const plotHeight = height - padding.top - padding.bottom;
  const baseline = padding.top + plotHeight;
  const scale = buildScale(Math.max(...data.map((point) => point.value), 0));

  const x = (index: number) =>
    data.length > 1
      ? padding.left + (plotWidth * index) / (data.length - 1)
      : padding.left + plotWidth / 2;
  const y = (value: number) => baseline - (value / scale.max) * plotHeight;

  const line = data
    .map((point, index) => `${index === 0 ? "M" : "L"}${x(index)} ${y(point.value)}`)
    .join(" ");
  const area = `${line} L${x(data.length - 1)} ${baseline} L${x(0)} ${baseline} Z`;
  const labelStep = Math.ceil(data.length / 8);

  const moveTo = (index: number) =>
    setActive(Math.min(Math.max(index, 0), data.length - 1));

  function handlePointer(event: PointerEvent<SVGSVGElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - bounds.left - padding.left) / plotWidth;
    moveTo(Math.round(ratio * (data.length - 1)));
  }

  function handleKey(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    moveTo((active ?? 0) + (event.key === "ArrowRight" ? 1 : -1));
  }

  const point = active === null ? null : data[active];

  return (
    <div className="chart-plot" ref={ref}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label={`${name} per month`}
        tabIndex={0}
        onPointerMove={handlePointer}
        onPointerLeave={() => setActive(null)}
        onFocus={() => moveTo(data.length - 1)}
        onBlur={() => setActive(null)}
        onKeyDown={handleKey}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

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

        <path d={area} fill={`url(#${gradientId})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {data.map((entry, index) =>
          index % labelStep === 0 || index === data.length - 1 ? (
            <text key={entry.label + index} x={x(index)} y={height - 8} textAnchor="middle" className="chart-axis">
              {entry.label}
            </text>
          ) : null,
        )}

        {point ? (
          <g>
            <line
              x1={x(active!)}
              x2={x(active!)}
              y1={padding.top}
              y2={baseline}
              stroke={chartInk.axis}
            />
            <circle
              cx={x(active!)}
              cy={y(point.value)}
              r="5"
              fill={color}
              stroke={chartInk.surface}
              strokeWidth="2"
            />
          </g>
        ) : (
          <circle
            cx={x(data.length - 1)}
            cy={y(data[data.length - 1].value)}
            r="4"
            fill={color}
            stroke={chartInk.surface}
            strokeWidth="2"
          />
        )}
      </svg>

      <ChartTooltip
        width={width}
        state={
          point
            ? {
                x: x(active!),
                y: Math.max(y(point.value) - 12, 8),
                title: point.label,
                rows: [{ name, value: format(point.value), color }],
              }
            : null
        }
      />
    </div>
  );
}
