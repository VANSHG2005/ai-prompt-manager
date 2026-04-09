import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Save, Globe, MapPin, FileText, AtSign, Bot, Trash2, Eye, EyeOff } from 'lucide-react';
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

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    fullName: '', email: '', bio: '', username: '',
    website: '', location: '', avatarColor: 'terracotta', preferredAiTool: 'ChatGPT',
  });
  const [passwordForm, setPasswordForm] = useState({ password: '', newPassword: '', confirmNewPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [deleteForm, setDeleteForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    userService.getProfile()
      .then(data => setProfile({
        fullName: data.user.fullName || '',
        email: data.user.email || '',
        bio: data.user.bio || '',
        username: data.user.username || '',
        website: data.user.website || '',
        location: data.user.location || '',
        avatarColor: data.user.avatarColor || 'terracotta',
        preferredAiTool: data.user.preferredAiTool || 'ChatGPT',
      }))
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setFetching(false));
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await userService.updateProfile(profile);
      updateUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) return toast.error('Passwords do not match');
    if (passwordForm.newPassword.length < 6) return toast.error('Minimum 6 characters');
    setPwLoading(true);
    try {
      await userService.updateProfile({ password: passwordForm.password, newPassword: passwordForm.newPassword });
      toast.success('Password updated');
      setPasswordForm({ password: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    } finally { setPwLoading(false); }
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
    } finally { setDeleteLoading(false); }
  };

  const avatarColor = AVATAR_COLORS[profile.avatarColor] || AVATAR_COLORS.terracotta;
  const initials = profile.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  const tabs = [
    { id: 'profile',      label: 'Profile',      icon: User },
    { id: 'security',     label: 'Security',     icon: Lock },
    { id: 'preferences',  label: 'Preferences',  icon: Bot },
    { id: 'danger',       label: 'Account',      icon: Trash2 },
  ];

  if (fetching) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}><Spinner size="lg" /></div>
  );

  /* shared label style */
  const FL = { display: 'block', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '5px', fontFamily: 'var(--f-sans)' };

  return (
    <>
      <div style={{ maxWidth: '840px' }}>

        {/* Profile header */}
        <div className="card-pv" style={{ padding: '24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }}>
            <span style={{ fontFamily: 'var(--f-serif)', fontSize: '26px', color: 'white' }}>{initials}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontFamily: 'var(--f-serif)', fontSize: '22px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{profile.fullName}</h2>
            {profile.username && <p style={{ fontFamily: 'var(--f-mono)', fontSize: '12.5px', color: 'var(--text-tertiary)' }}>@{profile.username}</p>}
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{profile.email}</p>
            {profile.bio && <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>{profile.bio}</p>}
            <div style={{ display: 'flex', gap: '14px', marginTop: '8px', flexWrap: 'wrap' }}>
              {profile.location && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}><MapPin size={11} />{profile.location}</span>}
              {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--accent)', textDecoration: 'none' }}><Globe size={11} />{profile.website.replace(/^https?:\/\//, '')}</a>}
            </div>
          </div>
          <div style={{ flexShrink: 0 }}>
            <span className="tag-pv" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Bot size={11} /> {profile.preferredAiTool}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-pv" style={{ marginBottom: '18px' }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`tab-pv ${activeTab === id ? 'active' : ''}`}
              style={activeTab === id && id === 'danger' ? { color: 'var(--accent)', borderColor: 'rgba(200,71,26,0.25)', background: 'var(--accent-subtle)' } : {}}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Profile Tab ── */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="card-pv" style={{ padding: '24px' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '18px' }}>Personal information</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {[
                  { label: 'Full name', key: 'fullName', placeholder: 'Your full name' },
                  { label: 'Username', key: 'username', placeholder: 'yourhandle', mono: true },
                ].map(({ label, key, placeholder, mono }) => (
                  <div key={key}>
                    <label style={FL}>{label}</label>
                    <input value={profile[key]} onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                      className="input-pv" placeholder={placeholder}
                      style={mono ? { fontFamily: 'var(--f-mono)' } : {}} />
                  </div>
                ))}
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={FL}>Email</label>
                  <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} className="input-pv" />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={FL}>Bio</label>
                  <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                    rows={3} className="textarea-pv" placeholder="Tell us about yourself…" maxLength={300} />
                  <p style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'right', marginTop: '3px' }}>{profile.bio.length}/300</p>
                </div>
                <div>
                  <label style={FL}>Location</label>
                  <input value={profile.location} onChange={e => setProfile(p => ({ ...p, location: e.target.value }))} className="input-pv" placeholder="City, Country" />
                </div>
                <div>
                  <label style={FL}>Website</label>
                  <input value={profile.website} onChange={e => setProfile(p => ({ ...p, website: e.target.value }))} className="input-pv" placeholder="https://yoursite.com" />
                </div>
              </div>
            </div>

            {/* Avatar color */}
            <div className="card-pv" style={{ padding: '24px' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>Avatar colour</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {Object.entries(AVATAR_COLORS).map(([name, hex]) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setProfile(p => ({ ...p, avatarColor: name }))}
                    className={`color-swatch-pv ${profile.avatarColor === name ? 'selected' : ''}`}
                    style={{ background: hex, width: '28px', height: '28px' }}
                    title={name}
                  />
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-pv btn-primary-pv" style={{ alignSelf: 'flex-start', gap: '6px' }}>
              {loading ? <MiniSpinner /> : <Save size={13} />}
              {loading ? 'Saving…' : 'Save profile'}
            </button>
          </form>
        )}

        {/* ── Security Tab ── */}
        {activeTab === 'security' && (
          <div className="card-pv" style={{ padding: '24px', maxWidth: '420px' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '18px' }}>Change password</p>
            <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Current password', key: 'password',         show: 'current' },
                { label: 'New password',     key: 'newPassword',      show: 'new' },
                { label: 'Confirm password', key: 'confirmNewPassword', show: 'confirm' },
              ].map(({ label, key, show }) => (
                <div key={key}>
                  <label style={FL}>{label}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPw[show] ? 'text' : 'password'}
                      value={passwordForm[key]}
                      onChange={e => setPasswordForm(p => ({ ...p, [key]: e.target.value }))}
                      className="input-pv"
                      placeholder="••••••••"
                      style={{ paddingRight: '40px' }}
                    />
                    <button type="button" onClick={() => setShowPw(p => ({ ...p, [show]: !p[show] }))}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex' }}>
                      {showPw[show] ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}
              <button type="submit" disabled={pwLoading} className="btn-pv btn-primary-pv" style={{ alignSelf: 'flex-start', gap: '6px' }}>
                {pwLoading ? <MiniSpinner /> : <Lock size={13} />}
                {pwLoading ? 'Updating…' : 'Update password'}
              </button>
            </form>
          </div>
        )}

        {/* ── Preferences Tab ── */}
        {activeTab === 'preferences' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="card-pv" style={{ padding: '24px' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Preferred AI tool</p>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>Pre-selected when creating new prompts.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
                {AI_TOOLS.map(tool => (
                  <button
                    key={tool}
                    type="button"
                    onClick={() => setProfile(p => ({ ...p, preferredAiTool: tool }))}
                    style={{
                      padding: '10px 14px', borderRadius: 'var(--r-md)',
                      border: `1px solid ${profile.preferredAiTool === tool ? 'rgba(200,71,26,0.35)' : 'var(--border)'}`,
                      background: profile.preferredAiTool === tool ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                      fontSize: '13px', fontWeight: 500,
                      color: profile.preferredAiTool === tool ? 'var(--accent)' : 'var(--text-secondary)',
                      cursor: 'pointer', fontFamily: 'var(--f-sans)', transition: 'all .15s',
                      display: 'flex', alignItems: 'center', gap: '7px',
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
                } catch { toast.error('Failed to save preferences'); }
                finally { setLoading(false); }
              }}
              disabled={loading}
              className="btn-pv btn-primary-pv"
              style={{ alignSelf: 'flex-start', gap: '6px' }}
            >
              {loading ? <MiniSpinner /> : <Save size={13} />}
              {loading ? 'Saving…' : 'Save preferences'}
            </button>
          </div>
        )}

        {/* ── Danger Zone ── */}
        {activeTab === 'danger' && (
          <div className="danger-zone-pv">
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Trash2 size={14} /> Danger zone
            </p>
            <p style={{ fontSize: '13.5px', color: 'var(--text-tertiary)', lineHeight: 1.6, marginBottom: '18px' }}>
              Permanently delete your account and all your prompts. This cannot be undone.
            </p>
            <button onClick={() => setShowDeleteModal(true)} className="btn-pv btn-danger-pv" style={{ gap: '6px' }}>
              <Trash2 size={13} /> Delete my account
            </button>
          </div>
        )}
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="modal-overlay-pv" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-pv" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '32px 28px', textAlign: 'center' }}>
              <div style={{ width: '52px', height: '52px', background: 'var(--accent-subtle)', border: '1px solid rgba(200,71,26,0.2)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                <Trash2 size={22} color="var(--accent)" />
              </div>
              <h3 style={{ fontFamily: 'var(--f-serif)', fontSize: '22px', color: 'var(--text-primary)', marginBottom: '8px' }}>Delete account?</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', lineHeight: 1.6, marginBottom: '24px' }}>
                All your prompts, favourites and data will be permanently erased.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', textAlign: 'left' }}>
                <div>
                  <label style={{ ...FL, marginBottom: '5px' }}>Current password</label>
                  <input type="password" value={deleteForm.password} onChange={e => setDeleteForm(p => ({ ...p, password: e.target.value }))} className="input-pv" placeholder="••••••••" />
                </div>
                <div>
                  <label style={{ ...FL, marginBottom: '5px' }}>
                    Type <span style={{ fontFamily: 'var(--f-mono)', color: 'var(--accent)', fontWeight: 600 }}>DELETE</span> to confirm
                  </label>
                  <input value={deleteForm.confirm} onChange={e => setDeleteForm(p => ({ ...p, confirm: e.target.value }))} className="input-pv" placeholder="DELETE" style={{ fontFamily: 'var(--f-mono)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setShowDeleteModal(false)} className="btn-pv" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || deleteForm.confirm !== 'DELETE'}
                  className="btn-pv btn-danger-pv"
                  style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px', opacity: deleteForm.confirm !== 'DELETE' ? 0.4 : 1 }}
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
