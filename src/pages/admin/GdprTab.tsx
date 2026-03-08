import { useEffect, useState } from "react";
import { getGdprRequests, processGdprRequest, type GdprRequest } from "../../api/admin";
import { ApiError } from "../../api/client";

export default function GdprTab() {
  const [requests, setRequests] = useState<GdprRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGdprRequests()
      .then(setRequests)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load GDPR requests.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleResolve = async (requestId: string) => {
    if (!confirm("Mark this GDPR request as resolved?")) return;
    try {
      const updated = await processGdprRequest(requestId, "Approved", null);
      setRequests((prev) => prev.map((r) => (r.requestId === requestId ? updated : r)));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to resolve request.");
    }
  };

  if (loading) return <p className="adminPanel__loading">Loading GDPR requests…</p>;
  if (error) return <p className="adminPanel__error">{error}</p>;

  return (
    <>
      <div className="adminPanel__toolbar">
        <span className="adminPanel__count">{requests.length} requests</span>
      </div>

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
                <td colSpan={6} className="adminTable__empty">No GDPR requests.</td>
              </tr>
            ) : (
              requests.map((r) => (
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
                  <td>{r.resolvedAt ? new Date(r.resolvedAt).toLocaleDateString() : "Pending"}</td>
                  <td className="adminTable__actions">
                    {r.status !== "Resolved" && (
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
