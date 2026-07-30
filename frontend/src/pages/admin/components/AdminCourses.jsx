import React from 'react';

const AdminCourses = ({ courses, handleToggleCourse }) => {
  return (
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
                <td style={{ color: 'var(--text-muted)' }}>{c.instructor?.name}</td>
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
  );
};

export default AdminCourses;
