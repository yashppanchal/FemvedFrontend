import { type FormEvent, useState } from "react";
import "./AdminDashboard.scss";

type AdminTab = "users" | "programs";

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
};

type ProgramRow = {
  id: string;
  title: string;
  category: string;
  status: "Draft" | "Published";
};

type ProgramForm = {
  title: string;
  category: string;
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

const programsSeed: ProgramRow[] = [
  { id: "P001", title: "PCOS Reset Journey", category: "Guided Care", status: "Published" },
  { id: "P002", title: "Cycle Sync Basics", category: "Self-Paced", status: "Draft" },
];

const initialProgramForm: ProgramForm = {
  title: "",
  category: "",
  status: "Draft",
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [registeredUsers] = useState<UserRow[]>(registeredUsersSeed);
  const [programs, setPrograms] = useState<ProgramRow[]>(programsSeed);
  const [programForm, setProgramForm] = useState<ProgramForm>(initialProgramForm);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);

  const resetProgramForm = () => {
    setProgramForm(initialProgramForm);
    setEditingProgramId(null);
  };

  const handleProgramSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const title = programForm.title.trim();
    const category = programForm.category.trim();
    if (!title || !category) return;

    if (editingProgramId) {
      setPrograms((prev) =>
        prev.map((program) =>
          program.id === editingProgramId
            ? { ...program, title, category, status: programForm.status }
            : program,
        ),
      );
      resetProgramForm();
      return;
    }

    const newProgram: ProgramRow = {
      id: `P${String(programs.length + 1).padStart(3, "0")}`,
      title,
      category,
      status: programForm.status,
    };

    setPrograms((prev) => [newProgram, ...prev]);
    resetProgramForm();
  };

  const startProgramEdit = (program: ProgramRow) => {
    setEditingProgramId(program.id);
    setProgramForm({
      title: program.title,
      category: program.category,
      status: program.status,
    });
  };

  const handleProgramDelete = (programId: string) => {
    setPrograms((prev) => prev.filter((program) => program.id !== programId));
    if (editingProgramId === programId) {
      resetProgramForm();
    }
  };

  return (
    <section className="page page--adminDashboard">
      <h1 className="page__title">Admin Dashboard</h1>
      <p className="page__lead">
        Manage platform users and programs from a single admin workspace.
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

        {activeTab === "programs" && (
          <section className="adminPanel" role="tabpanel" aria-label="Programs">
            <div className="adminPanel__header">
              <h2 className="adminPanel__title">Programs</h2>
              <p className="adminPanel__hint">
                Structure is ready. API endpoints can be connected later.
              </p>
            </div>

            <form className="form adminProgramForm" onSubmit={handleProgramSubmit} noValidate>
              <div className="adminProgramForm__row">
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
                  <span className="field__label">Category</span>
                  <input
                    className="field__input"
                    type="text"
                    value={programForm.category}
                    onChange={(e) =>
                      setProgramForm((prev) => ({ ...prev, category: e.target.value }))
                    }
                    placeholder="Guided Care / Self-Paced"
                    required
                  />
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

              <div className="adminProgramForm__actions">
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
                        <td>{program.category}</td>
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
                      <td colSpan={4} className="adminTable__empty">
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
