import React from 'react';
import { Users, BookOpen, FileText, GraduationCap, UserCheck, Shield } from 'lucide-react';

const AdminOverview = ({ stats, users, courses, initials }) => {
  const statCards = [
    { label: 'Total Users', value: stats.users || 0, icon: Users, color: 'var(--primary)', bg: 'rgba(46,125,50,0.08)' },
    { label: 'Students', value: stats.students || 0, icon: GraduationCap, color: '#0284c7', bg: 'rgba(2,132,199,0.08)' },
    { label: 'Instructors', value: stats.instructors || 0, icon: UserCheck, color: '#0d9488', bg: 'rgba(13,148,136,0.08)' },
    { label: 'Admins', value: stats.admins || 0, icon: Shield, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
    { label: 'Total Courses', value: stats.courses || 0, icon: BookOpen, color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
    { label: 'Materials', value: stats.materials || 0, icon: FileText, color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
  ];

  return (
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
  );
};

export default AdminOverview;
