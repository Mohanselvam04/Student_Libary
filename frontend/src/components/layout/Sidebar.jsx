import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, BookOpen, FileText, MessageSquare, Users,
  LogOut, GraduationCap, BarChart3, Settings, Sparkles, Menu, X
} from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../../services/api';

const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:8001');

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const fetchUnread = async () => {
    try {
      const res = await api.get('/api/messages/conversations');
      const conversations = res.data || [];
      const count = conversations.reduce((acc, c) => acc + (c.unread || 0), 0);
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  useEffect(() => {
    if (!user) return;
    void fetchUnread();

    socket.emit('join', user._id);
    const handleNewMsg = () => {
      void fetchUnread();
    };
    socket.on('newMessage', handleNewMsg);

    // Periodically sync unread counts as fallback every 15 seconds
    const interval = setInterval(fetchUnread, 15000);

    return () => {
      socket.off('newMessage', handleNewMsg);
      clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const studentLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/courses', icon: BookOpen, label: 'Courses' },
    { to: '/materials', icon: FileText, label: 'Materials' },
    { to: '/ai-tutor', icon: Sparkles, label: 'AI Tutor' },
    { to: '/chat', icon: MessageSquare, label: 'Messaging' },
  ];

  const adminLinks = [
    { to: '/admin', icon: BarChart3, label: 'Overview' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
    { to: '/materials', icon: FileText, label: 'Materials' },
    { to: '/ai-tutor', icon: Sparkles, label: 'AI Tutor' },
    { to: '/chat', icon: MessageSquare, label: 'Messaging' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const sidebarContent = (
    <>
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
        <button
          onClick={() => setMobileOpen(false)}
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer'
          }}
          className="sidebar-close-btn"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

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
              onClick={() => setMobileOpen(false)}
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
              <span style={{ flex: 1 }}>{label}</span>
              {to === '/chat' && unreadCount > 0 && (
                <span style={{
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  minWidth: 18,
                  height: 18,
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                  padding: '2px'
                }}>
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

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
    </>

  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        style={{
          position: 'fixed',
          top: 14,
          left: 14,
          zIndex: 200,
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          width: 42,
          height: 42,
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#1e293b',
          boxShadow: '0 8px 18px rgba(15,23,42,0.08)',
          cursor: 'pointer'
        }}
        className="mobile-menu-btn"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <aside className="sidebar-desktop" style={{
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
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setMobileOpen(false);
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            zIndex: 150,
            border: 'none',
            padding: 0,
            display: 'block',
            cursor: 'pointer'
          }}
          aria-label="Close side menu"
        />
      )}

      <aside style={{
        width: '84%',
        maxWidth: 280,
        background: 'white',
        borderRight: '1px solid #f1f5f9',
        position: 'fixed',
        top: 0,
        left: mobileOpen ? 0 : '-110%',
        height: '100vh',
        display: 'none',
        flexDirection: 'column',
        zIndex: 200,
        padding: '0 0 20px 0',
        boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
        transition: 'left 0.25s ease',
      }} className="sidebar-mobile">
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
