import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export function ExpandableContent({
  children,
  maxHeight = 360,
}: {
  children: ReactNode;
  maxHeight?: number;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const measure = () => setOverflowing(content.scrollHeight > maxHeight + 2);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, [children, maxHeight]);

  return (
    <div
      className={`expandable-content ${expanded ? "expanded" : ""} ${overflowing ? "has-overflow" : ""}`}
      style={{ "--expandable-max-height": `${maxHeight}px` } as CSSProperties}
    >
      <div className="expandable-content-inner" ref={contentRef}>
        {children}
      </div>
      {overflowing && (
        <button
          className="expandable-content-toggle"
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
