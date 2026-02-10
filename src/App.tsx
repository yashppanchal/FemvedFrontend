import "./App.scss";
import { AuthProvider } from "./auth/useAuth";
import { CountryProvider } from "./country/useCountry";
import { Footer } from "./components/Footer";
import { NavBar } from "./components/NavBar";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

const PAGE_TRANSITION_MS = 180;

function PageTransition({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<"enter" | "exit">("exit");

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => setPhase("enter"));
    return () => window.cancelAnimationFrame(raf);
  }, []);

  const style = {
    ["--pageTransitionMs" as never]: `${PAGE_TRANSITION_MS}ms`,
  } as CSSProperties;

  return (
    <div
      className={`pageTransition ${
        phase === "enter" ? "pageTransition--enter" : "pageTransition--exit"
      }`}
      style={style}
    >
      {children}
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const [isAtTop, setIsAtTop] = useState(true);
  const isHome = location.pathname === "/";

  useEffect(() => {
    let raf = 0;

    const update = () => {
      const atTop = window.scrollY <= 0;
      setIsAtTop(atTop);
    };

    const onScroll = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <CountryProvider>
    <AuthProvider>
    <div className="layout">
      <header
        className={`layout__header ${isAtTop ? "layout__header--atTop" : "layout__header--scrolled"}`}
      >
        <div className="container">
          <NavBar />
        </div>
      </header>

      <main className={`layout__main ${isHome ? "layout__main--home" : ""}`}>
        {isHome ? (
          <PageTransition key={location.key}>
            <Outlet />
          </PageTransition>
        ) : (
          <div className="container">
            <PageTransition key={location.key}>
              <Outlet />
            </PageTransition>
          </div>
        )}
      </main>

      <footer className="layout__footer">
        <div className="container">
          <Footer />
        </div>
      </footer>
    </div>
    </AuthProvider>
    </CountryProvider>
  );
}
