import type { ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { INTERNAL_NAV_ROUTES } from "../nav/menu";
import About from "../pages/About";
import Contact from "../pages/Contact";
import GuidedProgramDetail from "../pages/GuidedProgramDetail";
import Home from "../pages/Home";
import NotFound from "../pages/NotFound";
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
      { path: "/guided/:programSlug", element: <GuidedProgramDetail /> },
      ...INTERNAL_NAV_ROUTES.filter((r) => !r.path.startsWith("/guided/")).map(
        (r) => ({
          path: r.path,
          element: placeholderForRouteTitle(r.title),
        })
      ),
      { path: "*", element: <NotFound /> },
    ],
  },
]);
