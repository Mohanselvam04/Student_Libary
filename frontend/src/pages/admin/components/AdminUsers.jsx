import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { enrollUserInCourse, unenrollUserFromCourse } from '../../../services/adminService';
import toast from 'react-hot-toast';

const AdminUsers = ({ users, courses = [], initials, handleUpdateUser, onDeleteClick, refreshData }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    setIsSubmitting(true);
    try {
      await enrollUserInCourse(selectedUser._id, selectedCourseId);
      toast.success('Successfully enrolled!');
      setSelectedCourseId('');
      if (refreshData) await refreshData();
      
      // Update selectedUser state locally in modal
      const courseObj = courses.find(c => c._id === selectedCourseId);
      setSelectedUser(prev => ({
        ...prev,
        enrolledCourses: [...(prev.enrolledCourses || []), { _id: selectedCourseId, title: courseObj?.title || 'Course' }]
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnenroll = async (courseId) => {
    setIsSubmitting(true);
    try {
      await unenrollUserFromCourse(selectedUser._id, courseId);
      toast.success('Successfully unenrolled!');
      if (refreshData) await refreshData();
      
      // Update selectedUser state locally in modal
      setSelectedUser(prev => ({
        ...prev,
        enrolledCourses: (prev.enrolledCourses || []).filter(c => c._id !== courseId)
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unenrollment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter courses that this user is NOT enrolled in
  const availableCourses = courses.filter(c => 
    !(selectedUser?.enrolledCourses || []).some(ec => ec._id === c._id)
  );

  return (
    <>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Enrolled Courses</th>
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
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      {(u.enrolledCourses || []).map(ec => (
                        <span key={ec._id} className="badge badge-success" style={{ fontSize: '11px', padding: '2px 8px' }}>
                          {ec.title}
                        </span>
                      ))}
                      <button 
                        className="btn btn-outline btn-sm" 
                        onClick={() => setSelectedUser(u)} 
                        style={{ padding: '2px 8px', fontSize: '11px', height: 'auto', minHeight: 'auto', borderRadius: '6px' }}
                      >
                        Manage
                      </button>
                    </div>
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

      {/* Manage Enrollment Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ fontSize: 18 }}>Manage Enrollment</h2>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 24 }}>×</button>
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>User</div>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>{selectedUser.name} ({selectedUser.email})</div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Currently Enrolled In ({selectedUser.enrolledCourses?.length || 0})</div>
              {(!selectedUser.enrolledCourses || selectedUser.enrolledCourses.length === 0) ? (
                <div style={{ fontSize: 13, color: 'var(--text-faint)', fontStyle: 'italic', padding: '6px 0' }}>Not enrolled in any courses</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedUser.enrolledCourses.map(ec => (
                    <div key={ec._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card2)', padding: '8px 12px', borderRadius: 8 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 500 }}>{ec.title}</span>
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={() => handleUnenroll(ec._id)} 
                        disabled={isSubmitting}
                        style={{ padding: '4px 8px', fontSize: 11, borderRadius: 6 }}
                      >
                        Unenroll
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>Enroll in New Course</div>
              <form onSubmit={handleEnroll} style={{ display: 'flex', gap: 10 }}>
                <select 
                  value={selectedCourseId} 
                  onChange={e => setSelectedCourseId(e.target.value)} 
                  required
                  style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}
                  disabled={isSubmitting || availableCourses.length === 0}
                >
                  <option value="">{availableCourses.length === 0 ? 'No courses available to enroll' : 'Select course...'}</option>
                  {availableCourses.map(c => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isSubmitting || !selectedCourseId}
                  style={{ padding: '8px 16px', fontSize: 13, borderRadius: 'var(--radius)' }}
                >
                  Enroll
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminUsers;
