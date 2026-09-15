import { Navbar } from "../Navbar";
import { DataSkeleton } from "./DataSkeleton";
import { AdminShell } from "../Admin/AdminShell";

export function PageLoading({ label = "Loading page", variant = "public" }: { label?: string; variant?: "public" | "admin" }) {
  if (variant === "admin") return <AdminShell eyebrow="Loading" title="Loading" showHeader={false}><div className="admin-profile-loading" aria-busy="true" aria-label={label}><div className="admin-loading-title"><i /><i /></div><DataSkeleton count={5} /></div></AdminShell>;
  return <div className="generic-page-loading" aria-busy="true" aria-label={label}>
    <Navbar />
    <main>
      <div className="generic-loading-hero"><i /><i /><i /></div>
      <DataSkeleton count={6} layout="cards" />
    </main>
  </div>;
}
