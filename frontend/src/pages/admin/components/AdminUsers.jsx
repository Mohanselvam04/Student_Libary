import React from 'react';
import { ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';

const AdminUsers = ({ users, initials, handleUpdateUser, onDeleteClick }) => {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, background: 'var(--primary)' }}>
                      {initials(u.name)}
                    </div>
                    <span style={{ fontWeight: 600 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={e => handleUpdateUser(u._id, { role: e.target.value })}
                    style={{ width: 'auto', padding: '4px 8px', fontSize: 12 }}
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleUpdateUser(u._id, { isActive: !u.isActive })}
                      style={{ padding: '6px 10px' }}
                    >
                      {u.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => onDeleteClick(u._id)}
                      style={{ padding: '6px 10px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
