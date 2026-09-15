export function DataSkeleton({ count = 3, layout = "rows", className = "" }: { count?: number; layout?: "rows" | "cards" | "profile"; className?: string }) {
  return <div className={`data-skeleton ${layout} ${className}`} aria-label="Loading content" aria-busy="true">
    {Array.from({ length: count }, (_, index) => <div className="data-skeleton-item" key={index}>
      <i className="data-skeleton-avatar" />
      <span><i /><i /><i /></span>
    </div>)}
  </div>;
}
