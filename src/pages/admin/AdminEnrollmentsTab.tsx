import { useEffect, useState } from "react";
import {
  getAdminEnrollments,
  adminStartEnrollment,
  adminEndEnrollment,
  getAdminEnrollmentComments,
  postAdminEnrollmentComment,
  type AdminEnrollment,
  type AdminEnrollmentComment,
} from "../../api/admin";
import { ApiError } from "../../api/client";

export default function AdminEnrollmentsTab() {
  const [enrollments, setEnrollments] = useState<AdminEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [commentsId, setCommentsId] = useState<string | null>(null);
  const [comments, setComments] = useState<AdminEnrollmentComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    getAdminEnrollments()
      .then(setEnrollments)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load enrollments.");
      })
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = (id: string, accessStatus: string) =>
    setEnrollments((prev) => prev.map((e) => (e.accessId === id ? { ...e, accessStatus } : e)));

  const runAction = async (id: string, fn: () => Promise<void>, newStatus: string) => {
    try {
      await fn();
      updateStatus(id, newStatus);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Action failed.");
    }
  };

  const openComments = async (id: string) => {
    setCommentsId(id);
    setCommentsLoading(true);
    setComments([]);
    try {
      const data = await getAdminEnrollmentComments(id);
      setComments(data);
    } catch {
      // Show empty
    } finally {
      setCommentsLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!commentsId || !commentText.trim()) return;
    setPosting(true);
    try {
      await postAdminEnrollmentComment(commentsId, commentText.trim());
      const updated = await getAdminEnrollmentComments(commentsId);
      setComments(updated);
      setCommentText("");
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to post comment.");
    } finally {
      setPosting(false);
    }
  };

  const filtered = enrollments.filter(
    (e) =>
      (e.userFirstName + " " + e.userLastName).toLowerCase().includes(search.toLowerCase()) ||
      e.programName.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return <p className="adminPanel__loading">Loading enrollments…</p>;
  if (error) return <p className="adminPanel__error">{error}</p>;

  return (
    <>
      <div className="adminPanel__toolbar">
        <input
          className="field__input adminPanel__search"
          type="search"
          placeholder="Search by user or program…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="adminPanel__count">{filtered.length} enrollments</span>
      </div>

      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              <th>User</th>
              <th>Expert</th>
              <th>Program</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="adminTable__empty">No enrollments found.</td>
              </tr>
            ) : (
              filtered.map((e) => (
                <tr key={e.accessId}>
                  <td>
                    <div>{e.userFirstName} {e.userLastName}</div>
                    <div className="adminTable__sub">{e.userEmail}</div>
                  </td>
                  <td>{e.expertName}</td>
                  <td>{e.programName}</td>
                  <td>{e.durationLabel}</td>
                  <td>
                    <span className={`statusBadge statusBadge--${(e.accessStatus || "").toLowerCase()}`}>
                      {e.accessStatus}
                    </span>
                  </td>
                  <td className="adminTable__actions">
                    {e.accessStatus === "Pending" && (
                      <button
                        type="button"
                        className="adminActionButton"
                        onClick={() => runAction(e.accessId, () => adminStartEnrollment(e.accessId), "Active")}
                      >
                        Start
                      </button>
                    )}
                    {(e.accessStatus === "Active" || e.accessStatus === "Paused") && (
                      <button
                        type="button"
                        className="adminActionButton adminActionButton--danger"
                        onClick={() => runAction(e.accessId, () => adminEndEnrollment(e.accessId), "Ended")}
                      >
                        End
                      </button>
                    )}
                    <button
                      type="button"
                      className="adminActionButton"
                      onClick={() => openComments(e.accessId)}
                    >
                      Comments
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {commentsId && (
        <div className="adminModal__backdrop" onClick={() => setCommentsId(null)}>
          <div className="adminModal" onClick={(ev) => ev.stopPropagation()}>
            <div className="adminModal__header">
              <h3 className="adminModal__title">Enrollment Comments</h3>
              <button type="button" className="adminModal__close" onClick={() => setCommentsId(null)}>✕</button>
            </div>
            <div className="adminModal__body">
              {commentsLoading ? (
                <p className="adminPanel__loading">Loading…</p>
              ) : comments.length === 0 ? (
                <p className="adminPanel__empty">No comments yet.</p>
              ) : (
                <ul className="adminComments">
                  {comments.map((c) => (
                    <li key={c.commentId} className="adminComments__item">
                      <p className="adminComments__text">{c.updateNote}</p>
                      <span className="adminComments__date">{new Date(c.createdAt).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="adminModal__compose">
              <textarea
                className="field__input adminModal__textarea"
                value={commentText}
                onChange={(ev) => setCommentText(ev.target.value)}
                placeholder="Write a comment…"
                disabled={posting}
              />
              <button
                type="button"
                className="button"
                onClick={handlePostComment}
                disabled={posting || !commentText.trim()}
              >
                {posting ? "Posting…" : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
