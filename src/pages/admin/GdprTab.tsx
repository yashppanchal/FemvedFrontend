import { useEffect, useState } from "react";
import { getGdprRequests, processGdprRequest, type GdprRequest } from "../../api/admin";
import { ApiError } from "../../api/client";

type StatusFilter = "Pending" | "Completed" | "all";
const PAGE_SIZE = 15;

export default function GdprTab() {
  const [requests, setRequests] = useState<GdprRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Pending");
  const [actionError, setActionError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const status = statusFilter === "all" ? undefined : statusFilter;
    getGdprRequests(status)
      .then(setRequests)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load data requests.");
      })
      .finally(() => setLoading(false));
  }, [statusFilter]);

  // Reset page when filter changes
  useEffect(() => { setPage(1); }, [statusFilter]);

  const handleResolve = async (requestId: string) => {
    if (!confirm("Mark this data request as resolved?")) return;
    setActionError(null);
    try {
      const updated = await processGdprRequest(requestId, "Complete", null);
      setRequests((prev) => prev.map((r) => (r.requestId === requestId ? updated : r)));
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to resolve request.");
    }
  };

  if (loading) return <p className="adminPanel__loading">Loading data requests…</p>;
  if (error) return <p className="adminPanel__error">{error}</p>;

  const totalPages = Math.ceil(requests.length / PAGE_SIZE);

  return (
    <>
      <div className="adminPanel__toolbar">
        <div className="adminPanel__segmented">
          {(["Pending", "Completed", "all"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              type="button"
              className={`adminPanel__segBtn${statusFilter === s ? " adminPanel__segBtn--active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
        <span className="adminPanel__count">{requests.length} requests</span>
        {totalPages > 1 && (
          <div className="adminPanel__pagination">
            <button type="button" className="adminActionButton" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>Page {page} of {totalPages}</span>
            <button type="button" className="adminActionButton" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
          </div>
        )}
      </div>

      {actionError && <p className="adminPanel__error">{actionError}</p>}

      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              <th>User</th>
              <th>Type</th>
              <th>Status</th>
              <th>Requested</th>
              <th>Resolved</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="adminTable__empty">No data requests.</td>
              </tr>
            ) : (
              requests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((r) => (
                <tr key={r.requestId}>
                  <td>
                    <div>{r.userEmail}</div>
                    <div className="adminTable__sub">{r.userId}</div>
                  </td>
                  <td>{r.requestType}</td>
                  <td>
                    <span className={`statusBadge statusBadge--${r.status.toLowerCase()}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td>{r.resolvedAt ? new Date(r.resolvedAt).toLocaleDateString() : "—"}</td>
                  <td className="adminTable__actions">
                    {r.status === "Pending" && (
                      <button
                        type="button"
                        className="adminActionButton"
                        onClick={() => handleResolve(r.requestId)}
                      >
                        Resolve
                      </button>
                    )}
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
