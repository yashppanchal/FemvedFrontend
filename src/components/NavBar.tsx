import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FaRegUser } from "react-icons/fa";
import { IoChevronDown, IoMenu, IoClose } from "react-icons/io5";
import {
  DASHBOARD_TABS,
  dashboardTabFromSearchParams,
} from "../nav/dashboardTabs";
import {
  GUIDED_NAV_LOADING_SECTION,
  STATIC_NAV_SECTIONS,
  type NavSection,
} from "../nav/menu";
import {
  getGuidedNavSectionsSnapshot,
  loadGuidedNavSections,
} from "../nav/guidedNavTree";
import { hasValidAccessToken, ROLE_ADMIN, ROLE_EXPERT, useAuth } from "../auth/useAuth";
import { useCountry, type CountryCode } from "../country/useCountry";
import logoUrl from "../assets/femvedlogo.png";
import "./NavBar.scss";

const MOBILE_ACCOUNT_DASHBOARD_ID = "account-user-dashboard";

export function NavBar() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { country } = useCountry();
  const { user, tokens, logout } = useAuth();
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);
  const [treeNavPayload, setTreeNavPayload] = useState<{
    country: CountryCode;
    sections: NavSection[];
  } | null>(() => {
    const sections = getGuidedNavSectionsSnapshot(country);
    return sections?.length ? { country, sections } : null;
  });
  const [guidedNavLoading, setGuidedNavLoading] = useState(
    () => !getGuidedNavSectionsSnapshot(country)?.length,
  );
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAccessTokenValid, setIsAccessTokenValid] = useState(() =>
    hasValidAccessToken(tokens),
  );
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

  useEffect(() => {
    const validNow = hasValidAccessToken(tokens);
    setIsAccessTokenValid(validNow);

    if (!validNow || !tokens?.accessTokenExpiresAt) return;

    const expiryTime = Date.parse(tokens.accessTokenExpiresAt);
    if (Number.isNaN(expiryTime)) return;

    const msUntilExpiry = Math.max(expiryTime - Date.now(), 0);
    const timer = window.setTimeout(() => {
      setIsAccessTokenValid(hasValidAccessToken(tokens));
    }, msUntilExpiry + 50);

    return () => window.clearTimeout(timer);
  }, [tokens]);

  useEffect(() => {
    if (!isAccessTokenValid) {
      setUserMenuOpen(false);
    }
  }, [isAccessTokenValid]);

  useEffect(() => {
    let cancelled = false;
    const snapshot = getGuidedNavSectionsSnapshot(country);

    if (snapshot?.length) {
      setTreeNavPayload({ country, sections: snapshot });
      setGuidedNavLoading(false);
    } else {
      setTreeNavPayload(null);
      setGuidedNavLoading(true);
    }

    loadGuidedNavSections(country)
      .then((sections) => {
        if (cancelled) return;
        if (sections.length > 0) {
          setTreeNavPayload({ country, sections });
        } else {
          setTreeNavPayload(null);
        }
      })
      .catch(() => {
        if (!cancelled) setTreeNavPayload(null);
      })
      .finally(() => {
        if (!cancelled) setGuidedNavLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [country]);

  const isAuthenticated = Boolean(user) && isAccessTokenValid;

  const treeGuidedSections =
    treeNavPayload?.country === country ? treeNavPayload.sections : [];

  const guidedNavSections =
    guidedNavLoading && treeGuidedSections.length === 0
      ? [GUIDED_NAV_LOADING_SECTION]
      : treeGuidedSections;

  const navSections = [...guidedNavSections, ...STATIC_NAV_SECTIONS];

  const isAdmin = user?.role.id === ROLE_ADMIN.id;
  const canViewExpertDashboard =
    user?.role.id === ROLE_EXPERT.id && hasValidAccessToken(tokens);
  const isExpert = user?.role.id === ROLE_EXPERT.id;
  const expertDashboardPath = canViewExpertDashboard
    ? "/expert-dashboard"
    : "/dashboard";
  const expertClientsPath = "/expert-dashboard/clients";
  const dashboardTab = dashboardTabFromSearchParams(searchParams);

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
        {navSections.map((section) => {
          if (section.loading) {
            return (
              <div key={section.id} className="menu__section">
                <span
                  className="menu__button menu__button--loading"
                  aria-busy="true"
                  aria-label={`Loading ${section.label} menu`}
                >
                  {section.label}
                </span>
              </div>
            );
          }

          if (section.linkPath) {
            const isLinkActive =
              pathname === section.linkPath ||
              pathname.startsWith(`${section.linkPath}/`);
            return (
              <div key={section.id} className="menu__section">
                <Link
                  className={`menu__button menu__link ${isLinkActive ? "menu__button--active" : ""}`}
                  to={section.linkPath}
                  onClick={() => setOpenSectionId(null)}
                >
                  {section.label}
                </Link>
              </div>
            );
          }

          if (section.comingSoon) {
            return (
              <div key={section.id} className="menu__section">
                <span
                  className="menu__comingSoon"
                  role="status"
                  aria-label={`${section.label}, coming soon`}
                >
                  <span className="menu__comingSoonLabel" aria-hidden="true">
                    {section.label}
                  </span>
                  <span className="menu__comingSoonBadge" aria-hidden="true">
                    Coming soon
                  </span>
                </span>
              </div>
            );
          }

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
        {isAuthenticated ? (
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
                {isAdmin ? (
                  <Link
                    className="userMenu__item"
                    to="/admin-dashboard"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                ) : isExpert ? (
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
              {navSections.map((section) => {
                if (section.loading) {
                  return (
                    <div key={section.id} className="mobileDrawer__section">
                      <span
                        className="mobileDrawer__sectionLink mobileDrawer__sectionLink--loading"
                        aria-busy="true"
                        aria-label={`Loading ${section.label} menu`}
                      >
                        {section.label}
                      </span>
                    </div>
                  );
                }

                if (section.linkPath) {
                  const isLinkActive =
                    pathname === section.linkPath ||
                    pathname.startsWith(`${section.linkPath}/`);
                  return (
                    <div key={section.id} className="mobileDrawer__section">
                      <Link
                        className={`mobileDrawer__sectionLink ${isLinkActive ? "mobileDrawer__sectionLink--active" : ""}`}
                        to={section.linkPath}
                        onClick={closeMobileMenu}
                      >
                        {section.label}
                      </Link>
                    </div>
                  );
                }

                if (section.comingSoon) {
                  return (
                    <div key={section.id} className="mobileDrawer__section">
                      <div
                        className="mobileDrawer__comingSoon"
                        role="status"
                        aria-label={`${section.label}, coming soon`}
                      >
                        <span
                          className="mobileDrawer__comingSoonLabel"
                          aria-hidden="true"
                        >
                          {section.label}
                        </span>
                        <span
                          className="mobileDrawer__comingSoonBadge"
                          aria-hidden="true"
                        >
                          Coming soon
                        </span>
                      </div>
                    </div>
                  );
                }

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

              {isAuthenticated ? (
                <div className="mobileDrawer__section">
                  <p className="mobileDrawer__sectionLabel">Account</p>
                  {isAdmin ? (
                    <Link
                      className="mobileDrawer__item"
                      to="/admin-dashboard"
                      onClick={closeMobileMenu}
                    >
                      Admin Dashboard
                    </Link>
                  ) : isExpert ? (
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
                      <div
                        className={`mobileDrawer__section ${openMobileSections.has(MOBILE_ACCOUNT_DASHBOARD_ID) ? "mobileDrawer__section--open" : ""}`}
                      >
                        <button
                          type="button"
                          className="mobileDrawer__sectionToggle"
                          aria-expanded={openMobileSections.has(
                            MOBILE_ACCOUNT_DASHBOARD_ID,
                          )}
                          onClick={() =>
                            toggleMobileSection(MOBILE_ACCOUNT_DASHBOARD_ID)
                          }
                        >
                          <span>Dashboard</span>
                          <IoChevronDown
                            className="mobileDrawer__chevron"
                            aria-hidden="true"
                          />
                        </button>
                        <div className="mobileDrawer__sectionItems">
                          <div className="mobileDrawer__sectionItemsInner">
                            {DASHBOARD_TABS.map((tab) => (
                              <Link
                                key={tab.id}
                                className={`mobileDrawer__item ${pathname === "/dashboard" && dashboardTab === tab.id ? "mobileDrawer__item--active" : ""}`}
                                to={`/dashboard?tab=${encodeURIComponent(tab.id)}`}
                                onClick={closeMobileMenu}
                              >
                                {tab.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
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
