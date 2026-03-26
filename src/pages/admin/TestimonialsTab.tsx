import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  getAdminPrograms,
  getProgramTestimonials,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  type AdminProgram,
  type Testimonial,
} from "../../api/admin";
import { ApiError } from "../../api/client";
import { PAGE_SIZE } from "../../constants";
import { useEscapeKey } from "../../useEscapeKey";

type TestimonialForm = {
  reviewerName: string;
  reviewerTitle: string;
  reviewText: string;
  rating: string;
  sortOrder: string;
};

const initialForm: TestimonialForm = {
  reviewerName: "",
  reviewerTitle: "",
  reviewText: "",
  rating: "",
  sortOrder: "0",
};

export default function TestimonialsTab() {
  const [programs, setPrograms] = useState<AdminProgram[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTestimonials, setLoadingTestimonials] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TestimonialForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Load programs list
  useEffect(() => {
    setLoading(true);
    getAdminPrograms()
      .then((data) => {
        const published = data.filter((p) => !p.isDeleted);
        setPrograms(published);
        if (published.length > 0 && !selectedProgramId) {
          setSelectedProgramId(published[0].programId);
        }
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load programs."))
      .finally(() => setLoading(false));
  }, []);

  // Load testimonials when program changes
  useEffect(() => {
    if (!selectedProgramId) {
      setTestimonials([]);
      return;
    }
    setLoadingTestimonials(true);
    setActionError(null);
    getProgramTestimonials(selectedProgramId)
      .then(setTestimonials)
      .catch((err) => setActionError(err instanceof ApiError ? err.message : "Failed to load testimonials."))
      .finally(() => setLoadingTestimonials(false));
  }, [selectedProgramId]);

  // Reset page on program change
  useEffect(() => { setPage(1); }, [selectedProgramId]);

  // Clear success message after timeout
  useEffect(() => {
    if (!actionSuccess) return;
    const timer = setTimeout(() => setActionSuccess(null), 5000);
    return () => clearTimeout(timer);
  }, [actionSuccess]);

  const selectedProgram = useMemo(
    () => programs.find((p) => p.programId === selectedProgramId),
    [programs, selectedProgramId],
  );

  const sorted = useMemo(
    () => [...testimonials].sort((a, b) => a.sortOrder - b.sortOrder),
    [testimonials],
  );

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAddModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setIsModalOpen(true);
    setActionError(null);
  };

  const openEditModal = (t: Testimonial) => {
    setEditingId(t.testimonialId);
    setForm({
      reviewerName: t.reviewerName,
      reviewerTitle: t.reviewerTitle ?? "",
      reviewText: t.reviewText,
      rating: t.rating != null ? String(t.rating) : "",
      sortOrder: String(t.sortOrder),
    });
    setIsModalOpen(true);
    setActionError(null);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    setEditingId(null);
    setForm(initialForm);
  };

  useEscapeKey(closeModal, isModalOpen);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProgramId) return;

    const trimmedName = form.reviewerName.trim();
    const trimmedText = form.reviewText.trim();
    if (!trimmedName || !trimmedText) {
      setActionError("Reviewer name and review text are required.");
      return;
    }

    setSaving(true);
    setActionError(null);

    try {
      const ratingNum = form.rating.trim() ? Number(form.rating) : undefined;
      const sortNum = form.sortOrder.trim() ? Number(form.sortOrder) : 0;

      if (editingId) {
        await updateTestimonial(selectedProgramId, editingId, {
          reviewerName: trimmedName,
          reviewerTitle: form.reviewerTitle.trim() || undefined,
          reviewText: trimmedText,
          rating: ratingNum ?? null,
          sortOrder: sortNum,
        });
        setTestimonials((prev) =>
          prev.map((t) =>
            t.testimonialId === editingId
              ? { ...t, reviewerName: trimmedName, reviewerTitle: form.reviewerTitle.trim() || null, reviewText: trimmedText, rating: ratingNum ?? null, sortOrder: sortNum }
              : t,
          ),
        );
        setActionSuccess("Testimonial updated.");
      } else {
        await addTestimonial(selectedProgramId, {
          reviewerName: trimmedName,
          reviewerTitle: form.reviewerTitle.trim() || undefined,
          reviewText: trimmedText,
          rating: ratingNum,
          sortOrder: sortNum,
        });
        // Reload testimonials to get the full object from server
        const fresh = await getProgramTestimonials(selectedProgramId);
        setTestimonials(fresh);
        setActionSuccess("Testimonial added.");
      }
      closeModal();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to save testimonial.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (testimonialId: string) => {
    if (!confirm("Delete this testimonial? This cannot be undone.")) return;
    setDeletingId(testimonialId);
    setActionError(null);
    try {
      await deleteTestimonial(selectedProgramId, testimonialId);
      setTestimonials((prev) => prev.filter((t) => t.testimonialId !== testimonialId));
      setActionSuccess("Testimonial deleted.");
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to delete testimonial.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (t: Testimonial) => {
    setActionError(null);
    try {
      await updateTestimonial(selectedProgramId, t.testimonialId, { isActive: !t.isActive });
      setTestimonials((prev) =>
        prev.map((item) =>
          item.testimonialId === t.testimonialId ? { ...item, isActive: !t.isActive } : item,
        ),
      );
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to toggle status.");
    }
  };

  if (loading) return <p className="adminPanel__loading">Loading programs…</p>;
  if (error) return <p className="adminPanel__error">{error}</p>;

  return (
    <>
      <div className="adminPanel__toolbar">
        <div className="adminPanel__segmented">
          <label htmlFor="testimonial-program-select">Program:</label>
          <select
            id="testimonial-program-select"
            value={selectedProgramId}
            onChange={(e) => setSelectedProgramId(e.target.value)}
          >
            {programs.length === 0 && <option value="">No programs</option>}
            {programs.map((p) => (
              <option key={p.programId} value={p.programId}>
                {p.name ?? "Untitled"} ({p.status})
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="adminPanel__addBtn" onClick={openAddModal} disabled={!selectedProgramId}>
          + Add Testimonial
        </button>
      </div>

      {actionError && <p className="adminPanel__error">{actionError}</p>}
      {actionSuccess && <p className="adminPanel__success">{actionSuccess}</p>}

      {selectedProgram && (
        <div className="adminPanel__infoBox">
          <p className="adminPanel__infoTitle">
            Testimonials for: <strong>{selectedProgram.name ?? "Untitled"}</strong>
            {" "}— {testimonials.length} total
          </p>
        </div>
      )}

      {loadingTestimonials ? (
        <p className="adminPanel__loading">Loading testimonials…</p>
      ) : sorted.length === 0 ? (
        <p className="adminPanel__empty">No testimonials for this program yet. Click "+ Add Testimonial" to create one.</p>
      ) : (
        <>
          <div className="adminPanel__tableWrap">
            <table className="adminPanel__table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Reviewer</th>
                  <th scope="col">Title</th>
                  <th scope="col">Review</th>
                  <th scope="col">Rating</th>
                  <th scope="col">Active</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((t) => (
                  <tr key={t.testimonialId}>
                    <td>{t.sortOrder}</td>
                    <td>{t.reviewerName}</td>
                    <td>{t.reviewerTitle ?? "—"}</td>
                    <td className="adminPanel__cellWrap">{t.reviewText.length > 100 ? `${t.reviewText.slice(0, 100)}…` : t.reviewText}</td>
                    <td>{t.rating != null ? `${t.rating}/5` : "—"}</td>
                    <td>
                      <button
                        type="button"
                        className={`adminPanel__badge ${t.isActive ? "adminPanel__badge--green" : "adminPanel__badge--red"}`}
                        onClick={() => handleToggleActive(t)}
                        title={t.isActive ? "Click to deactivate" : "Click to activate"}
                        aria-label={`${t.isActive ? "Deactivate" : "Activate"} testimonial by ${t.reviewerName}`}
                      >
                        {t.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td>
                      <button type="button" className="adminPanel__actionBtn" onClick={() => openEditModal(t)} aria-label={`Edit testimonial by ${t.reviewerName}`}>Edit</button>
                      <button
                        type="button"
                        className="adminPanel__actionBtn adminPanel__actionBtn--danger"
                        onClick={() => handleDelete(t.testimonialId)}
                        disabled={deletingId === t.testimonialId}
                        aria-label={`Delete testimonial by ${t.reviewerName}`}
                      >
                        {deletingId === t.testimonialId ? "Deleting…" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="adminPanel__pagination">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
              <span>{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}</span>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <div className="adminModal__backdrop" onClick={closeModal}>
          <div className="adminModal" onClick={(e) => e.stopPropagation()}>
            <div className="adminModal__header">
              <h2>{editingId ? "Edit Testimonial" : "Add Testimonial"}</h2>
              <button type="button" className="adminModal__close" onClick={closeModal} aria-label="Close">×</button>
            </div>
            <form className="adminForm" onSubmit={handleSubmit}>
              <label className="adminForm__label">
                Reviewer Name *
                <input
                  className="adminForm__input"
                  value={form.reviewerName}
                  onChange={(e) => setForm((f) => ({ ...f, reviewerName: e.target.value }))}
                  required
                />
              </label>
              <label className="adminForm__label">
                Reviewer Title
                <input
                  className="adminForm__input"
                  value={form.reviewerTitle}
                  onChange={(e) => setForm((f) => ({ ...f, reviewerTitle: e.target.value }))}
                  placeholder="e.g. Software Engineer, Mumbai"
                />
              </label>
              <label className="adminForm__label">
                Review Text *
                <textarea
                  className="adminForm__textarea"
                  value={form.reviewText}
                  onChange={(e) => setForm((f) => ({ ...f, reviewText: e.target.value }))}
                  rows={4}
                  required
                />
              </label>
              <label className="adminForm__label">
                Rating (1–5, optional)
                <input
                  className="adminForm__input"
                  type="number"
                  min={1}
                  max={5}
                  step={1}
                  value={form.rating}
                  onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
                  placeholder="Leave blank for no rating"
                />
              </label>
              <label className="adminForm__label">
                Sort Order
                <input
                  className="adminForm__input"
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                />
                <span className="adminForm__hint">Lower numbers appear first</span>
              </label>
              <div className="adminForm__actions">
                <button type="button" className="adminForm__btn adminForm__btn--secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="adminForm__btn adminForm__btn--primary" disabled={saving}>
                  {saving ? "Saving…" : editingId ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
