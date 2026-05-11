import { useState, useEffect } from 'react';
import { Store, Users, Lock, Bell, Save, Loader2, CheckCircle2, Plus, Trash2, Edit, X } from 'lucide-react';
import axios from 'axios';

const ROLES = ['Admin', 'Manager', 'Cashier'];
const TABS = [
  { id: 'store', label: 'Store Profile', icon: Store },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'password', label: 'Change Password', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

const Settings = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('store');

  const visibleTabs = TABS.filter(tab => {
    if (tab.id === 'users' && currentUser?.role !== 'Admin') return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
        <p className="text-slate-500">Configure your store, manage staff, and set preferences.</p>
      </div>

      <div className="flex gap-6">
        {/* Tab Sidebar */}
        <div className="w-56 flex-shrink-0 space-y-1">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon className="w-5 h-5 flex-shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          {activeTab === 'store' && <StoreProfileTab />}
          {activeTab === 'users' && <UserManagementTab currentUser={currentUser} />}
          {activeTab === 'password' && <ChangePasswordTab currentUser={currentUser} />}
          {activeTab === 'notifications' && <NotificationsTab />}
        </div>
      </div>
    </div>
  );
};

/* ─── STORE PROFILE ─────────────────────────────────────── */
const StoreProfileTab = () => {
  const [form, setForm] = useState({ storeName: '', address: '', phone: '', email: '', taxRate: 8, currency: 'USD' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    axios.get(import.meta.env.VITE_API_URL + '/settings')
      .then(res => setForm(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(import.meta.env.VITE_API_URL + '/settings', form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { alert('Failed to save settings.'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-1">Store Profile</h3>
      <p className="text-sm text-slate-400 mb-6">This information appears on receipts and reports.</p>
      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <SF label="Store Name *" value={form.storeName} onChange={v => setForm(p => ({ ...p, storeName: v }))} required placeholder="My Superstore" />
          <SF label="Store Email" value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} type="email" placeholder="store@email.com" />
        </div>
        <SF label="Store Address" value={form.address} onChange={v => setForm(p => ({ ...p, address: v }))} placeholder="123 Main Street, Lagos" />
        <div className="grid grid-cols-2 gap-5">
          <SF label="Phone Number" value={form.phone} onChange={v => setForm(p => ({ ...p, phone: v }))} placeholder="+234 800 000 0000" />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Currency</label>
            <select value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700">
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="NGN">NGN (₦)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Tax Rate (%)</label>
          <div className="relative w-48">
            <input type="number" min="0" max="100" step="0.1" value={form.taxRate}
              onChange={e => setForm(p => ({ ...p, taxRate: parseFloat(e.target.value) }))}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
          </div>
        </div>
        <div className="pt-2">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-sm disabled:opacity-60">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ─── USER MANAGEMENT ───────────────────────────────────── */
const UserManagementTab = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Cashier' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [editUser, setEditUser] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + '/settings/users');
      setUsers(res.data);
    } finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + '/settings/users', form);
      setUsers(p => [res.data, ...p]);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setShowModal(false); setForm({ name: '', email: '', password: '', role: 'Cashier' }); }, 1500);
    } catch (err) { alert(err.response?.data?.message || 'Failed to add user.'); }
    finally { setSaving(false); }
  };

  const handleRoleChange = async (id, role) => {
    try {
      const res = await axios.put(import.meta.env.VITE_API_URL + '/settings/users/' + id, { role });
      setUsers(p => p.map(u => u._id === id ? res.data : u));
    } catch { alert('Failed to update role.'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this user?')) return;
    try {
      await axios.delete(import.meta.env.VITE_API_URL + '/settings/users/' + id);
      setUsers(p => p.filter(u => u._id !== id));
    } catch { alert('Failed to remove user.'); }
  };

  const roleColors = { Admin: 'bg-indigo-50 text-indigo-700', Manager: 'bg-amber-50 text-amber-700', Cashier: 'bg-emerald-50 text-emerald-700' };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">User Management</h3>
          <p className="text-sm text-slate-400">Add, edit, or remove staff accounts and their roles.</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
      ) : (
        <div className="space-y-3">
          {users.map(user => (
            <div key={user._id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{user.name}</p>
                <p className="text-sm text-slate-500 truncate">{user.email}</p>
              </div>
              <select
                value={user.role}
                onChange={e => handleRoleChange(user._id, e.target.value)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border-none outline-none cursor-pointer ${roleColors[user.role]}`}
              >
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {user._id !== currentUser?.id && (
                <button onClick={() => handleDelete(user._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Add New Staff Member</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            {success ? (
              <div className="p-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4"><CheckCircle2 className="w-8 h-8 text-emerald-600" /></div>
                <p className="text-lg font-semibold text-slate-800">Staff Added!</p>
              </div>
            ) : (
              <form onSubmit={handleAdd} className="p-6 space-y-4">
                <SF label="Full Name *" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} required placeholder="John Smith" />
                <SF label="Email Address *" value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} required type="email" placeholder="john@store.com" />
                <SF label="Password *" value={form.password} onChange={v => setForm(p => ({ ...p, password: v }))} required type="password" placeholder="Min 6 characters" />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Role *</label>
                  <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700">
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <button type="submit" disabled={saving}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-sm disabled:opacity-50 flex justify-center items-center gap-2 mt-2">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add Staff Member'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── CHANGE PASSWORD ───────────────────────────────────── */
const ChangePasswordTab = ({ currentUser }) => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (form.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await axios.put(import.meta.env.VITE_API_URL + '/settings/change-password', {
        userId: currentUser?.id,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
    } finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-1">Change Password</h3>
      <p className="text-sm text-slate-400 mb-6">Update your account password. You'll be signed in to all sessions.</p>
      <form onSubmit={handleSubmit} className="max-w-md space-y-5">
        {message && (
          <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}
        <SF label="Current Password *" value={form.currentPassword} onChange={v => setForm(p => ({ ...p, currentPassword: v }))} required type="password" placeholder="Enter current password" />
        <SF label="New Password *" value={form.newPassword} onChange={v => setForm(p => ({ ...p, newPassword: v }))} required type="password" placeholder="Min 6 characters" />
        <SF label="Confirm New Password *" value={form.confirmPassword} onChange={v => setForm(p => ({ ...p, confirmPassword: v }))} required type="password" placeholder="Repeat new password" />
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-sm disabled:opacity-60">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
          Update Password
        </button>
      </form>
    </div>
  );
};

/* ─── NOTIFICATIONS ─────────────────────────────────────── */
const NotificationsTab = () => {
  const [form, setForm] = useState({ lowStockThreshold: 5, expiryAlertDays: 30 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    axios.get(import.meta.env.VITE_API_URL + '/settings')
      .then(res => setForm({ lowStockThreshold: res.data.lowStockThreshold, expiryAlertDays: res.data.expiryAlertDays }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(import.meta.env.VITE_API_URL + '/settings', form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { alert('Failed to save notification preferences.'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-1">Notification Preferences</h3>
      <p className="text-sm text-slate-400 mb-6">Configure thresholds that trigger alerts across the system.</p>
      <form onSubmit={handleSave} className="max-w-md space-y-6">
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-800">Low Stock Alert</p>
              <p className="text-sm text-slate-500 mb-3">Flag products in the inventory as "Low Stock" when their quantity drops to or below this number.</p>
              <div className="flex items-center gap-3">
                <input type="number" min="1" value={form.lowStockThreshold}
                  onChange={e => setForm(p => ({ ...p, lowStockThreshold: parseInt(e.target.value) }))}
                  className="w-28 px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700 font-medium" />
                <span className="text-sm text-slate-500">units remaining</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-800">Expiry Alert</p>
              <p className="text-sm text-slate-500 mb-3">Flag products as "Expiring Soon" when their expiry date is within this many days.</p>
              <div className="flex items-center gap-3">
                <input type="number" min="1" value={form.expiryAlertDays}
                  onChange={e => setForm(p => ({ ...p, expiryAlertDays: parseInt(e.target.value) }))}
                  className="w-28 px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700 font-medium" />
                <span className="text-sm text-slate-500">days before expiry</span>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-sm disabled:opacity-60">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {saved ? 'Saved!' : 'Save Preferences'}
        </button>
      </form>
    </div>
  );
};

/* ─── SHARED FORM FIELD ─────────────────────────────────── */
const SF = ({ label, value, onChange, required, placeholder, type = 'text' }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
    <input type={type} required={required} value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700"
      placeholder={placeholder} />
  </div>
);

export default Settings;
