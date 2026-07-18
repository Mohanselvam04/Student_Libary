import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchRedirectUrl } from '../../services/authService';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const redirectRes = await fetchRedirectUrl();
      toast.success(`Welcome back, ${user.name}!`);
      navigate(redirectRes.redirectTo || (user.role === 'admin' ? '/admin' : '/dashboard'));
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.toLowerCase().trim().endsWith('@gmail.com')) {
      return toast.error('Email must be a valid @gmail.com address');
    }
    setForgotLoading(true);
    try {
      await resetPassword(forgotEmail);
      toast.success('Password reset email sent! Check your inbox.');
      setShowForgotModal(false);
      setForgotEmail('');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>
      {/* Left Panel */}
      <div style={{
        flex: 1, background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 50%, var(--secondary) 100%)',
        display: 'flex', flexDirection: 'column', justifyContext: 'center', alignItems: 'center',
        justifyContent: 'center',
        padding: 60, position: 'relative', overflow: 'hidden'
      }} className="auth-left">
        <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 380 }}>
          <div style={{ width: 72, height: 72, background: 'rgba(255,255,255,0.15)', borderRadius: 22, display: 'flex', alignItems: 'center', justifyContext: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <GraduationCap size={36} color="white" />
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 800, color: 'white', marginBottom: 16, fontFamily: 'Syne, sans-serif' }}>LearnHub LMS</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, lineHeight: 1.7, fontWeight: 300 }}>
            Your complete learning management platform. Access courses, study materials, and AI-powered tutoring.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['500+ Courses', 'AI Tutor', 'Real-time Chat'].map(f => (
              <div key={f} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '6px 14px', color: 'white', fontSize: 12, fontWeight: 500 }}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div className="card" style={{ width: '100%', maxWidth: 440, padding: 36 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6, color: '#1e293b' }}>Welcome back</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: 13.5, fontWeight: 300 }}>Sign in to continue learning</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                <input id="email" type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  style={{ paddingLeft: 42 }} required />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 12 }}>
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                <input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ paddingLeft: 42, paddingRight: 42 }} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -4, marginBottom: 24 }}>
              <button type="button" onClick={() => setShowForgotModal(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 13, fontWeight: 500, cursor: 'pointer', padding: 0 }}>
                Forgot Password?
              </button>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14 }} disabled={loading}>
              {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: 13.5 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Create one</Link>
          </p>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400, padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Reset Password</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
              Enter your registered email address and we'll send you a recovery link.
            </p>
            <form onSubmit={handleForgotPasswordSubmit}>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label htmlFor="forgot-email">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                  <input 
                    id="forgot-email" 
                    type="email" 
                    placeholder="you@gmail.com" 
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    style={{ paddingLeft: 42 }} 
                    required 
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowForgotModal(false)} style={{ padding: '10px 18px', fontSize: 13.5 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 13.5 }} disabled={forgotLoading}>
                  {forgotLoading ? 'Sending...' : 'Send Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .auth-left { display: none; } }
      `}</style>
    </div>
  );
};

export default Login;
