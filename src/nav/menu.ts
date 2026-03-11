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
};

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
    items: [
      {
        type: "internal",
        label: "Address Health Concerns",
        path: "/library/address-health-concerns",
      },
      {
        type: "internal",
        label: "Calm Your Mind",
        path: "/library/calm-your-mind",
      },
      {
        type: "internal",
        label: "Strength, Recovery, Movement",
        path: "/library/strength-recovery-movement",
      },
      {
        type: "internal",
        label: "Age Better, Live Stronger",
        path: "/library/age-better-live-stronger",
      },
    ],
  },
  {
    id: "treatments",
    label: "Holistic Treatments",
    items: [
      { type: "internal", label: "Retreats", path: "/treatments/retreats" },
      {
        type: "internal",
        label: "Wellness Kit",
        path: "/treatments/wellness-kit",
      },
    ],
  },
  {
    id: "learn",
    label: "Learn",
    items: [
      { type: "internal", label: "Podcast", path: "/learn/podcast" },
      { type: "internal", label: "Articles", path: "/learn/articles" },
      {
        // Replace this with your WhatsApp community link when ready (e.g. wa.me/...).
        type: "internal",
        label: "Join Our Community",
        path: "/learn/join-our-community",
      },
      {
        type: "internal",
        label: "About",
        path: "/about",
      },
      {
        type: "internal",
        label: "Founders Story",
        path: "/learn/founders-story",
      },
      // {
      //   type: "internal",
      //   label: "Know Your Experts",
      //   path: "/learn/know-your-experts",
      // },
    ],
  },
];

export const INTERNAL_NAV_ROUTES: Array<{ path: string; title: string }> =
  NAV_SECTIONS.flatMap((s) =>
    s.items
      .filter(
        (i): i is Extract<NavItem, { type: "internal" }> =>
          i.type === "internal",
      )
      .map((i) => ({ path: i.path, title: i.label })),
  );
