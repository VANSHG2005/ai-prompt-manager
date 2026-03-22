import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Zap, AlertCircle } from 'lucide-react';
import { MiniSpinner } from '../components/common/Spinner';
import ThemeToggle from '../components/common/ThemeToggle';

const FormField = ({
  label,
  type = 'text',
  placeholder,
  autoComplete,
  value,
  error,
  onChange,
  extra,
}) => (
  <div>
    <label className="form-label-pv">{label}</label>
    <div style={{ position: 'relative' }}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="input-pv"
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{ borderColor: error ? 'var(--accent)' : undefined, paddingRight: extra ? '40px' : undefined }}
      />
      {extra}
    </div>
    {error && (
      <p style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <AlertCircle size={11} /> {error}
      </p>
    )}
  </div>
);

const Register = () => {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const { register, loading, user } = useAuth();
  const navigate = useNavigate();

  // Already authenticated — skip registration
  if (user) return <Navigate to="/dashboard" replace />;

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.email) e.email = 'Email is required';
    if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    const res = await register({ fullName: form.fullName, email: form.email, password: form.password });
    if (res.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setServerError(res.message || 'Registration failed');
    }
  };

  const clearFieldError = (field) => {
    if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n; });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative' }}>
      <div style={{ position: 'fixed', top: '18px', right: '20px' }}>
        <ThemeToggle />
      </div>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(ellipse at 25% 25%, var(--accent-subtle) 0%, transparent 55%), radial-gradient(ellipse at 75% 75%, var(--sage-subtle) 0%, transparent 55%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }} className="animate-slide-up">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div className="logo-icon-pv"><Zap size={14} color="white" /></div>
            <span style={{ fontFamily: 'var(--f-serif)', fontSize: '22px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>PromptVault</span>
          </div>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: '11.5px', color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>Your AI prompt library</p>
        </div>

        <div className="card-pv" style={{ padding: '32px' }}>
          <h2 style={{ fontFamily: 'var(--f-serif)', fontSize: '24px', color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '5px' }}>Create account</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '24px' }}>Start managing your AI prompts</p>

          {/* Server error */}
          {serverError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: 'var(--r-sm)', marginBottom: '16px' }}>
              <AlertCircle size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '13px', color: 'var(--accent)', margin: 0 }}>{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <FormField
              label="Full name"
              placeholder="Jane Smith"
              autoComplete="name"
              value={form.fullName}
              error={errors.fullName}
              onChange={e => { setForm(f => ({ ...f, fullName: e.target.value })); clearFieldError('fullName'); setServerError(''); }}
            />
            <FormField
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={form.email}
              error={errors.email}
              onChange={e => { setForm(f => ({ ...f, email: e.target.value })); clearFieldError('email'); setServerError(''); }}
            />
            <FormField
              label="Password"
              type={showPw ? 'text' : 'password'}
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
              value={form.password}
              error={errors.password}
              onChange={e => { setForm(f => ({ ...f, password: e.target.value })); clearFieldError('password'); setServerError(''); }}
              extra={
                <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
            <FormField
              label="Confirm password"
              type="password"
              placeholder="Re-enter password"
              autoComplete="new-password"
              value={form.confirmPassword}
              error={errors.confirmPassword}
              onChange={e => { setForm(f => ({ ...f, confirmPassword: e.target.value })); clearFieldError('confirmPassword'); setServerError(''); }}
            />

            <button
              type="submit"
              disabled={loading}
              className="btn-pv btn-primary-pv"
              style={{ justifyContent: 'center', display: 'flex', gap: '7px', padding: '10px', marginTop: '4px' }}
            >
              {loading ? <><MiniSpinner /> Creating account…</> : 'Create account'}
            </button>
          </form>

          <p style={{ fontSize: '13.5px', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '20px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
