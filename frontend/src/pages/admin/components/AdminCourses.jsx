import React, { useState, useRef } from 'react';
import { Edit2, Trash2, Upload, FileImage, Image as ImageIcon } from 'lucide-react';
import ConfirmModal from '../../../components/common/ConfirmModal';

const CATEGORIES = ['Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'Language'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const AdminCourses = ({
  courses,
  handleToggleCourse,
  handleCreateCourse,
  handleUpdateCourse,
  handleDeleteCourse,
}) => {
  const [showModal, setShowModal] = useState(null); // 'create' | 'edit' | null
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: 'Programming',
    level: 'Beginner',
    duration: '',
    backgroundImage: '',
  });

  const [imageTab, setImageTab] = useState('upload'); // 'upload' | 'url'
  const [imageFile, setImageFile] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, courseId: null });
  const fileRef = useRef(null);

  const handleOpenCreate = () => {
    setCourseForm({
      title: '',
      description: '',
      category: 'Programming',
      level: 'Beginner',
      duration: '',
      backgroundImage: '',
    });
    setImageFile(null);
    setImageTab('upload');
    setShowModal('create');
  };

  const handleOpenEdit = (course) => {
    setSelectedCourse(course);
    setCourseForm({
      title: course.title || '',
      description: course.description || '',
      category: course.category || 'Programming',
      level: course.level || 'Beginner',
      duration: course.duration || '',
      backgroundImage: course.backgroundImage || '',
    });
    setImageFile(null);
    setImageTab(course.backgroundImage && !course.backgroundImage.startsWith('/uploads/') ? 'url' : 'upload');
    setShowModal('edit');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', courseForm.title);
    formData.append('description', courseForm.description);
    formData.append('category', courseForm.category);
    formData.append('level', courseForm.level);
    formData.append('duration', courseForm.duration);

    if (imageTab === 'url') {
      formData.append('backgroundImage', courseForm.backgroundImage);
    } else {
      formData.append('backgroundImage', ''); // Clear text URL if they use file upload
      if (imageFile) {
        formData.append('backgroundImageFile', imageFile);
      }
    }

    if (showModal === 'create') {
      formData.append('isPublished', 'true');
      const success = await handleCreateCourse(formData);
      if (success) setShowModal(null);
    } else if (showModal === 'edit') {
      const success = await handleUpdateCourse(selectedCourse._id, formData);
      if (success) setShowModal(null);
    }
  };

  const executeDelete = async () => {
    const id = confirmDelete.courseId;
    if (id) {
      await handleDeleteCourse(id);
    }
    setConfirmDelete({ isOpen: false, courseId: null });
  };

  const getPreviewSrc = () => {
    if (imageTab === 'upload' && imageFile) {
      return URL.createObjectURL(imageFile);
    }
    if (imageTab === 'url' && courseForm.backgroundImage) {
      return courseForm.backgroundImage;
    }
    if (showModal === 'edit' && selectedCourse && selectedCourse.backgroundImage) {
      if (selectedCourse.backgroundImage.startsWith('http') || selectedCourse.backgroundImage.startsWith('data:')) {
        return selectedCourse.backgroundImage;
      }
      return `http://localhost:8001${selectedCourse.backgroundImage}`;
    }
    return '';
  };

  const getCourseListImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    return `http://localhost:8001${url}`;
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          + Add Course
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Image</th>
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
                  <td>
                    {c.backgroundImage ? (
                      <div style={{
                        width: 50,
                        height: 35,
                        borderRadius: 6,
                        background: `url(${getCourseListImageUrl(c.backgroundImage)}) center/cover no-repeat`,
                        border: '1px solid var(--border)'
                      }} />
                    ) : (
                      <div style={{
                        width: 50,
                        height: 35,
                        borderRadius: 6,
                        background: 'linear-gradient(135deg, var(--primary-dark), var(--secondary))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>LMS</span>
                      </div>
                    )}
                  </td>
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
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button
                        className={`btn btn-sm ${c.isPublished ? 'btn-outline' : 'btn-success'}`}
                        onClick={() => handleToggleCourse(c._id)}
                      >
                        {c.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        className="btn btn-sm btn-outline"
                        style={{ padding: '6px 10px' }}
                        onClick={() => handleOpenEdit(c)}
                        title="Edit Course"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        style={{ padding: '6px 10px' }}
                        onClick={() => setConfirmDelete({ isOpen: true, courseId: c._id })}
                        title="Delete Course"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 650 }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {showModal === 'create' ? 'Create New Course (Admin)' : 'Edit Course (Admin)'}
              </h2>
              <button onClick={() => setShowModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 24 }}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: getPreviewSrc() ? '3fr 2fr' : '1fr', gap: 20 }}>
                {/* Inputs Column */}
                <div>
                  <div className="form-group">
                    <label>Course Title</label>
                    <input required placeholder="e.g. Introduction to Python" value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea required rows={3} placeholder="Describe your course..." value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} />
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label>Category</label>
                      <select value={courseForm.category} onChange={e => setCourseForm({ ...courseForm, category: e.target.value })}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Level</label>
                      <select value={courseForm.level} onChange={e => setCourseForm({ ...courseForm, level: e.target.value })}>
                        {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Duration</label>
                    <input placeholder="e.g. 8 weeks" value={courseForm.duration} onChange={e => setCourseForm({ ...courseForm, duration: e.target.value })} />
                  </div>
                </div>

                {/* Image Preview & Background settings Column (only if preview exists) */}
                {getPreviewSrc() && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <label style={{ fontWeight: 600, fontSize: 13, color: '#475569' }}>Card Header Preview</label>
                    <div style={{
                      height: 140,
                      borderRadius: 10,
                      background: `url(${getPreviewSrc()}) center/cover no-repeat`,
                      border: '1px solid var(--border)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }} />
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
                      Active background image preview
                    </div>
                  </div>
                )}
              </div>

              {/* Background Photo Section */}
              <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <div style={{ display: 'flex', justifyContext: 'space-between', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <label style={{ fontWeight: 600, margin: 0 }}>Course Background Photo</label>
                  <div style={{ display: 'flex', background: 'var(--bg-card2)', padding: 3, borderRadius: 8, border: '1px solid var(--border)' }}>
                    <button
                      type="button"
                      onClick={() => setImageTab('upload')}
                      style={{
                        padding: '4px 12px',
                        borderRadius: 6,
                        border: 'none',
                        background: imageTab === 'upload' ? 'white' : 'transparent',
                        boxShadow: imageTab === 'upload' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 500,
                        transition: 'all 0.15s'
                      }}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageTab('url')}
                      style={{
                        padding: '4px 12px',
                        borderRadius: 6,
                        border: 'none',
                        background: imageTab === 'url' ? 'white' : 'transparent',
                        boxShadow: imageTab === 'url' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 500,
                        transition: 'all 0.15s'
                      }}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {imageTab === 'upload' ? (
                  <div
                    onClick={() => fileRef.current?.click()}
                    style={{
                      border: `2px dashed ${imageFile ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius)',
                      padding: '20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: imageFile ? 'rgba(46,125,50,0.02)' : 'transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    <input
                      type="file"
                      ref={fileRef}
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setImageFile(e.target.files[0]);
                        }
                      }}
                    />
                    <ImageIcon size={26} color={imageFile ? 'var(--primary)' : 'var(--text-faint)'} style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {imageFile ? imageFile.name : 'Click to select course card background image'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      PNG, JPG, JPEG or GIF (max 10MB)
                    </div>
                  </div>
                ) : (
                  <div className="form-group" style={{ margin: 0 }}>
                    <input
                      placeholder="https://images.unsplash.com/photo-..."
                      value={courseForm.backgroundImage}
                      onChange={e => setCourseForm({ ...courseForm, backgroundImage: e.target.value })}
                    />
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      Provide any image link to use as the background card photo
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {showModal === 'create' ? 'Create Course' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, courseId: null })}
        onConfirm={executeDelete}
        title="Delete Course"
        message="Are you sure you want to delete this course? This action will permanently remove it and cannot be undone."
        confirmText="Delete Course"
      />
    </>
  );
};

export default AdminCourses;
