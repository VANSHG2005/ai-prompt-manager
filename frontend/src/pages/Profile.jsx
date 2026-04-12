import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { promptService } from '../services/promptService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  User, Lock, Save, Globe, MapPin, Bot, Trash2, Eye, EyeOff,
  Award, Flame, Target, Heart, Sparkles, Activity, BarChart2,
  Bell, Key, CheckCircle, Calendar, Shield, Star, Hash,
  TrendingUp, Zap, Copy, Download, RefreshCw
} from 'lucide-react';
import Spinner from '../components/common/Spinner';
import { MiniSpinner } from '../components/common/Spinner';
import { AI_TOOLS } from '../utils/constants';

const AVATAR_COLORS = {
  terracotta: '#C4441A',
  midnight:   '#2A3A5C',
  forest:     '#3A6B5A',
  plum:       '#6a2a5c',
  slate:      '#3a4a5c',
  amber:      '#c8811a',
  teal:       '#1a5c52',
  rose:       '#c7336e',
};

/* ─────────────────────────────────────────────────────
   STAT PILL
───────────────────────────────────────────────────── */
const StatPill = ({ icon: Icon, label, value, color }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 4, padding: '14px 10px', background: 'var(--bg-subtle)',
    borderRadius: 'var(--r-md)', flex: 1, minWidth: 70,
  }}>
    <Icon size={16} color={color || 'var(--accent)'} />
    <span style={{
      fontFamily: 'var(--f-serif)', fontSize: 22, color: 'var(--text-primary)',
      letterSpacing: '-0.02em', lineHeight: 1,
    }}>{value}</span>
    <span style={{
      fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-tertiary)',
      textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center',
    }}>{label}</span>
  </div>
);

/* ─────────────────────────────────────────────────────
   ACHIEVEMENT BADGE
───────────────────────────────────────────────────── */
const Achievement = ({ icon: Icon, title, desc, unlocked, color }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
    background: unlocked ? 'var(--bg-subtle)' : 'var(--bg-base)',
    border: `1px solid ${unlocked ? color + '40' : 'var(--border)'}`,
    borderRadius: 'var(--r-md)', opacity: unlocked ? 1 : 0.45,
    transition: 'all .2s',
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      background: unlocked ? color + '20' : 'var(--bg-muted)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Icon size={16} color={unlocked ? color : 'var(--text-tertiary)'} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: unlocked ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
        {title}
      </p>
      <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10.5, color: 'var(--text-tertiary)' }}>
        {desc}
      </p>
    </div>
    {unlocked && <CheckCircle size={14} color={color} style={{ flexShrink: 0 }} />}
  </div>
);

