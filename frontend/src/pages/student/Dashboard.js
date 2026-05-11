import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/layout/Sidebar';
import { BookOpen, FileText, MessageSquare, TrendingUp, Clock, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState({ enrolled: [], created: [] });
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/courses/my'),
      axios.get('/api/materials?limit=5'),
    ]).then(([coursesRes, matsRes]) => {
      setCourses(coursesRes.data);
      setMaterials(matsRes.data.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Enrolled Courses', value: courses.enrolled.length, icon: BookOpen, color: '#4f46e5', bg: 'rgba(79,70,229,0.15)' },
    { label: 'Study Materials', value: materials.length, icon: FileText, color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
    { label: 'Active Sessions', value: 1, icon: TrendingUp, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    { label: 'Hours Learned', value: '12h', icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  ];

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        {/* Welcome Banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 60%, var(--secondary) 100%)',
          borderRadius: 'var(--radius-lg)', padding: '32px', marginBottom: 28, position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)', width: 120, height: 120, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', right: 80, bottom: -20, width: 80, height: 80, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>Welcome back 👋</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 8 }}>{user?.name}</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Continue your learning journey. You have {courses.enrolled.length} active courses.</p>
            <Link to="/courses" className="btn" style={{ marginTop: 20, background: 'white', color: 'var(--primary)', fontWeight: 700 }}>
              Browse Courses <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="stat-card">
              <div className="stat-icon" style={{ background: bg }}>
                <Icon size={22} color={color} />
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800 }}>{value}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid-2">
          {/* My Courses */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16 }}>My Courses</h3>
              <Link to="/courses" style={{ fontSize: 13, color: 'var(--primary-light)' }}>View all →</Link>
            </div>
            {loading ? <div className="loading">Loading...</div> :
              courses.enrolled.length === 0 ? (
                <div className="empty-state" style={{ padding: '30px 0' }}>
                  <BookOpen size={40} />
                  <p style={{ marginTop: 8 }}>No courses yet</p>
                  <Link to="/courses" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Browse Courses</Link>
                </div>
              ) : courses.enrolled.map(course => (
                <div key={course._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 44, height: 44, background: 'rgba(79,70,229,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BookOpen size={20} color="var(--primary-light)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{course.instructor?.name}</div>
                  </div>
                  <span className="badge badge-primary">{course.level}</span>
                </div>
              ))
            }
          </div>

          {/* Recent Materials */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16 }}>Recent Materials</h3>
              <Link to="/materials" style={{ fontSize: 13, color: 'var(--primary-light)' }}>View all →</Link>
            </div>
            {loading ? <div className="loading">Loading...</div> :
              materials.length === 0 ? (
                <div className="empty-state" style={{ padding: '30px 0' }}>
                  <FileText size={40} />
                  <p style={{ marginTop: 8 }}>No materials yet</p>
                </div>
              ) : materials.map(mat => (
                <div key={mat._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 44, height: 44, background: 'rgba(6,182,212,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>
                    {mat.type === 'pdf' ? '📄' : mat.type === 'video' ? '🎬' : mat.type === 'image' ? '🖼️' : '📁'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mat.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{mat.type} • {mat.uploadedBy?.name}</div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Quick Actions</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/courses" className="btn btn-outline"><BookOpen size={16} /> Browse Courses</Link>
            <Link to="/materials" className="btn btn-outline"><FileText size={16} /> View Materials</Link>
            <Link to="/chat" className="btn btn-outline"><MessageSquare size={16} /> Open Chat</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
