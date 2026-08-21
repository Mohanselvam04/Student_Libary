import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { verifyResetCode, confirmResetPassword } from '../../services/authService';
import { GraduationCap, Lock, ArrowRight, Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

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

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  
  const [email, setEmail] = useState('');
  const [verifying, setVerifying] = useState(true);
  const [codeValid, setCodeValid] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkCode = async () => {
      if (!oobCode) {
        setErrorMsg('Invalid or missing password reset code in link.');
        setVerifying(false);
        setCodeValid(false);
        return;
      }
      try {
        const res = await verifyResetCode(oobCode);
        setEmail(res.email);
        setCodeValid(true);
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'The password reset link is invalid or has expired.');
        setCodeValid(false);
      } finally {
        setVerifying(false);
      }
    };
    checkCode();
  }, [oobCode]);

  const passwordChecks = validatePassword(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPasswordStrong(password)) {
      return toast.error('Password must be 5+ chars and include upper, lower, number, special character');
    }
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await confirmResetPassword(oobCode, password);
      toast.success('Password reset successful! You can now log in with your new password.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 50, height: 50, border: '3px solid rgba(46,125,50,0.2)', borderTop: '3px solid var(--primary)',
            borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px'
          }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Verifying reset link...</p>
        </div>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!codeValid) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <AlertCircle size={32} color="#ef4444" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: '#1e293b' }}>Link Invalid or Expired</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: 14.5, lineHeight: 1.6 }}>
            {errorMsg || 'The password reset link is invalid. Please request a new password reset link from the login page.'}
          </p>
          <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex', padding: '12px 24px', fontSize: 14 }}>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 58, height: 58, background: 'gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', backgroundColor: 'var(--primary)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 10px rgba(46,125,50,0.15)' }}>
            <GraduationCap size={28} color="white" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6, color: '#1e293b', fontFamily: 'Syne, sans-serif' }}>New Password</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13.5, fontWeight: 300 }}>Set a new password for {email}</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                <input 
                  id="new-password" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="New strong password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingLeft: 42, paddingRight: 42 }} 
                  required 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label htmlFor="confirm-new-password">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                <input 
                  id="confirm-new-password" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Confirm new password" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: 42, paddingRight: 42 }} 
                  required 
                />
              </div>
            </div>

            {/* Password Validation Checklist */}
            <div style={{ marginBottom: 24, display: 'grid', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
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

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14 }} disabled={loading}>
              {loading ? 'Updating password...' : <><span>Reset Password</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: 13.5 }}>
            Remembered your password?{' '}
            <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
