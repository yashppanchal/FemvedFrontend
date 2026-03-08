import { useEffect, useState } from "react";
import { getAdminUsers, activateAdminUser, deactivateAdminUser, changeUserRole, deleteAdminUser, type AdminUser } from "../../api/admin";
import { ApiError } from "../../api/client";

export default function AdminUsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAdminUsers()
      .then(setUsers)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load users.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggleActive = async (user: AdminUser) => {
    try {
      const updated = user.isActive
        ? await deactivateAdminUser(user.userId)
        : await activateAdminUser(user.userId);
      setUsers((prev) => prev.map((u) => (u.userId === user.userId ? updated : u)));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to update user.");
    }
  };

  const handleChangeRole = async (userId: string, roleId: number) => {
    try {
      const updated = await changeUserRole(userId, roleId);
      setUsers((prev) => prev.map((u) => (u.userId === userId ? updated : u)));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to change role.");
    }
  };

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
    try {
      await deleteAdminUser(userId);
      setUsers((prev) => prev.filter((u) => u.userId !== userId));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete user.");
    }
  };

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return <p className="adminPanel__loading">Loading users…</p>;
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
        <span className="adminPanel__count">{filtered.length} users</span>
      </div>

      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="adminTable__empty">No users found.</td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.userId}>
                  <td>{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <span className={`statusBadge statusBadge--${u.isActive ? "active" : "ended"}`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="adminTable__actions">
                    <select
                      className="field__input adminTable__roleSelect"
                      value={(u.role ?? "").toLowerCase().includes("admin") ? "1" : (u.role ?? "").toLowerCase().includes("expert") ? "2" : "3"}
                      onChange={(ev) => handleChangeRole(u.userId, Number(ev.target.value))}
                    >
                      <option value="3">User</option>
                      <option value="2">Expert</option>
                      <option value="1">Admin</option>
                    </select>
                    <button
                      type="button"
                      className="adminActionButton"
                      onClick={() => handleToggleActive(u)}
                    >
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      className="adminActionButton adminActionButton--danger"
                      onClick={() => handleDelete(u.userId, u.email)}
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
