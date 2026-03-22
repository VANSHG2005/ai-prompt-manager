import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Zap, AlertCircle } from 'lucide-react';
import { MiniSpinner } from '../components/common/Spinner';
import ThemeToggle from '../components/common/ThemeToggle';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();

  // Already authenticated — skip the login page
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(form);
    if (res.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(res.message || 'Invalid email or password');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative' }}>
      <div style={{ position: 'fixed', top: '18px', right: '20px' }}>
        <ThemeToggle />
      </div>

      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(ellipse at 25% 25%, var(--accent-subtle) 0%, transparent 55%), radial-gradient(ellipse at 75% 75%, var(--sage-subtle) 0%, transparent 55%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1 }} className="animate-slide-up">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div className="logo-icon-pv"><Zap size={14} color="white" /></div>
            <span style={{ fontFamily: 'var(--f-serif)', fontSize: '22px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>PromptVault</span>
          </div>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: '11.5px', color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>Welcome back</p>
        </div>

        <div className="card-pv" style={{ padding: '32px' }}>
          <h2 style={{ fontFamily: 'var(--f-serif)', fontSize: '24px', color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '5px' }}>Sign in</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '24px' }}>Enter your credentials to continue</p>

          {/* Inline error banner */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: 'var(--r-sm)', marginBottom: '16px' }}>
              <AlertCircle size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '13px', color: 'var(--accent)', margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="form-label-pv">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setError(''); }}
                className="input-pv"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="form-label-pv">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setError(''); }}
                  className="input-pv"
                  placeholder="••••••••"
                  style={{ paddingRight: '40px' }}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex' }}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-pv btn-primary-pv"
              style={{ justifyContent: 'center', display: 'flex', gap: '7px', padding: '10px', marginTop: '4px' }}
            >
              {loading ? <><MiniSpinner /> Signing in…</> : 'Sign in'}
            </button>
          </form>

          <p style={{ fontSize: '13.5px', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '20px' }}>
            No account?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
