import type { FormEvent } from "react";
import type { CategoryRow, DomainRow, ProgramForm, ProgramRow } from "./types";

type ProgramsTabProps = {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  programForm: ProgramForm;
  onProgramFormChange: (updater: (prev: ProgramForm) => ProgramForm) => void;
  domains: DomainRow[];
  categoriesForProgramDomain: CategoryRow[];
  editingProgramId: string | null;
  onCancelEdit: () => void;
  programs: ProgramRow[];
  categories: CategoryRow[];
  onStartEdit: (program: ProgramRow) => void;
  onDelete: (programId: string) => void;
};

export function ProgramsTab({
  onSubmit,
  programForm,
  onProgramFormChange,
  domains,
  categoriesForProgramDomain,
  editingProgramId,
  onCancelEdit,
  programs,
  categories,
  onStartEdit,
  onDelete,
}: ProgramsTabProps) {
  return (
    <section className="adminPanel" role="tabpanel" aria-label="Programs">
      <div className="adminPanel__header">
        <h2 className="adminPanel__title">Programs</h2>
        <p className="adminPanel__hint">
          Program hierarchy: Domain {">"} Category {">"} Program.
        </p>
      </div>

      <form className="form adminForm" onSubmit={onSubmit} noValidate>
        <div className="adminForm__row">
          <label className="field">
            <span className="field__label">Program title</span>
            <input
              className="field__input"
              type="text"
              value={programForm.title}
              onChange={(e) =>
                onProgramFormChange((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
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
                onProgramFormChange((prev) => ({
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
                onProgramFormChange((prev) => ({
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
                onProgramFormChange((prev) => ({
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
            <button
              type="button"
              className="adminActionButton"
              onClick={onCancelEdit}
            >
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
                  <td>
                    {domains.find((domain) => domain.id === program.domainId)?.name ?? "-"}
                  </td>
                  <td>
                    {categories.find((category) => category.id === program.categoryId)
                      ?.name ?? "-"}
                  </td>
                  <td>{program.status}</td>
                  <td>
                    <div className="adminActionGroup">
                      <button
                        type="button"
                        className="adminActionButton"
                        onClick={() => onStartEdit(program)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="adminActionButton adminActionButton--danger"
                        onClick={() => onDelete(program.id)}
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
  );
}
