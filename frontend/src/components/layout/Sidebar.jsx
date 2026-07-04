import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, BookOpen, FileText, MessageSquare, Users,
  Settings, LogOut, GraduationCap, Bot, BarChart3
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
    { to: '/materials', icon: FileText, label: 'Materials' },
    { to: '/chat', icon: MessageSquare, label: 'Messaging' },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <aside style={{
      width: 'var(--sidebar-width)', background: 'var(--bg-card)',
      borderRight: '1px solid var(--border)', position: 'fixed',
      top: 0, left: 0, height: '100vh', display: 'flex',
      flexDirection: 'column', zIndex: 100, padding: '0 0 20px 0'
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, background: 'var(--primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GraduationCap size={20} color="white" />
        </div>
        <div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16 }}>LearnHub</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>LMS Platform</div>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px', marginBottom: 8 }}>
          {user?.role === 'admin' ? 'Admin Menu' : 'Main Menu'}
        </div>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/admin' || to === '/dashboard'} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            borderRadius: 10, marginBottom: 2, fontWeight: 500, fontSize: 14,
            color: isActive ? 'white' : 'var(--text-muted)',
            background: isActive ? 'var(--primary)' : 'transparent',
            transition: 'all 0.15s',
          })}>
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div style={{ padding: '0 12px' }}>
        <div style={{ background: 'var(--bg-card2)', borderRadius: 12, padding: '12px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div className="avatar" style={{ width: 36, height: 36, fontSize: 14, background: 'var(--primary)', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
