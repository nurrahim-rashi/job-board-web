import { useEffect } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import AboutPage from "../pages/AboutPage";
import AdminAnalyticsPage from "../pages/AdminAnalyticsPage";
import AdminApplicantsPage from "../pages/AdminApplicantsPage";
import AdminInterviewsPage from "../pages/AdminInterviewsPage";
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
import CompanyEditProfilePage from "../pages/CompanyEditProfilePage";
import BrowseJobsPage from "../pages/BrowseJobsPage";
import DashboardPage from "../pages/DashboardPage";
import EmailActionPage from "../pages/EmailActionPage";
import Homepage from "../pages/Homepage";
import JobDetailPage from "../pages/JobDetailPage";
import LandingPage from "../pages/LandingPage";
import PreSelectionTestPage from "../pages/PreSelectionTestPage";
import ProfilePage from "../pages/ProfilePage";
import PricingPage from "../pages/PricingPage";
import PublicProfilePage from "../pages/PublicProfilePage";
import StoriesPage from "../pages/StoriesPage";
import AssessmentResultsPage from "../pages/AssessmentResultsPage";
import AssessmentResultDetailPage from "../pages/AssessmentResultDetailPage";
import AssessmentManagementPage from "../pages/AssessmentManagementPage";
import AssessmentQuestionsManagementPage from "../pages/AssessmentQuestionsManagementPage";
import CvGeneratorPage from "../pages/CvGeneratorPage";
import DeveloperAnalyticsPage from "../pages/DeveloperAnalyticsPage";
import DeveloperSubscriptionsPage from "../pages/DeveloperSubscriptionsPage";
import DeveloperHomePage from "../pages/DeveloperHomePage";
import CertificateVerificationPage from "../pages/CertificateVerificationPage";
import { useAuth } from "../stores/useAuth";
import { SignedInFooter } from "../components/SignedInFooter";
import SeekerApplicationsPage from "../pages/SeekerApplicationsPage";
import SavedJobsPage from "../pages/SavedJobsPage";
import { Navbar } from "../components/Navbar";

function hasPreviewSession(search: string) {
  const preview = new URLSearchParams(search).get("loggedIn");
  return preview === "true";
}

function hasAdminPreview(search: string) {
  const preview = new URLSearchParams(search).get("role");
  return preview === "admin";
}

function HomeRoute() {
  const loggedIn = useAuth((state) => Boolean(state.token));
  const role = useAuth((state) => state.user?.role);

  if (role === "COMPANY_ADMIN") {
    return <Navigate replace to="/admin" />;
  }

  return loggedIn ? <Homepage /> : <LandingPage />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const loggedIn = useAuth((state) => Boolean(state.token));
  return loggedIn ? children : <RememberedSignInRedirect />;
}

function RememberedSignInRedirect() {
  const location = useLocation();
  useEffect(() => {
    sessionStorage.setItem("authReturnTo", `${location.pathname}${location.search}${location.hash}`);
  }, [location.hash, location.pathname, location.search]);
  return <Navigate replace to="/?auth=signin" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { search } = useLocation();
  const loggedIn = useAuth((state) => Boolean(state.token));
  const role = useAuth((state) => state.user?.role);

  if (!loggedIn && !hasPreviewSession(search)) {
    return <RememberedSignInRedirect />;
  }

  return role === "COMPANY_ADMIN" || hasAdminPreview(search) ? (
    children
  ) : (
    <Navigate replace to={{ pathname: "/dashboard", search }} />
  );
}

function DeveloperRoute({ children }: { children: React.ReactNode }) {
  const loggedIn = useAuth((state) => Boolean(state.token));
  const role = useAuth((state) => state.user?.role);

  if (!loggedIn) {
    return <RememberedSignInRedirect />;
  }

  return role === "DEVELOPER" ? children : <Navigate replace to="/dashboard" />;
}

function JobSeekerRoute({ children }: { children: React.ReactNode }) {
  const loggedIn = useAuth((state) => Boolean(state.token));
  const role = useAuth((state) => state.user?.role);

  if (!loggedIn) {
    return <RememberedSignInRedirect />;
  }

  return role === "JOB_SEEKER" ? (
    children
  ) : (
    <Navigate replace to="/dashboard" />
  );
}

