import { type FormEvent, useEffect, useState } from "react";
import { ApiError } from "../api/client";
import {
  createGuidedProgram,
  createGuidedCategory,
  createGuidedDomain,
  deleteGuidedCategory,
  deleteGuidedDomain,
  fetchGuidedTree,
  type GuidedTreeDomain,
  updateGuidedCategory,
  updateGuidedDomain,
} from "../api/guided";
import { useAuth } from "../auth/useAuth";
import { AdminTabs } from "./admin/AdminTabs";
import { CategoriesTab } from "./admin/CategoriesTab";
import { DomainsTab } from "./admin/DomainsTab";
import { ProgramsTab } from "./admin/ProgramsTab";
import {
  type AdminTab,
  type CategoryForm,
  type CategoryRow,
  type DomainForm,
  type DomainRow,
  type ProgramForm,
  type ProgramRow,
  type UserRow,
} from "./admin/types";
import { UsersTab } from "./admin/UsersTab";
import "./AdminDashboard.scss";

type GuidedHierarchyRows = {
  domainRows: DomainRow[];
  categoryRows: CategoryRow[];
  programRows: ProgramRow[];
  categoryFormById: Record<string, CategoryForm>;
};

const PENDING_DOMAINS_STORAGE_KEY = "femved_admin_pending_domains";
const ADMIN_ALERT_TIMEOUT_MS = 10_000;

const registeredUsersSeed: UserRow[] = [
  {
    id: "U001",
    name: "Bhargavi Padhya",
    email: "bhargavi@example.com",
    phone: "+91 98765 43210",
    role: "Admin",
  },
  {
    id: "U002",
    name: "Nitya Sharma",
    email: "nitya@example.com",
    phone: "+91 98111 22334",
    role: "User",
  },
  {
    id: "U003",
    name: "Sakshi Menon",
    email: "sakshi@example.com",
    phone: "+91 99220 11223",
    role: "Expert",
  },
];

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

