import { type FormEvent, useState } from "react";
import { createPortal } from "react-dom";
import type { CategoryForm, CategoryRow, DomainRow } from "./types";

const PAGE_SIZE = 15;

type CategoriesTabProps = {
  categoryCreateSuccess: string | null;
  categoryCreateError: string | null;
  categories: CategoryRow[];
  domains: DomainRow[];
  onOpenAddModal: () => void;
  onStartEdit: (category: CategoryRow) => void;
  onDelete: (categoryId: string) => void;
  deletingCategoryId: string | null;
  isCategoryModalOpen: boolean;
  editingCategoryId: string | null;
  onCloseModal: () => void;
  isCreatingCategory: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  categoryForm: CategoryForm;
  onCategoryFormChange: (updater: (prev: CategoryForm) => CategoryForm) => void;
};

export function CategoriesTab({
  categoryCreateSuccess,
  categoryCreateError,
  categories,
  domains,
  onOpenAddModal,
  onStartEdit,
  onDelete,
  deletingCategoryId,
  isCategoryModalOpen,
  editingCategoryId,
  onCloseModal,
  isCreatingCategory,
  onSubmit,
  categoryForm,
  onCategoryFormChange,
}: CategoriesTabProps) {
  const [page, setPage] = useState(1);

  const categoryModal = isCategoryModalOpen ? (
    <div className="adminModalBackdrop" role="presentation">
      <section
        className="adminModal"
        role="dialog"
        aria-modal="true"
        aria-label={editingCategoryId ? "Edit category" : "Create category"}
      >
        <div className="adminModal__header">
          <h3 className="adminModal__title">
            {editingCategoryId ? "Edit Category" : "Add Category"}
          </h3>
          <button
            type="button"
            className="adminActionButton"
            onClick={onCloseModal}
            disabled={isCreatingCategory}
          >
            Close
          </button>
        </div>

        {categoryCreateError && <p className="adminPanel__error">{categoryCreateError}</p>}

        <form className="form adminForm" onSubmit={onSubmit} noValidate>
          <div className="adminForm__row adminForm__row--two">
            <label className="field">
              <span className="field__label">Domain (e.g., Guided 1:1 Care)</span>
              <select
                className="field__input"
                value={categoryForm.domainId}
                onChange={(e) =>
                  onCategoryFormChange((prev) => ({
                    ...prev,
                    domainId: e.target.value,
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
              <span className="field__label">Name (e.g., PCOS Support)</span>
              <input
                className="field__input"
                type="text"
                value={categoryForm.name}
                onChange={(e) =>
                  onCategoryFormChange((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Category name"
                required
              />
            </label>
          </div>

          <div className="adminForm__row adminForm__row--two">
            <label className="field">
              <span className="field__label">
                Page Banner Heading (e.g., Balance Your Hormones Naturally)
              </span>
              <input
                className="field__input"
                type="text"
                value={categoryForm.heroTitle}
                onChange={(e) =>
                  onCategoryFormChange((prev) => ({
                    ...prev,
                    heroTitle: e.target.value,
                  }))
                }
                placeholder="Big heading visitors see at the top of the page"
                required
              />
            </label>

            <label className="field">
              <span className="field__label">
                Banner Subtext (e.g., Practical plans tailored to your cycle)
              </span>
              <input
                className="field__input"
                type="text"
                value={categoryForm.heroSubtext}
                onChange={(e) =>
                  onCategoryFormChange((prev) => ({
                    ...prev,
                    heroSubtext: e.target.value,
                  }))
                }
                placeholder="Short description shown below the banner heading"
              />
            </label>
          </div>

          <div className="adminForm__row adminForm__row--two">
            <label className="field">
              <span className="field__label">Button Text (e.g., Start Journey)</span>
              <input
                className="field__input"
                type="text"
                value={categoryForm.ctaLabel}
                onChange={(e) =>
                  onCategoryFormChange((prev) => ({
                    ...prev,
                    ctaLabel: e.target.value,
                  }))
                }
                placeholder="Label shown on the call-to-action button (optional)"
              />
            </label>

            <label className="field">
              <span className="field__label">
                Button URL (e.g., https://femved.com/programs/pcos)
              </span>
              <input
                className="field__input"
                type="url"
                value={categoryForm.ctaLink}
                onChange={(e) =>
                  onCategoryFormChange((prev) => ({
                    ...prev,
                    ctaLink: e.target.value,
                  }))
                }
                placeholder="Where the button takes users (optional)"
              />
            </label>
          </div>

          <div className="adminForm__row adminForm__row--two">
            <label className="field">
              <span className="field__label">
                Programs Section Title (e.g., PCOS Recovery Programs)
              </span>
              <input
                className="field__input"
                type="text"
                value={categoryForm.pageHeader}
                onChange={(e) =>
                  onCategoryFormChange((prev) => ({
                    ...prev,
                    pageHeader: e.target.value,
                  }))
                }
                placeholder="Heading shown above the list of programs on this page"
                required
              />
            </label>

            <label className="field">
              <span className="field__label">
                Image URL (e.g., https://images.example.com/pcos.jpg)
              </span>
              <input
                className="field__input"
                type="url"
                value={categoryForm.imageUrl}
                onChange={(e) =>
                  onCategoryFormChange((prev) => ({
                    ...prev,
                    imageUrl: e.target.value,
                  }))
                }
                placeholder="https://..."
              />
            </label>
          </div>

          <div className="adminForm__row adminForm__row--two">
            <label className="field">
              <span className="field__label">
                What's Included (one per line or comma-separated)
              </span>
              <textarea
                className="field__input"
                value={categoryForm.whatsIncluded}
                onChange={(e) =>
                  onCategoryFormChange((prev) => ({
                    ...prev,
                    whatsIncluded: e.target.value,
                  }))
                }
                rows={4}
                placeholder={"Meal plans\nExpert consults"}
              />
            </label>

            <label className="field">
              <span className="field__label">
                Key Areas (one per line or comma-separated)
              </span>
              <textarea
                className="field__input"
                value={categoryForm.keyAreas}
                onChange={(e) =>
                  onCategoryFormChange((prev) => ({
                    ...prev,
                    keyAreas: e.target.value,
                  }))
                }
                rows={4}
                placeholder={"Nutrition\nHormones"}
              />
            </label>
          </div>

          <div className="adminForm__actions">
            <button type="submit" className="button" disabled={isCreatingCategory}>
              {editingCategoryId
                ? isCreatingCategory
                  ? "Updating Category..."
                  : "Update Category"
                : isCreatingCategory
                  ? "Adding Category..."
                  : "Add Category"}
            </button>
            <button
              type="button"
              className="adminActionButton"
              onClick={onCloseModal}
              disabled={isCreatingCategory}
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </div>
  ) : null;

  return (
    <section className="adminPanel" role="tabpanel" aria-label="Categories">
      <div className="adminPanel__header">
        <h2 className="adminPanel__title">Categories</h2>
        <p className="adminPanel__hint">Create categories under each domain.</p>
        <button type="button" className="button" onClick={onOpenAddModal}>
          Add Category
        </button>
      </div>

      {categoryCreateSuccess && (
        <p className="adminPanel__success">{categoryCreateSuccess}</p>
      )}

      {Math.ceil(categories.length / PAGE_SIZE) > 1 && (
        <div className="adminPanel__pagination">
          <button type="button" className="adminActionButton" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>Page {page} of {Math.ceil(categories.length / PAGE_SIZE)}</span>
          <button type="button" className="adminActionButton" disabled={page >= Math.ceil(categories.length / PAGE_SIZE)} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}

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
              categories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{domains.find((domain) => domain.id === category.domainId)?.name}</td>
                  <td>
                    <div className="adminActionGroup">
                      <button
                        type="button"
                        className="adminActionButton"
                        onClick={() => onStartEdit(category)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="adminActionButton adminActionButton--danger"
                        onClick={() => onDelete(category.id)}
                        disabled={deletingCategoryId === category.id}
                      >
                        {deletingCategoryId === category.id ? "Archiving..." : "Archive"}
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

      {categoryModal &&
        (typeof document !== "undefined"
          ? createPortal(categoryModal, document.body)
          : categoryModal)}
    </section>
  );
}
