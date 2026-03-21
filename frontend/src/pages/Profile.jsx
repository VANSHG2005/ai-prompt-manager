import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  User, Mail, Lock, Save, Globe, MapPin, FileText,
  AtSign, Palette, Bot, Trash2, AlertTriangle, Eye, EyeOff,
  Shield, Bell, Download
} from 'lucide-react';
import Spinner from '../components/common/Spinner';
import { AI_TOOLS } from '../utils/constants';

const AVATAR_COLORS = {
  blue:   { bg: 'bg-gradient-to-br from-blue-500 to-blue-700',    ring: 'ring-blue-500/40' },
  purple: { bg: 'bg-gradient-to-br from-purple-500 to-violet-700', ring: 'ring-purple-500/40' },
  green:  { bg: 'bg-gradient-to-br from-emerald-500 to-teal-700',  ring: 'ring-emerald-500/40' },
  orange: { bg: 'bg-gradient-to-br from-orange-500 to-red-600',    ring: 'ring-orange-500/40' },
  pink:   { bg: 'bg-gradient-to-br from-pink-500 to-rose-600',     ring: 'ring-pink-500/40' },
  cyan:   { bg: 'bg-gradient-to-br from-cyan-500 to-blue-600',     ring: 'ring-cyan-500/40' },
  red:    { bg: 'bg-gradient-to-br from-red-500 to-pink-700',      ring: 'ring-red-500/40' },
  yellow: { bg: 'bg-gradient-to-br from-yellow-400 to-orange-500', ring: 'ring-yellow-400/40' },
};

const SectionCard = ({ icon: Icon, iconColor, title, children }) => (
  <div className="card p-6">
    <h3 className="font-display font-semibold text-white mb-5 flex items-center gap-2.5">
      <div className={`w-7 h-7 rounded-lg ${iconColor} flex items-center justify-center`}>
        <Icon size={14} className="text-white" />
      </div>
      {title}
    </h3>
    {children}
  </div>
);

