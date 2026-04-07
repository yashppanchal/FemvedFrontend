import { useEffect, useState } from "react";
import { adminLibrary, type LibraryPurchaseDto } from "../../../api/adminLibrary";
import { ApiError } from "../../../api/client";
import { PAGE_SIZE } from "../../../constants";

export default function LibraryPurchasesTab() {
  const [purchases, setPurchases] = useState<LibraryPurchaseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    adminLibrary
      .getPurchases()
      .then((res) => setPurchases(res.purchases))
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load purchases."),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setPage(1); }, [search]);

  const filtered = purchases.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.userName.toLowerCase().includes(q) ||
      p.userEmail.toLowerCase().includes(q) ||
      p.videoTitle.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section className="adminPanel" role="tabpanel" aria-label="Library purchases">
      <div className="adminPanel__header">
        <h2 className="adminPanel__title">Library Purchases</h2>
        <p className="adminPanel__hint">Who bought what — all library purchase records.</p>
      </div>

      {loading && <p className="adminPanel__hint">Loading...</p>}
      {error && <p className="adminPanel__error">{error}</p>}

      <div className="adminPanel__toolbar">
        <input
          className="field__input adminPanel__search"
          type="search"
          placeholder="Search by name, email, or video title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="adminPanel__count">{filtered.length} purchases</span>
      </div>

      {totalPages > 1 && (
        <div className="adminPanel__pagination">
          <button
            type="button"
            className="adminActionButton"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <button
            type="button"
            className="adminActionButton"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}

      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Video</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Purchased</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {paged.length > 0 ? (
              paged.map((p) => (
                <tr key={p.accessId}>
                  <td>{p.userName}</td>
                  <td>{p.userEmail}</td>
                  <td>{p.videoTitle}</td>
                  <td>{p.videoType}</td>
                  <td>
                    {p.currencySymbol}
                    {new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
                      p.amountPaid,
                    )}
                  </td>
                  <td>{new Date(p.purchasedAt).toLocaleDateString()}</td>
                  <td>{p.isActive ? "Yes" : "No"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="adminTable__empty">
                  No purchases found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
