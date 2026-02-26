import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Save } from 'lucide-react';
import Spinner from '../components/common/Spinner';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({ fullName: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ password: '', newPassword: '', confirmNewPassword: '' });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await userService.getProfile();
        setProfile({ fullName: data.user.fullName, email: data.user.email });
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setFetching(false);
      }
    };
    load();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await userService.updateProfile(profile);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      return toast.error('New passwords do not match');
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setPwLoading(true);
    try {
      await userService.updateProfile({
        password: passwordForm.password,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password updated!');
      setPasswordForm({ password: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPwLoading(false);
    }
  };

  if (fetching) return <DashboardLayout title="Profile"><div className="flex justify-center py-20"><Spinner size="lg" /></div></DashboardLayout>;

  return (
    <DashboardLayout title="Profile">
      <div className="max-w-2xl space-y-6">
        {/* Avatar */}
        <div className="card p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-blue/30 to-neon-purple/30 border border-obsidian-500 flex items-center justify-center">
            <span className="font-display font-bold text-white text-2xl">
              {profile.fullName?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-lg">{profile.fullName}</h3>
            <p className="text-gray-500 font-mono text-sm">{profile.email}</p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="card p-6">
          <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <User size={18} className="text-neon-blue" /> Personal Info
          </h3>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Full Name</label>
              <input
                value={profile.fullName}
                onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))}
                className="input-field"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                className="input-field"
                placeholder="your@email.com"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              {loading ? <><span className="w-4 h-4 border-2 border-obsidian-950/30 border-t-obsidian-950 rounded-full animate-spin" /> Saving...</> : <><Save size={15} /> Save Changes</>}
            </button>
          </form>
        </div>

        {/* Password Form */}
        <div className="card p-6">
          <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <Lock size={18} className="text-neon-purple" /> Change Password
          </h3>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Current Password</label>
              <input
                type="password"
                value={passwordForm.password}
                onChange={e => setPasswordForm(p => ({ ...p, password: e.target.value }))}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                className="input-field"
                placeholder="Min. 6 characters"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmNewPassword}
                onChange={e => setPasswordForm(p => ({ ...p, confirmNewPassword: e.target.value }))}
                className="input-field"
                placeholder="Re-enter new password"
              />
            </div>
            <button type="submit" disabled={pwLoading} className="btn-primary flex items-center gap-2">
              {pwLoading ? <><span className="w-4 h-4 border-2 border-obsidian-950/30 border-t-obsidian-950 rounded-full animate-spin" /> Updating...</> : <><Lock size={15} /> Update Password</>}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