/* ─────────────────────────────────────────────────────
   ACTIVITY HEATMAP  (12-week GitHub-style grid)
───────────────────────────────────────────────────── */
const ActivityHeatmap = ({ activity }) => {
  const weeks = 12;
  const days = [];
  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const found = activity?.find(a => a._id === key);
    days.push({
      key,
      count: found?.count || 0,
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }
  const max = Math.max(...days.map(d => d.count), 1);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${weeks}, 1fr)`, gap: 3 }}>
        {Array.from({ length: weeks }).map((_, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {days.slice(wi * 7, wi * 7 + 7).map(d => (
              <div
                key={d.key}
                title={`${d.label}: ${d.count} prompt${d.count !== 1 ? 's' : ''}`}
                style={{
                  width: '100%', aspectRatio: '1', borderRadius: 2, cursor: 'default',
                  background: d.count === 0
                    ? 'var(--bg-muted)'
                    : `rgba(196,68,26,${0.15 + (d.count / max) * 0.85})`,
                  transition: 'transform .1s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.3)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, justifyContent: 'flex-end' }}>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-tertiary)' }}>Less</span>
        {[0.15, 0.38, 0.58, 0.78, 1].map(o => (
          <div key={o} style={{ width: 11, height: 11, borderRadius: 2, background: `rgba(196,68,26,${o})` }} />
        ))}
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-tertiary)' }}>More</span>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────
   TOP TAGS CLOUD
───────────────────────────────────────────────────── */
const TagCloud = ({ topTags }) => {
  if (!topTags?.length) return (
    <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>No tags yet. Add tags to your prompts.</p>
  );
  const max = Math.max(...topTags.map(t => t.count), 1);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {topTags.map(({ _id: tag, count }) => {
        const scale = 0.7 + (count / max) * 0.8;
        return (
          <span
            key={tag}
            className="tag-pv"
            title={`${count} uses`}
            style={{ fontSize: `${Math.max(10, scale * 12)}px`, opacity: 0.5 + (count / max) * 0.5 }}
          >
            #{tag} <span style={{ color: 'var(--text-tertiary)', marginLeft: 2 }}>{count}</span>
          </span>
        );
      })}
    </div>
  );
};

/* ─────────────────────────────────────────────────────
   API KEY MANAGER
───────────────────────────────────────────────────── */
const ApiKeyManager = () => {
  const [groqKey, setGroqKey] = useState(() => localStorage.getItem('groq_api_key') || '');
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('groq_api_key', groqKey);
    setSaved(true);
    toast.success('API key saved locally');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    localStorage.removeItem('groq_api_key');
    setGroqKey('');
    toast.success('API key removed');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Security notice */}
      <div style={{
        padding: '14px 16px', background: 'var(--amber-subtle)',
        border: '1px solid var(--amber-border)', borderRadius: 'var(--r-md)',
        display: 'flex', alignItems: 'flex-start', gap: 10,
      }}>
        <Shield size={14} color="var(--amber)" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12.5, color: 'var(--amber-text)', lineHeight: 1.6 }}>
          API keys are stored in your browser's localStorage only — never sent to our servers.
          Get your free Groq key at{' '}
          <a href="https://console.groq.com" target="_blank" rel="noreferrer"
            style={{ color: 'var(--amber)', fontWeight: 600 }}>
            console.groq.com
          </a>.
        </p>
      </div>

      {/* Groq key input */}
      <div>
        <label style={{
          display: 'block', fontSize: 12, fontWeight: 500,
          color: 'var(--text-secondary)', marginBottom: 5,
        }}>
          Groq API Key{' '}
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 400 }}>
            (powers AI Generate, Playground &amp; Chains)
          </span>
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type={show ? 'text' : 'password'}
              value={groqKey}
              onChange={e => setGroqKey(e.target.value)}
              className="input-pv"
              placeholder="gsk_••••••••••••••••••••••••"
              style={{ paddingRight: 40, fontFamily: 'var(--f-mono)', fontSize: 12.5 }}
            />
            <button
              type="button"
              onClick={() => setShow(v => !v)}
              style={{
                position: 'absolute', right: 10, top: '50%',
                transform: 'translateY(-50%)', background: 'none',
                border: 'none', color: 'var(--text-tertiary)',
                cursor: 'pointer', display: 'flex',
              }}
            >
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <button onClick={handleSave} className="btn-pv btn-primary-pv" style={{ gap: 5, flexShrink: 0 }}>
            {saved ? <CheckCircle size={13} /> : <Save size={13} />}
            {saved ? 'Saved!' : 'Save'}
          </button>
          {groqKey && (
            <button onClick={handleClear} className="btn-pv btn-danger-pv" style={{ flexShrink: 0 }}>
              Clear
            </button>
          )}
        </div>
        {groqKey && (
          <p style={{
            fontFamily: 'var(--f-mono)', fontSize: 10.5, color: 'var(--sage)',
            marginTop: 6, display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <CheckCircle size={10} /> Key configured — AI features are active
          </p>
        )}
      </div>

      {/* How it's used */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
          What your key enables
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { icon: Sparkles, label: 'AI Generate', desc: 'Create prompts from a topic description' },
            { icon: Zap,      label: 'AI Improve',  desc: 'Enhance existing prompts automatically' },
            { icon: TrendingUp, label: 'Playground', desc: 'Test prompts live against real AI models' },
            { icon: Copy,     label: 'Chains',      desc: 'Run multi-step sequential prompt pipelines' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 'var(--r-sm)',
                background: 'var(--bg-muted)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={13} color="var(--text-secondary)" />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</p>
                <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10.5, color: 'var(--text-tertiary)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────
   NOTIFICATION PREFERENCES
───────────────────────────────────────────────────── */
const NotificationPrefs = () => {
  const [prefs, setPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pv_notif') || '{}'); }
    catch { return {}; }
  });

  const toggle = key => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    localStorage.setItem('pv_notif', JSON.stringify(next));
    toast.success(`${next[key] ? 'Enabled' : 'Disabled'} successfully`);
  };

  const items = [
    { key: 'weekly_digest',    label: 'Weekly digest',     desc: 'Summary of your prompt activity every Monday' },
    { key: 'streak_reminders', label: 'Streak reminders',  desc: 'Nudge when you are about to break your streak' },
    { key: 'ai_suggestions',   label: 'AI suggestions',    desc: 'Notify when AI finds improvement opportunities' },
    { key: 'export_complete',  label: 'Export complete',   desc: 'Alert when bulk exports finish' },
    { key: 'new_templates',    label: 'New templates',     desc: 'Alert when new starter templates are added' },
    { key: 'chain_complete',   label: 'Chain completed',   desc: 'Notify when a long Prompt Chain finishes running' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map(({ key, label, desc }) => (
        <div key={key} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 14px', background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)',
        }}>
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</p>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
              {desc}
            </p>
          </div>
          <button
            onClick={() => toggle(key)}
            style={{
              width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
              background: prefs[key] ? 'var(--sage)' : 'var(--bg-muted)',
              position: 'relative', transition: 'background .2s', flexShrink: 0,
            }}
          >
            <span style={{
              position: 'absolute', top: 3,
              left: prefs[key] ? 21 : 3,
              width: 16, height: 16, borderRadius: '50%',
              background: '#fff', transition: 'left .2s',
            }} />
          </button>
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────
   DATA EXPORT PANEL
───────────────────────────────────────────────────── */
const DataExportPanel = ({ promptCount }) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async format => {
    setExporting(true);
    try {
      const api = (await import('../services/api')).default;
      const res = await api.post('/prompts/bulk/export', { ids: [], format });
      const { data, count } = res.data;
      const ext = format === 'csv' ? 'csv' : format === 'markdown' ? 'md' : 'json';
      const mime = format === 'csv' ? 'text/csv' : format === 'markdown' ? 'text/markdown' : 'application/json';
      const content = format === 'json' ? JSON.stringify(data, null, 2) : data;
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `promptvault-${new Date().toISOString().split('T')[0]}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${count} prompts as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        Export all <strong style={{ color: 'var(--text-primary)' }}>{promptCount}</strong> of your prompts
        in your preferred format. Your data belongs to you.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {[
          { id: 'json',     label: 'JSON',     desc: 'Re-importable, structured' },
          { id: 'markdown', label: 'Markdown', desc: 'Human-readable docs' },
          { id: 'csv',      label: 'CSV',      desc: 'Opens in Excel / Sheets' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => handleExport(f.id)}
            disabled={exporting}
            style={{
              padding: '14px 12px', borderRadius: 'var(--r-md)',
              border: '1px solid var(--border)', background: 'var(--bg-subtle)',
              cursor: 'pointer', textAlign: 'left', transition: 'all .15s',
              display: 'flex', flexDirection: 'column', gap: 6,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'var(--bg-muted)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-subtle)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Download size={13} color="var(--text-secondary)" />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{f.label}</span>
            </div>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10.5, color: 'var(--text-tertiary)' }}>
              {f.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────
   MAIN PROFILE PAGE
───────────────────────────────────────────────────── */
const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    fullName: '', email: '', bio: '', username: '',
    website: '', location: '', avatarColor: 'terracotta', preferredAiTool: 'ChatGPT',
  });
  const [passwordForm, setPasswordForm] = useState({
    password: '', newPassword: '', confirmNewPassword: '',
  });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [deleteForm, setDeleteForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [promptCount, setPromptCount] = useState(0);

  useEffect(() => {
    Promise.all([
      userService.getProfile(),
      userService.getStats(),
      promptService.getAll({}),
    ])
      .then(([data, s, p]) => {
        setProfile({
          fullName:        data.user.fullName        || '',
          email:           data.user.email           || '',
          bio:             data.user.bio             || '',
          username:        data.user.username        || '',
          website:         data.user.website         || '',
          location:        data.user.location        || '',
          avatarColor:     data.user.avatarColor     || 'terracotta',
          preferredAiTool: data.user.preferredAiTool || 'ChatGPT',
        });
        setStats(s.stats);
        setPromptCount(p.prompts?.length || 0);
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setFetching(false));
  }, []);

  const handleProfileUpdate = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await userService.updateProfile(profile);
      updateUser(data.user);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async e => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      return toast.error('Passwords do not match');
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error('Minimum 6 characters');
    }
    setPwLoading(true);
    try {
      await userService.updateProfile({
        password: passwordForm.password,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password updated');
      setPasswordForm({ password: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteForm.confirm !== 'DELETE') return toast.error('Type DELETE to confirm');
    setDeleteLoading(true);
    try {
      await userService.deleteAccount(deleteForm.password);
      toast.success('Account deleted');
      logout();
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Deletion failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  /* Compute streak from activity data */
  const activityDates = new Set(
    (stats?.activity || []).filter(a => a.count > 0).map(a => a._id)
  );
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    if (activityDates.has(key)) { streak++; }
    else if (i > 0) { break; }
  }

  /* Achievements */
  const achieves = [
    {
      key: 'first_prompt', icon: Sparkles, title: 'First Prompt',
      desc: 'Save your very first prompt', color: '#C4441A',
      unlocked: promptCount >= 1,
    },
    {
      key: 'ten_prompts', icon: Hash, title: 'Power User',
      desc: 'Reach 10 saved prompts', color: '#3B72D4',
      unlocked: promptCount >= 10,
    },
    {
      key: 'fifty_prompts', icon: Star, title: 'Prompt Master',
      desc: 'Collect 50 prompts', color: '#8040C8',
      unlocked: promptCount >= 50,
    },
    {
      key: 'five_favs', icon: Heart, title: 'Curator',
      desc: 'Favourite 5 prompts', color: '#C42E72',
      unlocked: (stats?.favorites || 0) >= 5,
    },
    {
      key: 'all_cats', icon: Target, title: 'Versatile',
      desc: 'Use all 6 categories', color: '#2A9148',
      unlocked: (stats?.categoryCount || 0) >= 6,
    },
    {
      key: 'three_tools', icon: Bot, title: 'Multi-Modal',
      desc: 'Prompts for 3+ AI tools', color: '#C8811A',
      unlocked: (stats?.aiToolCount || 0) >= 3,
    },
    {
      key: 'active_week', icon: Flame, title: 'On Fire',
      desc: 'Prompt on 7 consecutive days', color: '#E05828',
      unlocked: streak >= 7,
    },
    {
      key: 'top_rated', icon: Award, title: 'Top Shelf',
      desc: 'Rate a prompt 5 stars', color: '#3A6B5A',
      unlocked: false,
    },
    {
      key: 'chain_runner', icon: TrendingUp, title: 'Chain Reaction',
      desc: 'Complete your first Prompt Chain', color: '#6B3A8A',
      unlocked: false,
    },
    {
      key: 'playground', icon: Zap, title: 'Tinkerer',
      desc: 'Run a prompt in the Playground', color: '#2A6B9B',
      unlocked: false,
    },
  ];

  const avatarColor = AVATAR_COLORS[profile.avatarColor] || AVATAR_COLORS.terracotta;
  const initials    = profile.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const unlockedCount = achieves.filter(a => a.unlocked).length;

  const FL = {
    display: 'block', fontSize: 12, color: 'var(--text-secondary)',
    fontWeight: 500, marginBottom: 5, fontFamily: 'var(--f-sans)',
  };

  const tabs = [
    { id: 'overview',      label: 'Overview' },
    { id: 'profile',       label: 'Profile' },
    { id: 'security',      label: 'Security' },
    { id: 'preferences',   label: 'Preferences' },
    { id: 'api',           label: 'API Keys' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'data',          label: 'My Data' },
    { id: 'danger',        label: 'Account' },
  ];

  if (fetching) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <Spinner size="lg" />
    </div>
  );

  return (
    <>
      <div>

        {/* ─── Profile header card ─────────────────────────── */}
        <div className="card-pv" style={{ padding: 24, marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${avatarColor}, ${avatarColor}80)` }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>

            {/* Avatar with streak badge */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', background: avatarColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 0 3px ${avatarColor}30`,
              }}>
                <span style={{ fontFamily: 'var(--f-serif)', fontSize: 28, color: 'white' }}>
                  {initials}
                </span>
              </div>
              {streak > 0 && (
                <div
                  title={`${streak}-day streak!`}
                  style={{
                    position: 'absolute', bottom: -4, right: -4, background: '#E05828',
                    borderRadius: '50%', width: 22, height: 22,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid var(--bg-surface)',
                  }}
                >
                  <Flame size={11} color="white" />
                </div>
              )}
            </div>

            {/* Name + metadata */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{
                fontFamily: 'var(--f-serif)', fontSize: 22,
                color: 'var(--text-primary)', letterSpacing: '-0.02em',
              }}>
                {profile.fullName}
              </h2>
              {profile.username && (
                <p style={{ fontFamily: 'var(--f-mono)', fontSize: 12.5, color: 'var(--text-tertiary)' }}>
                  @{profile.username}
                </p>
              )}
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 2 }}>
                {profile.email}
              </p>
              {profile.bio && (
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                  {profile.bio}
                </p>
              )}
              <div style={{ display: 'flex', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
                {profile.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--text-tertiary)' }}>
                    <MapPin size={11} />{profile.location}
                  </span>
                )}
                {profile.website && (
                  <a
                    href={profile.website} target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}
                  >
                    <Globe size={11} />{profile.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--text-tertiary)' }}>
                  <Calendar size={11} />
                  Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Stat pills */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <StatPill icon={Sparkles} label="Prompts"    value={promptCount}               color="#3B72D4" />
              <StatPill icon={Heart}    label="Favourites" value={stats?.favorites || 0}     color="#C4441A" />
              <StatPill icon={Flame}    label="Streak"     value={streak}                    color="#E05828" />
              <StatPill icon={Award}    label="Badges"     value={unlockedCount}             color="#8040C8" />
            </div>
          </div>
        </div>

        {/* ─── Tabs ────────────────────────────────────────── */}
        <div className="tabs-pv" style={{ marginBottom: 18, gap: 2 }}>
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`tab-pv ${activeTab === id ? 'active' : ''}`}
              style={
                activeTab === id && id === 'danger'
                  ? { color: 'var(--accent)', borderColor: 'rgba(200,71,26,0.25)', background: 'var(--accent-subtle)' }
                  : {}
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* ─── OVERVIEW TAB ────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Achievements grid */}
            <div className="card-pv" style={{ padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Award size={14} color="var(--text-tertiary)" /> Achievements
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {achieves.map((a, i) => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: a.unlocked ? a.color : 'var(--bg-muted)' }} />
                    ))}
                  </div>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--text-tertiary)' }}>
                    {unlockedCount}/{achieves.length} unlocked
                  </span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {achieves.map(a => <Achievement key={a.key} {...a} />)}
              </div>
            </div>

            {/* Two-col: category breakdown + tag cloud */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {stats?.categoryBreakdown?.length > 0 && (
                <div className="card-pv" style={{ padding: 22 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 7 }}>
                    <BarChart2 size={14} color="var(--text-tertiary)" /> Categories
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {stats.categoryBreakdown.map(({ _id: cat, count }) => {
                      const clr = { Coding:'#3B72D4', Writing:'#2A9148', Image:'#8040C8', Video:'#C85C1E', Marketing:'#C42E72', Other:'#857E78' };
                      const pct = promptCount ? Math.round((count / promptCount) * 100) : 0;
                      return (
                        <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span className={`cat-pill-pv cat-${cat}`} style={{ flexShrink: 0 }}>
                            <span className="cat-dot-pv" />{cat}
                          </span>
                          <div className="bar-track-pv" style={{ flex: 1 }}>
                            <div className="bar-fill-pv" style={{ width: `${pct}%`, background: clr[cat] || 'var(--accent)' }} />
                          </div>
                          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11.5, color: 'var(--text-tertiary)', width: 50, textAlign: 'right' }}>
                            {count} ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="card-pv" style={{ padding: 22 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Hash size={14} color="var(--text-tertiary)" /> Top tags
                </p>
                <TagCloud topTags={stats?.topTags} />
              </div>
            </div>
          </div>
        )}

        {/* ─── PROFILE TAB ─────────────────────────────────── */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card-pv" style={{ padding: 24 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 18 }}>
                Personal information
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={FL}>Full name</label>
                  <input
                    value={profile.fullName}
                    onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))}
                    className="input-pv" placeholder="Your full name"
                  />
                </div>
                <div>
                  <label style={FL}>Username</label>
                  <input
                    value={profile.username}
                    onChange={e => setProfile(p => ({ ...p, username: e.target.value }))}
                    className="input-pv" placeholder="yourhandle"
                    style={{ fontFamily: 'var(--f-mono)' }}
                  />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={FL}>Email</label>
                  <input
                    type="email" value={profile.email}
                    onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                    className="input-pv"
                  />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={FL}>Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                    rows={3} className="textarea-pv"
                    placeholder="Tell us about yourself…" maxLength={300}
                  />
                  <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'right', marginTop: 3 }}>
                    {profile.bio.length}/300
                  </p>
                </div>
                <div>
                  <label style={FL}>Location</label>
                  <input
                    value={profile.location}
                    onChange={e => setProfile(p => ({ ...p, location: e.target.value }))}
                    className="input-pv" placeholder="City, Country"
                  />
                </div>
                <div>
                  <label style={FL}>Website</label>
                  <input
                    value={profile.website}
                    onChange={e => setProfile(p => ({ ...p, website: e.target.value }))}
                    className="input-pv" placeholder="https://yoursite.com"
                  />
                </div>
              </div>
            </div>

            {/* Avatar colour picker */}
            <div className="card-pv" style={{ padding: 24 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Avatar colour</p>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 14 }}>
                Choose a colour for your avatar. Shown in the sidebar and on your profile.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {Object.entries(AVATAR_COLORS).map(([name, hex]) => (
                  <button
                    key={name} type="button"
                    onClick={() => setProfile(p => ({ ...p, avatarColor: name }))}
                    className={`color-swatch-pv ${profile.avatarColor === name ? 'selected' : ''}`}
                    style={{ background: hex, width: 28, height: 28 }} title={name}
                  />
                ))}
              </div>
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 3px ${avatarColor}30` }}>
                  <span style={{ fontFamily: 'var(--f-serif)', fontSize: 18, color: 'white' }}>{initials}</span>
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{profile.fullName}</p>
                  <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1 }}>
                    {profile.username ? `@${profile.username}` : 'Preview'}
                  </p>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-pv btn-primary-pv" style={{ alignSelf: 'flex-start', gap: 6 }}>
              {loading ? <MiniSpinner /> : <Save size={13} />}
              {loading ? 'Saving…' : 'Save profile'}
            </button>
          </form>
        )}

        {/* ─── SECURITY TAB ────────────────────────────────── */}
        {activeTab === 'security' && (
          <div className="card-pv" style={{ padding: 24, maxWidth: 440 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
              Change password
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 18 }}>
              Choose a strong password of at least 6 characters.
            </p>
            <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Current password',  key: 'password',            show: 'current' },
                { label: 'New password',       key: 'newPassword',         show: 'new' },
                { label: 'Confirm password',   key: 'confirmNewPassword',  show: 'confirm' },
              ].map(({ label, key, show }) => (
                <div key={key}>
                  <label style={FL}>{label}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPw[show] ? 'text' : 'password'}
                      value={passwordForm[key]}
                      onChange={e => setPasswordForm(p => ({ ...p, [key]: e.target.value }))}
                      className="input-pv" placeholder="••••••••"
                      style={{ paddingRight: 40 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(p => ({ ...p, [show]: !p[show] }))}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex' }}
                    >
                      {showPw[show] ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}
              <button type="submit" disabled={pwLoading} className="btn-pv btn-primary-pv" style={{ alignSelf: 'flex-start', gap: 6 }}>
                {pwLoading ? <MiniSpinner /> : <Lock size={13} />}
                {pwLoading ? 'Updating…' : 'Update password'}
              </button>
            </form>
          </div>
        )}

        {/* ─── PREFERENCES TAB ─────────────────────────────── */}
        {activeTab === 'preferences' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card-pv" style={{ padding: 24 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                Preferred AI tool
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 16 }}>
                Pre-selected when creating new prompts and running the AI Generator.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {AI_TOOLS.map(tool => (
                  <button
                    key={tool} type="button"
                    onClick={() => setProfile(p => ({ ...p, preferredAiTool: tool }))}
                    style={{
                      padding: '10px 14px', borderRadius: 'var(--r-md)', cursor: 'pointer',
                      fontFamily: 'var(--f-sans)', fontSize: 13, fontWeight: 500, transition: 'all .15s',
                      border: `1px solid ${profile.preferredAiTool === tool ? 'rgba(200,71,26,0.35)' : 'var(--border)'}`,
                      background: profile.preferredAiTool === tool ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                      color: profile.preferredAiTool === tool ? 'var(--accent)' : 'var(--text-secondary)',
                      display: 'flex', alignItems: 'center', gap: 7,
                    }}
                  >
                    <Bot size={13} /> {tool}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  const data = await userService.updateProfile({ preferredAiTool: profile.preferredAiTool });
                  updateUser(data.user);
                  toast.success('Preferences saved');
                } catch {
                  toast.error('Failed to save preferences');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="btn-pv btn-primary-pv"
              style={{ alignSelf: 'flex-start', gap: 6 }}
            >
              {loading ? <MiniSpinner /> : <Save size={13} />}
              {loading ? 'Saving…' : 'Save preferences'}
            </button>
          </div>
        )}

        {/* ─── API KEYS TAB ────────────────────────────────── */}
        {activeTab === 'api' && (
          <div className="card-pv" style={{ padding: 24 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 7 }}>
              <Key size={14} color="var(--text-tertiary)" /> API Key Management
            </p>
            <ApiKeyManager />
          </div>
        )}

        {/* ─── NOTIFICATIONS TAB ───────────────────────────── */}
        {activeTab === 'notifications' && (
          <div className="card-pv" style={{ padding: 24 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 7 }}>
              <Bell size={14} color="var(--text-tertiary)" /> Notification Preferences
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 18 }}>
              Stored locally in your browser. No email notifications are sent.
            </p>
            <NotificationPrefs />
          </div>
        )}

        {/* ─── MY DATA TAB ─────────────────────────────────── */}
        {activeTab === 'data' && (
          <div className="card-pv" style={{ padding: 24 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 7 }}>
              <Download size={14} color="var(--text-tertiary)" /> Export My Data
            </p>
            <DataExportPanel promptCount={promptCount} />
          </div>
        )}

        {/* ─── DANGER ZONE TAB ─────────────────────────────── */}
        {activeTab === 'danger' && (
          <div className="danger-zone-pv">
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 7 }}>
              <Trash2 size={14} /> Danger zone
            </p>
            <p style={{ fontSize: 13.5, color: 'var(--text-tertiary)', lineHeight: 1.6, marginBottom: 18 }}>
              Permanently delete your account, all your prompts, version history, and all associated data.
              This action <strong>cannot be undone</strong>.
            </p>
            <button onClick={() => setShowDeleteModal(true)} className="btn-pv btn-danger-pv" style={{ gap: 6 }}>
              <Trash2 size={13} /> Delete my account
            </button>
          </div>
        )}
      </div>

      {/* ─── DELETE CONFIRMATION MODAL ───────────────────── */}
      {showDeleteModal && (
        <div className="modal-overlay-pv" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-pv" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '32px 28px', textAlign: 'center' }}>
              <div style={{
                width: 52, height: 52, background: 'var(--accent-subtle)',
                border: '1px solid rgba(200,71,26,0.2)', borderRadius: 'var(--r-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 18px',
              }}>
                <Trash2 size={22} color="var(--accent)" />
              </div>
              <h3 style={{ fontFamily: 'var(--f-serif)', fontSize: 22, color: 'var(--text-primary)', marginBottom: 8 }}>
                Delete account?
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-tertiary)', lineHeight: 1.6, marginBottom: 24 }}>
                All your prompts, favourites, version history, and account data will be permanently erased.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20, textAlign: 'left' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 5 }}>
                    Current password
                  </label>
                  <input
                    type="password" value={deleteForm.password}
                    onChange={e => setDeleteForm(p => ({ ...p, password: e.target.value }))}
                    className="input-pv" placeholder="••••••••"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 5 }}>
                    Type{' '}
                    <span style={{ fontFamily: 'var(--f-mono)', color: 'var(--accent)', fontWeight: 600 }}>DELETE</span>
                    {' '}to confirm
                  </label>
                  <input
                    value={deleteForm.confirm}
                    onChange={e => setDeleteForm(p => ({ ...p, confirm: e.target.value }))}
                    className="input-pv" placeholder="DELETE"
                    style={{ fontFamily: 'var(--f-mono)' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-pv"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || deleteForm.confirm !== 'DELETE'}
                  className="btn-pv btn-danger-pv"
                  style={{
                    flex: 1, justifyContent: 'center',
                    display: 'flex', alignItems: 'center', gap: 6,
                    opacity: deleteForm.confirm !== 'DELETE' ? 0.4 : 1,
                  }}
                >
                  {deleteLoading ? <MiniSpinner dark /> : <Trash2 size={13} />}
                  {deleteLoading ? 'Deleting…' : 'Delete forever'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
