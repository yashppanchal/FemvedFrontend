import type { ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import { INTERNAL_NAV_ROUTES } from "../nav/menu";
import AllPrograms from "../pages/AllPrograms";
import Contact from "../pages/Contact";
import CategoryProgramsPage from "../pages/CategoryProgramsPage";
import GuidedProgramDetail from "../pages/GuidedProgramDetail";
import ProgramDetailPage from "../pages/ProgramDetailPage";
import Home from "../pages/Home";
import Login from "../pages/Login";
import MeetTheTeam from "../pages/MeetTheTeam";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Dashboard from "../pages/Dashboard";
import ExpertClients from "../pages/ExpertClients";
import AdminDashboard from "../pages/AdminDashboard";
import ExpertDashboard from "../pages/ExpertDashboard";
import OurStory from "../pages/OurStory";
import KnowYourExperts from "../pages/KnowYourExperts";
import NotFound from "../pages/NotFound";
import OrderHistory from "../pages/OrderHistory";
import PaymentCancel from "../pages/PaymentCancel";
import PaymentProcessing from "../pages/PaymentProcessing";
import PaymentProviderSelection from "../pages/PaymentProviderSelection";
import PaymentSuccess from "../pages/PaymentSuccess";
import Placeholder from "../pages/Placeholder";
import Podcast from "../pages/Podcast";
import WellnessLibraryPage from "../pages/WellnessLibraryPage";
import LibraryDetailPage from "../pages/LibraryDetailPage";
import MyLibraryPage from "../pages/MyLibraryPage";
import AdminLibraryPage from "../pages/AdminLibraryPage";
import CategoryLibraryPage from "../pages/CategoryLibraryPage";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import RefundPolicy from "../pages/RefundPolicy";
import Terms from "../pages/Terms";
import AdminRoute from "./AdminRoute";
import AuthenticatedRoute from "./AuthenticatedRoute";
import ExpertRoute from "./ExpertRoute";

function placeholderForRouteTitle(title: string): ReactNode {
  return <Placeholder title={title} />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "/our-story", element: <OurStory /> },
      { path: "/about", element: <Navigate to="/our-story" replace /> },
      { path: "/meet-the-team", element: <MeetTheTeam /> },
      { path: "/contact", element: <Contact /> },
      { path: "/all-guided-programs", element: <AllPrograms /> },
      { path: "/faqs", element: placeholderForRouteTitle("FAQs") },
      { path: "/terms", element: <Terms /> },
      { path: "/privacy-policy", element: <PrivacyPolicy /> },
      { path: "/refund-policy", element: <RefundPolicy /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password", element: <ResetPassword /> },
      {
        element: <AuthenticatedRoute />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/dashboard/library", element: <MyLibraryPage /> },
          { path: "/orders", element: <OrderHistory /> },
        ],
      },
      {
        element: <AdminRoute />,
        children: [
          { path: "/admin-dashboard", element: <AdminDashboard /> },
          { path: "/admin-dashboard/library", element: <AdminLibraryPage /> },
        ],
      },
      {
        element: <ExpertRoute />,
        children: [
          { path: "/expert-dashboard", element: <ExpertDashboard /> },
          { path: "/expert-dashboard/clients", element: <ExpertClients /> },
        ],
      },
      { path: "/payment/select-provider", element: <PaymentProviderSelection /> },
      { path: "/payment/cancel", element: <PaymentCancel /> },
      { path: "/payment-cancel", element: <PaymentCancel /> },
      { path: "/payment/success", element: <PaymentSuccess /> },
      { path: "/payment/processing", element: <PaymentProcessing /> },
      {
        path: "/learn/founders-story",
        element: <Navigate to="/our-story" replace />,
      },
      { path: "/learn/know-your-experts", element: <KnowYourExperts /> },
      { path: "/learn/podcast", element: <Podcast /> },
      { path: "/wellness-library", element: <WellnessLibraryPage /> },
      { path: "/wellness-library/:categorySlug", element: <CategoryLibraryPage /> },
      { path: "/wellness-library/:categorySlug/:videoSlug", element: <LibraryDetailPage /> },
      { path: "/guided/:categorySlug/programs", element: <CategoryProgramsPage /> },
      { path: "/guided/:programSlug", element: <GuidedProgramDetail /> },
      { path: "/guided/:programSlug/:programId", element: <ProgramDetailPage /> },
      ...INTERNAL_NAV_ROUTES.filter(
        (r) =>
          !r.path.startsWith("/guided/") &&
          r.path !== "/our-story" &&
          r.path !== "/meet-the-team" &&
          r.path !== "/learn/founders-story" &&
          r.path !== "/learn/know-your-experts" &&
          r.path !== "/learn/podcast",
      ).map(
        (r) => ({
          path: r.path,
          element: placeholderForRouteTitle(r.title),
        })
      ),
      { path: "*", element: <NotFound /> },
    ],
  },
]);
