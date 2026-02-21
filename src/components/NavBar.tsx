import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaRegUser } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";
import { NAV_SECTIONS } from "../nav/menu";
import { hasValidAccessToken, useAuth } from "../auth/useAuth";
import logoUrl from "../assets/logo.png";
import "./NavBar.scss";

export function NavBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, tokens, logout } = useAuth();
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Close any open dropdown on navigation.
    const t = window.setTimeout(() => {
      setOpenSectionId(null);
      setUserMenuOpen(false);
    }, 0);
    return () => window.clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current) return;
      const target = e.target as Node | null;
      if (target && !rootRef.current.contains(target)) {
        setOpenSectionId(null);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const canViewExpertDashboard =
    user?.role === "expert" && hasValidAccessToken(tokens);

  return (
    <div className="navBar" ref={rootRef}>
      <Link className="brand" to="/">
        <img className="brand__logo" src={logoUrl} alt="Femved" />
      </Link>

      <div className="menu" aria-label="Primary navigation">
        {NAV_SECTIONS.map((section) => {
          const isOpen = openSectionId === section.id;
          const isActive = section.items.some(
            (i) => i.type === "internal" && pathname.startsWith(i.path),
          );

          return (
            <div
              key={section.id}
              className={`menu__section ${isOpen ? "menu__section--open" : ""}`}
            >
              <button
                type="button"
                className={`menu__button ${isActive ? "menu__button--active" : ""}`}
                aria-haspopup="true"
                aria-expanded={isOpen}
                onClick={() =>
                  setOpenSectionId((prev) =>
                    prev === section.id ? null : section.id,
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Escape") setOpenSectionId(null);
                }}
              >
                <span>{section.label}</span>
                <IoChevronDown className="menu__chevron" aria-hidden="true" />
              </button>

              <div
                className="menu__panel"
                role="group"
                aria-label={section.label}
              >
                <div className="menu__panelInner">
                  {section.items.map((item) => {
                    if (item.type === "external") {
                      return (
                        <a
                          key={item.href}
                          className="menu__item"
                          href={item.href}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {item.label}
                        </a>
                      );
                    }

                    return (
                      <Link
                        key={item.path}
                        className="menu__item"
                        to={item.path}
                        onClick={() => setOpenSectionId(null)}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="navAuth">
        {user ? (
          <div className={`userMenu ${userMenuOpen ? "userMenu--open" : ""}`}>
            <button
              type="button"
              className="userMenu__trigger"
              aria-haspopup="true"
              aria-expanded={userMenuOpen}
              onClick={() => setUserMenuOpen((prev) => !prev)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setUserMenuOpen(false);
              }}
            >
              <FaRegUser />
            </button>

            <div className="userMenu__dropdown" role="menu">
              <div className="userMenu__dropdownInner">
                <Link
                  className="userMenu__item"
                  to={canViewExpertDashboard ? "/expert-dashboard" : "/dashboard"}
                  role="menuitem"
                  onClick={() => setUserMenuOpen(false)}
                >
                  {canViewExpertDashboard ? "Expert Dashboard" : "Dashboard"}
                </Link>
                <Link
                  className="userMenu__item"
                  to="/orders"
                  role="menuitem"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Order History
                </Link>
                <button
                  type="button"
                  className="userMenu__item"
                  role="menuitem"
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                    navigate("/");
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Link className="navAuth__login" to="/login">
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
