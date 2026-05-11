import { useState, useEffect } from 'react';
import { Search, Loader2, Calendar, User, Receipt, Filter } from 'lucide-react';
import axios from 'axios';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + '/sales');
      setTransactions(res.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => 
    t._id.toLowerCase().includes(search.toLowerCase()) ||
    (t.cashier || 'Unknown').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Transaction History</h2>
          <p className="text-slate-500">View all past sales processed by any staff member.</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by Cashier Name or Transaction ID..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700 shadow-sm"
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-medium">Transaction ID</th>
                <th className="p-4 font-medium">Date & Time</th>
                <th className="p-4 font-medium">Cashier</th>
                <th className="p-4 font-medium">Payment Method</th>
                <th className="p-4 font-medium">Items</th>
                <th className="p-4 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="p-12 text-center text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />Loading transactions...
                </td></tr>
              ) : filteredTransactions.length === 0 ? (
                <tr><td colSpan="6" className="p-12 text-center text-slate-400">No transactions found.</td></tr>
              ) : filteredTransactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-mono text-sm text-slate-600">#{tx._id.slice(-8).toUpperCase()}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(tx.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 font-medium text-slate-800">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                        {(tx.cashier || 'U')[0].toUpperCase()}
                      </div>
                      {tx.cashier || 'Unknown'}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-sm text-slate-600 font-medium">
                      {tx.paymentMethod}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-slate-600">
                      {tx.items.length} items
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="font-bold text-slate-800">${tx.total.toFixed(2)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
