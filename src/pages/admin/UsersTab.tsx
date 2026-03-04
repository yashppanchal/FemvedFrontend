import type { UserRow } from "./types";

type UsersTabProps = {
  registeredUsers: UserRow[];
};

export function UsersTab({ registeredUsers }: UsersTabProps) {
  return (
    <section className="adminPanel" role="tabpanel" aria-label="Users">
      <h2 className="adminPanel__title">Registered Users</h2>
      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {registeredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
