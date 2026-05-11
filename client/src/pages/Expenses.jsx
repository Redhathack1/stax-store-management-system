import { useState, useEffect } from 'react';
import { Plus, Search, Loader2, X, CheckCircle2, Receipt } from 'lucide-react';
import axios from 'axios';

const CATEGORIES = ['Rent', 'Utilities', 'Staff', 'Maintenance', 'Other'];

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', amount: '', category: 'Rent', date: new Date().toISOString().split('T')[0], description: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + '/expenses');
      setExpenses(res.data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + '/expenses', form);
      setExpenses(prev => [res.data, ...prev]);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowModal(false);
        setForm({ title: '', amount: '', category: 'Rent', date: new Date().toISOString().split('T')[0], description: '' });
      }, 1500);
    } catch (err) {
      console.error('Error saving expense:', err);
      alert('Failed to save expense. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const filtered = expenses.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  const categoryColors = {
    Rent: 'bg-purple-50 text-purple-700',
    Utilities: 'bg-blue-50 text-blue-700',
    Staff: 'bg-indigo-50 text-indigo-700',
    Maintenance: 'bg-amber-50 text-amber-700',
    Other: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Expense Tracking</h2>
          <p className="text-slate-500">Log and categorise your business expenses.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Log Expense
        </button>
      </div>

      {/* Total Expenses Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg shadow-indigo-200">
        <p className="text-indigo-200 text-sm font-medium mb-1">Total Expenses Logged</p>
        <p className="text-4xl font-bold">${totalExpenses.toFixed(2)}</p>
        <p className="text-indigo-200 text-sm mt-2">{expenses.length} transactions recorded</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search expenses by title or category..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700 shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
          <p>Loading expenses...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Receipt className="w-12 h-12 opacity-40 mb-3" />
          <p className="text-lg font-medium mb-1">No expenses logged yet</p>
          <p className="text-sm">Click "Log Expense" to record one.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(exp => (
                  <tr key={exp._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{exp.title}</div>
                      {exp.description && <div className="text-sm text-slate-500 mt-0.5">{exp.description}</div>}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryColors[exp.category] || 'bg-slate-100 text-slate-600'}`}>
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-sm">
                      {new Date(exp.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4 text-right font-bold text-red-600">
                      -${exp.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Log New Expense</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {success ? (
              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="text-lg font-semibold text-slate-800">Expense Logged!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
                  <input type="text" required value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700" placeholder="e.g. Monthly Office Rent" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount ($) *</label>
                    <input type="number" step="0.01" min="0" required value={form.amount} onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Date *</label>
                    <input type="date" required value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
                  <select required value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700 resize-none" placeholder="Optional details..." />
                </div>
                <button type="submit" disabled={saving}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-sm disabled:opacity-50 flex justify-center items-center gap-2 mt-2">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Expense'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
