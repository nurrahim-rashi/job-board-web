export interface TooltipRow {
  name: string;
  value: string;
  color: string;
}

export interface TooltipState {
  x: number;
  y: number;
  title: string;
  rows: TooltipRow[];
}

export function ChartTooltip({ state, width }: { state: TooltipState | null; width: number }) {
  if (!state) return null;

  const clamped = Math.min(Math.max(state.x, 90), Math.max(width - 90, 90));

  return (
    <div className="chart-tooltip" style={{ left: clamped, top: state.y }}>
      <b>{state.title}</b>
      {state.rows.map((row) => (
        <span key={row.name}>
          <i style={{ background: row.color }} />
          <em>{row.value}</em>
          {row.name}
        </span>
      ))}
    </div>
  );
}
