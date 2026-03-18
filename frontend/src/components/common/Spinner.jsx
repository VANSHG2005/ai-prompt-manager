const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: { width: '16px', height: '16px' },
    md: { width: '28px', height: '28px' },
    lg: { width: '40px', height: '40px' },
  };

  return (
    <div
      className={`spinner-pv ${className}`}
      style={{ ...sizes[size] }}
    />
  );
};

export const PageLoader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
      <Spinner size="lg" />
      <p style={{ fontFamily: 'var(--f-mono)', fontSize: '12px', color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>Loading…</p>
    </div>
  </div>
);

export const LoadingDots = () => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
    <span className="loading-dot-pv" />
    <span className="loading-dot-pv" />
    <span className="loading-dot-pv" />
  </span>
);

export const MiniSpinner = ({ dark = false }) => (
  <span className={dark ? 'mini-spinner-dark-pv' : 'mini-spinner-pv'} />
);

export default Spinner;
