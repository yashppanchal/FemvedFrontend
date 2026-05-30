import type { CountryCode } from "../country/useCountry";
import {
  fetchGuidedTree,
  type GuidedTreeCategory,
  type GuidedTreeResponse,
} from "../api/guided";
import { normalizeSlug } from "../data/guidedPrograms";
import {
  STATIC_NAV_ITEM_LABEL_BY_PATH,
  WELLNESS_LIBRARY_NAV_PATH,
  type NavItem,
  type NavSection,
} from "./menu";

const GUIDED_NAV_TREE_STORAGE_PREFIX = "femved.guidedNavTree.";
const GUIDED_NAV_TREE_CACHE_TTL_MS = 5 * 60 * 1000;

type PersistedGuidedNavTree = {
  timestamp: number;
  sections: NavSection[];
};

type GuidedNavCacheEntry = PersistedGuidedNavTree;

const guidedNavCache = new Map<CountryCode, GuidedNavCacheEntry>();
const guidedNavRequests = new Map<CountryCode, Promise<NavSection[]>>();
const guidedNavRefreshing = new Set<CountryCode>();

function toApiCountryCode(country: CountryCode): string {
  return country === "UK" ? "GB" : country;
}

function getGuidedNavStorageKey(country: CountryCode): string {
  return `${GUIDED_NAV_TREE_STORAGE_PREFIX}${country}`;
}

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
  const path = cta || (slug ? `/guided/${slug}` : "");
  if (!path) return null;

  const label =
    page.categoryType?.trim() ||
    STATIC_NAV_ITEM_LABEL_BY_PATH.get(path) ||
    titleCaseFromSlug(category.categoryName);

  return { type: "internal", label, path };
}

export function isWellnessLibraryDomainName(name: string): boolean {
  return name.trim().toLowerCase() === "wellness library";
}

function navSectionsFromTree(response: GuidedTreeResponse): NavSection[] {
  const sections: NavSection[] = [];

  for (const [index, domain] of (response.domains ?? []).entries()) {
    if (!isEntityActive(domain)) continue;

    const domainId =
      domain.domainId ?? domain.id ?? domain._id ?? `domain-${index}`;
    const label = (domain.domainName ?? domain.name ?? "").trim();
    if (!label) continue;

    if (isWellnessLibraryDomainName(label)) {
      sections.push({
        id: domainId,
        label,
        items: [],
        linkPath: WELLNESS_LIBRARY_NAV_PATH,
      });
      continue;
    }

    const items = (domain.categories ?? [])
      .map((c) => categoryToNavItem(c))
      .filter((item): item is NavItem => item !== null);

    sections.push({ id: domainId, label, items });
  }

  return sections;
}

export function filterGuidedNavSections(sections: NavSection[]): NavSection[] {
  return sections.filter((s) => !isWellnessLibraryDomainName(s.label));
}

function readPersisted(
  country: CountryCode,
  checkTtl: boolean,
): NavSection[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(getGuidedNavStorageKey(country));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedGuidedNavTree;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.timestamp !== "number" ||
      !Array.isArray(parsed.sections)
    ) {
      return null;
    }
    if (parsed.sections.length === 0) return null;
    if (checkTtl && Date.now() - parsed.timestamp > GUIDED_NAV_TREE_CACHE_TTL_MS) {
      return null;
    }
    return parsed.sections;
  } catch {
    return null;
  }
}

function persistGuidedNavTree(country: CountryCode, sections: NavSection[]): void {
  if (typeof window === "undefined") return;
  try {
    const payload: PersistedGuidedNavTree = {
      timestamp: Date.now(),
      sections,
    };
    window.localStorage.setItem(
      getGuidedNavStorageKey(country),
      JSON.stringify(payload),
    );
  } catch {
    // localStorage write failure should not block rendering
  }
}

async function doFetch(country: CountryCode): Promise<NavSection[]> {
  const active = guidedNavRequests.get(country);
  if (active) return active;

  const request = (async () => {
    const tree = await fetchGuidedTree(toApiCountryCode(country));
    const sections = navSectionsFromTree(tree);
    if (sections.length > 0) {
      const entry: GuidedNavCacheEntry = {
        timestamp: Date.now(),
        sections,
      };
      guidedNavCache.set(country, entry);
      persistGuidedNavTree(country, sections);
    }
    return filterGuidedNavSections(sections);
  })();

  guidedNavRequests.set(country, request);
  try {
    return await request;
  } finally {
    guidedNavRequests.delete(country);
  }
}

function scheduleBackgroundRefresh(country: CountryCode): void {
  if (guidedNavRefreshing.has(country)) return;
  if (guidedNavRequests.has(country)) return;
  guidedNavRefreshing.add(country);
  doFetch(country)
    .catch(() => {})
    .finally(() => guidedNavRefreshing.delete(country));
}

/**
 * Returns cached guided nav sections immediately (ignoring TTL).
 * Used to hydrate the navbar before the network request completes.
 */
export function getGuidedNavSectionsSnapshot(
  country: CountryCode,
): NavSection[] | null {
  const entry = guidedNavCache.get(country);
  if (entry?.sections.length) {
    return filterGuidedNavSections(entry.sections);
  }
  const persisted = readPersisted(country, false);
  return persisted ? filterGuidedNavSections(persisted) : null;
}

/**
 * Loads guided nav sections with stale-while-revalidate semantics.
 */
export async function loadGuidedNavSections(
  country: CountryCode,
): Promise<NavSection[]> {
  const entry = guidedNavCache.get(country);
  if (entry) {
    if (Date.now() - entry.timestamp <= GUIDED_NAV_TREE_CACHE_TTL_MS) {
      return filterGuidedNavSections(entry.sections);
    }
    scheduleBackgroundRefresh(country);
    return filterGuidedNavSections(entry.sections);
  }

  const fresh = readPersisted(country, true);
  if (fresh) {
    guidedNavCache.set(country, { timestamp: Date.now(), sections: fresh });
    return filterGuidedNavSections(fresh);
  }

  const stale = readPersisted(country, false);
  if (stale) {
    guidedNavCache.set(country, { timestamp: 0, sections: stale });
    scheduleBackgroundRefresh(country);
    return filterGuidedNavSections(stale);
  }

  return doFetch(country);
}

export function preloadGuidedNavSections(country: CountryCode): void {
  loadGuidedNavSections(country).catch(() => {});
}

export function clearGuidedNavCache(): void {
  guidedNavCache.clear();
  if (typeof window === "undefined") return;
  for (const country of ["IN", "UK", "US"] as const) {
    window.localStorage.removeItem(getGuidedNavStorageKey(country));
  }
}
