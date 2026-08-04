import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Mail, Lock, User, ArrowRight, Eye, EyeOff, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const validateEmail = (email) => {
  if (!email) return false;
  return email.toLowerCase().trim().endsWith('@gmail.com');
};

const validatePassword = (password) => ({
  length: password.length >= 5,
  upper: /[A-Z]/.test(password),
  lower: /[a-z]/.test(password),
  number: /\d/.test(password),
  special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
});

const isPasswordStrong = (password) => {
  const checks = validatePassword(password);
  return checks.length && checks.upper && checks.lower && checks.number && checks.special;
};

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Card Visibility Management
  const [adminCardVisible, setAdminCardVisible] = useState(true);
  const [instructorCardVisible, setInstructorCardVisible] = useState(true);
  const [studentCardVisible, setStudentCardVisible] = useState(true);

  useEffect(() => {
    const fetchVisibility = async () => {
      try {
        const [adminRes, instructorRes, studentRes] = await Promise.all([
          api.get('/api/auth/admin-card-visibility'),
          api.get('/api/auth/instructor-card-visibility'),
          api.get('/api/auth/student-card-visibility')
        ]);
        setAdminCardVisible(adminRes.data.visible);
        setInstructorCardVisible(instructorRes.data.visible);
        setStudentCardVisible(studentRes.data.visible);
        
        let fallbackRole = form.role;
        if (!adminRes.data.visible && fallbackRole === 'admin') {
          fallbackRole = 'student';
        }
        if (!instructorRes.data.visible && fallbackRole === 'instructor') {
          fallbackRole = 'student';
        }
        if (!studentRes.data.visible && fallbackRole === 'student') {
          if (instructorRes.data.visible) fallbackRole = 'instructor';
          else if (adminRes.data.visible) fallbackRole = 'admin';
        }
        if (fallbackRole !== form.role) {
          setForm(prev => ({ ...prev, role: fallbackRole }));
        }
      } catch (err) {
        console.error('Error fetching visibility settings:', err);
      }
    };
    fetchVisibility();
  }, []);

  const passwordChecks = validatePassword(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(form.email)) {
      return toast.error('Email must be a valid @gmail.com address');
    }
    if (!isPasswordStrong(form.password)) {
      return toast.error('Password must be 5+ chars and include upper, lower, number, special character');
    }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! A verification email has been sent to your Gmail (check Spam folder if not found).');
      if (form.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 58, height: 58, background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 10px rgba(46,125,50,0.15)' }}>
            <GraduationCap size={28} color="white" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6, color: '#1e293b', fontFamily: 'Syne, sans-serif' }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13.5, fontWeight: 300 }}>Join LearnHub and start learning today</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                <input id="name" type="text" placeholder="John Doe" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  style={{ paddingLeft: 42 }} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                <input id="email" type="email" placeholder="you@gmail.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  style={{ paddingLeft: 42 }} required />
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                Only Gmail addresses are accepted.
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                <input id="password" type={showPassword ? 'text' : 'password'} placeholder="Create strong password" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ paddingLeft: 42, paddingRight: 42 }} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div style={{ marginTop: 10, display: 'grid', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: passwordChecks.length ? '#10b981' : 'var(--text-muted)' }}>
                  {passwordChecks.length ? <Check size={14} /> : <X size={14} />} At least 5 characters
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: passwordChecks.upper ? '#10b981' : 'var(--text-muted)' }}>
                  {passwordChecks.upper ? <Check size={14} /> : <X size={14} />} One uppercase letter
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: passwordChecks.lower ? '#10b981' : 'var(--text-muted)' }}>
                  {passwordChecks.lower ? <Check size={14} /> : <X size={14} />} One lowercase letter
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: passwordChecks.number ? '#10b981' : 'var(--text-muted)' }}>
                  {passwordChecks.number ? <Check size={14} /> : <X size={14} />} One number
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: passwordChecks.special ? '#10b981' : 'var(--text-muted)' }}>
                  {passwordChecks.special ? <Check size={14} /> : <X size={14} />} One special character
                </div>
              </div>
            </div>

            <fieldset className="form-group" style={{ border: 'none', padding: 0, margin: '0 0 24px 0' }}>
              {/* <legend style={{ marginBottom: 10, fontWeight: 500, fontSize: 13, color: 'var(--text-muted)' }}>I am joining as</legend> */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${
                  ['student', 'instructor', 'admin'].filter(role => 
                    (role === 'student' && studentCardVisible) || 
                    (role === 'admin' && adminCardVisible) || 
                    (role === 'instructor' && instructorCardVisible)
                  ).length
                }, 1fr)`,
                gap: 10
              }}>
                {['student', 'instructor', 'admin'].filter(role => 
                  (role === 'student' && studentCardVisible) || 
                  (role === 'admin' && adminCardVisible) || 
                  (role === 'instructor' && instructorCardVisible)
                ).map((roleItem) => {
                  let icon = '🛡️';
                  if (roleItem === 'student') icon = '🎓';
                  else if (roleItem === 'instructor') icon = '👩‍🏫';
                  const isSelected = form.role === roleItem;
                  return (
                    <button
                      key={roleItem}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setForm({ ...form, role: roleItem })}
                      style={{
                        padding: '10px', borderRadius: 8, border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                        background: isSelected ? 'rgba(46,125,50,0.08)' : 'transparent',
                        color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                        cursor: 'pointer', fontWeight: 600, fontSize: 13, textTransform: 'capitalize', transition: 'all 0.2s'
                      }}
                    >
                      {icon} {roleItem}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14 }} disabled={loading}>
              {loading ? 'Creating account...' : <><span>Create Account</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: 13.5 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
