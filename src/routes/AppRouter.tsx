import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import AboutPage from "../pages/AboutPage";
import BrowseCompaniesPage from "../pages/BrowseCompaniesPage";
import BrowseJobsPage from "../pages/BrowseJobsPage";
import DashboardPage from "../pages/DashboardPage";
import EmailActionPage from "../pages/EmailActionPage";
import Homepage from "../pages/Homepage";
import JobDetailPage from "../pages/JobDetailPage";
import LandingPage from "../pages/LandingPage";
import ProfilePage from "../pages/ProfilePage";
import StoriesPage from "../pages/StoriesPage";
import { useAuth } from "../stores/useAuth";

function hasSession(search: string) {
  const preview = new URLSearchParams(search).get("loggedIn");
  return preview === "true" || Boolean(useAuth.getState().token);
}

function HomeRoute() {
  const { search } = useLocation();
  return hasSession(search) ? <Homepage /> : <LandingPage />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { search } = useLocation();
  return hasSession(search) ? children : <Navigate replace to="/" />;
}

function NotFoundPage() {
  return <main className="not-found"><h1>404</h1><h2>That page is not on the map.</h2><Link className="button button-primary" to="/">Back home</Link></main>;
}

export function AppRouter() {
  return <Routes>
    <Route path="/" element={<HomeRoute />} />
    <Route path="/home" element={<HomeRoute />} />
    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    <Route path="/verify-email" element={<EmailActionPage action="verify" />} />
    <Route path="/reset-password" element={<EmailActionPage action="forgot" />} />
    <Route path="/reset-password/confirm" element={<EmailActionPage action="reset" />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/stories" element={<StoriesPage />} />
    <Route path="/companies" element={<BrowseCompaniesPage />} />
    <Route path="/jobs" element={<BrowseJobsPage />} />
    <Route path="/jobs/:slug" element={<JobDetailPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>;
}
