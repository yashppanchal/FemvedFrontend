import type { FormEvent } from "react";
import type { CategoryForm, CategoryRow, DomainRow } from "./types";

type CategoriesTabProps = {
  categoryCreateSuccess: string | null;
  categoryCreateError: string | null;
  categories: CategoryRow[];
  domains: DomainRow[];
  onOpenAddModal: () => void;
  onStartEdit: (category: CategoryRow) => void;
  onDelete: (categoryId: string) => void;
  isCategoryModalOpen: boolean;
  editingCategoryId: string | null;
  onCloseModal: () => void;
  isCreatingCategory: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  categoryForm: CategoryForm;
  onCategoryFormChange: (updater: (prev: CategoryForm) => CategoryForm) => void;
  categoriesForSelectedCategoryDomain: CategoryRow[];
};

export function CategoriesTab({
  categoryCreateSuccess,
  categoryCreateError,
  categories,
  domains,
  onOpenAddModal,
  onStartEdit,
  onDelete,
  isCategoryModalOpen,
  editingCategoryId,
  onCloseModal,
  isCreatingCategory,
  onSubmit,
  categoryForm,
  onCategoryFormChange,
  categoriesForSelectedCategoryDomain,
}: CategoriesTabProps) {
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
      {categoryCreateError && <p className="adminPanel__error">{categoryCreateError}</p>}

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
                  <td>
                    {domains.find((domain) => domain.id === category.domainId)?.name ??
                      "-"}
                  </td>
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

      {isCategoryModalOpen && (
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

            <form className="form adminForm" onSubmit={onSubmit} noValidate>
              <div className="adminForm__row adminForm__row--two">
                <label className="field">
                  <span className="field__label">Domain</span>
                  <select
                    className="field__input"
                    value={categoryForm.domainId}
                    onChange={(e) =>
                      onCategoryFormChange((prev) => ({
                        ...prev,
                        domainId: e.target.value,
                        parentId: "",
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
                  <span className="field__label">Name</span>
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
                  <span className="field__label">Slug</span>
                  <input
                    className="field__input"
                    type="text"
                    value={categoryForm.slug}
                    onChange={(e) =>
                      onCategoryFormChange((prev) => ({
                        ...prev,
                        slug: e.target.value,
                      }))
                    }
                    placeholder="auto-generated if blank"
                  />
                </label>

                <label className="field">
                  <span className="field__label">Category Type</span>
                  <input
                    className="field__input"
                    type="text"
                    value={categoryForm.categoryType}
                    onChange={(e) =>
                      onCategoryFormChange((prev) => ({
                        ...prev,
                        categoryType: e.target.value,
                      }))
                    }
                    placeholder="Defaults to name"
                  />
                </label>
              </div>

              <div className="adminForm__row adminForm__row--two">
                <label className="field">
                  <span className="field__label">Hero Title</span>
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
                    placeholder="Defaults to name"
                  />
                </label>

                <label className="field">
                  <span className="field__label">Hero Subtext</span>
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
                    placeholder="Optional hero description"
                  />
                </label>
              </div>

              <div className="adminForm__row adminForm__row--two">
                <label className="field">
                  <span className="field__label">CTA Label</span>
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
                    placeholder="Optional CTA label"
                  />
                </label>

                <label className="field">
                  <span className="field__label">CTA Link</span>
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
                    placeholder="https://example.com"
                  />
                </label>
              </div>

              <div className="adminForm__row adminForm__row--two">
                <label className="field">
                  <span className="field__label">Page Header</span>
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
                    placeholder="Defaults to name"
                  />
                </label>

                <label className="field">
                  <span className="field__label">Image URL</span>
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
                  <span className="field__label">Sort Order</span>
                  <input
                    className="field__input"
                    type="number"
                    min={0}
                    value={categoryForm.sortOrder}
                    onChange={(e) =>
                      onCategoryFormChange((prev) => ({
                        ...prev,
                        sortOrder: e.target.value,
                      }))
                    }
                    placeholder="auto if blank"
                  />
                </label>

                <label className="field">
                  <span className="field__label">Parent Category</span>
                  <select
                    className="field__input"
                    value={categoryForm.parentId}
                    onChange={(e) =>
                      onCategoryFormChange((prev) => ({
                        ...prev,
                        parentId: e.target.value,
                      }))
                    }
                    disabled={!categoryForm.domainId}
                  >
                    <option value="">
                      {categoryForm.domainId ? "No parent" : "Select domain first"}
                    </option>
                    {categoriesForSelectedCategoryDomain.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
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
      )}
    </section>
  );
}
