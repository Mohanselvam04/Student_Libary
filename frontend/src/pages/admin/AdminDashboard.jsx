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
import { ChevronDown, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/common/ConfirmModal';
import { createCourse } from '../../services/courseService';
import AdminOverview from './components/AdminOverview';
import AdminUsers from './components/AdminUsers';
import AdminCourses from './components/AdminCourses';

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

  const handleCreateCourse = async (courseData) => {
    try {
      await createCourse(courseData);
      toast.success('Course created successfully!');
      const coursesData = await fetchAllCourses();
      setCourses(coursesData || []);
      const statsData = await fetchAdminStats();
      setStats(statsData || {});
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create course');
      return false;
    }
  };

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
              <AdminOverview
                stats={stats}
                users={users}
                courses={courses}
                initials={initials}
              />
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <AdminUsers
                users={users}
                courses={courses}
                initials={initials}
                handleUpdateUser={handleUpdateUser}
                onDeleteClick={(id) => setConfirmModal({ isOpen: true, userId: id })}
                refreshData={loadData}
              />
            )}

            {/* Courses Tab */}
            {activeTab === 'courses' && (
              <AdminCourses
                courses={courses}
                handleToggleCourse={handleToggleCourse}
                handleCreateCourse={handleCreateCourse}
              />
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
