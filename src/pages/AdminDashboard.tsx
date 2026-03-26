import { type FormEvent, useEffect, useState } from "react";
import { ApiError } from "../api/client";
import { getProgramDurations, updateDuration, updateDurationPrice, addDurationPrice, addProgramDuration, getAdminPrograms, getAdminExperts, type AdminExpert } from "../api/admin";
import {
  createGuidedProgram,
  createGuidedCategory,
  createGuidedDomain,
  deleteGuidedCategory,
  deleteGuidedDomain,
  deleteGuidedProgram,
  fetchGuidedTree,
  submitProgramForReview,
  publishProgram,
  rejectProgram,
  archiveProgram,
  type GuidedTreeDomain,
  updateGuidedCategory,
  updateGuidedDomain,
  updateGuidedProgram,
} from "../api/guided";
import { useAuth } from "../auth/useAuth";
import { bumpGuidedProgramsCacheVersion } from "../data/guidedPrograms";
import { AdminTabs } from "./admin/AdminTabs";
import { CategoriesTab } from "./admin/CategoriesTab";
import { DomainsTab } from "./admin/DomainsTab";
import { ProgramsTab } from "./admin/ProgramsTab";
import {
  type AdminTab,
  type CategoryForm,
  type CategoryRow,
  type DurationEntry,
  type DomainForm,
  type DomainRow,
  type ProgramForm,
  type ProgramRow,
} from "./admin/types";
import SummaryTab from "./admin/SummaryTab";
import AdminUsersTab from "./admin/AdminUsersTab";
import ExpertsTab from "./admin/ExpertsTab";
import CouponsTab from "./admin/CouponsTab";
import AdminOrdersTab from "./admin/AdminOrdersTab";
import AdminEnrollmentsTab from "./admin/AdminEnrollmentsTab";
import AnalyticsTab from "./admin/AnalyticsTab";
import GdprTab from "./admin/GdprTab";
import ExpertPayoutsTab from "./admin/ExpertPayoutsTab";
import TestimonialsTab from "./admin/TestimonialsTab";
import "./AdminDashboard.scss";

type GuidedHierarchyRows = {
  domainRows: DomainRow[];
  categoryRows: CategoryRow[];
  programRows: ProgramRow[];
  categoryFormById: Record<string, CategoryForm>;
  programDurationsById: Record<string, DurationEntry[]>;
  programFormById: Record<string, Partial<ProgramForm>>;
};

const PENDING_DOMAINS_STORAGE_KEY = "femved_admin_pending_domains";
const ADMIN_ALERT_TIMEOUT_MS = 10_000;


const initialDomainForm: DomainForm = {
  name: "",
};

const initialCategoryForm: CategoryForm = {
  domainId: "",
  name: "",
  heroTitle: "",
  heroSubtext: "",
  ctaLabel: "",
  ctaLink: "",
  pageHeader: "",
  imageUrl: "",
  whatsIncluded: "",
  keyAreas: "",
};

const initialDurationEntry = { label: "4 weeks", weeks: "4", priceIN: "", priceUK: "", priceUS: "" };

const initialProgramForm: ProgramForm = {
  name: "",
  domainId: "",
  categoryId: "",
  expertId: "",
  gridDescription: "",
  gridImageUrl: "",
  overview: "",
  sortOrder: "0",
  durations: [{ ...initialDurationEntry }],
  whatYouGet: "",
  whoIsThisFor: "",
  tags: "",
  detailHeading: "",
  detailDescription: "",
};

const createNextId = (prefix: string, existingIds: string[]) => {
  const maxNumericPart = existingIds.reduce((maxValue, currentId) => {
    const value = Number(currentId.replace(prefix, ""));
    if (Number.isNaN(value)) return maxValue;
    return Math.max(maxValue, value);
  }, 0);

  return `${prefix}${String(maxNumericPart + 1).padStart(3, "0")}`;
};

const toHyphenatedSlug = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const parseTextareaItems = (value: string): string[] =>
  value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const joinTextareaItems = (items: string[] | undefined): string =>
  (items ?? []).map((item) => item.trim()).filter(Boolean).join("\n");

const parseNonNegativeNumber = (value: string): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
};

const getObjectValue = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;

