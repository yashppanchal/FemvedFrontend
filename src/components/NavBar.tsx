import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaRegUser } from "react-icons/fa";
import { IoChevronDown, IoMenu, IoClose } from "react-icons/io5";
import {
  HOLISTIC_TREATMENTS_NAV_SECTION,
  LEARN_NAV_SECTION,
  NAV_SECTIONS,
  STATIC_NAV_ITEM_LABEL_BY_PATH,
  WELLNESS_LIBRARY_NAV_PATH,
  type NavItem,
  type NavSection,
} from "../nav/menu";
import { hasValidAccessToken, ROLE_ADMIN, ROLE_EXPERT, useAuth } from "../auth/useAuth";
import { useCountry, type CountryCode } from "../country/useCountry";
import {
  fetchGuidedTree,
  type GuidedTreeCategory,
  type GuidedTreeResponse,
} from "../api/guided";
import { normalizeSlug } from "../data/guidedPrograms";
import logoUrl from "../assets/femvedlogo.png";
import "./NavBar.scss";

function isEntityActive(entity: {
  isActive?: boolean;
  is_active?: boolean;
}): boolean {
  if (typeof entity.isActive === "boolean") return entity.isActive;
  if (typeof entity.is_active === "boolean") return entity.is_active;
  return true;
}

function titleCaseFromSlug(value: string | undefined): string {
  return (value ?? "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function categoryToNavItem(category: GuidedTreeCategory): NavItem | null {
  if (!isEntityActive(category)) return null;
  const page = category.categoryPageData ?? {};
  const cta = page.categoryCtaTo?.trim();
  const slug = normalizeSlug(category.categoryName);
  const path =
    cta || (slug ? `/guided/${slug}` : "");
  if (!path) return null;

  const label =
    page.categoryType?.trim() ||
    STATIC_NAV_ITEM_LABEL_BY_PATH.get(path) ||
    titleCaseFromSlug(category.categoryName);

  return { type: "internal", label, path };
}

function isWellnessLibraryDomainName(name: string): boolean {
  return name.trim().toLowerCase() === "wellness library";
}

function navSectionsFromTree(response: GuidedTreeResponse): NavSection[] {
  return (response.domains ?? [])
    .filter((d) => isEntityActive(d))
    .map((domain, index) => {
      const domainId =
        domain.domainId ?? domain.id ?? domain._id ?? `domain-${index}`;
      const label = (domain.domainName ?? domain.name ?? "").trim();
      if (!label) return null;

      if (isWellnessLibraryDomainName(label)) {
        const section: NavSection = {
          id: domainId,
          label,
          items: [],
          linkPath: WELLNESS_LIBRARY_NAV_PATH,
        };
        return section;
      }

      const items = (domain.categories ?? [])
        .map((c) => categoryToNavItem(c))
        .filter((item): item is NavItem => item !== null);

      return { id: domainId, label, items };
    })
    .filter((s): s is NavSection => s !== null);
}

export function NavBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { country } = useCountry();
  const { user, tokens, logout } = useAuth();
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);
  const [treeNavPayload, setTreeNavPayload] = useState<{
    country: CountryCode;
    sections: NavSection[];
  } | null>(null);
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
    const apiCountryCode = country === "UK" ? "GB" : country;

    fetchGuidedTree(apiCountryCode)
      .then((tree) => {
        if (cancelled) return;
        const built = navSectionsFromTree(tree);
        if (built.length > 0) {
          setTreeNavPayload({ country, sections: built });
        } else {
          setTreeNavPayload(null);
        }
      })
      .catch(() => {
        if (!cancelled) setTreeNavPayload(null);
      });

    return () => {
      cancelled = true;
    };
  }, [country]);

  const isAuthenticated = Boolean(user) && isAccessTokenValid;

  const navSections =
    treeNavPayload &&
    treeNavPayload.country === country &&
    treeNavPayload.sections.length > 0
      ? [
          ...treeNavPayload.sections,
          HOLISTIC_TREATMENTS_NAV_SECTION,
          LEARN_NAV_SECTION,
        ]
      : NAV_SECTIONS;

  const isAdmin = user?.role.id === ROLE_ADMIN.id;
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
        {navSections.map((section) => {
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
              {navSections.map((section) => {
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
