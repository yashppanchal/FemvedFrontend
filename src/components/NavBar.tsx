import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaRegUser } from "react-icons/fa";
import { IoChevronDown, IoMenu, IoClose } from "react-icons/io5";
import { NAV_SECTIONS } from "../nav/menu";
import { hasValidAccessToken, ROLE_EXPERT, useAuth } from "../auth/useAuth";
import logoUrl from "../assets/femvedlogo.png";
import "./NavBar.scss";

export function NavBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, tokens, logout } = useAuth();
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileSections, setOpenMobileSections] = useState<Set<string>>(
    new Set(),
  );
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setOpenSectionId(null);
      setUserMenuOpen(false);
      setMobileMenuOpen(false);
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

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const canViewExpertDashboard =
    user?.role.id === ROLE_EXPERT.id && hasValidAccessToken(tokens);
  const isExpert = user?.role.id === ROLE_EXPERT.id;
  const expertDashboardPath = canViewExpertDashboard
    ? "/expert-dashboard"
    : "/dashboard";
  const expertClientsPath = "/expert-dashboard/clients";

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setOpenMobileSections(new Set());
  };

  const toggleMobileSection = (id: string) => {
    setOpenMobileSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="navBar" ref={rootRef}>
      <button
        type="button"
        className="hamburger"
        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        onClick={() => setMobileMenuOpen((prev) => !prev)}
      >
        {mobileMenuOpen ? <IoClose /> : <IoMenu />}
      </button>

      <Link className="brand" to="/">
        <img className="brand__logo" src={logoUrl} alt="Femved" />
      </Link>

      {/* ---- Desktop menu ---- */}
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
                {isExpert ? (
                  <>
                    <Link
                      className="userMenu__item"
                      to={expertDashboardPath}
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Expert Dashboard
                    </Link>
                    <Link
                      className="userMenu__item"
                      to={expertClientsPath}
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Clients
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      className="userMenu__item"
                      to="/dashboard"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      className="userMenu__item"
                      to="/orders"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Order History
                    </Link>
                  </>
                )}
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

      {/* ---- Mobile drawer (portalled to body to escape backdrop-filter containing block) ---- */}
      {createPortal(
        <>
          <div
            className={`mobileOverlay ${mobileMenuOpen ? "mobileOverlay--open" : ""}`}
            onClick={closeMobileMenu}
            aria-hidden={!mobileMenuOpen}
          />
          <nav
            className={`mobileDrawer ${mobileMenuOpen ? "mobileDrawer--open" : ""}`}
            aria-label="Mobile navigation"
          >
            <div className="mobileDrawer__header">
              <Link className="brand" to="/" onClick={closeMobileMenu}>
                <img className="brand__logo" src={logoUrl} alt="Femved" />
              </Link>
              <button
                type="button"
                className="mobileDrawer__close"
                aria-label="Close menu"
                onClick={closeMobileMenu}
              >
                <IoClose />
              </button>
            </div>

            <div className="mobileDrawer__body">
              {NAV_SECTIONS.map((section) => {
                const isSectionOpen = openMobileSections.has(section.id);
                return (
                  <div
                    key={section.id}
                    className={`mobileDrawer__section ${isSectionOpen ? "mobileDrawer__section--open" : ""}`}
                  >
                    <button
                      type="button"
                      className="mobileDrawer__sectionToggle"
                      aria-expanded={isSectionOpen}
                      onClick={() => toggleMobileSection(section.id)}
                    >
                      <span>{section.label}</span>
                      <IoChevronDown
                        className="mobileDrawer__chevron"
                        aria-hidden="true"
                      />
                    </button>

                    <div className="mobileDrawer__sectionItems">
                      <div className="mobileDrawer__sectionItemsInner">
                        {section.items.map((item) =>
                          item.type === "external" ? (
                            <a
                              key={item.href}
                              className="mobileDrawer__item"
                              href={item.href}
                              target="_blank"
                              rel="noreferrer"
                              onClick={closeMobileMenu}
                            >
                              {item.label}
                            </a>
                          ) : (
                            <Link
                              key={item.path}
                              className={`mobileDrawer__item ${pathname.startsWith(item.path) ? "mobileDrawer__item--active" : ""}`}
                              to={item.path}
                              onClick={closeMobileMenu}
                            >
                              {item.label}
                            </Link>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="mobileDrawer__divider" />

              {user ? (
                <div className="mobileDrawer__section">
                  <p className="mobileDrawer__sectionLabel">Account</p>
                  {isExpert ? (
                    <>
                      <Link
                        className="mobileDrawer__item"
                        to={expertDashboardPath}
                        onClick={closeMobileMenu}
                      >
                        Expert Dashboard
                      </Link>
                      <Link
                        className="mobileDrawer__item"
                        to={expertClientsPath}
                        onClick={closeMobileMenu}
                      >
                        Clients
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        className="mobileDrawer__item"
                        to="/dashboard"
                        onClick={closeMobileMenu}
                      >
                        Dashboard
                      </Link>
                      <Link
                        className="mobileDrawer__item"
                        to="/orders"
                        onClick={closeMobileMenu}
                      >
                        Order History
                      </Link>
                    </>
                  )}
                  <button
                    type="button"
                    className="mobileDrawer__item mobileDrawer__logout"
                    onClick={() => {
                      closeMobileMenu();
                      logout();
                      navigate("/");
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="mobileDrawer__section">
                  <Link
                    className="mobileDrawer__loginBtn"
                    to="/login"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </>,
        document.body,
      )}
    </div>
  );
}
