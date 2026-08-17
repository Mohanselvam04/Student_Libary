import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { fetchCourses, enrollInCourse, createCourse } from '../../services/courseService';
import { Search, BookOpen, Users, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['All', 'Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'Language'];
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const getCourseImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  return `http://localhost:8001${url}`;
};

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [enrolling, setEnrolling] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', category: 'Programming', level: 'Beginner', duration: '' });

  const getCoursesList = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      if (level !== 'All') params.level = level;
      const data = await fetchCourses(params);
      setCourses(data || []);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { getCoursesList(); }, [search, category, level]);

  const handleEnroll = async (courseId) => {
    setEnrolling(courseId);
    try {
      await enrollInCourse(courseId);
      toast.success('Enrolled successfully!');
      getCoursesList();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createCourse({ ...newCourse, isPublished: true });
      toast.success('Course created!');
      setShowModal(false);
      getCoursesList();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create course');
    }
  };

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Courses</h1>
            <p className="page-subtitle">Explore and enroll in available courses</p>
          </div>
          {/* {isInstructor && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Create Course
            </button>
          )
          } */}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
            <Search size={16} />
            <input placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: 'auto', minWidth: 140 }}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={level} onChange={e => setLevel(e.target.value)} style={{ width: 'auto', minWidth: 140 }}>
            {LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>

        {loading ? <div className="loading"><BookOpen size={20} /> Loading courses...</div> :
          courses.length === 0 ? (
            <div className="empty-state">
              <BookOpen size={50} color="var(--text-faint)" />
              <h3 style={{ marginTop: 16, fontSize: 16, fontWeight: 700 }}>No courses found</h3>
              <p style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid-3">
              {courses.map(course => (
                <div key={course._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{
                    height: 130,
                    background: course.backgroundImage
                      ? `url(${getCourseImageUrl(course.backgroundImage)}) center/cover no-repeat`
                      : 'linear-gradient(135deg, var(--primary-dark), var(--secondary))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    {!course.backgroundImage && <BookOpen size={44} color="rgba(255,255,255,0.3)" />}
                  </div>
                  <div style={{ padding: 20 }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                      <span className="badge badge-primary">{course.category}</span>
                      <span className="badge badge-warning">{course.level}</span>
                    </div>
                    <h3 style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 8, lineHeight: 1.4, color: '#1e293b' }}>{course.title}</h3>
                    <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: 40 }}>{course.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={13} /> {course.enrolledStudents?.length || 0}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={13} color="var(--accent)" fill="var(--accent)" /> {course.rating || '4.5'}</span>
                      {course.duration && <span>⏱ {course.duration}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>by <span style={{ color: 'var(--text)', fontWeight: 500 }}>{course.instructor?.name}</span></div>
                      {user && (user.id || user._id) ? (
                        course.enrolledStudents?.some(id => id && String(id) === String(user.id || user._id)) ? (
                          <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: '13px' }}>Enrolled</span>
                        ) : (
                          <button className="btn btn-primary btn-sm" onClick={() => handleEnroll(course._id)} disabled={enrolling === course._id}>
                            {enrolling === course._id ? '...' : 'Enroll'}
                          </button>
                        )
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        }

        {/* Create Course Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Create New Course</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 24 }}>×</button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="form-group"><label>Course Title</label><input required placeholder="e.g. Introduction to Python" value={newCourse.title} onChange={e => setNewCourse({ ...newCourse, title: e.target.value })} /></div>
                <div className="form-group"><label>Description</label><textarea required rows={3} placeholder="Describe your course..." value={newCourse.description} onChange={e => setNewCourse({ ...newCourse, description: e.target.value })} /></div>
                <div className="grid-2">
                  <div className="form-group"><label>Category</label><select value={newCourse.category} onChange={e => setNewCourse({ ...newCourse, category: e.target.value })}>{CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}</select></div>
                  <div className="form-group"><label>Level</label><select value={newCourse.level} onChange={e => setNewCourse({ ...newCourse, level: e.target.value })}>{LEVELS.filter(l => l !== 'All').map(l => <option key={l}>{l}</option>)}</select></div>
                </div>
                <div className="form-group"><label>Duration</label><input placeholder="e.g. 8 weeks" value={newCourse.duration} onChange={e => setNewCourse({ ...newCourse, duration: e.target.value })} /></div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Course</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Courses;
