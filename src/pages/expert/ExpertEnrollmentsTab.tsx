import { useEffect, useState } from "react";
import {
  getExpertEnrollments,
  startEnrollment,
  pauseExpertEnrollment,
  resumeEnrollment,
  endExpertEnrollment,
  getEnrollmentComments,
  postEnrollmentComment,
  type ExpertEnrollment,
  type EnrollmentComment,
} from "../../api/experts";
import { ApiError } from "../../api/client";

export default function ExpertEnrollmentsTab() {
  const [enrollments, setEnrollments] = useState<ExpertEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [commentsEnrollmentId, setCommentsEnrollmentId] = useState<string | null>(null);
  const [comments, setComments] = useState<EnrollmentComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    getExpertEnrollments()
      .then(setEnrollments)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load enrollments.");
      })
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = (enrollmentId: string, status: string) =>
    setEnrollments((prev) =>
      prev.map((e) => (e.accessId === enrollmentId ? { ...e, status } : e))
    );

  const runAction = async (accessId: string, action: () => Promise<void>, newStatus: string) => {
    setActionError(null);
    try {
      await action();
      updateStatus(enrollmentId, newStatus);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Action failed.");
    }
  };

  const openComments = async (enrollmentId: string) => {
    setCommentsEnrollmentId(enrollmentId);
    setCommentsLoading(true);
    setComments([]);
    try {
      const data = await getEnrollmentComments(enrollmentId);
      setComments(data);
    } catch {
      // Show empty
    } finally {
      setCommentsLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!commentsEnrollmentId || !commentText.trim()) return;
    setPostingComment(true);
    try {
      const c = await postEnrollmentComment(commentsEnrollmentId, commentText.trim());
      setComments((prev) => [...prev, c]);
      setCommentText("");
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to post comment.");
    } finally {
      setPostingComment(false);
    }
  };

  if (loading) return <p className="expertSection__loading">Loading enrollments…</p>;
  if (error) return <p className="form__error">{error}</p>;

  return (
    <section className="expertSection">
      <div className="expertSection__header">
        <h2 className="expertSection__title">Enrollments</h2>
      </div>

      {actionError && <p className="form__error">{actionError}</p>}

      {enrollments.length === 0 ? (
        <p className="expertSection__empty">No enrollments yet.</p>
      ) : (
        <div className="expertTableWrap">
          <table className="expertTable">
            <thead>
              <tr>
                <th>Client</th>
                <th>Program</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.accessId}>
                  <td>
                    <div>{e.userFirstName + " " + e.userLastName}</div>
                    <div className="expertTable__sub">{e.userEmail}</div>
                  </td>
                  <td>{e.programName}</td>
                  <td>{e.durationLabel}</td>
                  <td>
                    <span className={`statusBadge statusBadge--${(e.accessStatus || "").toLowerCase()}`}>
                      {e.accessStatus}
                    </span>
                  </td>
                  <td className="expertTable__actions">
                    {e.accessStatus === "Pending" && (
                      <button
                        type="button"
                        className="expertTable__btn"
                        onClick={() => runAction(e.accessId, () => startEnrollment(e.accessId), "Active")}
                      >
                        Start
                      </button>
                    )}
                    {e.accessStatus === "Active" && (
                      <button
                        type="button"
                        className="expertTable__btn"
                        onClick={() => runAction(e.accessId, () => pauseExpertEnrollment(e.accessId), "Paused")}
                      >
                        Pause
                      </button>
                    )}
                    {e.accessStatus === "Paused" && (
                      <button
                        type="button"
                        className="expertTable__btn"
                        onClick={() => runAction(e.accessId, () => resumeEnrollment(e.accessId), "Active")}
                      >
                        Resume
                      </button>
                    )}
                    {(e.accessStatus === "Active" || e.accessStatus === "Paused") && (
                      <button
                        type="button"
                        className="expertTable__btn expertTable__btn--danger"
                        onClick={() => runAction(e.accessId, () => endExpertEnrollment(e.accessId), "Ended")}
                      >
                        End
                      </button>
                    )}
                    <button
                      type="button"
                      className="expertTable__btn"
                      onClick={() => openComments(e.accessId)}
                    >
                      Comments
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {commentsEnrollmentId && (
        <div className="expertModal__backdrop" onClick={() => setCommentsEnrollmentId(null)}>
          <div className="expertModal" onClick={(ev) => ev.stopPropagation()}>
            <div className="expertModal__header">
              <h3 className="expertModal__title">Enrollment Comments</h3>
              <button
                type="button"
                className="expertModal__close"
                onClick={() => setCommentsEnrollmentId(null)}
              >
                ✕
              </button>
            </div>
            {commentsLoading ? (
              <p className="expertSection__loading">Loading…</p>
            ) : comments.length === 0 ? (
              <p className="expertSection__empty">No comments yet.</p>
            ) : (
              <ul className="expertComments">
                {comments.map((c) => (
                  <li key={c.commentId} className="expertComments__item">
                    <span className="expertComments__author">{c.authorName}</span>
                    <span className="expertComments__role">{c.authorRole}</span>
                    <p className="expertComments__text">{c.content}</p>
                    <span className="expertComments__date">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="expertModal__compose">
              <textarea
                className="field__input expertForm__textarea expertForm__textarea--sm"
                value={commentText}
                onChange={(ev) => setCommentText(ev.target.value)}
                placeholder="Write a comment…"
                disabled={postingComment}
              />
              <button
                type="button"
                className="button"
                onClick={handlePostComment}
                disabled={postingComment || !commentText.trim()}
              >
                {postingComment ? "Posting…" : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
