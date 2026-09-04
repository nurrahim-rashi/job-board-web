import { Link, Navigate, Route, Routes } from "react-router-dom";
import AboutPage from "../pages/AboutPage";
import AdminApplicantsPage from "../pages/AdminApplicantsPage";
import AdminJobDetailPage from "../pages/AdminJobDetailPage";
import AdminJobFormPage from "../pages/AdminJobFormPage";
import AdminJobsPage from "../pages/AdminJobsPage";
import AdminTestPage from "../pages/AdminTestPage";
import AdminTestsPage from "../pages/AdminTestsPage";
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

function HomeRoute() {
  const loggedIn = useAuth((state) => Boolean(state.token));
  return loggedIn ? <Homepage /> : <LandingPage />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const loggedIn = useAuth((state) => Boolean(state.token));
  return loggedIn ? children : <Navigate replace to="/" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const loggedIn = useAuth((state) => Boolean(state.token));
  const isCompanyAdmin = useAuth(
    (state) => state.user?.role === "COMPANY_ADMIN",
  );
  if (!loggedIn) return <Navigate replace to="/" />;
  return isCompanyAdmin ? children : <Navigate replace to="/dashboard" />;
}

function DashboardRoute() {
  const isCompanyAdmin = useAuth(
    (state) => state.user?.role === "COMPANY_ADMIN",
  );
  return isCompanyAdmin ? <Navigate replace to="/admin" /> : <DashboardPage />;
}

function NotFoundPage() {
  return (
    <main className="not-found">
      <h1>404</h1>
      <h2>That page is not on the map.</h2>
      <Link className="button button-primary" to="/">
        Back home
      </Link>
    </main>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/home" element={<HomeRoute />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRoute />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminJobsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/jobs/new"
        element={
          <AdminRoute>
            <AdminJobFormPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/jobs/:slug"
        element={
          <AdminRoute>
            <AdminJobDetailPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/jobs/:slug/edit"
        element={
          <AdminRoute>
            <AdminJobFormPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/jobs/:slug/test"
        element={
          <AdminRoute>
            <AdminTestPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/applicants"
        element={
          <AdminRoute>
            <AdminApplicantsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/tests"
        element={
          <AdminRoute>
            <AdminTestsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/verify-email"
        element={<EmailActionPage action="verify" />}
      />
      <Route
        path="/reset-password"
        element={<EmailActionPage action="forgot" />}
      />
      <Route
        path="/reset-password/confirm"
        element={<EmailActionPage action="reset" />}
      />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/stories" element={<StoriesPage />} />
      <Route path="/companies" element={<BrowseCompaniesPage />} />
      <Route path="/jobs" element={<BrowseJobsPage />} />
      <Route path="/jobs/:slug" element={<JobDetailPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
