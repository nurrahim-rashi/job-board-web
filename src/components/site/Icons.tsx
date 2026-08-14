import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;
const icon = (path: string) =>
  function Icon(props: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
      >
        <path d={path} />
      </svg>
    );
  };
export const ArrowRight = icon("M5 12h14M13 6l6 6-6 6");
export const Search = icon(
  "m21 21-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
);
export const FileText = icon(
  "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Zm0 0v6h6M8 13h8M8 17h6",
);
export const MessagesSquare = icon(
  "M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z",
);
export const Compass = icon(
  "m16.24 7.76-2.12 4.24-4.24 2.12 2.12-4.24ZM12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z",
);
export const Handshake = icon(
  "m8 11 3 3a2 2 0 0 0 3 0l5-5M3 8l3-3 4 3 3-2 5 4 3-2 3 3-6 7a2 2 0 0 1-3 0l-1 1a2 2 0 0 1-3 0l-1 1a2 2 0 0 1-3 0l-5-5Z",
);
export const Sparkles = icon(
  "m12 3-1.5 5.5L5 10l5.5 1.5L12 17l1.5-5.5L19 10l-5.5-1.5ZM19 16l-.7 2.3L16 19l2.3.7L19 22l.7-2.3L22 19l-2.3-.7Z",
);
export const Play = icon("m8 5 11 7-11 7Z");
export const Bell = icon(
  "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4",
);
export const Bookmark = icon("M6 3a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4Z");
export const Briefcase = icon(
  "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 6h18v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2ZM3 11h18",
);
export const MapPin = icon(
  "M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Zm-8 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
);
export const Building = icon(
  "M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M2 21h20M8 7h4M8 11h4M8 15h4M18 9h2M18 13h2",
);
export const ChevronDown = icon("m6 9 6 6 6-6");
export const ArrowLeft = icon("M19 12H5m6 6-6-6 6-6");
export const Calendar = icon("M7 2v4M17 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z");
export const CheckCircle = icon("M22 11.1V12a10 10 0 1 1-5.9-9.1M22 4 12 14l-3-3");
export const Clipboard = icon("M9 5h6M9 3h6a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h1V5a2 2 0 0 1 2-2Z");
export const Clock = icon("M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z");
export const Share = icon("M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13");
export const Upload = icon("M12 16V3m0 0L7 8m5-5 5 5M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5");
export const Wallet = icon("M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V6M16 14h.01");
export const Close = icon("m18 6-12 12M6 6l12 12");
