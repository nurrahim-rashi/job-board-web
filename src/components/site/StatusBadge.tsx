import type { CSSProperties } from "react";
import {
  isPlatformStatus,
  platformStatusLabel,
  statusPalette,
} from "../../lib/status";

type StatusBadgeStyle = CSSProperties & {
  "--status-color": string;
  "--status-background": string;
  "--status-border": string;
};

export function StatusBadge({
  status,
  className = "",
}: {
  status: string;
  className?: string;
}) {
  const colors = isPlatformStatus(status)
    ? statusPalette[status]
    : {
        color: "#475569",
        background: "#f1f5f9",
        border: "#cbd5e1",
      };
  const style: StatusBadgeStyle = {
    "--status-color": colors.color,
    "--status-background": colors.background,
    "--status-border": colors.border,
  };

  return (
    <em
      className={`status-badge${className ? ` ${className}` : ""}`}
      data-status={status}
      style={style}
    >
      <i aria-hidden="true" />
      {platformStatusLabel(status)}
    </em>
  );
}
