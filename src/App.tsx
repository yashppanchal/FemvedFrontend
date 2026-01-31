import "./App.scss";
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

  return (
    <div className="layout">
      <header className="layout__header">
        <div className="container">
          <NavBar />
        </div>
      </header>

      <main className="layout__main">
        <div className="container">
          <PageTransition key={location.key}>
            <Outlet />
          </PageTransition>
        </div>
      </main>

      <footer className="layout__footer">
        <div className="container">
          <Footer />
        </div>
      </footer>
    </div>
  );
}
