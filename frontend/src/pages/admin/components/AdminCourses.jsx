import React, { useState } from 'react';

const CATEGORIES = ['Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'Language'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const AdminCourses = ({ courses, handleToggleCourse, handleCreateCourse }) => {
  const [showModal, setShowModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: 'Programming',
    level: 'Beginner',
    duration: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await handleCreateCourse({ ...newCourse, isPublished: true });
    if (success) {
      setShowModal(false);
      setNewCourse({
        title: '',
        description: '',
        category: 'Programming',
        level: 'Beginner',
        duration: '',
      });
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Course
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Instructor</th>
                <th>Category</th>
                <th>Students</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.title}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{c.instructor?.name || 'Admin'}</td>
                  <td>
                    <span className="badge badge-primary">{c.category}</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{c.enrolledStudents?.length || 0}</td>
                  <td>
                    <span className={`badge ${c.isPublished ? 'badge-success' : 'badge-warning'}`}>
                      {c.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${c.isPublished ? 'btn-outline' : 'btn-success'}`}
                      onClick={() => handleToggleCourse(c._id)}
                    >
                      {c.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Course (Admin)</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 24 }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Course Title</label>
                <input required placeholder="e.g. Introduction to Python" value={newCourse.title} onChange={e => setNewCourse({ ...newCourse, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea required rows={3} placeholder="Describe your course..." value={newCourse.description} onChange={e => setNewCourse({ ...newCourse, description: e.target.value })} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Category</label>
                  <select value={newCourse.category} onChange={e => setNewCourse({ ...newCourse, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Level</label>
                  <select value={newCourse.level} onChange={e => setNewCourse({ ...newCourse, level: e.target.value })}>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Duration</label>
                <input placeholder="e.g. 8 weeks" value={newCourse.duration} onChange={e => setNewCourse({ ...newCourse, duration: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Course</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminCourses;
