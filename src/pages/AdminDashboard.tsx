import { type FormEvent, useState } from "react";
import "./AdminDashboard.scss";

type AdminTab = "users" | "domains" | "categories" | "programs";

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
};

type DomainRow = {
  id: string;
  name: string;
};

type CategoryRow = {
  id: string;
  name: string;
  domainId: string;
};

type ProgramRow = {
  id: string;
  title: string;
  domainId: string;
  categoryId: string;
  status: "Draft" | "Published";
};

type DomainForm = {
  name: string;
};

type CategoryForm = {
  name: string;
  domainId: string;
};

type ProgramForm = {
  title: string;
  domainId: string;
  categoryId: string;
  status: "Draft" | "Published";
};

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

const domainsSeed: DomainRow[] = [
  { id: "D001", name: "Hormonal Health" },
  { id: "D002", name: "Nutrition" },
];

const categoriesSeed: CategoryRow[] = [
  { id: "C001", name: "PCOS", domainId: "D001" },
  { id: "C002", name: "Cycle Care", domainId: "D001" },
  { id: "C003", name: "Gut Wellness", domainId: "D002" },
];

const programsSeed: ProgramRow[] = [
  {
    id: "P001",
    title: "PCOS Reset Journey",
    domainId: "D001",
    categoryId: "C001",
    status: "Published",
  },
  {
    id: "P002",
    title: "Cycle Sync Basics",
    domainId: "D001",
    categoryId: "C002",
    status: "Draft",
  },
];

const initialDomainForm: DomainForm = {
  name: "",
};

const initialCategoryForm: CategoryForm = {
  name: "",
  domainId: "",
};

const initialProgramForm: ProgramForm = {
  title: "",
  domainId: "",
  categoryId: "",
  status: "Draft",
};

