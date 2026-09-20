type BarListProps = {
  items: Array<{
    label: string;
    values: Array<number | null>;
    note?: string;
    color?: string;
  }>;
  series: Array<{ name: string; color: string }>;
  format?: (value: number) => string;
  /** Pass the top of a fixed scale (a 5 point rating) so bars are not scaled to the winner. */
  scaleMax?: number;
};

export function BarList({ items, series, format = String, scaleMax }: BarListProps) {
  const max =
    scaleMax ??
    Math.max(...items.flatMap((item) => item.values.map((value) => value ?? 0)), 1);

  return (
    <ul className="bar-list">
      {items.map((item) => (
        <li key={item.label}>
          <span className="bar-label">
            {item.label}
            {item.note ? <small>{item.note}</small> : null}
          </span>
          <span className="bar-tracks">
            {series.map((entry, index) => {
              const value = item.values[index];

              return (
                <span className="bar-track" key={entry.name} title={`${entry.name}: ${value === null ? "no data" : format(value)}`}>
                  <span className="bar-rail">
                    {value === null ? null : (
                      <i
                        style={{
                          width: `${(value / max) * 100}%`,
                          background: item.color ?? entry.color,
                        }}
                      />
                    )}
                  </span>
                  <em>{value === null ? "N/A" : format(value)}</em>
                </span>
              );
            })}
          </span>
        </li>
      ))}
    </ul>
  );
}
