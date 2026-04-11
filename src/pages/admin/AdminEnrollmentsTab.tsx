import { useEffect, useState } from "react";
import { LoadingScreen } from "../../components/LoadingScreen";
import { useEscapeKey } from "../../useEscapeKey";
import {
  getAdminEnrollments,
  adminStartEnrollment,
  adminApproveStartDate,
  adminDeclineStartDate,
  adminPauseEnrollment,
  adminResumeEnrollment,
  adminEndEnrollment,
  getAdminEnrollmentComments,
  postAdminEnrollmentComment,
  type AdminEnrollment,
  type AdminEnrollmentComment,
} from "../../api/admin";
import { ApiError } from "../../api/client";
import { PAGE_SIZE } from "../../constants";
import { getStatusBadgeClass, formatStatus } from "../../statusBadge";
import { formatDate, formatDateTime, parseISODate, calculateEndDate, todayISO } from "../../dateUtils";

const STATUS_OPTIONS = ["All", "NotStarted", "Scheduled", "Active", "Paused", "Completed", "Cancelled"];

interface Props {
  filterExpertId?: string | null;
  filterProgramId?: string | null;
}

export default function AdminEnrollmentsTab({ filterExpertId, filterProgramId }: Props) {
  const [enrollments, setEnrollments] = useState<AdminEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  // Comments modal
  const [commentsId, setCommentsId] = useState<string | null>(null);
  const [comments, setComments] = useState<AdminEnrollmentComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);

  // Action in-progress guard
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Start date picker modal
  const [startPickerId, setStartPickerId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(todayISO());
  const [startingId, setStartingId] = useState<string | null>(null);

  useEscapeKey(() => { if (commentsId) setCommentsId(null); else if (startPickerId) setStartPickerId(null); }, !!(startPickerId || commentsId));

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

  const refresh = () => getAdminEnrollments().then(setEnrollments).catch(() => {});

  const runAction = async (id: string, fn: () => Promise<void>, newStatus: string) => {
    setActionError(null);
    setActioningId(id);
    try {
      await fn();
      updateStatus(id, newStatus);
      refresh();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Action failed.");
    } finally {
      setActioningId(null);
    }
  };

  const handleStartConfirm = async () => {
    if (!startPickerId) return;
    setStartingId(startPickerId);
    setActionError(null);
    try {
      await adminStartEnrollment(startPickerId, startDate !== todayISO() ? startDate : undefined);
      if (startDate === todayISO()) {
        setEnrollments((prev) =>
          prev.map((e) => e.accessId === startPickerId
            ? { ...e, accessStatus: "Active", startedAt: new Date().toISOString() }
            : e)
        );
      } else {
        setEnrollments((prev) =>
          prev.map((e) => e.accessId === startPickerId ? { ...e, scheduledStartAt: startDate } : e)
        );
      }
      refresh();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Action failed.");
    } finally {
      setStartingId(null);
      setStartPickerId(null);
      setStartDate(todayISO());
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
      setActionError(err instanceof ApiError ? err.message : "Failed to post comment.");
    } finally {
      setPosting(false);
    }
  };

  const years = [...new Set(enrollments.map((e) => new Date(e.enrolledAt).getFullYear()))].sort((a, b) => b - a);

  // Reset page when any filter changes
  useEffect(() => { setPage(1); }, [search, statusFilter, monthFilter, yearFilter]);

  const filtered = enrollments.filter((e) => {
    if (filterExpertId && e.expertId !== filterExpertId) return false;
    if (filterProgramId && e.programId !== filterProgramId) return false;
    const fullName = `${e.userFirstName} ${e.userLastName}`.toLowerCase();
    if (
      search &&
      !fullName.includes(search.toLowerCase()) &&
      !e.programName.toLowerCase().includes(search.toLowerCase()) &&
      !(e.expertName ?? "").toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (statusFilter === "Scheduled") {
      if (!(e.accessStatus === "NotStarted" && e.scheduledStartAt)) return false;
    } else if (statusFilter !== "All" && e.accessStatus !== statusFilter) return false;
    if (monthFilter) {
      const m = new Date(e.enrolledAt).getMonth() + 1;
      if (m !== parseInt(monthFilter)) return false;
    }
    if (yearFilter) {
      const y = new Date(e.enrolledAt).getFullYear();
      if (y !== parseInt(yearFilter)) return false;
    }
    return true;
  });

  if (loading) return <LoadingScreen compact message="Loading enrollments…" />;
  if (error) return <p className="adminPanel__error">{error}</p>;

  return (
    <>
      <div className="adminPanel__toolbar">
        <input
          className="field__input adminPanel__search"
          type="search"
          placeholder="Search by user, expert or program…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="field__input adminPanel__select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === "All" ? "All statuses" : s}</option>
          ))}
        </select>
        <select
          className="field__input adminPanel__select"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
        >
          <option value="">All months</option>
          {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          className="field__input adminPanel__select"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        >
          <option value="">All years</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <span className="adminPanel__count">{filtered.length} enrollments</span>
        {Math.ceil(filtered.length / PAGE_SIZE) > 1 && (
          <div className="adminPanel__pagination">
            <button type="button" className="adminActionButton" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
            <button type="button" className="adminActionButton" disabled={page >= Math.ceil(filtered.length / PAGE_SIZE)} onClick={() => setPage((p) => p + 1)}>Next →</button>
          </div>
        )}
      </div>

      {actionError && <p className="adminPanel__error">{actionError}</p>}

      <div className="adminTableWrap">
        <table className="adminTable adminTable--wide">
          <thead>
            <tr>
              <th scope="col">User</th>
              <th scope="col">Expert</th>
              <th scope="col">Program</th>
              <th scope="col">Duration</th>
              <th scope="col">Status</th>
              <th scope="col">Start / End Date</th>
              <th scope="col">Requested Start</th>
              <th scope="col">Enrolled</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="adminTable__empty">No enrollments found.</td>
              </tr>
            ) : (
              filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((e) => (
                <tr key={e.accessId}>
                  <td>
                    <div>{e.userFirstName} {e.userLastName}</div>
                    <div className="adminTable__sub">{e.userEmail}</div>
                  </td>
                  <td>{e.expertName}</td>
                  <td>{e.programName}</td>
                  <td>{e.durationLabel}</td>
                  <td>
                    <span className={`statusBadge statusBadge--${getStatusBadgeClass(e.scheduledStartAt && e.accessStatus === "NotStarted" ? "Scheduled" : e.accessStatus)}`}>
                      {e.scheduledStartAt && e.accessStatus === "NotStarted" ? "Scheduled" : formatStatus(e.accessStatus)}
                    </span>
                  </td>
                  <td>
                    {e.startedAt ? (
                      <>
                        <div>{formatDate(e.startedAt)}</div>
                        {e.endDate
                          ? <div className="adminTable__sub">Ends: {formatDate(e.endDate)}</div>
                          : e.durationWeeks > 0 && <div className="adminTable__sub">Ends: {formatDate(calculateEndDate(e.startedAt, e.durationWeeks).toISOString())}</div>
                        }
                        {e.accessStatus === "Paused" && e.pausedAt && (
                          <div className="adminTable__sub">Paused since {formatDate(e.pausedAt)}</div>
                        )}
                      </>
                    ) : e.scheduledStartAt ? (
                      <>
                        <div>{formatDate(e.scheduledStartAt)}</div>
                        {e.durationWeeks > 0 && (
                          <div className="adminTable__sub">Projected end: {formatDate(calculateEndDate(e.scheduledStartAt, e.durationWeeks).toISOString())}</div>
                        )}
                      </>
                    ) : "—"}
                  </td>
                  <td>
                    {e.requestedStartDate ? (
                      <>
                        <div>{formatDate(e.requestedStartDate)}</div>
                        {e.startRequestStatus && (
                          <div className="adminTable__sub">{e.startRequestStatus}</div>
                        )}
                      </>
                    ) : "—"}
                  </td>
                  <td>{formatDate(e.enrolledAt)}</td>
                  <td>
                    <div className="adminTable__actions">
                      {e.accessStatus === "NotStarted" && (
                        <button
                          type="button"
                          className="adminActionButton"
                          onClick={() => { setStartPickerId(e.accessId); setStartDate(e.scheduledStartAt ? parseISODate(e.scheduledStartAt) : todayISO()); }}
                          disabled={actioningId === e.accessId}
                        >
                          {e.scheduledStartAt ? "Reschedule" : "Start"}
                        </button>
                      )}
                      {e.startRequestStatus === "Pending" && (
                        <>
                          <button
                            type="button"
                            className="adminActionButton"
                            onClick={() => runAction(e.accessId, () => adminApproveStartDate(e.accessId), e.accessStatus)}
                            disabled={actioningId === e.accessId}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="adminActionButton adminActionButton--danger"
                            onClick={() => runAction(e.accessId, () => adminDeclineStartDate(e.accessId), e.accessStatus)}
                            disabled={actioningId === e.accessId}
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {e.accessStatus === "Active" && (
                        <button
                          type="button"
                          className="adminActionButton"
                          onClick={() => runAction(e.accessId, () => adminPauseEnrollment(e.accessId), "Paused")}
                          disabled={actioningId === e.accessId}
                        >
                          Pause
                        </button>
                      )}
                      {e.accessStatus === "Paused" && (
                        <button
                          type="button"
                          className="adminActionButton"
                          onClick={() => runAction(e.accessId, () => adminResumeEnrollment(e.accessId), "Active")}
                          disabled={actioningId === e.accessId}
                        >
                          Resume
                        </button>
                      )}
                      {(e.accessStatus === "Active" || e.accessStatus === "Paused") && (
                        <button
                          type="button"
                          className="adminActionButton adminActionButton--danger"
                          onClick={() => runAction(e.accessId, () => adminEndEnrollment(e.accessId), "Completed")}
                          disabled={actioningId === e.accessId}
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
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Start date picker modal */}
      {startPickerId && (
        <div className="adminModal__backdrop" onClick={() => setStartPickerId(null)}>
          <div className="adminModal" onClick={(ev) => ev.stopPropagation()}>
            <div className="adminModal__header">
              <h3 className="adminModal__title">{enrollments.find(e => e.accessId === startPickerId)?.scheduledStartAt ? "Reschedule Program" : "Start Program"}</h3>
              <button type="button" className="adminModal__close" onClick={() => setStartPickerId(null)} aria-label="Close">✕</button>
            </div>
            <div className="adminModal__body">
              <label className="field">
                <span className="field__label">Start date</span>
                <input
                  className="field__input"
                  type="date"
                  value={startDate}
                  min={todayISO()}
                  onChange={(ev) => setStartDate(ev.target.value)}
                  disabled={!!startingId}
                />
              </label>
              {startDate === todayISO() ? (
                <p>Program will start immediately today.</p>
              ) : (
                <p>
                  Program will be scheduled for {formatDate(startDate + "T00:00:00")}.
                  Emails will be sent to all parties confirming the schedule.
                </p>
              )}
            </div>
            <div className="adminModal__compose">
              <button type="button" className="adminActionButton" onClick={() => setStartPickerId(null)} disabled={!!startingId}>
                Cancel
              </button>
              <button type="button" className="button" onClick={handleStartConfirm} disabled={!!startingId}>
                {startingId ? "Confirming…" : startDate === todayISO() ? "Start now" : "Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments modal */}
      {commentsId && (
        <div className="adminModal__backdrop" onClick={() => setCommentsId(null)}>
          <div className="adminModal" onClick={(ev) => ev.stopPropagation()}>
            <div className="adminModal__header">
              <h3 className="adminModal__title">Enrollment Comments</h3>
              <button type="button" className="adminModal__close" onClick={() => setCommentsId(null)} aria-label="Close">✕</button>
            </div>
            <div className="adminModal__body">
              {commentsLoading ? (
                <LoadingScreen compact message="Loading…" />
              ) : comments.length === 0 ? (
                <p className="adminPanel__empty">No comments yet.</p>
              ) : (
                <ul className="adminComments">
                  {comments.map((c) => (
                    <li key={c.commentId} className="adminComments__item">
                      <p className="adminComments__text">{c.updateNote}</p>
                      <span className="adminComments__date">{formatDateTime(c.createdAt)}</span>
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
