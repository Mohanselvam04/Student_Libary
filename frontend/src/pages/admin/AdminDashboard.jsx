import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import {
  fetchAdminStats,
  fetchAllUsers,
  fetchAllCourses,
  updateUserInfo,
  deleteUserById,
  toggleCourseStatus,
  fetchAdminCardVisibility,
  updateAdminCardVisibility,
  fetchInstructorCardVisibility,
  updateInstructorCardVisibility,
  fetchStudentCardVisibility,
  updateStudentCardVisibility
} from '../../services/adminService';
import { Users, BookOpen, FileText, GraduationCap, UserCheck, ToggleLeft, ToggleRight, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/common/ConfirmModal';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showAdminCard, setShowAdminCard] = useState(true);
  const [showInstructorCard, setShowInstructorCard] = useState(true);
  const [showStudentCard, setShowStudentCard] = useState(true);
  const [showRoleCardsGroup, setShowRoleCardsGroup] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, userId: null });
  const location = useLocation();
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, coursesData, visibilityData, instVisibilityData, studVisibilityData] = await Promise.all([
        fetchAdminStats(),
        fetchAllUsers(),
        fetchAllCourses(),
        fetchAdminCardVisibility(),
        fetchInstructorCardVisibility(),
        fetchStudentCardVisibility()
      ]);
      setStats(statsData || {});
      setUsers(usersData || []);
      setCourses(coursesData || []);
      setShowAdminCard(visibilityData.visible);
      setShowInstructorCard(instVisibilityData.visible);
      setShowStudentCard(studVisibilityData.visible);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync active tab with the current URL path
  useEffect(() => {
    const p = location.pathname.toLowerCase();
    if (p.startsWith('/admin/users')) setActiveTab('users');
    else if (p.startsWith('/admin/courses')) setActiveTab('courses');
    else if (p.startsWith('/admin/settings')) setActiveTab('settings');
    else setActiveTab('overview');
  }, [location.pathname]);

  const handleToggleAdminCard = async () => {
    const newValue = !showAdminCard;
    try {
      await updateAdminCardVisibility(newValue);
      setShowAdminCard(newValue);
      toast.success(newValue ? 'Admin registration card enabled' : 'Admin registration card disabled');
    } catch {
      toast.error('Failed to update admin signup visibility');
    }
  };

  const handleToggleInstructorCard = async () => {
    const newValue = !showInstructorCard;
    try {
      await updateInstructorCardVisibility(newValue);
      setShowInstructorCard(newValue);
      toast.success(newValue ? 'Instructor registration card enabled' : 'Instructor registration card disabled');
    } catch {
      toast.error('Failed to update instructor signup visibility');
    }
  };

  const handleToggleStudentCard = async () => {
    const newValue = !showStudentCard;
    try {
      await updateStudentCardVisibility(newValue);
      setShowStudentCard(newValue);
      toast.success(newValue ? 'Student registration card enabled' : 'Student registration card disabled');
    } catch {
      toast.error('Failed to update student signup visibility');
    }
  };

  const handleUpdateUser = async (id, updates) => {
    try {
      const resData = await updateUserInfo(id, updates);
      setUsers(u => u.map(x => x._id === id ? resData : x));
      toast.success('User updated');
    } catch { toast.error('Update failed'); }
  };

  const handleConfirmDeleteUser = async () => {
    const id = confirmModal.userId;
    if (!id) return;
    try {
      await deleteUserById(id);
      setUsers(u => u.filter(x => x._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleToggleCourse = async (id) => {
    try {
      const resData = await toggleCourseStatus(id);
      setCourses(c => c.map(x => x._id === id ? resData : x));
      toast.success(resData.isPublished ? 'Course published' : 'Course unpublished');
    } catch { toast.error('Failed to change course status'); }
  };

  const statCards = [
    { label: 'Total Users', value: stats.users || 0, icon: Users, color: 'var(--primary)', bg: 'rgba(46,125,50,0.08)' },
    { label: 'Students', value: stats.students || 0, icon: GraduationCap, color: '#0284c7', bg: 'rgba(2,132,199,0.08)' },
    { label: 'Instructors', value: stats.instructors || 0, icon: UserCheck, color: '#0d9488', bg: 'rgba(13,148,136,0.08)' },
    { label: 'Total Courses', value: stats.courses || 0, icon: BookOpen, color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
    { label: 'Materials', value: stats.materials || 0, icon: FileText, color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
  ];

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

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

        {loading ? <div className="loading">Loading dashboard data...</div> : (
          <>
            {/* Overview */}
            {activeTab === 'overview' && (
              <>
                <div className="grid-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: 28 }}>
                  {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="stat-card">
                      <div className="stat-icon" style={{ background: bg }}>
                        <Icon size={20} color={color} />
                      </div>
                      <div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>{value}</div>
                        <div style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 300 }}>{label}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="grid-2">
                  <div className="card">
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Recent Users</h3>
                    {users.slice(0, 5).map(u => (
                      <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                        <div className="avatar" style={{ width: 34, height: 34, fontSize: 12, background: 'var(--primary)', flexShrink: 0 }}>{initials(u.name)}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13.5, color: '#1e293b' }}>{u.name}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                        <span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'instructor' ? 'badge-warning' : 'badge-primary'}`} style={{ textTransform: 'capitalize' }}>{u.role}</span>
                      </div>
                    ))}
                  </div>

                  <div className="card">
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Recent Courses</h3>
                    {courses.slice(0, 5).map(c => (
                      <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ width: 34, height: 34, background: 'rgba(46,125,50,0.08)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <BookOpen size={16} color="var(--primary)" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13.5, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{c.instructor?.name}</div>
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
                              <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, background: 'var(--primary)' }}>{initials(u.name)}</div>
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
                          <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-outline btn-sm" onClick={() => handleUpdateUser(u._id, { isActive: !u.isActive })} style={{ padding: '6px 10px' }}>
                                {u.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => setConfirmModal({ isOpen: true, userId: u._id })} style={{ padding: '6px 10px' }}><Trash2 size={14} /></button>
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
                          <td style={{ fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</td>
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

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="card" style={{ maxWidth: 600 }}>

                {/* Group: Registration Page Visibility Settings */}
                <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
                  <div 
                    onClick={() => setShowRoleCardsGroup(!showRoleCardsGroup)}
                    style={{ 
                      background: 'rgba(0,0,0,0.02)', 
                      padding: '14px 20px', 
                      borderBottom: showRoleCardsGroup ? '1px solid var(--border)' : 'none', 
                      fontWeight: 600, 
                      color: '#1e293b', 
                      fontSize: 14.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    <span>Registration Page Role Cards</span>
                    {showRoleCardsGroup ? <ChevronDown size={18} color="var(--text-muted)" /> : <ChevronRight size={18} color="var(--text-muted)" />}
                  </div>
                  
                  {showRoleCardsGroup && (
                    <div style={{ padding: '0 20px' }}>
                      
                      {/* Student Setting */}
                      <div style={{ padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13.5, color: '#1e293b', marginBottom: 4 }}>
                              Student Registration Card
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              Control if the 'Student' role option card is shown on the registration page.
                            </div>
                          </div>
                          <button
                            onClick={handleToggleStudentCard}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: showStudentCard ? 'var(--primary)' : 'var(--text-faint)',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title={showStudentCard ? "Disable Student Registration Option" : "Enable Student Registration Option"}
                          >
                            {showStudentCard ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                          </button>
                        </div>
                      </div>

                      {/* Instructor Setting */}
                      <div style={{ padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13.5, color: '#1e293b', marginBottom: 4 }}>
                              Instructor Registration Card
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              Control if the 'Instructor' role option card is shown on the registration page.
                            </div>
                          </div>
                          <button
                            onClick={handleToggleInstructorCard}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: showInstructorCard ? 'var(--primary)' : 'var(--text-faint)',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title={showInstructorCard ? "Disable Instructor Registration Option" : "Enable Instructor Registration Option"}
                          >
                            {showInstructorCard ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                          </button>
                        </div>
                      </div>

                      {/* Admin Setting */}
                      <div style={{ padding: '20px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13.5, color: '#1e293b', marginBottom: 4 }}>
                              Admin Registration Card
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              Control if the 'Admin' role option card is shown on the registration page.
                            </div>
                          </div>
                          <button
                            onClick={handleToggleAdminCard}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: showAdminCard ? 'var(--primary)' : 'var(--text-faint)',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title={showAdminCard ? "Disable Admin Registration Option" : "Enable Admin Registration Option"}
                          >
                            {showAdminCard ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                          </button>
                        </div>
                      </div>

                    </div>
                  )}
                </div>

              </div>
            )}
          </>
        )}

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, userId: null })}
          onConfirm={handleConfirmDeleteUser}
          title="Delete User"
          message="Are you sure you want to delete this user permanently? This action cannot be undone."
          confirmText="Delete permanently"
        />
      </main>
    </div>
  );
};

export default AdminDashboard;