const createNextId = (prefix: string, existingIds: string[]) => {
  const maxNumericPart = existingIds.reduce((maxValue, currentId) => {
    const value = Number(currentId.replace(prefix, ""));
    if (Number.isNaN(value)) return maxValue;
    return Math.max(maxValue, value);
  }, 0);

  return `${prefix}${String(maxNumericPart + 1).padStart(3, "0")}`;
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [registeredUsers] = useState<UserRow[]>(registeredUsersSeed);
  const [domains, setDomains] = useState<DomainRow[]>(domainsSeed);
  const [categories, setCategories] = useState<CategoryRow[]>(categoriesSeed);
  const [programs, setPrograms] = useState<ProgramRow[]>(programsSeed);

  const [domainForm, setDomainForm] = useState<DomainForm>(initialDomainForm);
  const [editingDomainId, setEditingDomainId] = useState<string | null>(null);

  const [categoryForm, setCategoryForm] = useState<CategoryForm>(initialCategoryForm);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const [programForm, setProgramForm] = useState<ProgramForm>(initialProgramForm);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);

  const categoriesForProgramDomain = categories.filter(
    (category) => category.domainId === programForm.domainId,
  );

  const resetDomainForm = () => {
    setDomainForm(initialDomainForm);
    setEditingDomainId(null);
  };

  const resetCategoryForm = () => {
    setCategoryForm(initialCategoryForm);
    setEditingCategoryId(null);
  };

  const resetProgramForm = () => {
    setProgramForm(initialProgramForm);
    setEditingProgramId(null);
  };

  const handleDomainSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const name = domainForm.name.trim();
    if (!name) return;

    if (editingDomainId) {
      setDomains((prev) =>
        prev.map((domain) => (domain.id === editingDomainId ? { ...domain, name } : domain)),
      );
      resetDomainForm();
      return;
    }

    const newDomain: DomainRow = {
      id: createNextId(
        "D",
        domains.map((domain) => domain.id),
      ),
      name,
    };

    setDomains((prev) => [newDomain, ...prev]);
    resetDomainForm();
  };

  const startDomainEdit = (domain: DomainRow) => {
    setEditingDomainId(domain.id);
    setDomainForm({ name: domain.name });
  };

  const handleDomainDelete = (domainId: string) => {
    const categoryIdsInDomain = categories
      .filter((category) => category.domainId === domainId)
      .map((category) => category.id);

    setDomains((prev) => prev.filter((domain) => domain.id !== domainId));
    setCategories((prev) => prev.filter((category) => category.domainId !== domainId));
    setPrograms((prev) =>
      prev.filter(
        (program) =>
          program.domainId !== domainId && !categoryIdsInDomain.includes(program.categoryId),
      ),
    );

    if (editingDomainId === domainId) resetDomainForm();
    if (categoryForm.domainId === domainId) resetCategoryForm();
    if (programForm.domainId === domainId) resetProgramForm();
  };

  const handleCategorySubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const name = categoryForm.name.trim();
    if (!name || !categoryForm.domainId) return;

    if (editingCategoryId) {
      setCategories((prev) =>
        prev.map((category) =>
          category.id === editingCategoryId
            ? { ...category, name, domainId: categoryForm.domainId }
            : category,
        ),
      );

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

      resetCategoryForm();
      return;
    }

    const newCategory: CategoryRow = {
      id: createNextId(
        "C",
        categories.map((category) => category.id),
      ),
      name,
      domainId: categoryForm.domainId,
    };

    setCategories((prev) => [newCategory, ...prev]);
    resetCategoryForm();
  };

  const startCategoryEdit = (category: CategoryRow) => {
    setEditingCategoryId(category.id);
    setCategoryForm({
      name: category.name,
      domainId: category.domainId,
    });
  };

  const handleCategoryDelete = (categoryId: string) => {
    setCategories((prev) => prev.filter((category) => category.id !== categoryId));
    setPrograms((prev) => prev.filter((program) => program.categoryId !== categoryId));

    if (editingCategoryId === categoryId) resetCategoryForm();
    if (programForm.categoryId === categoryId) {
      setProgramForm((prev) => ({ ...prev, categoryId: "" }));
    }
  };

  const handleProgramSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const title = programForm.title.trim();
    if (!title || !programForm.domainId || !programForm.categoryId) return;

    if (editingProgramId) {
      setPrograms((prev) =>
        prev.map((program) =>
          program.id === editingProgramId
            ? {
                ...program,
                title,
                domainId: programForm.domainId,
                categoryId: programForm.categoryId,
                status: programForm.status,
              }
            : program,
        ),
      );
      resetProgramForm();
      return;
    }

    const newProgram: ProgramRow = {
      id: createNextId(
        "P",
        programs.map((program) => program.id),
      ),
      title,
      domainId: programForm.domainId,
      categoryId: programForm.categoryId,
      status: programForm.status,
    };

    setPrograms((prev) => [newProgram, ...prev]);
    resetProgramForm();
  };

  const startProgramEdit = (program: ProgramRow) => {
    setEditingProgramId(program.id);
    setProgramForm({
      title: program.title,
      domainId: program.domainId,
      categoryId: program.categoryId,
      status: program.status,
    });
  };

  const handleProgramDelete = (programId: string) => {
    setPrograms((prev) => prev.filter((program) => program.id !== programId));
    if (editingProgramId === programId) resetProgramForm();
  };

  return (
    <section className="page page--adminDashboard">
      <h1 className="page__title">Admin Dashboard</h1>
      <p className="page__lead">
        Manage platform users, domains, categories, and programs from a single admin workspace.
      </p>

      <div className="adminContent">
        <div className="adminTabs" role="tablist" aria-label="Admin dashboard sections">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "users"}
            className={`adminTabs__tab ${activeTab === "users" ? "adminTabs__tab--active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "domains"}
            className={`adminTabs__tab ${activeTab === "domains" ? "adminTabs__tab--active" : ""}`}
            onClick={() => setActiveTab("domains")}
          >
            Domains
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "categories"}
            className={`adminTabs__tab ${activeTab === "categories" ? "adminTabs__tab--active" : ""}`}
            onClick={() => setActiveTab("categories")}
          >
            Categories
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "programs"}
            className={`adminTabs__tab ${activeTab === "programs" ? "adminTabs__tab--active" : ""}`}
            onClick={() => setActiveTab("programs")}
          >
            Programs
          </button>
        </div>

        {activeTab === "users" && (
          <section className="adminPanel" role="tabpanel" aria-label="Users">
            <h2 className="adminPanel__title">Registered Users</h2>
            <div className="adminTableWrap">
              <table className="adminTable">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {registeredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>{user.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "domains" && (
          <section className="adminPanel" role="tabpanel" aria-label="Domains">
            <div className="adminPanel__header">
              <h2 className="adminPanel__title">Domains</h2>
              <p className="adminPanel__hint">Create top-level program domains.</p>
            </div>

            <form className="form adminForm" onSubmit={handleDomainSubmit} noValidate>
              <label className="field">
                <span className="field__label">Domain name</span>
                <input
                  className="field__input"
                  type="text"
                  value={domainForm.name}
                  onChange={(e) => setDomainForm({ name: e.target.value })}
                  placeholder="Enter domain name"
                  required
                />
              </label>

              <div className="adminForm__actions">
                <button type="submit" className="button">
                  {editingDomainId ? "Update Domain" : "Add Domain"}
                </button>
                {editingDomainId && (
                  <button type="button" className="adminActionButton" onClick={resetDomainForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="adminTableWrap">
              <table className="adminTable">
                <thead>
                  <tr>
                    <th>Domain</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {domains.length > 0 ? (
                    domains.map((domain) => (
                      <tr key={domain.id}>
                        <td>{domain.name}</td>
                        <td>
                          <div className="adminActionGroup">
                            <button
                              type="button"
                              className="adminActionButton"
                              onClick={() => startDomainEdit(domain)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="adminActionButton adminActionButton--danger"
                              onClick={() => handleDomainDelete(domain.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="adminTable__empty">
                        No domains yet. Add one to begin.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "categories" && (
          <section className="adminPanel" role="tabpanel" aria-label="Categories">
            <div className="adminPanel__header">
              <h2 className="adminPanel__title">Categories</h2>
              <p className="adminPanel__hint">Create categories under each domain.</p>
            </div>

            <form className="form adminForm" onSubmit={handleCategorySubmit} noValidate>
              <div className="adminForm__row adminForm__row--two">
                <label className="field">
                  <span className="field__label">Domain</span>
                  <select
                    className="field__input"
                    value={categoryForm.domainId}
                    onChange={(e) =>
                      setCategoryForm((prev) => ({ ...prev, domainId: e.target.value }))
                    }
                    required
                  >
                    <option value="">Select domain</option>
                    {domains.map((domain) => (
                      <option key={domain.id} value={domain.id}>
                        {domain.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span className="field__label">Category name</span>
                  <input
                    className="field__input"
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter category name"
                    required
                  />
                </label>
              </div>

              <div className="adminForm__actions">
                <button type="submit" className="button">
                  {editingCategoryId ? "Update Category" : "Add Category"}
                </button>
                {editingCategoryId && (
                  <button type="button" className="adminActionButton" onClick={resetCategoryForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="adminTableWrap">
              <table className="adminTable">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Domain</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <tr key={category.id}>
                        <td>{category.name}</td>
                        <td>{domains.find((domain) => domain.id === category.domainId)?.name ?? "-"}</td>
                        <td>
                          <div className="adminActionGroup">
                            <button
                              type="button"
                              className="adminActionButton"
                              onClick={() => startCategoryEdit(category)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="adminActionButton adminActionButton--danger"
                              onClick={() => handleCategoryDelete(category.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="adminTable__empty">
                        No categories yet. Add one to begin.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "programs" && (
          <section className="adminPanel" role="tabpanel" aria-label="Programs">
            <div className="adminPanel__header">
              <h2 className="adminPanel__title">Programs</h2>
              <p className="adminPanel__hint">
                Program hierarchy: Domain {">"} Category {">"} Program.
              </p>
            </div>

            <form className="form adminForm" onSubmit={handleProgramSubmit} noValidate>
              <div className="adminForm__row">
                <label className="field">
                  <span className="field__label">Program title</span>
                  <input
                    className="field__input"
                    type="text"
                    value={programForm.title}
                    onChange={(e) => setProgramForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter program title"
                    required
                  />
                </label>

                <label className="field">
                  <span className="field__label">Domain</span>
                  <select
                    className="field__input"
                    value={programForm.domainId}
                    onChange={(e) =>
                      setProgramForm((prev) => ({
                        ...prev,
                        domainId: e.target.value,
                        categoryId: "",
                      }))
                    }
                    required
                  >
                    <option value="">Select domain</option>
                    {domains.map((domain) => (
                      <option key={domain.id} value={domain.id}>
                        {domain.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span className="field__label">Category</span>
                  <select
                    className="field__input"
                    value={programForm.categoryId}
                    onChange={(e) =>
                      setProgramForm((prev) => ({
                        ...prev,
                        categoryId: e.target.value,
                      }))
                    }
                    required
                    disabled={!programForm.domainId}
                  >
                    <option value="">
                      {programForm.domainId ? "Select category" : "Select domain first"}
                    </option>
                    {categoriesForProgramDomain.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span className="field__label">Status</span>
                  <select
                    className="field__input"
                    value={programForm.status}
                    onChange={(e) =>
                      setProgramForm((prev) => ({
                        ...prev,
                        status: e.target.value as ProgramForm["status"],
                      }))
                    }
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </select>
                </label>
              </div>

              <div className="adminForm__actions">
                <button type="submit" className="button">
                  {editingProgramId ? "Update Program" : "Add Program"}
                </button>
                {editingProgramId && (
                  <button type="button" className="adminActionButton" onClick={resetProgramForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="adminTableWrap">
              <table className="adminTable">
                <thead>
                  <tr>
                    <th>Program</th>
                    <th>Domain</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.length > 0 ? (
                    programs.map((program) => (
                      <tr key={program.id}>
                        <td>{program.title}</td>
                        <td>{domains.find((domain) => domain.id === program.domainId)?.name ?? "-"}</td>
                        <td>
                          {categories.find((category) => category.id === program.categoryId)?.name ??
                            "-"}
                        </td>
                        <td>{program.status}</td>
                        <td>
                          <div className="adminActionGroup">
                            <button
                              type="button"
                              className="adminActionButton"
                              onClick={() => startProgramEdit(program)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="adminActionButton adminActionButton--danger"
                              onClick={() => handleProgramDelete(program.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="adminTable__empty">
                        No programs yet. Add one to begin.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </section>
  );
}