const initialProgramForm: ProgramForm = {
  name: "",
  domainId: "",
  categoryId: "",
  gridDescription: "",
  gridImageUrl: "",
  overview: "",
  sortOrder: "0",
  durationLabel: "",
  durationWeeks: "0",
  durationSortOrder: "0",
  locationCode: "",
  amount: "0",
  currencyCode: "",
  currencySymbol: "",
  whatYouGet: "",
  whoIsThisFor: "",
  tags: "",
  detailHeading: "",
  detailDescription: "",
  detailSortOrder: "0",
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

const mapGuidedTreeToRows = (
  response: Awaited<ReturnType<typeof fetchGuidedTree>>,
): GuidedHierarchyRows => {
  const domainRows = mapGuidedDomainsToRows(response.domains ?? []);
  const categoryFormById: Record<string, CategoryForm> = {};
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

  return { domainRows, categoryRows, programRows, categoryFormById };
};

export default function AdminDashboard() {
  const { tokens } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [registeredUsers] = useState<UserRow[]>(registeredUsersSeed);
  const [domains, setDomains] = useState<DomainRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [programs, setPrograms] = useState<ProgramRow[]>([]);

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
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);

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

        const treeResponse = await fetchGuidedTree();
        const { domainRows, categoryRows, programRows, categoryFormById } =
          mapGuidedTreeToRows(treeResponse);
        const pendingDomains = getPendingDomains();
        const unresolvedPendingDomains = pendingDomains.filter(
          (pending) => !domainRows.some((domain) => domain.id === pending.id),
        );

        if (!isActive) return;
        setDomains(dedupeDomainRows([...domainRows, ...unresolvedPendingDomains]));
        setCategories(categoryRows);
        setPrograms(programRows);
        setCategoryFormById(categoryFormById);
        setPendingDomains(unresolvedPendingDomains);
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
      setDomainCreateSuccess("Domain deleted.");
    } catch (err) {
      if (err instanceof ApiError) {
        setDomainCreateError(err.message);
      } else {
        setDomainCreateError("Unable to delete domain. Please try again.");
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
      setCategoryCreateSuccess("Category deleted.");
    } catch (err) {
      if (err instanceof ApiError) {
        setCategoryCreateError(err.message);
      } else {
        setCategoryCreateError("Unable to delete category. Please try again.");
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

    const gridDescription = programForm.gridDescription.trim();
    const gridImageUrl = programForm.gridImageUrl.trim();
    const overview = programForm.overview.trim();
    const durationLabel = programForm.durationLabel.trim();
    const locationCode = programForm.locationCode.trim();
    const currencyCode = programForm.currencyCode.trim();
    const currencySymbol = programForm.currencySymbol.trim();

    if (
      !gridDescription ||
      !gridImageUrl ||
      !overview ||
      !durationLabel ||
      !locationCode ||
      !currencyCode ||
      !currencySymbol
    ) {
      setProgramCreateError(
        "Grid fields, overview, duration label, and price details are required.",
      );
      return;
    }

    const accessToken = tokens?.accessToken;
    if (!accessToken) {
      setProgramCreateError("You must be logged in to manage programs.");
      return;
    }

    const sortOrder = parseNonNegativeNumber(programForm.sortOrder);
    const durationWeeks = parseNonNegativeNumber(programForm.durationWeeks);
    const durationSortOrder = parseNonNegativeNumber(programForm.durationSortOrder);
    const amount = parseNonNegativeNumber(programForm.amount);
    const detailSortOrder = parseNonNegativeNumber(programForm.detailSortOrder);

    const whatYouGet = parseTextareaItems(programForm.whatYouGet);
    const whoIsThisFor = parseTextareaItems(programForm.whoIsThisFor);
    const tags = parseTextareaItems(programForm.tags);
    const detailHeading = programForm.detailHeading.trim();
    const detailDescription = programForm.detailDescription.trim();
    const detailSections =
      detailHeading || detailDescription
        ? [
            {
              heading: detailHeading,
              description: detailDescription,
              sortOrder: detailSortOrder,
            },
          ]
        : [];

    if (editingProgramId) {
      setPrograms((prev) =>
        prev.map((program) =>
          program.id === editingProgramId
            ? {
                ...program,
                name,
                domainId: programForm.domainId,
                categoryId: programForm.categoryId,
              }
            : program,
        ),
      );
      setProgramCreateSuccess(`Program "${name}" updated locally.`);
      closeProgramModal();
      return;
    }

    try {
      setIsCreatingProgram(true);
      const response = await createGuidedProgram(
        {
          categoryId: programForm.categoryId,
          name,
          slug,
          gridDescription,
          gridImageUrl,
          overview,
          sortOrder,
          durations: [
            {
              label: durationLabel,
              weeks: durationWeeks,
              sortOrder: durationSortOrder,
              prices: [
                {
                  locationCode,
                  amount,
                  currencyCode,
                  currencySymbol,
                },
              ],
            },
          ],
          whatYouGet,
          whoIsThisFor,
          tags,
          detailSections,
        },
        accessToken,
      );

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

  const startProgramEdit = (program: ProgramRow) => {
    setEditingProgramId(program.id);
    setProgramForm({
      name: program.name,
      domainId: program.domainId,
      categoryId: program.categoryId,
      gridDescription: "",
      gridImageUrl: "",
      overview: "",
      sortOrder: "0",
      durationLabel: "",
      durationWeeks: "0",
      durationSortOrder: "0",
      locationCode: "",
      amount: "0",
      currencyCode: "",
      currencySymbol: "",
      whatYouGet: "",
      whoIsThisFor: "",
      tags: "",
      detailHeading: "",
      detailDescription: "",
      detailSortOrder: "0",
    });
    setProgramCreateError(null);
    setProgramCreateSuccess(null);
    setIsProgramModalOpen(true);
  };

  const handleProgramDelete = (programId: string) => {
    setProgramCreateError(null);
    setProgramCreateSuccess(null);
    setDeletingProgramId(programId);
    setPrograms((prev) => prev.filter((program) => program.id !== programId));
    if (editingProgramId === programId) closeProgramModal();
    setProgramCreateSuccess("Program deleted.");
    setDeletingProgramId(null);
  };

  return (
    <section className="page page--adminDashboard">
      <h1 className="page__title">Admin Dashboard</h1>
      <p className="page__lead">
        Manage platform users, domains, categories, and programs from a single
        admin workspace.
      </p>

      <div className="adminContent">
        <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "users" && (
          <UsersTab registeredUsers={registeredUsers} />
        )}

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
            editingProgramId={editingProgramId}
            programs={programs}
            categories={categories}
            onStartEdit={startProgramEdit}
            onDelete={handleProgramDelete}
            deletingProgramId={deletingProgramId}
          />
        )}
      </div>
    </section>
  );
}
