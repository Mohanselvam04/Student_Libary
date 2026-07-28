import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, BookOpen, FileText, MessageSquare, Users,
  LogOut, GraduationCap, BarChart3, Settings
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const studentLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/courses', icon: BookOpen, label: 'Courses' },
    { to: '/materials', icon: FileText, label: 'Materials' },
    { to: '/chat', icon: MessageSquare, label: 'Chat & AI Tutor' },
  ];

  const adminLinks = [
    { to: '/admin', icon: BarChart3, label: 'Overview' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
    { to: '/materials', icon: FileText, label: 'Materials' },
    { to: '/chat', icon: MessageSquare, label: 'Messaging' },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      background: 'white',
      borderRight: '1px solid #f1f5f9',
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      padding: '0 0 20px 0',
      boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <div style={{
          width: 38,
          height: 38,
          background: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)',
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(46,125,50,0.2)'
        }}>
          <GraduationCap size={20} color="white" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b', letterSpacing: '-0.02em' }}>LearnHub</div>
          <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>LMS Portal</div>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: '24px 16px', overflowY: 'auto' }}>
        <div style={{
          fontSize: 10,
          fontWeight: 600,
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          padding: '0 8px',
          marginBottom: 12
        }}>
          {user?.role === 'admin' ? 'Admin Menu' : 'Main Menu'}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin' || to === '/dashboard'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 8,
                fontWeight: 500,
                fontSize: 13.5,
                color: isActive ? 'white' : '#475569',
                background: isActive ? '#43a047' : 'transparent',
                boxShadow: isActive ? '0 4px 12px rgba(67,160,71,0.2)' : 'none',
                transition: 'all 0.2s ease',
              })}
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User Profile */}
      <div style={{ padding: '0 16px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)',
          borderRadius: 12,
          padding: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 10,
          color: 'white',
          boxShadow: '0 4px 12px rgba(46,125,50,0.15)'
        }}>
          <div className="avatar" style={{
            width: 36,
            height: 36,
            fontSize: 13,
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            flexShrink: 0
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', textTransform: 'capitalize', fontWeight: 300 }}>{user?.role}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-outline"
          style={{
            width: '100%',
            justifyContent: 'center',
            fontSize: 13,
            borderColor: '#e2e8f0',
            color: '#64748b'
          }}
        >
          <LogOut size={15} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
