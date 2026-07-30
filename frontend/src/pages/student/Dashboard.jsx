import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/layout/Sidebar';
import { fetchMyCourses } from '../../services/courseService';
import { fetchMaterials } from '../../services/materialService';
import { BookOpen, FileText, MessageSquare, TrendingUp, Clock, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState({ enrolled: [], created: [] });
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchMyCourses(),
      fetchMaterials({ limit: 5 }),
    ]).then(([coursesRes, matsRes]) => {
      setCourses(coursesRes || { enrolled: [], created: [] });
      setMaterials((matsRes || []).slice(0, 5));
    }).catch(err => {
      console.error('Failed to load dashboard data:', err);
    }).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Enrolled Courses', value: courses.enrolled?.length || 0, icon: BookOpen, color: 'var(--primary)', bg: 'rgba(46,125,50,0.08)' },
    { label: 'Study Materials', value: materials.length, icon: FileText, color: '#0284c7', bg: 'rgba(2,132,199,0.08)' },
    { label: 'Active Sessions', value: 1, icon: TrendingUp, color: '#0d9488', bg: 'rgba(13,148,136,0.08)' },
    { label: 'Hours Learned', value: '12h', icon: Clock, color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
  ];

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        {/* Welcome Banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 60%, var(--secondary) 100%)',
          borderRadius: 'var(--radius-lg)', padding: '32px', marginBottom: 28, position: 'relative', overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(46,125,50,0.15)'
        }}>
          <div style={{ position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)', width: 120, height: 120, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', right: 80, bottom: -20, width: 80, height: 80, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>Welcome back 👋</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 8, fontFamily: 'Syne, sans-serif' }}>{user?.name}</h1>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: 300 }}>Continue your learning journey. You have {courses.enrolled?.length || 0} active courses.</p>
            <Link to="/courses" className="btn" style={{ marginTop: 20, background: 'white', color: 'var(--primary)', fontWeight: 600, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
              Browse Courses <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
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
          {/* My Courses */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>My Courses</h3>
              <Link to="/courses" style={{ fontSize: 12.5, color: 'var(--primary-light)', fontWeight: 500 }}>View all →</Link>
            </div>
            {loading ? <div className="loading">Loading...</div> :
              (!courses.enrolled || courses.enrolled.length === 0) ? (
                <div className="empty-state" style={{ padding: '30px 0' }}>
                  <BookOpen size={36} color="var(--text-faint)" />
                  <p style={{ marginTop: 8, fontSize: 13.5 }}>No courses yet</p>
                  <Link to="/courses" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Browse Courses</Link>
                </div>
              ) : courses.enrolled.map(course => (
                <div key={course._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 40, height: 40, background: 'rgba(46,125,50,0.08)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BookOpen size={18} color="var(--primary)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{course.instructor?.name}</div>
                  </div>
                  <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>{course.level}</span>
                </div>
              ))
            }
          </div>

          {/* Recent Materials */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recent Materials</h3>
              <Link to="/materials" style={{ fontSize: 12.5, color: 'var(--primary-light)', fontWeight: 500 }}>View all →</Link>
            </div>
            {loading ? <div className="loading">Loading...</div> :
              materials.length === 0 ? (
                <div className="empty-state" style={{ padding: '30px 0' }}>
                  <FileText size={36} color="var(--text-faint)" />
                  <p style={{ marginTop: 8, fontSize: 13.5 }}>No materials yet</p>
                </div>
              ) : materials.map(mat => (
                <div key={mat._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 40, height: 40, background: 'var(--bg-card2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>
                    {mat.type === 'pdf' ? '📄' : mat.type === 'video' ? '🎬' : mat.type === 'image' ? '🖼️' : mat.type === 'doc' ? '📝' : mat.type === 'ppt' ? '📊' : '📁'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mat.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{mat.type} • {mat.uploadedBy?.name}</div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Quick Actions</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/courses" className="btn btn-outline" style={{ fontSize: 13 }}><BookOpen size={15} /> Browse Courses</Link>
            <Link to="/materials" className="btn btn-outline" style={{ fontSize: 13 }}><FileText size={15} /> View Materials</Link>
            <Link to="/chat" className="btn btn-outline" style={{ fontSize: 13 }}><MessageSquare size={15} /> Open Chat</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