function DashboardRoute() {
  const { search } = useLocation();
  const role = useAuth((state) => state.user?.role);

  if (role === "COMPANY_ADMIN" || hasAdminPreview(search)) {
    return <Navigate replace to={{ pathname: "/admin", search }} />;
  }

  if (role === "DEVELOPER") {
    return <DeveloperHomePage />;
  }

  return <DashboardPage />;
}

function NotFoundPage() {
  return (
    <div className="seeker-profile-page seeker-profile-not-found-page global-not-found-page">
      <Navbar />
      <main>
        <section className="seeker-profile-not-found">
          <div className="seeker-profile-stars" aria-hidden="true" />
          <div className="seeker-profile-not-found-copy">
            <p className="eyebrow light">Page unavailable</p>
            <h1>That page is not on the map.</h1>
            <p>It may have been moved, removed, or the link is wrong.</p>
            <Link to="/">Back home</Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export function AppRouter() {
  const loggedIn = useAuth((state) => Boolean(state.token));

  useEffect(() => {
    document.body.classList.toggle("polaris-signed-in", loggedIn);
    document.body.classList.toggle("polaris-signed-out", !loggedIn);
    return () => {
      document.body.classList.remove("polaris-signed-in", "polaris-signed-out");
    };
  }, [loggedIn]);

  return (
    <>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/home" element={<HomeRoute />} />

        <Route
          path="/verify-certificate"
          element={<CertificateVerificationPage />}
        />

        <Route
          path="/verify-certificate/:certificateCode"
          element={<CertificateVerificationPage />}
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/company/profile/edit"
          element={
            <AdminRoute>
              <CompanyEditProfilePage />
            </AdminRoute>
          }
        />

        <Route
          path="/profile/cv-generator"
          element={
            <JobSeekerRoute>
              <CvGeneratorPage />
            </JobSeekerRoute>
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
        <Route path="/dashboard/applications" element={<JobSeekerRoute><SeekerApplicationsPage /></JobSeekerRoute>} />
        <Route path="/dashboard/saved-jobs" element={<JobSeekerRoute><SavedJobsPage /></JobSeekerRoute>} />
        <Route path="/dashboard/interviews" element={<JobSeekerRoute><SeekerApplicationsPage view="interviews" /></JobSeekerRoute>} />
        <Route path="/dashboard/tests" element={<JobSeekerRoute><SeekerApplicationsPage view="tests" /></JobSeekerRoute>} />
        <Route path="/dashboard/closed-jobs" element={<JobSeekerRoute><SeekerApplicationsPage view="closed" /></JobSeekerRoute>} />

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
          path="/admin/interviews"
          element={
            <AdminRoute>
              <AdminInterviewsPage />
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
          path="/admin/analytics"
          element={
            <AdminRoute>
              <AdminAnalyticsPage />
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
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/companies" element={<BrowseCompaniesPage />} />
        <Route path="/companies/:companyId" element={<CompanyDetailPage />} />
        <Route path="/profile/view" element={<ProtectedRoute><PublicProfilePage /></ProtectedRoute>} />
        <Route path="/profile/:userId" element={<PublicProfilePage />} />
        <Route path="/jobs" element={<BrowseJobsPage />} />
        <Route path="/jobs/:slug" element={<JobDetailPage />} />

        <Route
          path="/jobs/:slug/pre-selection-test"
          element={
            <JobSeekerRoute>
              <PreSelectionTestPage />
            </JobSeekerRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />

        <Route
          path="/dashboard/developer/analytics"
          element={
            <DeveloperRoute>
              <DeveloperAnalyticsPage />
            </DeveloperRoute>
          }
        />

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

        <Route
          path="/dashboard/developer/subscriptions"
          element={
            <DeveloperRoute>
              <DeveloperSubscriptionsPage />
            </DeveloperRoute>
          }
        />
      </Routes>
      {loggedIn && <SignedInFooter />}
    </>
  );
}
