import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import AboutPage from "../pages/AboutPage";
import AdminApplicantsPage from "../pages/AdminApplicantsPage";
import AdminJobDetailPage from "../pages/AdminJobDetailPage";
import AdminJobFormPage from "../pages/AdminJobFormPage";
import AdminJobsPage from "../pages/AdminJobsPage";
import AdminTestPage from "../pages/AdminTestPage";
import AdminTestsPage from "../pages/AdminTestsPage";
import AssessmentDetailPage from "../pages/AssessmentDetailPage";
import AssessmentDiscoveryPage from "../pages/AssessmentDiscoveryPage";
import AssessmentTakePage from "../pages/AssessmentTakePage";
import BrowseCompaniesPage from "../pages/BrowseCompaniesPage";
import CompanyDetailPage from "../pages/CompanyDetailPage";
import BrowseJobsPage from "../pages/BrowseJobsPage";
import DashboardPage from "../pages/DashboardPage";
import EmailActionPage from "../pages/EmailActionPage";
import Homepage from "../pages/Homepage";
import JobDetailPage from "../pages/JobDetailPage";
import LandingPage from "../pages/LandingPage";
import ProfilePage from "../pages/ProfilePage";
import StoriesPage from "../pages/StoriesPage";
import AssessmentResultsPage from "../pages/AssessmentResultsPage";
import AssessmentResultDetailPage from "../pages/AssessmentResultDetailPage";
import AssessmentManagementPage from "../pages/AssessmentManagementPage";
import AssessmentQuestionsManagementPage from "../pages/AssessmentQuestionsManagementPage";
import { useAuth } from "../stores/useAuth";

function hasSession(search: string) {
  const preview = new URLSearchParams(search).get("loggedIn");
  return preview === "true" || Boolean(useAuth.getState().token);
}

function isCompanyAdmin(search: string) {
  const preview = new URLSearchParams(search).get("role");
  return (
    preview === "admin" || useAuth.getState().user?.role === "COMPANY_ADMIN"
  );
}

function HomeRoute() {
  const loggedIn = useAuth((state) => Boolean(state.token));
  return loggedIn ? <Homepage /> : <LandingPage />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const loggedIn = useAuth((state) => Boolean(state.token));
  return loggedIn ? children : <Navigate replace to="/" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { search } = useLocation();

  if (!hasSession(search)) {
    return <Navigate replace to="/" />;
  }

  return isCompanyAdmin(search) ? (
    children
  ) : (
    <Navigate replace to={{ pathname: "/dashboard", search }} />
  );
}

function DeveloperRoute({ children }: { children: React.ReactNode }) {
  const loggedIn = useAuth((state) => Boolean(state.token));
  const role = useAuth((state) => state.user?.role);

  if (!loggedIn) {
    return <Navigate replace to="/" />;
  }

  return role === "DEVELOPER" ? children : <Navigate replace to="/dashboard" />;
}

function JobSeekerRoute({ children }: { children: React.ReactNode }) {
  const loggedIn = useAuth((state) => Boolean(state.token));
  const role = useAuth((state) => state.user?.role);

  if (!loggedIn) {
    return <Navigate replace to="/" />;
  }

  return role === "JOB_SEEKER" ? (
    children
  ) : (
    <Navigate replace to="/dashboard" />
  );
}

function DashboardRoute() {
  const { search } = useLocation();

  return isCompanyAdmin(search) ? (
    <Navigate replace to={{ pathname: "/admin", search }} />
  ) : (
    <DashboardPage />
  );
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
        path="/dashboard/assessments"
        element={
          <JobSeekerRoute>
            <AssessmentDiscoveryPage />
          </JobSeekerRoute>
        }
      />

      <Route
        path="/dashboard/assessments/results"
        element={
          <JobSeekerRoute>
            <AssessmentResultsPage />
          </JobSeekerRoute>
        }
      />

      <Route
        path="/dashboard/assessments/:assessmentId"
        element={
          <JobSeekerRoute>
            <AssessmentDetailPage />
          </JobSeekerRoute>
        }
      />

      <Route
        path="/dashboard/assessments/:assessmentId/take"
        element={
          <JobSeekerRoute>
            <AssessmentTakePage />
          </JobSeekerRoute>
        }
      />

      <Route
        path="/dashboard/assessments/results/:resultId"
        element={
          <JobSeekerRoute>
            <AssessmentResultDetailPage />
          </JobSeekerRoute>
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
      <Route path="/companies/:companyId" element={<CompanyDetailPage />} />
      <Route path="/jobs" element={<BrowseJobsPage />} />
      <Route path="/jobs/:slug" element={<JobDetailPage />} />

      <Route path="*" element={<NotFoundPage />} />

      <Route
        path="/dashboard/developer/assessments"
        element={
          <DeveloperRoute>
            <AssessmentManagementPage />
          </DeveloperRoute>
        }
      />

      <Route
        path="/dashboard/developer/assessments/:assessmentId"
        element={
          <DeveloperRoute>
            <AssessmentQuestionsManagementPage />
          </DeveloperRoute>
        }
      />
    </Routes>
  );
}
