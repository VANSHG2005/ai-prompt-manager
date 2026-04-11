import { memo } from 'react';

/* ── Reusable skeleton line ─────────────────────────── */
const Skel = ({ w = '100%', h = 14, r = 4, mb = 0 }) => (
  <div
    className="skeleton-pv"
    style={{ width: w, height: h, borderRadius: r, marginBottom: mb, flexShrink: 0 }}
  />
);

/* ── Single prompt card skeleton ────────────────────── */
export const PromptCardSkeleton = () => (
  <div className="skeleton-card-pv">
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Skel w={72} h={20} r={10} />
      <Skel w={52} h={14} />
    </div>
    <Skel w="70%" h={16} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Skel h={12} />
      <Skel h={12} />
      <Skel w="60%" h={12} />
    </div>
    <div style={{ display: 'flex', gap: 6 }}>
      <Skel w={48} h={20} r={4} />
      <Skel w={56} h={20} r={4} />
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
      <Skel w={80} h={12} />
      <Skel w={24} h={24} r={6} />
    </div>
  </div>
);

/* ── Grid of 6 card skeletons ───────────────────────── */
export const PromptGridSkeleton = ({ count = 6 }) => (
  <div
    className="prompt-grid-mobile"
    style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}
  >
    {Array.from({ length: count }).map((_, i) => (
      <PromptCardSkeleton key={i} />
    ))}
  </div>
);

/* ── Dashboard stat row skeleton ────────────────────── */
export const StatRowSkeleton = () => (
  <div
    className="stat-grid-mobile"
    style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 22 }}
  >
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="skeleton-card-pv" style={{ padding: '18px 20px', gap: 10 }}>
        <Skel w={80} h={10} />
        <Skel w={60} h={32} />
      </div>
    ))}
  </div>
);

/* ── Full page skeleton for Dashboard ───────────────── */
export const DashboardSkeleton = () => (
  <>
    <div style={{ marginBottom: 28 }}>
      <Skel w={220} h={28} mb={8} />
      <Skel w={300} h={14} />
    </div>
    <StatRowSkeleton />
    <div
      className="dashboard-split-mobile"
      style={{ display: 'grid', gridTemplateColumns: '1fr 272px', gap: 16, marginBottom: 22 }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="skeleton-card-pv" style={{ height: 120 }}><Skel h="100%" style={{ flex: 1 }} /></div>
        <div className="skeleton-card-pv" style={{ height: 140 }}><Skel h="100%" /></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="skeleton-card-pv" style={{ height: 160 }}><Skel h="100%" /></div>
        <div className="skeleton-card-pv" style={{ height: 120 }}><Skel h="100%" /></div>
      </div>
    </div>
    <Skel w={140} h={18} mb={14} />
    <div
      className="recent-grid-mobile"
      style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="skeleton-card-pv" style={{ height: 140 }} />
      ))}
    </div>
  </>
);

export default PromptGridSkeleton;
