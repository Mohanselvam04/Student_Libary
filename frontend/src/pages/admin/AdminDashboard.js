import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../../components/layout/Sidebar';
import { Users, BookOpen, FileText, GraduationCap, TrendingUp, UserCheck, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/admin/stats'),
      axios.get('/api/admin/users'),
      axios.get('/api/admin/courses'),
    ]).then(([sRes, uRes, cRes]) => {
      setStats(sRes.data);
      setUsers(uRes.data);
      setCourses(cRes.data);
    }).catch(() => toast.error('Failed to load data'))
    .finally(() => setLoading(false));
  }, []);

  const handleUpdateUser = async (id, updates) => {
    try {
      const res = await axios.put(`/api/admin/users/${id}`, updates);
      setUsers(u => u.map(x => x._id === id ? res.data : x));
      toast.success('User updated');
    } catch { toast.error('Update failed'); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await axios.delete(`/api/admin/users/${id}`);
      setUsers(u => u.filter(x => x._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleToggleCourse = async (id) => {
    try {
      const res = await axios.patch(`/api/admin/courses/${id}/toggle`);
      setCourses(c => c.map(x => x._id === id ? res.data : x));
      toast.success(res.data.isPublished ? 'Course published' : 'Course unpublished');
    } catch { toast.error('Failed'); }
  };

  const statCards = [
    { label: 'Total Users', value: stats.users || 0, icon: Users, color: '#4f46e5', bg: 'rgba(79,70,229,0.15)' },
    { label: 'Students', value: stats.students || 0, icon: GraduationCap, color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
    { label: 'Instructors', value: stats.instructors || 0, icon: UserCheck, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    { label: 'Total Courses', value: stats.courses || 0, icon: BookOpen, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    { label: 'Materials', value: stats.materials || 0, icon: FileText, color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  ];

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">Manage your LMS platform</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ maxWidth: 400, marginBottom: 28 }}>
          {['overview', 'users', 'courses'].map(t => (
            <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <>
            <div className="grid-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: 28 }}>
              {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="stat-card">
                  <div className="stat-icon" style={{ background: bg }}>
                    <Icon size={22} color={color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>{value}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid-2">
              <div className="card">
                <h3 style={{ fontSize: 16, marginBottom: 16 }}>Recent Users</h3>
                {users.slice(0, 5).map(u => (
                  <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div className="avatar" style={{ width: 36, height: 36, fontSize: 13, background: 'var(--primary)', flexShrink: 0 }}>{u.name?.slice(0, 2).toUpperCase()}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</div>
                    </div>
                    <span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'instructor' ? 'badge-warning' : 'badge-primary'}`} style={{ textTransform: 'capitalize' }}>{u.role}</span>
                  </div>
                ))}
              </div>
              <div className="card">
                <h3 style={{ fontSize: 16, marginBottom: 16 }}>Recent Courses</h3>
                {courses.slice(0, 5).map(c => (
                  <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 36, height: 36, background: 'rgba(79,70,229,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BookOpen size={16} color="var(--primary-light)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.instructor?.name}</div>
                    </div>
                    <span className={`badge ${c.isPublished ? 'badge-success' : 'badge-warning'}`}>{c.isPublished ? 'Published' : 'Draft'}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, background: 'var(--primary)' }}>{u.name?.slice(0, 2).toUpperCase()}</div>
                          <span style={{ fontWeight: 600 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                      <td>
                        <select value={u.role} onChange={e => handleUpdateUser(u._id, { role: e.target.value })}
                          style={{ width: 'auto', padding: '4px 8px', fontSize: 12 }}>
                          <option value="student">Student</option>
                          <option value="instructor">Instructor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => handleUpdateUser(u._id, { isActive: !u.isActive })}>
                            {u.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u._id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Course</th><th>Instructor</th><th>Category</th><th>Students</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {courses.map(c => (
                    <tr key={c._id}>
                      <td style={{ fontWeight: 600, maxWidth: 200 }}>{c.title}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{c.instructor?.name}</td>
                      <td><span className="badge badge-primary">{c.category}</span></td>
                      <td style={{ color: 'var(--text-muted)' }}>{c.enrolledStudents?.length || 0}</td>
                      <td><span className={`badge ${c.isPublished ? 'badge-success' : 'badge-warning'}`}>{c.isPublished ? 'Published' : 'Draft'}</span></td>
                      <td>
                        <button className={`btn btn-sm ${c.isPublished ? 'btn-outline' : 'btn-success'}`} onClick={() => handleToggleCourse(c._id)}>
                          {c.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
