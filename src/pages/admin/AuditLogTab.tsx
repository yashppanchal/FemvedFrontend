import { useEffect, useState } from "react";
import { getAuditLog, type AuditLogEntry } from "../../api/admin";
import { ApiError } from "../../api/client";
import { LoadingScreen } from "../../components/LoadingScreen";
import { PAGE_SIZE } from "../../constants";

export default function AuditLogTab() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);


  useEffect(() => {
    setLoading(true);
    setError(null);
    getAuditLog(PAGE_SIZE, (page - 1) * PAGE_SIZE)
      .then(setEntries)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load audit log.");
      })
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <LoadingScreen compact message="Loading audit log…" />;
  if (error) return <p className="adminPanel__error">{error}</p>;

  return (
    <>
      <div className="adminPanel__toolbar">
        <span className="adminPanel__count">Page {page}</span>
        <div className="adminPanel__pagination">
          <button
            type="button"
            className="adminActionButton"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <button
            type="button"
            className="adminActionButton"
            disabled={entries.length < PAGE_SIZE}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      </div>

      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              <th scope="col">Actor</th>
              <th scope="col">Action</th>
              <th scope="col">Target</th>
              <th scope="col">Details</th>
              <th scope="col">Date</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="adminTable__empty">No audit log entries.</td>
              </tr>
            ) : (
              entries.map((e) => (
                <tr key={e.logId}>
                  <td>
                    <div>{e.performedByEmail}</div>
                  </td>
                  <td><code>{e.entityType}</code></td>
                  <td>{e.entityId}</td>
                  <td className="adminTable__details">{e.after ?? e.before ?? ""}</td>
                  <td>{new Date(e.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
