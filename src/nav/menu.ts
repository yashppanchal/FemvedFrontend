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

export const NAV_SECTIONS: NavSection[] = [
  {
    id: "guided",
    label: "Guided 1:1 Care",
    items: [
      {
        type: "internal",
        label: "Hormonal Health Support",
        path: "/guided/hormonal-health-support",
      },
      {
        type: "internal",
        label: "Mental and Spiritual Wellbeing",
        path: "/guided/mental-spiritual-wellbeing",
      },
      {
        type: "internal",
        label: "Longevity and Healthy Ageing Guidance",
        path: "/guided/longevity-healthy-ageing",
      },
      {
        type: "internal",
        label: "Fitness and Personal Care Support",
        path: "/guided/fitness-personal-care",
      },
    ],
  },
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
        label: "Events",
        path: "/holistic-treatments/events",
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
      // {
      //   type: "internal",
      //   label: "Know Your Experts",
      //   path: "/learn/know-your-experts",
      // },
    ],
  },
];

/** Wellness Library nav section — always shown as a single link (no dropdown). */
export const WELLNESS_LIBRARY_NAV_SECTION: NavSection =
  NAV_SECTIONS.find((s) => s.id === "library")!;

/** Learn is not backed by a guided-tree domain; appended in the nav after API-driven domain sections. */
export const LEARN_NAV_SECTION: NavSection =
  NAV_SECTIONS.find((s) => s.id === "learn")!;

/** Static dropdown (Retreats, Events); inserted before Learn when the guided tree drives other sections. */
export const HOLISTIC_TREATMENTS_NAV_SECTION: NavSection =
  NAV_SECTIONS.find((s) => s.id === "treatments")!;

/** Workplaces — single top-level link between Holistic Treatments and Learn. */
export const WORKPLACES_NAV_SECTION: NavSection =
  NAV_SECTIONS.find((s) => s.id === "workplaces")!;

/** Fallback labels for category paths when `categoryType` is missing from the tree. */
export const STATIC_NAV_ITEM_LABEL_BY_PATH: ReadonlyMap<string, string> =
  new Map([
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