const getStringField = (
  obj: Record<string, unknown>,
  key: string,
): string | null => {
  const value = obj[key];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const extractCreatedDomainId = (response: unknown): string | null => {
  if (typeof response === "string") {
    const trimmed = response.trim();
    return trimmed || null;
  }

  const root = getObjectValue(response);
  if (!root) return null;

  const directKeys = ["domainId", "domain_id", "id", "_id"];
  for (const key of directKeys) {
    const value = getStringField(root, key);
    if (value) return value;
  }

  const nestedContainers = ["data", "domain", "result"];
  for (const containerKey of nestedContainers) {
    const nested = getObjectValue(root[containerKey]);
    if (!nested) continue;
    for (const key of directKeys) {
      const value = getStringField(nested, key);
      if (value) return value;
    }
  }

  return null;
};

const extractCreatedDomainName = (
  response: unknown,
  fallbackName: string,
): string => {
  const root = getObjectValue(response);
  if (!root) return fallbackName;

  const directKeys = ["name", "domainName", "domain_name"];
  for (const key of directKeys) {
    const value = getStringField(root, key);
    if (value) return value;
  }

  const nestedContainers = ["data", "domain", "result"];
  for (const containerKey of nestedContainers) {
    const nested = getObjectValue(root[containerKey]);
    if (!nested) continue;
    for (const key of directKeys) {
      const value = getStringField(nested, key);
      if (value) return value;
    }
  }

  return fallbackName;
};

const extractCreatedProgramId = (response: unknown): string | null => {
  if (typeof response === "string") {
    const trimmed = response.trim();
    return trimmed || null;
  }

  const root = getObjectValue(response);
  if (!root) return null;

  const directKeys = ["programId", "program_id", "id", "_id"];
  for (const key of directKeys) {
    const value = getStringField(root, key);
    if (value) return value;
  }

  const nestedContainers = ["data", "program", "result"];
  for (const containerKey of nestedContainers) {
    const nested = getObjectValue(root[containerKey]);
    if (!nested) continue;
    for (const key of directKeys) {
      const value = getStringField(nested, key);
      if (value) return value;
    }
  }

  return null;
};

const isEntityActive = (entity: {
  isActive?: boolean;
  is_active?: boolean;
}): boolean => {
  if (typeof entity.isActive === "boolean") return entity.isActive;
  if (typeof entity.is_active === "boolean") return entity.is_active;
  return true;
};

const isLocalPlaceholderDomainId = (domainId: string): boolean =>
  domainId.trim().startsWith("domain-");

const mapGuidedDomainsToRows = (domains: GuidedTreeDomain[]): DomainRow[] =>
  domains
    .map((domain, index) => {
      const id =
        domain.domainId ?? domain.id ?? domain._id ?? `domain-${index + 1}`;
      const name = domain.name ?? domain.domainName ?? "";
      if (!id || !name.trim()) return null;

      return {
        id,
        name: name.trim(),
      } as DomainRow;
    })
    .filter((domain): domain is DomainRow => domain !== null);

const dedupeDomainRows = (rows: DomainRow[]): DomainRow[] => {
  const byId = new Map<string, DomainRow>();
  for (const row of rows) {
    if (!byId.has(row.id)) {
      byId.set(row.id, row);
    }
  }
  return Array.from(byId.values());
};

const getPendingDomains = (): DomainRow[] => {
  try {
    const raw = localStorage.getItem(PENDING_DOMAINS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DomainRow[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (domain) =>
        typeof domain?.id === "string" &&
        Boolean(domain.id) &&
        typeof domain?.name === "string" &&
        Boolean(domain.name.trim()),
    );
  } catch {
    return [];
  }
};

const setPendingDomains = (domains: DomainRow[]) => {
  try {
    localStorage.setItem(PENDING_DOMAINS_STORAGE_KEY, JSON.stringify(domains));
  } catch {
    // Ignore storage failures; UI state still updates in memory.
  }
};

const upsertPendingDomain = (domain: DomainRow) => {
  const pending = getPendingDomains();
  if (pending.some((row) => row.id === domain.id)) return;
  setPendingDomains([...pending, domain]);
};

const removePendingDomain = (domainId: string) => {
  const pending = getPendingDomains();
  setPendingDomains(pending.filter((domain) => domain.id !== domainId));
};

const parseDurationWeeks = (label: string): string => {
  const match = /(\d+)\s*week/i.exec(label);
  return match ? match[1] : "";
};

const mapGuidedTreeToRows = (
  response: Awaited<ReturnType<typeof fetchGuidedTree>>,
): GuidedHierarchyRows => {
  const domainRows = mapGuidedDomainsToRows(response.domains ?? []);
  const categoryFormById: Record<string, CategoryForm> = {};
  const programDurationsById: Record<string, DurationEntry[]> = {};
  const programFormById: Record<string, Partial<ProgramForm>> = {};
  const programRows: ProgramRow[] = [];

  const categoryRows = (response.domains ?? []).flatMap(
    (domain, domainIndex) => {
      const domainId =
        domain.domainId ??
        domain.id ??
        domain._id ??
        `domain-${domainIndex + 1}`;
      if (!domainId) return [];

      return (domain.categories ?? [])
        .map((category, categoryIndex) => {
          if (!isEntityActive(category)) return null;

          const id =
            category.categoryId ??
            category.id ??
            category._id ??
            `${domainId}-category-${categoryIndex + 1}`;
          const name =
            category.categoryType ??
            category.categoryPageData?.categoryType ??
            category.categoryName ??
            category.name ??
            "";
          if (!id || !name.trim()) return null;

          const pageData = category.categoryPageData ?? {};
          const categoryImage =
            pageData.categoryPageDataImage ??
            pageData.imageUrl ??
            pageData.image_url ??
            "";
          categoryFormById[id] = {
            domainId,
            name: name.trim(),
            heroTitle: pageData.categoryHeroTitle?.trim() ?? "",
            heroSubtext: pageData.categoryHeroSubtext?.trim() ?? "",
            ctaLabel: pageData.categoryCtaLabel?.trim() ?? "",
            ctaLink: pageData.categoryCtaTo?.trim() ?? "",
            pageHeader: pageData.categoryPageHeader?.trim() ?? "",
            imageUrl: categoryImage.trim(),
            whatsIncluded: joinTextareaItems(pageData.whatsIncludedInCategory),
            keyAreas: joinTextareaItems(pageData.categoryPageKeyAreas),
          };

          for (const program of category.programsInCategory ?? []) {
            if (!isEntityActive(program)) continue;
            const programId = program.programId ?? program.id ?? program._id;
            const programName = (program.programName ?? program.name ?? "").trim();
            if (!programId || !programName) continue;
            programRows.push({
              id: programId,
              name: programName,
              domainId,
              categoryId: id,
            });
            const mappedDurations: DurationEntry[] = (program.programDurations ?? []).map((d) => ({
              label: d.durationLabel ?? "",
              weeks: parseDurationWeeks(d.durationLabel ?? ""),
              priceIN: "",
              priceUK: "",
              priceUS: "",
            }));
            if (mappedDurations.length > 0) {
              programDurationsById[programId] = mappedDurations;
            }

            const pageDetails = program.programPageDisplayDetails;
            const firstSection = pageDetails?.detailSections?.[0];
            programFormById[programId] = {
              gridDescription: program.programGridDescription?.trim() ?? "",
              gridImageUrl: program.programGridImage?.trim() ?? "",
              overview: pageDetails?.overview?.trim() ?? "",
              sortOrder: pageDetails?.sortOrder != null ? String(pageDetails.sortOrder) : "0",
              whatYouGet: joinTextareaItems(pageDetails?.whatYouGet),
              whoIsThisFor: joinTextareaItems(pageDetails?.whoIsThisFor),
              tags: joinTextareaItems(pageDetails?.tags),
              detailHeading: firstSection?.heading?.trim() ?? "",
              detailDescription: firstSection?.description?.trim() ?? "",
              durations: mappedDurations.length > 0 ? mappedDurations : undefined,
            };
          }

          return {
            id,
            name: name.trim(),
            domainId,
          } as CategoryRow;
        })
        .filter((category): category is CategoryRow => category !== null);
    },
  );

  return { domainRows, categoryRows, programRows, categoryFormById, programDurationsById, programFormById };
};

export default function AdminDashboard() {
  const { tokens, user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("summary");
  const [domains, setDomains] = useState<DomainRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [programs, setPrograms] = useState<ProgramRow[]>([]);
  const [expertsList, setExpertsList] = useState<AdminExpert[]>([]);

  const [domainForm, setDomainForm] = useState<DomainForm>(initialDomainForm);
  const [editingDomainId, setEditingDomainId] = useState<string | null>(null);
  const [domainCreateError, setDomainCreateError] = useState<string | null>(
    null,
  );
  const [domainCreateSuccess, setDomainCreateSuccess] = useState<string | null>(
    null,
  );
  const [isCreatingDomain, setIsCreatingDomain] = useState(false);
  const [deletingDomainId, setDeletingDomainId] = useState<string | null>(null);
  const [isDomainsLoading, setIsDomainsLoading] = useState(true);
  const [domainLoadError, setDomainLoadError] = useState<string | null>(null);

  const [categoryForm, setCategoryForm] =
    useState<CategoryForm>(initialCategoryForm);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [categoryCreateError, setCategoryCreateError] = useState<string | null>(
    null,
  );
  const [categoryCreateSuccess, setCategoryCreateSuccess] = useState<
    string | null
  >(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(
    null,
  );
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryFormById, setCategoryFormById] = useState<
    Record<string, CategoryForm>
  >({});
  const [programDurationsById, setProgramDurationsById] = useState<
    Record<string, DurationEntry[]>
  >({});
  const [programFormById, setProgramFormById] = useState<
    Record<string, Partial<ProgramForm>>
  >({});

  const [programForm, setProgramForm] =
    useState<ProgramForm>(initialProgramForm);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [programCreateError, setProgramCreateError] = useState<string | null>(
    null,
  );
  const [programCreateSuccess, setProgramCreateSuccess] = useState<
    string | null
  >(null);
  const [isCreatingProgram, setIsCreatingProgram] = useState(false);
  const [deletingProgramId, setDeletingProgramId] = useState<string | null>(null);
  const [statusChangingId, setStatusChangingId] = useState<string | null>(null);
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [isLoadingProgramEdit, setIsLoadingProgramEdit] = useState(false);

  useEffect(() => {
    const timers: Array<ReturnType<typeof setTimeout>> = [];

    if (domainCreateError) {
      timers.push(
        setTimeout(() => {
          setDomainCreateError(null);
        }, ADMIN_ALERT_TIMEOUT_MS),
      );
    }
    if (domainCreateSuccess) {
      timers.push(
        setTimeout(() => {
          setDomainCreateSuccess(null);
        }, ADMIN_ALERT_TIMEOUT_MS),
      );
    }
    if (categoryCreateError) {
      timers.push(
        setTimeout(() => {
          setCategoryCreateError(null);
        }, ADMIN_ALERT_TIMEOUT_MS),
      );
    }
    if (categoryCreateSuccess) {
      timers.push(
        setTimeout(() => {
          setCategoryCreateSuccess(null);
        }, ADMIN_ALERT_TIMEOUT_MS),
      );
    }
    if (programCreateError) {
      timers.push(
        setTimeout(() => {
          setProgramCreateError(null);
        }, ADMIN_ALERT_TIMEOUT_MS),
      );
    }
    if (programCreateSuccess) {
      timers.push(
        setTimeout(() => {
          setProgramCreateSuccess(null);
        }, ADMIN_ALERT_TIMEOUT_MS),
      );
    }

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [
    domainCreateError,
    domainCreateSuccess,
    categoryCreateError,
    categoryCreateSuccess,
    programCreateError,
    programCreateSuccess,
  ]);

  const categoriesForProgramDomain = categories.filter(
    (category) => category.domainId === programForm.domainId,
  );
  useEffect(() => {
    let isActive = true;

    const loadHierarchy = async () => {
      try {
        setIsDomainsLoading(true);
        setDomainLoadError(null);

        const [treeResponse, adminPrograms, adminExperts] = await Promise.all([
          fetchGuidedTree(),
          getAdminPrograms().catch(() => []),
          getAdminExperts().catch(() => []),
        ]);
        const { domainRows, categoryRows, programRows, categoryFormById, programDurationsById, programFormById } =
          mapGuidedTreeToRows(treeResponse);
        const pendingDomains = getPendingDomains();
        const unresolvedPendingDomains = pendingDomains.filter(
          (pending) => !domainRows.some((domain) => domain.id === pending.id),
        );

        // Merge admin programs (all statuses) into the tree-sourced programs
        const treeIds = new Set(programRows.map((p) => p.id));
        const extraPrograms: ProgramRow[] = adminPrograms
          .filter((ap) => !treeIds.has(ap.programId))
          .map((ap) => ({
            id: ap.programId,
            name: ap.name ?? "Untitled",
            domainId: "",
            categoryId: ap.categoryId,
            status: ap.status,
            expertName: ap.expertName,
            expertId: ap.expertId,
          }));

        // Enrich tree-sourced programs with status from admin API
        const adminMap = new Map(adminPrograms.map((ap) => [ap.programId, ap]));
        const enrichedTreePrograms = programRows.map((p) => {
          const ap = adminMap.get(p.id);
          return ap ? { ...p, status: ap.status, expertName: ap.expertName, expertId: ap.expertId } : p;
        });

        if (!isActive) return;
        setDomains(dedupeDomainRows([...domainRows, ...unresolvedPendingDomains]));
        setCategories(categoryRows);
        setPrograms([...enrichedTreePrograms, ...extraPrograms]);
        setCategoryFormById(categoryFormById);
        setProgramDurationsById(programDurationsById);
        setProgramFormById(programFormById);
        setPendingDomains(unresolvedPendingDomains);
        setExpertsList(adminExperts);
      } catch {
        if (!isActive) return;
        setDomainLoadError("Unable to load domains.");
      } finally {
        if (!isActive) return;
        setIsDomainsLoading(false);
      }
    };

    void loadHierarchy();

    return () => {
      isActive = false;
    };
  }, []);

  const resetDomainForm = () => {
    setDomainForm(initialDomainForm);
    setEditingDomainId(null);
    setDomainCreateError(null);
    setDomainCreateSuccess(null);
  };

  const resetCategoryForm = () => {
    setCategoryForm(initialCategoryForm);
    setEditingCategoryId(null);
    setCategoryCreateError(null);
    setCategoryCreateSuccess(null);
  };

  const openAddCategoryModal = () => {
    setEditingCategoryId(null);
    setCategoryForm(initialCategoryForm);
    setCategoryCreateError(null);
    setCategoryCreateSuccess(null);
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setCategoryForm(initialCategoryForm);
    setEditingCategoryId(null);
    setIsCategoryModalOpen(false);
  };

  const resetProgramForm = () => {
    setProgramForm(initialProgramForm);
    setEditingProgramId(null);
    setProgramCreateError(null);
    setProgramCreateSuccess(null);
  };

  const openAddProgramModal = () => {
    setEditingProgramId(null);
    setProgramForm(initialProgramForm);
    setProgramCreateError(null);
    setProgramCreateSuccess(null);
    setIsProgramModalOpen(true);
  };

  const closeProgramModal = () => {
    setProgramForm(initialProgramForm);
    setEditingProgramId(null);
    setIsProgramModalOpen(false);
  };

  const handleDomainSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDomainCreateError(null);
    setDomainCreateSuccess(null);

    const name = domainForm.name.trim();
    if (!name) return;

    const accessToken = tokens?.accessToken;
    if (!accessToken) {
      setDomainCreateError("You must be logged in to manage domains.");
      return;
    }

    const slug = toHyphenatedSlug(name);
    if (!slug) {
      setDomainCreateError("Please enter a valid domain name.");
      return;
    }

    if (editingDomainId) {
      const sortOrder = Math.max(
        domains.findIndex((domain) => domain.id === editingDomainId),
        0,
      );

      try {
        setIsCreatingDomain(true);
        if (isLocalPlaceholderDomainId(editingDomainId)) {
          throw new Error(
            "This domain is pending sync. Refresh once it appears in the backend list.",
          );
        }
        await updateGuidedDomain(
          editingDomainId,
          {
            name,
            slug,
            sortOrder,
          },
          accessToken,
        );

        // Endpoint returns 204 No Content; treat successful status as update success.
        const updatedName = name;
        setDomains((prev) =>
          prev.map((domain) =>
            domain.id === editingDomainId
              ? { ...domain, name: updatedName }
              : domain,
          ),
        );

        setDomainCreateSuccess(`Domain "${updatedName}" updated.`);
        setDomainForm(initialDomainForm);
        setEditingDomainId(null);
      } catch (err) {
        if (err instanceof ApiError) {
          setDomainCreateError(err.message);
        } else {
          setDomainCreateError("Unable to update domain. Please try again.");
        }
      } finally {
        setIsCreatingDomain(false);
      }
      return;
    }

    try {
      setIsCreatingDomain(true);
      const response = await createGuidedDomain(
        {
          name,
          slug,
          sortOrder: domains.length,
        },
        accessToken,
      );

      const createdName = extractCreatedDomainName(response, name);
      const createdId = extractCreatedDomainId(response);
      const optimisticDomainId =
        createdId && !domains.some((domain) => domain.id === createdId)
          ? createdId
          : `domain-${Date.now()}`;
      const optimisticDomain: DomainRow = {
        id: optimisticDomainId,
        name: createdName,
      };

      // Ensure newly created domains are visible immediately even if tree refresh
      // is eventually consistent or does not include empty/unpublished entries.
      setDomains((prev) => {
        if (prev.some((domain) => domain.id === optimisticDomain.id)) return prev;
        return [...prev, optimisticDomain];
      });
      upsertPendingDomain(optimisticDomain);

      try {
        const refreshedTree = await fetchGuidedTree();
        const { domainRows, categoryRows, programRows } =
          mapGuidedTreeToRows(refreshedTree);
        const pendingDomains = getPendingDomains();
        const unresolvedPendingDomains = pendingDomains.filter(
          (pending) => !domainRows.some((domain) => domain.id === pending.id),
        );
        setDomains((prev) =>
          dedupeDomainRows([...domainRows, ...prev, ...unresolvedPendingDomains]),
        );
        setCategories(categoryRows);
        setPrograms(programRows);
        setPendingDomains(unresolvedPendingDomains);
      } catch {}

      setDomainCreateSuccess(`Domain "${createdName}" created.`);
      setDomainForm(initialDomainForm);
    } catch (err) {
      if (err instanceof ApiError) {
        setDomainCreateError(err.message);
      } else if (err instanceof Error) {
        setDomainCreateError(err.message);
      } else {
        setDomainCreateError("Unable to create domain. Please try again.");
      }
    } finally {
      setIsCreatingDomain(false);
    }
  };

  const startDomainEdit = (domain: DomainRow) => {
    setEditingDomainId(domain.id);
    setDomainForm({ name: domain.name });
  };

  const handleDomainDelete = async (domainId: string) => {
    setDomainCreateError(null);
    setDomainCreateSuccess(null);

    const accessToken = tokens?.accessToken;
    if (!accessToken) {
      setDomainCreateError("You must be logged in to manage domains.");
      return;
    }

    const domainName = domains.find((d) => d.id === domainId)?.name ?? "this domain";
    if (!confirm(`Archive "${domainName}"? This will also archive all its categories and programs. Active enrollments will block the operation.`)) return;

    const categoryIdsInDomain = categories
      .filter((category) => category.domainId === domainId)
      .map((category) => category.id);

    try {
      setDeletingDomainId(domainId);
      if (isLocalPlaceholderDomainId(domainId)) {
        throw new Error(
          "This domain is pending sync and does not have a backend id yet. Refresh and try again.",
        );
      }
      const response = await deleteGuidedDomain(domainId, accessToken);
      if (!response.isDeleted) {
        throw new Error("Delete operation did not complete.");
      }

      setDomains((prev) => prev.filter((domain) => domain.id !== domainId));
      setCategories((prev) =>
        prev.filter((category) => category.domainId !== domainId),
      );
      setPrograms((prev) =>
        prev.filter(
          (program) =>
            program.domainId !== domainId &&
            !categoryIdsInDomain.includes(program.categoryId),
        ),
      );

      if (editingDomainId === domainId) resetDomainForm();
      if (categoryForm.domainId === domainId) resetCategoryForm();
      if (programForm.domainId === domainId) resetProgramForm();
      removePendingDomain(domainId);
      setDomainCreateSuccess("Domain archived.");
    } catch (err) {
      if (err instanceof ApiError) {
        setDomainCreateError(err.message);
      } else {
        setDomainCreateError("Unable to archive domain. Please try again.");
      }
    } finally {
      setDeletingDomainId(null);
    }
  };

  const handleCategorySubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCategoryCreateError(null);
    setCategoryCreateSuccess(null);

    const rawName = categoryForm.name.trim();
    if (!rawName || !categoryForm.domainId) return;

    const categoryType = rawName;
    const heroTitle = categoryForm.heroTitle.trim();
    if (!heroTitle) {
      setCategoryCreateError("Hero title is required.");
      return;
    }
    const pageHeader = categoryForm.pageHeader.trim();
    if (!pageHeader) {
      setCategoryCreateError("Page header is required.");
      return;
    }

    const accessToken = tokens?.accessToken;
    if (!accessToken) {
      setCategoryCreateError("You must be logged in to manage categories.");
      return;
    }

    if (editingCategoryId) {
      const sortOrder = Math.max(
        categories.findIndex((category) => category.id === editingCategoryId),
        0,
      );

      try {
        setIsCreatingCategory(true);
        const response = await updateGuidedCategory(
          editingCategoryId,
          {
            name: rawName,
            categoryType,
            heroTitle,
            heroSubtext: categoryForm.heroSubtext.trim(),
            ctaLabel: categoryForm.ctaLabel.trim(),
            ctaLink: categoryForm.ctaLink.trim(),
            pageHeader,
            imageUrl: categoryForm.imageUrl.trim(),
            sortOrder,
            whatsIncluded: parseTextareaItems(categoryForm.whatsIncluded),
            keyAreas: parseTextareaItems(categoryForm.keyAreas),
          },
          accessToken,
        );

        if (!response.isUpdated) {
          throw new Error("Update operation did not complete.");
        }

        setCategories((prev) =>
          prev.map((category) =>
            category.id === editingCategoryId
              ? {
                  ...category,
                  name: rawName,
                  domainId: categoryForm.domainId,
                }
              : category,
          ),
        );
        setCategoryFormById((prev) => ({
          ...prev,
          [editingCategoryId]: {
            domainId: categoryForm.domainId,
            name: rawName,
            heroTitle,
            heroSubtext: categoryForm.heroSubtext.trim(),
            ctaLabel: categoryForm.ctaLabel.trim(),
            ctaLink: categoryForm.ctaLink.trim(),
            pageHeader,
            imageUrl: categoryForm.imageUrl.trim(),
            whatsIncluded: joinTextareaItems(
              parseTextareaItems(categoryForm.whatsIncluded),
            ),
            keyAreas: joinTextareaItems(parseTextareaItems(categoryForm.keyAreas)),
          },
        }));

        setPrograms((prev) =>
          prev.map((program) =>
            program.categoryId === editingCategoryId
              ? { ...program, domainId: categoryForm.domainId }
              : program,
          ),
        );

        if (programForm.categoryId === editingCategoryId) {
          setProgramForm((prev) => ({
            ...prev,
            domainId: categoryForm.domainId,
          }));
        }

        bumpGuidedProgramsCacheVersion();
        setCategoryCreateSuccess(`Category "${categoryType}" updated.`);
        closeCategoryModal();
      } catch (err) {
        if (err instanceof ApiError) {
          setCategoryCreateError(err.message);
        } else {
          setCategoryCreateError("Unable to update category. Please try again.");
        }
      } finally {
        setIsCreatingCategory(false);
      }
      return;
    }

    const slug = toHyphenatedSlug(rawName);
    if (!slug) {
      setCategoryCreateError("Please enter a valid category name.");
      return;
    }

    try {
      setIsCreatingCategory(true);
      const response = await createGuidedCategory(
        {
          domainId: categoryForm.domainId,
          name: rawName,
          slug,
          categoryType,
          heroTitle,
          heroSubtext: categoryForm.heroSubtext.trim(),
          ctaLabel: categoryForm.ctaLabel.trim(),
          ctaLink: categoryForm.ctaLink.trim(),
          pageHeader,
          imageUrl: categoryForm.imageUrl.trim(),
          sortOrder: 0,
          parentId: null,
          whatsIncluded: parseTextareaItems(categoryForm.whatsIncluded),
          keyAreas: parseTextareaItems(categoryForm.keyAreas),
        },
        accessToken,
      );

      const createdId = typeof response === "string" ? response.trim() : "";
      if (!createdId) {
        throw new Error("Category created but no id was returned by backend.");
      }
      const newCategory: CategoryRow = {
        id: createdId,
        name: rawName,
        domainId: categoryForm.domainId,
      };

      setCategories((prev) => {
        if (prev.some((category) => category.id === createdId)) return prev;
        return [newCategory, ...prev];
      });
      setCategoryFormById((prev) => ({
        ...prev,
        [createdId]: {
          domainId: categoryForm.domainId,
          name: rawName,
          heroTitle,
          heroSubtext: categoryForm.heroSubtext.trim(),
          ctaLabel: categoryForm.ctaLabel.trim(),
          ctaLink: categoryForm.ctaLink.trim(),
          pageHeader,
          imageUrl: categoryForm.imageUrl.trim(),
          whatsIncluded: joinTextareaItems(
            parseTextareaItems(categoryForm.whatsIncluded),
          ),
          keyAreas: joinTextareaItems(parseTextareaItems(categoryForm.keyAreas)),
        },
      }));
      bumpGuidedProgramsCacheVersion();
      setCategoryCreateSuccess(`Category "${categoryType}" created.`);
      closeCategoryModal();
    } catch (err) {
      if (err instanceof ApiError) {
        setCategoryCreateError(err.message);
      } else {
        setCategoryCreateError("Unable to create category. Please try again.");
      }
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const startCategoryEdit = (category: CategoryRow) => {
    const prefilled = categoryFormById[category.id];
    setEditingCategoryId(category.id);
    setCategoryForm({
      domainId: prefilled?.domainId ?? category.domainId,
      name: prefilled?.name ?? category.name,
      heroTitle: prefilled?.heroTitle ?? category.name,
      heroSubtext: prefilled?.heroSubtext ?? "",
      ctaLabel: prefilled?.ctaLabel ?? "",
      ctaLink: prefilled?.ctaLink ?? "",
      pageHeader: prefilled?.pageHeader ?? category.name,
      imageUrl: prefilled?.imageUrl ?? "",
      whatsIncluded: prefilled?.whatsIncluded ?? "",
      keyAreas: prefilled?.keyAreas ?? "",
    });
    setCategoryCreateError(null);
    setCategoryCreateSuccess(null);
    setIsCategoryModalOpen(true);
  };

  const handleCategoryDelete = async (categoryId: string) => {
    setCategoryCreateError(null);
    setCategoryCreateSuccess(null);

    const accessToken = tokens?.accessToken;
    if (!accessToken) {
      setCategoryCreateError("You must be logged in to manage categories.");
      return;
    }

    const categoryName = categories.find((c) => c.id === categoryId)?.name ?? "this category";
    if (!confirm(`Archive "${categoryName}"? This will also archive all its programs. Active enrollments will block the operation.`)) return;

    try {
      setDeletingCategoryId(categoryId);
      const response = await deleteGuidedCategory(categoryId, accessToken);
      if (!response.isDeleted) {
        throw new Error("Delete operation did not complete.");
      }

      setCategories((prev) =>
        prev.filter((category) => category.id !== categoryId),
      );
      setPrograms((prev) =>
        prev.filter((program) => program.categoryId !== categoryId),
      );
      setCategoryFormById((prev) => {
        if (!prev[categoryId]) return prev;
        const next = { ...prev };
        delete next[categoryId];
        return next;
      });

      if (editingCategoryId === categoryId) closeCategoryModal();
      if (programForm.categoryId === categoryId) {
        setProgramForm((prev) => ({ ...prev, categoryId: "" }));
      }
      bumpGuidedProgramsCacheVersion();
      setCategoryCreateSuccess("Category archived.");
    } catch (err) {
      if (err instanceof ApiError) {
        setCategoryCreateError(err.message);
      } else {
        setCategoryCreateError("Unable to archive category. Please try again.");
      }
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const handleProgramSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProgramCreateError(null);
    setProgramCreateSuccess(null);

    const name = programForm.name.trim();
    const slug = toHyphenatedSlug(name);
    if (!name || !slug || !programForm.domainId || !programForm.categoryId) {
      setProgramCreateError("Name, domain, and category are required.");
      return;
    }

    if (!editingProgramId && !programForm.expertId) {
      setProgramCreateError("Please select an expert for this program.");
      return;
    }

    const gridDescription = programForm.gridDescription.trim();
    const gridImageUrl = programForm.gridImageUrl.trim();
    const overview = programForm.overview.trim();

    if (!overview) {
      setProgramCreateError("Program description is required.");
      return;
    }

    if (programForm.durations.length === 0) {
      setProgramCreateError("At least one duration is required.");
      return;
    }

    // Validate and map durations
    const buildPrices = (d: DurationEntry) => {
      const p: { locationCode: string; amount: number; currencyCode: string; currencySymbol: string }[] = [];
      if (d.priceIN) p.push({ locationCode: "IN", amount: Number(d.priceIN), currencyCode: "INR", currencySymbol: "₹" });
      if (d.priceUK) p.push({ locationCode: "GB", amount: Number(d.priceUK), currencyCode: "GBP", currencySymbol: "£" });
      if (d.priceUS) p.push({ locationCode: "US", amount: Number(d.priceUS), currencyCode: "USD", currencySymbol: "$" });
      return p;
    };

    for (let i = 0; i < programForm.durations.length; i++) {
      const d = programForm.durations[i];
      if (!d.label.trim()) {
        setProgramCreateError(`Duration ${i + 1}: label is required.`);
        return;
      }
      if (buildPrices(d).length === 0) {
        setProgramCreateError(`Duration ${i + 1} ("${d.label}"): set a price for at least one region.`);
        return;
      }
    }

    const mappedDurations = programForm.durations.map((d, i) => ({
      label: d.label.trim(),
      weeks: parseNonNegativeNumber(d.weeks),
      sortOrder: i,
      prices: buildPrices(d),
    }));

    const accessToken = tokens?.accessToken;
    if (!accessToken) {
      setProgramCreateError("You must be logged in to manage programs.");
      return;
    }

    const sortOrder = parseNonNegativeNumber(programForm.sortOrder);

    const whatYouGet = parseTextareaItems(programForm.whatYouGet);
    const whoIsThisFor = parseTextareaItems(programForm.whoIsThisFor);
    const tags = parseTextareaItems(programForm.tags);
    const detailHeading = programForm.detailHeading.trim();
    const detailDescription = programForm.detailDescription.trim();
    const detailSections =
      detailHeading || detailDescription
        ? [{ heading: detailHeading, description: detailDescription, sortOrder: 0 }]
        : [];

    if (editingProgramId) {
      try {
        setIsCreatingProgram(true);

        // 1. Update core program fields
        const res = await updateGuidedProgram(
          editingProgramId,
          { name, gridDescription, gridImageUrl, overview, sortOrder, whatYouGet, whoIsThisFor, tags, detailSections },
          accessToken,
        );
        if (!res.isUpdated) throw new Error("Update did not complete.");

        // 2. Save duration + price changes
        const PRICE_META: Record<string, { code: string; symbol: string }> = {
          IN: { code: "INR", symbol: "₹" },
          GB: { code: "GBP", symbol: "£" },
          US: { code: "USD", symbol: "$" },
        };

        for (let i = 0; i < programForm.durations.length; i++) {
          const d = programForm.durations[i];

          if (d.durationId) {
            // Existing duration — update label/weeks + upsert prices
            await updateDuration(editingProgramId, d.durationId, {
              label: d.label.trim(),
              weeks: parseNonNegativeNumber(d.weeks),
            });

            const priceEntries: Array<{ locationCode: string; value: string; priceId: string | undefined }> = [
              { locationCode: "IN", value: d.priceIN, priceId: d.priceIdIN },
              { locationCode: "GB", value: d.priceUK, priceId: d.priceIdUK },
              { locationCode: "US", value: d.priceUS, priceId: d.priceIdUS },
            ];

            for (const { locationCode, value, priceId } of priceEntries) {
              if (!value) continue;
              const meta = PRICE_META[locationCode];
              const amount = Number(value);
              if (priceId) {
                await updateDurationPrice(editingProgramId, d.durationId, priceId, {
                  amount, currencyCode: meta.code, currencySymbol: meta.symbol,
                });
              } else {
                await addDurationPrice(editingProgramId, d.durationId, {
                  locationCode, amount, currencyCode: meta.code, currencySymbol: meta.symbol,
                });
              }
            }
          } else {
            // New duration added during edit — create it with prices
            const prices = buildPrices(d);
            if (prices.length > 0) {
              await addProgramDuration(editingProgramId, {
                label: d.label.trim(),
                weeks: parseNonNegativeNumber(d.weeks),
                sortOrder: i,
                prices,
              });
            }
          }
        }

        setPrograms((prev) =>
          prev.map((program) =>
            program.id === editingProgramId
              ? { ...program, name, domainId: programForm.domainId, categoryId: programForm.categoryId }
              : program,
          ),
        );
        bumpGuidedProgramsCacheVersion();
        setProgramCreateSuccess(`Program "${name}" updated.`);
        closeProgramModal();
      } catch (err) {
        if (err instanceof ApiError) {
          setProgramCreateError(err.message);
        } else {
          setProgramCreateError("Unable to update program. Please try again.");
        }
      } finally {
        setIsCreatingProgram(false);
      }
      return;
    }

    try {
      setIsCreatingProgram(true);
      const createPayload: Parameters<typeof createGuidedProgram>[0] = {
        categoryId: programForm.categoryId,
        name,
        slug,
        gridDescription,
        gridImageUrl,
        overview,
        sortOrder,
        durations: mappedDurations,
        whatYouGet,
        whoIsThisFor,
        tags,
        detailSections,
      };
      if (programForm.expertId) {
        createPayload.expertId = programForm.expertId;
      }
      const response = await createGuidedProgram(createPayload, accessToken);

      const createdId =
        extractCreatedProgramId(response) ??
        createNextId(
          "P",
          programs.map((program) => program.id),
        );
      const newProgram: ProgramRow = {
        id: createdId,
        name,
        domainId: programForm.domainId,
        categoryId: programForm.categoryId,
      };

      setPrograms((prev) => {
        if (prev.some((program) => program.id === createdId)) return prev;
        return [newProgram, ...prev];
      });
      setProgramCreateSuccess(`Program "${name}" created.`);
      closeProgramModal();
    } catch (err) {
      if (err instanceof ApiError) {
        setProgramCreateError(err.message);
      } else {
        setProgramCreateError("Unable to create program. Please try again.");
      }
    } finally {
      setIsCreatingProgram(false);
    }
  };

  const startProgramEdit = async (program: ProgramRow) => {
    const prefilled = programFormById[program.id] ?? {};
    const fallbackDurations = programDurationsById[program.id];

    setProgramCreateError(null);
    setProgramCreateSuccess(null);
    setEditingProgramId(program.id);
    setIsLoadingProgramEdit(true);
    setIsProgramModalOpen(true);

    let resolvedDurations: DurationEntry[] | null = null;
    try {
      const apiDurations = await getProgramDurations(program.id);
      if (apiDurations.length > 0) {
        resolvedDurations = apiDurations.map((d) => {
          const priceByLocation = Object.fromEntries(
            d.prices.filter((p) => p.isActive).map((p) => [p.locationCode, p]),
          );
          return {
            durationId: d.durationId,
            priceIdIN: priceByLocation["IN"]?.priceId,
            priceIdUK: priceByLocation["GB"]?.priceId,
            priceIdUS: priceByLocation["US"]?.priceId,
            label: d.label,
            weeks: String(d.weeks),
            priceIN: priceByLocation["IN"] ? String(priceByLocation["IN"].amount) : "",
            priceUK: priceByLocation["GB"] ? String(priceByLocation["GB"].amount) : "",
            priceUS: priceByLocation["US"] ? String(priceByLocation["US"].amount) : "",
          };
        });
      }
    } catch {
      // Fall back to tree-sourced durations (no prices) if fetch fails
    } finally {
      setIsLoadingProgramEdit(false);
    }

    const durations =
      resolvedDurations ??
      (fallbackDurations && fallbackDurations.length > 0
        ? fallbackDurations.map((d) => ({ ...d }))
        : [{ ...initialDurationEntry }]);

    setProgramForm({
      name: program.name,
      domainId: program.domainId,
      categoryId: program.categoryId,
      expertId: program.expertId ?? "",
      gridDescription: prefilled.gridDescription ?? "",
      gridImageUrl: prefilled.gridImageUrl ?? "",
      overview: prefilled.overview ?? "",
      sortOrder: prefilled.sortOrder ?? "0",
      durations,
      whatYouGet: prefilled.whatYouGet ?? "",
      whoIsThisFor: prefilled.whoIsThisFor ?? "",
      tags: prefilled.tags ?? "",
      detailHeading: prefilled.detailHeading ?? "",
      detailDescription: prefilled.detailDescription ?? "",
    });
  };

  const handleProgramDelete = async (programId: string) => {
    setProgramCreateError(null);
    setProgramCreateSuccess(null);

    if (!confirm("Delete this program? This cannot be undone.")) return;

    const accessToken = tokens?.accessToken;
    if (!accessToken) {
      setProgramCreateError("You must be logged in to manage programs.");
      return;
    }

    try {
      setDeletingProgramId(programId);
      const response = await deleteGuidedProgram(programId, accessToken);
      if (!response.isDeleted) throw new Error("Delete did not complete.");

      setPrograms((prev) => prev.filter((program) => program.id !== programId));
      if (editingProgramId === programId) closeProgramModal();
      setProgramCreateSuccess("Program deleted.");
    } catch (err) {
      if (err instanceof ApiError) {
        setProgramCreateError(err.message);
      } else {
        setProgramCreateError("Unable to delete program. Please try again.");
      }
    } finally {
      setDeletingProgramId(null);
    }
  };

  const handleProgramStatusChange = async (programId: string, action: "submit" | "publish" | "reject" | "archive") => {
    setProgramCreateError(null);
    setProgramCreateSuccess(null);
    setStatusChangingId(programId);
    try {
      if (action === "submit") {
        await submitProgramForReview(programId);
        setPrograms((prev) => prev.map((p) => p.id === programId ? { ...p, status: "PendingReview" } : p));
        setProgramCreateSuccess("Program submitted for review.");
      } else if (action === "publish") {
        await publishProgram(programId);
        setPrograms((prev) => prev.map((p) => p.id === programId ? { ...p, status: "Published" } : p));
        setProgramCreateSuccess("Program published successfully.");
      } else if (action === "reject") {
        await rejectProgram(programId);
        setPrograms((prev) => prev.map((p) => p.id === programId ? { ...p, status: "Draft" } : p));
        setProgramCreateSuccess("Program declined and returned to draft.");
      } else if (action === "archive") {
        await archiveProgram(programId);
        setPrograms((prev) => prev.map((p) => p.id === programId ? { ...p, status: "Archived" } : p));
        setProgramCreateSuccess("Program archived.");
      }
    } catch (err) {
      setProgramCreateError(err instanceof ApiError ? err.message : `Failed to ${action} program.`);
    } finally {
      setStatusChangingId(null);
    }
  };

  return (
    <section className="page page--adminDashboard">
      <div className="adminContent">
        <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} userName={user?.firstName} />

        <div className="adminMain">

        {activeTab === "summary" && <SummaryTab />}

        {activeTab === "users" && <AdminUsersTab />}

        {activeTab === "experts" && <ExpertsTab />}

        {activeTab === "coupons" && <CouponsTab />}

        {activeTab === "orders" && <AdminOrdersTab />}

        {activeTab === "enrollments" && <AdminEnrollmentsTab />}

        {activeTab === "analytics" && <AnalyticsTab />}

        {activeTab === "gdpr" && <GdprTab />}

        {activeTab === "payouts" && <ExpertPayoutsTab />}

        {activeTab === "testimonials" && <TestimonialsTab />}

        {activeTab === "domains" && (
          <DomainsTab
            isDomainsLoading={isDomainsLoading}
            domainLoadError={domainLoadError}
            domainCreateSuccess={domainCreateSuccess}
            domainCreateError={domainCreateError}
            domainForm={domainForm}
            onDomainFormChange={(value) => setDomainForm({ name: value })}
            onSubmit={handleDomainSubmit}
            isCreatingDomain={isCreatingDomain}
            editingDomainId={editingDomainId}
            onCancelEdit={resetDomainForm}
            domains={domains}
            deletingDomainId={deletingDomainId}
            onStartEdit={startDomainEdit}
            onDelete={handleDomainDelete}
          />
        )}

        {activeTab === "categories" && (
          <CategoriesTab
            categoryCreateSuccess={categoryCreateSuccess}
            categoryCreateError={categoryCreateError}
            categories={categories}
            domains={domains}
            onOpenAddModal={openAddCategoryModal}
            onStartEdit={startCategoryEdit}
            onDelete={handleCategoryDelete}
            deletingCategoryId={deletingCategoryId}
            isCategoryModalOpen={isCategoryModalOpen}
            editingCategoryId={editingCategoryId}
            onCloseModal={closeCategoryModal}
            isCreatingCategory={isCreatingCategory}
            onSubmit={handleCategorySubmit}
            categoryForm={categoryForm}
            onCategoryFormChange={setCategoryForm}
          />
        )}

        {activeTab === "programs" && (
          <ProgramsTab
            programCreateSuccess={programCreateSuccess}
            programCreateError={programCreateError}
            onOpenAddModal={openAddProgramModal}
            onSubmit={handleProgramSubmit}
            programForm={programForm}
            onProgramFormChange={setProgramForm}
            domains={domains}
            categoriesForProgramDomain={categoriesForProgramDomain}
            isProgramModalOpen={isProgramModalOpen}
            onCloseModal={closeProgramModal}
            isCreatingProgram={isCreatingProgram}
            isLoadingProgramEdit={isLoadingProgramEdit}
            editingProgramId={editingProgramId}
            programs={programs}
            categories={categories}
            onStartEdit={startProgramEdit}
            onDelete={handleProgramDelete}
            deletingProgramId={deletingProgramId}
            expertsList={expertsList}
            onStatusChange={handleProgramStatusChange}
            statusChangingId={statusChangingId}
          />
        )}
        </div>
      </div>
    </section>
  );
}
