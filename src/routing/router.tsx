import type { ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { INTERNAL_NAV_ROUTES } from "../nav/menu";
import About from "../pages/About";
import Contact from "../pages/Contact";
import GuidedProgramDetail from "../pages/GuidedProgramDetail";
import ProgramDetailPage from "../pages/ProgramDetailPage";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import ExpertClients from "../pages/ExpertClients";
import AdminDashboard from "../pages/AdminDashboard";
import ExpertDashboard from "../pages/ExpertDashboard";
import FoundersStory from "../pages/FoundersStory";
import KnowYourExperts from "../pages/KnowYourExperts";
import NotFound from "../pages/NotFound";
import OrderHistory from "../pages/OrderHistory";
import PaymentSuccess from "../pages/PaymentSuccess";
import Placeholder from "../pages/Placeholder";
import Podcast from "../pages/Podcast";
import Terms from "../pages/Terms";
import AdminRoute from "./AdminRoute";
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
      { path: "/about", element: <About /> },
      { path: "/contact", element: <Contact /> },
      { path: "/faqs", element: placeholderForRouteTitle("FAQs") },
      { path: "/terms", element: <Terms /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/dashboard", element: <Dashboard /> },
      {
        element: <AdminRoute />,
        children: [
          { path: "/admin-dashboard", element: <AdminDashboard /> },
        ],
      },
      {
        element: <ExpertRoute />,
        children: [
          { path: "/expert-dashboard", element: <ExpertDashboard /> },
          { path: "/expert-dashboard/clients", element: <ExpertClients /> },
        ],
      },
      { path: "/orders", element: <OrderHistory /> },
      { path: "/payment/success", element: <PaymentSuccess /> },
      { path: "/learn/founders-story", element: <FoundersStory /> },
      { path: "/learn/know-your-experts", element: <KnowYourExperts /> },
      { path: "/learn/podcast", element: <Podcast /> },
      { path: "/guided/:programSlug", element: <GuidedProgramDetail /> },
      { path: "/guided/:programSlug/:programId", element: <ProgramDetailPage /> },
      ...INTERNAL_NAV_ROUTES.filter(
        (r) =>
          !r.path.startsWith("/guided/") &&
          r.path !== "/about" &&
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
