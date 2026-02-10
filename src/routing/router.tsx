import type { ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { INTERNAL_NAV_ROUTES } from "../nav/menu";
import About from "../pages/About";
import Contact from "../pages/Contact";
import GuidedProgramDetail from "../pages/GuidedProgramDetail";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import FoundersStory from "../pages/FoundersStory";
import NotFound from "../pages/NotFound";
import OrderHistory from "../pages/OrderHistory";
import Placeholder from "../pages/Placeholder";

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
      { path: "/terms", element: placeholderForRouteTitle("Terms") },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/orders", element: <OrderHistory /> },
      { path: "/learn/founders-story", element: <FoundersStory /> },
      { path: "/guided/:programSlug", element: <GuidedProgramDetail /> },
      ...INTERNAL_NAV_ROUTES.filter(
        (r) =>
          !r.path.startsWith("/guided/") &&
          r.path !== "/about" &&
          r.path !== "/learn/founders-story",
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
