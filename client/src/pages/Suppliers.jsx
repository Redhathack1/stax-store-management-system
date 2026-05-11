import { useState, useEffect } from 'react';
import { Plus, Search, Phone, Mail, MapPin, Loader2, X, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', contactPerson: '', phone: '', email: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + '/suppliers');
      setSuppliers(res.data);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + '/suppliers', form);
      setSuppliers(prev => [res.data, ...prev]);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowModal(false);
        setForm({ name: '', contactPerson: '', phone: '', email: '', address: '' });
      }, 1500);
    } catch (err) {
      console.error('Error saving supplier:', err);
      alert('Failed to save supplier. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.contactPerson || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Suppliers & Distributors</h2>
          <p className="text-slate-500">Manage your supply chain and vendor relationships.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Supplier
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search suppliers..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700 shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
          <p>Loading suppliers...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <p className="text-lg font-medium mb-2">No suppliers yet</p>
          <p className="text-sm">Click "Add Supplier" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(supplier => (
            <div key={supplier._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{supplier.name}</h3>
                  {supplier.contactPerson && (
                    <p className="text-slate-500 text-sm mt-0.5">{supplier.contactPerson}</p>
                  )}
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  supplier.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {supplier.status}
                </span>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                {supplier.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{supplier.phone}</span>
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{supplier.email}</span>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{supplier.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Supplier Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Add New Supplier</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {success ? (
              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="text-lg font-semibold text-slate-800">Supplier Added!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {[
                  { field: 'name', label: 'Company Name *', required: true },
                  { field: 'contactPerson', label: 'Contact Person' },
                  { field: 'phone', label: 'Phone Number *', required: true },
                  { field: 'email', label: 'Email Address' },
                  { field: 'address', label: 'Address' },
                ].map(({ field, label, required }) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                    <input
                      type="text"
                      required={required}
                      value={form[field]}
                      onChange={(e) => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700"
                      placeholder={`Enter ${label.replace(' *', '').toLowerCase()}`}
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-sm disabled:opacity-50 flex justify-center items-center gap-2 mt-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Supplier'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
