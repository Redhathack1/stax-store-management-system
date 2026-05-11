import { useState, useEffect } from 'react';
import { Search, Plus, Filter, AlertCircle, Edit, Trash2, Loader2, X, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const CATEGORIES = ['Beverages', 'Dairy', 'Bakery', 'Produce', 'Snacks', 'Meat', 'Frozen', 'Household', 'Other'];
const EMPTY_FORM = { name: '', sku: '', category: 'Beverages', price: '', cost: '', stock: '', minStockLevel: '', expiryDate: '', supplier: '' };

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const [prodRes, suppRes] = await Promise.all([
        axios.get(import.meta.env.VITE_API_URL + '/products'),
        axios.get(import.meta.env.VITE_API_URL + '/suppliers')
      ]);
      setProducts(prodRes.data);
      setSuppliers(suppRes.data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setEditProduct(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name, sku: product.sku, category: product.category,
      price: product.price, cost: product.cost, stock: product.stock,
      minStockLevel: product.minStockLevel, supplier: product.supplier?._id || '',
      expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), cost: parseFloat(form.cost), stock: parseInt(form.stock), minStockLevel: parseInt(form.minStockLevel) };
      if (editProduct) {
        const res = await axios.put(import.meta.env.VITE_API_URL + '/products/' + editProduct._id, payload);
        setProducts(prev => prev.map(p => p._id === editProduct._id ? res.data : p));
      } else {
        const res = await axios.post(import.meta.env.VITE_API_URL + '/products', payload);
        setProducts(prev => [res.data, ...prev]);
      }
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setShowModal(false); setForm(EMPTY_FORM); }, 1500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(import.meta.env.VITE_API_URL + '/products/' + id);
      setProducts(prev => prev.filter(p => p._id !== id));
      setDeleteId(null);
    } catch (err) {
      alert('Failed to delete product.');
    }
  };

  const isLowStock = (stock, min) => stock <= min;
  const isExpiringSoon = (dateStr) => {
    if (!dateStr) return false;
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 30;
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Inventory Management</h2>
          <p className="text-slate-500">Track and manage your products with real-time stock levels.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-sm">
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input type="text" placeholder="Search products by name, SKU, or category..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700 shadow-sm"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
          <Filter className="w-5 h-5" /> Filter
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-medium">Product / SKU</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Price / Cost</th>
                <th className="p-4 font-medium">Stock Level</th>
                <th className="p-4 font-medium">Expiry</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="p-12 text-center text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />Loading inventory...
                </td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan="6" className="p-12 text-center text-slate-400">No products found.</td></tr>
              ) : filteredProducts.map((product) => {
                const lowStock = isLowStock(product.stock, product.minStockLevel);
                const expiring = isExpiringSoon(product.expiryDate);
                return (
                  <tr key={product._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{product.name}</div>
                      <div className="text-sm text-slate-400">{product.sku}</div>
                      {product.supplier && <div className="text-xs text-indigo-500 mt-1">Supplier: {product.supplier.name}</div>}
                    </td>
                    <td className="p-4"><span className="px-2.5 py-1 bg-slate-100 rounded-lg text-sm text-slate-600">{product.category}</span></td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800">${product.price?.toFixed(2)}</div>
                      <div className="text-sm text-slate-400">Cost: ${product.cost?.toFixed(2)}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-lg ${lowStock ? 'text-red-600' : 'text-slate-800'}`}>{product.stock}</span>
                        <span className="text-slate-400 text-sm">/ {product.minStockLevel} min</span>
                      </div>
                      {lowStock && <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 mt-1"><AlertCircle className="w-3 h-3" /> Low Stock</span>}
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-600">{product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : '—'}</div>
                      {expiring && <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md mt-1"><AlertCircle className="w-3 h-3" /> Expiring Soon</span>}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(product)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteId(product._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-slate-800">{editProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            {success ? (
              <div className="p-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4"><CheckCircle2 className="w-8 h-8 text-emerald-600" /></div>
                <p className="text-lg font-semibold text-slate-800">{editProduct ? 'Product Updated!' : 'Product Added!'}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Product Name *" value={form.name} onChange={(v) => setForm(p => ({ ...p, name: v }))} required placeholder="e.g. Organic Milk" />
                  <FormField label="SKU *" value={form.sku} onChange={(v) => setForm(p => ({ ...p, sku: v }))} required placeholder="e.g. MIL-001" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
                  <select required value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Selling Price ($) *" value={form.price} onChange={(v) => setForm(p => ({ ...p, price: v }))} required placeholder="0.00" type="number" step="0.01" min="0" />
                  <FormField label="Cost Price ($) *" value={form.cost} onChange={(v) => setForm(p => ({ ...p, cost: v }))} required placeholder="0.00" type="number" step="0.01" min="0" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Stock Quantity *" value={form.stock} onChange={(v) => setForm(p => ({ ...p, stock: v }))} required placeholder="0" type="number" min="0" />
                  <FormField label="Min Stock Level *" value={form.minStockLevel} onChange={(v) => setForm(p => ({ ...p, minStockLevel: v }))} required placeholder="5" type="number" min="0" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Expiry Date" value={form.expiryDate} onChange={(v) => setForm(p => ({ ...p, expiryDate: v }))} type="date" />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Supplier</label>
                    <select value={form.supplier} onChange={(e) => setForm(p => ({ ...p, supplier: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700">
                      <option value="">No Supplier</option>
                      {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={saving} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-sm disabled:opacity-50 flex justify-center items-center gap-2 mt-2">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : editProduct ? 'Update Product' : 'Add Product'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-8 h-8 text-red-500" /></div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Product?</h3>
            <p className="text-slate-500 mb-6 text-sm">This action cannot be undone. The product will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors shadow-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FormField = ({ label, value, onChange, required, placeholder, type = 'text', step, min }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
    <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} step={step} min={min}
      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700"
      placeholder={placeholder} />
  </div>
);

export default Inventory;