const MiniSpinner = () => (
  <span className="w-4 h-4 border-2 border-obsidian-950/30 border-t-obsidian-950 rounded-full animate-spin inline-block" />
);

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    fullName: '', email: '', bio: '', username: '',
    website: '', location: '', avatarColor: 'blue', preferredAiTool: 'ChatGPT',
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
        avatarColor: data.user.avatarColor || 'blue',
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
      toast.success('Profile updated!', { icon: '✅' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) return toast.error('Passwords do not match');
    if (passwordForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setPwLoading(true);
    try {
      await userService.updateProfile({ password: passwordForm.password, newPassword: passwordForm.newPassword });
      toast.success('Password updated!', { icon: '🔐' });
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

  const avatarStyle = AVATAR_COLORS[profile.avatarColor] || AVATAR_COLORS.blue;
  const initials = profile.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'danger', label: 'Account', icon: AlertTriangle },
  ];

  if (fetching) return (
    <DashboardLayout title="Profile">
      <div className="flex justify-center py-20"><Spinner size="lg" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Profile">
      <div className="max-w-3xl">

        {/* ── Profile Header Card ── */}
        <div className="card p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 to-neon-purple/5" />
          <div className="relative flex items-center gap-5 flex-wrap">
            <div className={`w-20 h-20 rounded-2xl ${avatarStyle.bg} ring-4 ${avatarStyle.ring} flex items-center justify-center shadow-xl shrink-0`}>
              <span className="font-display font-black text-white text-2xl">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-bold text-white text-xl">{profile.fullName}</h2>
              {profile.username && <p className="text-gray-500 font-mono text-sm">@{profile.username}</p>}
              <p className="text-gray-500 font-body text-sm mt-0.5">{profile.email}</p>
              {profile.bio && <p className="text-gray-400 font-body text-sm mt-2 max-w-md">{profile.bio}</p>}
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                {profile.location && (
                  <span className="flex items-center gap-1 text-gray-600 font-body text-xs">
                    <MapPin size={11} /> {profile.location}
                  </span>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-neon-blue font-body text-xs hover:underline">
                    <Globe size={11} /> {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="badge bg-obsidian-700 border border-obsidian-500 text-gray-400 text-xs flex items-center gap-1">
                <Bot size={11} /> {profile.preferredAiTool}
              </span>
            </div>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className="flex gap-1 bg-obsidian-800 border border-obsidian-600 rounded-xl p-1 mb-5">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-body transition-all ${
                activeTab === id
                  ? id === 'danger' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-obsidian-600 text-white border border-obsidian-500'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon size={14} />
              <span className="hidden sm:block">{label}</span>
            </button>
          ))}
        </div>

        {/* ── Profile Tab ── */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <SectionCard icon={User} iconColor="bg-neon-blue/80" title="Personal Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs mb-1.5">Full Name</label>
                  <input value={profile.fullName} onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))}
                    className="input-field" placeholder="Your full name" />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1.5 flex items-center gap-1"><AtSign size={11} /> Username</label>
                  <input value={profile.username} onChange={e => setProfile(p => ({ ...p, username: e.target.value }))}
                    className="input-field" placeholder="yourhandle" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-400 text-xs mb-1.5">Email</label>
                  <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                    className="input-field" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-400 text-xs mb-1.5 flex items-center gap-1"><FileText size={11} /> Bio</label>
                  <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                    rows={3} className="input-field resize-none" placeholder="Tell us about yourself..." maxLength={300} />
                  <p className="text-gray-600 text-xs mt-1 text-right">{profile.bio.length}/300</p>
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1.5 flex items-center gap-1"><MapPin size={11} /> Location</label>
                  <input value={profile.location} onChange={e => setProfile(p => ({ ...p, location: e.target.value }))}
                    className="input-field" placeholder="City, Country" />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1.5 flex items-center gap-1"><Globe size={11} /> Website</label>
                  <input value={profile.website} onChange={e => setProfile(p => ({ ...p, website: e.target.value }))}
                    className="input-field" placeholder="https://yoursite.com" />
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={Palette} iconColor="bg-purple-500/80" title="Avatar Color">
              <div className="flex flex-wrap gap-3">
                {Object.entries(AVATAR_COLORS).map(([color, styles]) => (
                  <button key={color} type="button" onClick={() => setProfile(p => ({ ...p, avatarColor: color }))}
                    className={`w-10 h-10 rounded-xl ${styles.bg} transition-all ${profile.avatarColor === color ? `ring-2 ring-offset-2 ring-offset-obsidian-800 ${styles.ring} scale-110` : 'opacity-60 hover:opacity-90'}`}>
                    {profile.avatarColor === color && (
                      <span className="text-white text-xs font-bold flex items-center justify-center h-full">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </SectionCard>

            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              {loading ? <><MiniSpinner /> Saving...</> : <><Save size={15} /> Save Profile</>}
            </button>
          </form>
        )}

        {/* ── Security Tab ── */}
        {activeTab === 'security' && (
          <SectionCard icon={Lock} iconColor="bg-orange-500/80" title="Change Password">
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              {[
                { label: 'Current Password', key: 'password', show: 'current' },
                { label: 'New Password', key: 'newPassword', show: 'new' },
                { label: 'Confirm New Password', key: 'confirmNewPassword', show: 'confirm' },
              ].map(({ label, key, show }) => (
                <div key={key}>
                  <label className="block text-gray-400 text-xs mb-1.5">{label}</label>
                  <div className="relative">
                    <input
                      type={showPw[show] ? 'text' : 'password'}
                      value={passwordForm[key]}
                      onChange={e => setPasswordForm(p => ({ ...p, [key]: e.target.value }))}
                      className="input-field pr-10" placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPw(p => ({ ...p, [show]: !p[show] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showPw[show] ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}
              <button type="submit" disabled={pwLoading} className="btn-primary flex items-center gap-2">
                {pwLoading ? <><MiniSpinner /> Updating...</> : <><Lock size={15} /> Update Password</>}
              </button>
            </form>
          </SectionCard>
        )}

        {/* ── Preferences Tab ── */}
        {activeTab === 'preferences' && (
          <div className="space-y-4">
            <SectionCard icon={Bot} iconColor="bg-emerald-500/80" title="Preferred AI Tool">
              <p className="text-gray-500 font-body text-xs mb-3">This will be pre-selected when creating new prompts.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AI_TOOLS.map(tool => (
                  <button key={tool} type="button"
                    onClick={() => setProfile(p => ({ ...p, preferredAiTool: tool }))}
                    className={`p-3 rounded-xl border text-sm font-body transition-all flex items-center gap-2 ${
                      profile.preferredAiTool === tool
                        ? 'bg-neon-blue/10 border-neon-blue/40 text-neon-blue'
                        : 'bg-obsidian-700 border-obsidian-500 text-gray-400 hover:border-obsidian-400'
                    }`}>
                    <Bot size={14} /> {tool}
                  </button>
                ))}
              </div>
            </SectionCard>
            <button onClick={async () => {
              setLoading(true);
              try {
                const data = await userService.updateProfile({ preferredAiTool: profile.preferredAiTool });
                updateUser(data.user);
                toast.success('Preferences saved!');
              } catch { toast.error('Failed to save preferences'); }
              finally { setLoading(false); }
            }} disabled={loading} className="btn-primary flex items-center gap-2">
              {loading ? <><MiniSpinner /> Saving...</> : <><Save size={15} /> Save Preferences</>}
            </button>
          </div>
        )}

        {/* ── Danger Zone Tab ── */}
        {activeTab === 'danger' && (
          <div className="space-y-4">
            <div className="card p-6 border border-red-500/20 bg-red-500/5">
              <h3 className="font-display font-semibold text-red-400 mb-2 flex items-center gap-2">
                <AlertTriangle size={16} /> Danger Zone
              </h3>
              <p className="text-gray-500 font-body text-sm mb-5">
                Permanently delete your account and all your prompts. This cannot be undone.
              </p>
              <button onClick={() => setShowDeleteModal(true)} className="btn-danger flex items-center gap-2">
                <Trash2 size={15} /> Delete My Account
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Delete Confirm Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-obsidian-800 border border-red-500/30 rounded-2xl p-6 w-full max-w-md animate-slide-up shadow-2xl">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4">
                <Trash2 size={24} className="text-red-400" />
              </div>
              <h3 className="font-display font-bold text-white text-lg">Delete Account?</h3>
              <p className="text-gray-400 font-body text-sm mt-2">
                All your prompts, favorites and data will be permanently erased.
              </p>
            </div>
            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-gray-400 text-xs mb-1.5">Current Password</label>
                <input type="password" value={deleteForm.password}
                  onChange={e => setDeleteForm(p => ({ ...p, password: e.target.value }))}
                  className="input-field" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1.5">Type <span className="text-red-400 font-mono">DELETE</span> to confirm</label>
                <input value={deleteForm.confirm}
                  onChange={e => setDeleteForm(p => ({ ...p, confirm: e.target.value }))}
                  className="input-field font-mono" placeholder="DELETE" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleDeleteAccount} disabled={deleteLoading || deleteForm.confirm !== 'DELETE'}
                className="btn-danger flex-1 flex items-center justify-center gap-2 disabled:opacity-40">
                {deleteLoading ? <><MiniSpinner /> Deleting...</> : <><Trash2 size={14} /> Delete Forever</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Profile;
