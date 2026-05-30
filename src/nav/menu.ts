export type NavItem =
  | {
      type: "internal";
      label: string;
      path: string;
    }
  | {
      type: "external";
      label: string;
      href: string;
    };

export type NavSection = {
  id: string;
  label: string;
  items: NavItem[];
  /** When set, the section is a single link (no dropdown). */
  linkPath?: string;
  /** Label only with a “Coming soon” badge; no link or dropdown. */
  comingSoon?: boolean;
  /** Reserved slot while guided-tree data is loading. */
  loading?: boolean;
};

/** Placeholder shown while guided-tree nav data is loading (first visit / no cache). */
export const GUIDED_NAV_LOADING_SECTION: NavSection = {
  id: "__guided-nav-loading__",
  label: "Guided 1:1 Care",
  items: [],
  loading: true,
};

/** Target route for the Wellness Library top-level nav (single click, no dropdown). */
export const WELLNESS_LIBRARY_NAV_PATH = "/wellness-library";

/** Target route for Workplaces top-level nav (single click, no dropdown). */
export const WORKPLACES_NAV_PATH = "/workplaces";

/** Legacy library category URLs still registered as placeholder routes. */
const LIBRARY_CATEGORY_PLACEHOLDER_ROUTES: Array<{ path: string; title: string }> = [
  { path: "/library/address-health-concerns", title: "Address Health Concerns" },
  { path: "/library/calm-your-mind", title: "Calm Your Mind" },
  {
    path: "/library/strength-recovery-movement",
    title: "Strength, Recovery, Movement",
  },
  { path: "/library/age-better-live-stronger", title: "Age Better, Live Stronger" },
];

/** Labels for guided category paths when `categoryType` is missing from the tree. */
const GUIDED_CATEGORY_LABEL_BY_PATH: ReadonlyArray<[string, string]> = [
  ["/guided/hormonal-health-support", "Hormonal Health Support"],
  ["/guided/mental-spiritual-wellbeing", "Mental and Spiritual Wellbeing"],
  ["/guided/longevity-healthy-ageing", "Longevity and Healthy Ageing Guidance"],
  ["/guided/fitness-personal-care", "Fitness and Personal Care Support"],
];

export const NAV_SECTIONS: NavSection[] = [
  {
    id: "library",
    label: "Wellness Library",
    linkPath: WELLNESS_LIBRARY_NAV_PATH,
    items: [],
  },
  {
    id: "treatments",
    label: "Holistic Treatments",
    items: [
      {
        type: "internal",
        label: "Retreats",
        path: "/holistic-treatments/retreats",
      },
      {
        type: "internal",
        label: "Wellness Kits",
        path: "/holistic-treatments/wellness-kits",
      },
    ],
  },
  {
    id: "workplaces",
    label: "Workplaces",
    linkPath: WORKPLACES_NAV_PATH,
    items: [],
  },
  {
    id: "learn",
    label: "Learn",
    items: [
      { type: "internal", label: "Podcast", path: "/learn/podcast" },
      { type: "internal", label: "Articles", path: "/learn/articles" },
      {
        type: "internal",
        label: "Our story",
        path: "/our-story",
      },
      {
        type: "internal",
        label: "Know Your Experts",
        path: "/learn/know-your-experts",
      },
    ],
  },
];

/** Wellness Library nav section — always shown as a single link (no dropdown). */
export const WELLNESS_LIBRARY_NAV_SECTION: NavSection =
  NAV_SECTIONS.find((s) => s.id === "library")!;

/** Learn is not backed by a guided-tree domain; appended in the nav after API-driven domain sections. */
export const LEARN_NAV_SECTION: NavSection =
  NAV_SECTIONS.find((s) => s.id === "learn")!;

/** Static dropdown (Retreats, Wellness Kits); inserted before Learn when the guided tree drives other sections. */
export const HOLISTIC_TREATMENTS_NAV_SECTION: NavSection =
  NAV_SECTIONS.find((s) => s.id === "treatments")!;

/** Workplaces — single top-level link between Holistic Treatments and Learn. */
export const WORKPLACES_NAV_SECTION: NavSection =
  NAV_SECTIONS.find((s) => s.id === "workplaces")!;

/** Static nav sections shown regardless of guided-tree API availability. */
export const STATIC_NAV_SECTIONS: NavSection[] = [
  WELLNESS_LIBRARY_NAV_SECTION,
  HOLISTIC_TREATMENTS_NAV_SECTION,
  WORKPLACES_NAV_SECTION,
  LEARN_NAV_SECTION,
];

/** Fallback labels for category paths when `categoryType` is missing from the tree. */
export const STATIC_NAV_ITEM_LABEL_BY_PATH: ReadonlyMap<string, string> =
  new Map([
    ...GUIDED_CATEGORY_LABEL_BY_PATH,
    ...NAV_SECTIONS.filter((s) => s.id !== "learn").flatMap((s) => {
      const fromItems = s.items
        .filter(
          (i): i is Extract<NavItem, { type: "internal" }> =>
            i.type === "internal",
        )
        .map((i) => [i.path, i.label] as const);
      const fromWorkplacesLink =
        s.id === "workplaces" && s.linkPath
          ? ([[s.linkPath, s.label]] as const)
          : [];
      return [...fromItems, ...fromWorkplacesLink];
    }),
    ...LIBRARY_CATEGORY_PLACEHOLDER_ROUTES.map(
      (r) => [r.path, r.title] as const,
    ),
  ]);

export const INTERNAL_NAV_ROUTES: Array<{ path: string; title: string }> = [
  ...NAV_SECTIONS.flatMap((s) =>
    s.items
      .filter(
        (i): i is Extract<NavItem, { type: "internal" }> =>
          i.type === "internal",
      )
      .map((i) => ({ path: i.path, title: i.label })),
  ),
  ...LIBRARY_CATEGORY_PLACEHOLDER_ROUTES,
];
