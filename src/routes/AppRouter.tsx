import { useSyncExternalStore } from "react";
import AboutPage from "../pages/AboutPage";
import Homepage from "../pages/Homepage";
import JobDetailPage from "../pages/JobDetailPage";
import LandingPage from "../pages/LandingPage";

function hasSession() {
  const preview = new URLSearchParams(window.location.search).get("loggedIn");
  return (
    preview === "true" ||
    ["accessToken", "authToken", "token"].some((key) =>
      Boolean(localStorage.getItem(key)),
    )
  );
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  return () => window.removeEventListener("popstate", onStoreChange);
}

function getPathname() {
  return window.location.pathname;
}

function NotFoundPage() {
  return (
    <main className="not-found">
      <p className="eyebrow">404</p>
      <h1>That page is not on the map.</h1>
      <a className="button button-primary" href="/">
        Back home
      </a>
    </main>
  );
}

export function AppRouter() {
  const pathname = useSyncExternalStore(subscribe, getPathname, () => "/");
  if (pathname === "/" || pathname === "/home")
    return hasSession() ? <Homepage /> : <LandingPage />;
  if (pathname === "/about") return <AboutPage />;
  if (/^\/jobs\/[^/]+$/.test(pathname)) return <JobDetailPage />;
  return <NotFoundPage />;
}
