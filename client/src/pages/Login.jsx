import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + '/auth/login', form);
      localStorage.setItem('stax_token', res.data.token);
      localStorage.setItem('stax_user', JSON.stringify(res.data.user));
      onLogin(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-indigo-300 blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="text-white font-black text-lg">S</span>
            </div>
            <h1 className="text-2xl font-bold">Stax Store</h1>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-6">
            Manage your store<br />smarter, faster.
          </h2>
          <p className="text-indigo-200 text-lg leading-relaxed max-w-sm">
            Enterprise-grade inventory, POS, and analytics — all in one beautifully designed platform.
          </p>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { label: 'Products Tracked', value: '10,000+' },
            { label: 'Daily Transactions', value: '500+' },
            { label: 'Uptime', value: '99.9%' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-indigo-200 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 lg:max-w-md flex flex-col justify-center px-8 py-16">
        <div className="mb-10 lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-black text-sm">S</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800">Stax Store</h1>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome back</h2>
          <p className="text-slate-500">Sign in to your store management account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 bg-white"
              placeholder="admin@staxstore.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 bg-white"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-base transition-all shadow-md shadow-indigo-200 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>


      </div>
    </div>
  );
};

export default Login;
