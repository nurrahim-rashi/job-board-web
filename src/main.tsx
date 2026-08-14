import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Homepage from "./pages/Homepage";
import LandingPage from "./pages/LandingPage";
import JobDetailPage from "./pages/JobDetailPage";

function hasSession() {
  const preview = new URLSearchParams(window.location.search).get("loggedIn");
  return preview === "true" || ["accessToken", "authToken", "token"].some((key) => Boolean(localStorage.getItem(key)));
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {window.location.pathname.startsWith("/jobs/") ? <JobDetailPage /> : hasSession() ? <Homepage /> : <LandingPage />}
  </StrictMode>,
);
