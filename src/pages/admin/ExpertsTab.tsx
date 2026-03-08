import { useEffect, useState } from "react";
import { getAdminExperts, activateAdminExpert, deactivateAdminExpert, deleteAdminExpert, type AdminExpert } from "../../api/admin";
import { ApiError } from "../../api/client";

export default function ExpertsTab() {
  const [experts, setExperts] = useState<AdminExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAdminExperts()
      .then(setExperts)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load experts.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggleActive = async (expert: AdminExpert) => {
    try {
      const updated = expert.isActive
        ? await deactivateAdminExpert(expert.expertId)
        : await activateAdminExpert(expert.expertId);
      setExperts((prev) => prev.map((e) => (e.expertId === expert.expertId ? updated : e)));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to update expert.");
    }
  };

  const handleDelete = async (expertId: string, name: string) => {
    if (!confirm(`Delete expert profile for ${name}? This cannot be undone.`)) return;
    try {
      await deleteAdminExpert(expertId);
      setExperts((prev) => prev.filter((e) => e.expertId !== expertId));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete expert.");
    }
  };

  const filtered = experts.filter(
    (e) =>
      e.displayName.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return <p className="adminPanel__loading">Loading experts…</p>;
  if (error) return <p className="adminPanel__error">{error}</p>;

  return (
    <>
      <div className="adminPanel__toolbar">
        <input
          className="field__input adminPanel__search"
          type="search"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="adminPanel__count">{filtered.length} experts</span>
      </div>

      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Title</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="adminTable__empty">No experts found.</td>
              </tr>
            ) : (
              filtered.map((e) => (
                <tr key={e.expertId}>
                  <td>{e.displayName}</td>
                  <td>{e.email}</td>
                  <td>{e.title}</td>
                  <td>{e.locationCountry || "—"}</td>
                  <td>
                    <span className={`statusBadge statusBadge--${e.isActive ? "active" : "ended"}`}>
                      {e.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="adminTable__actions">
                    <button
                      type="button"
                      className="adminActionButton"
                      onClick={() => handleToggleActive(e)}
                    >
                      {e.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      className="adminActionButton adminActionButton--danger"
                      onClick={() => handleDelete(e.expertId, e.displayName)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
