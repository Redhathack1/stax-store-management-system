import { useState, useEffect } from 'react';
import { 
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, DollarSign, Package, AlertTriangle, ShoppingBag, Loader2 } from 'lucide-react';
import axios from 'axios';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('Last 7 Days');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + '/reports/dashboard');
      setData(res.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
        <p className="text-lg font-medium">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Overview</h2>
          <p className="text-slate-500">Welcome back! Here's what's happening in your store.</p>
        </div>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-xl bg-white text-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
        >
          <option>Last 7 Days</option>
          <option>This Month</option>
          <option>This Year</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Revenue" amount={`$${(data?.totalRevenue || 0).toFixed(2)}`} icon={DollarSign} trend="All time" />
        <MetricCard title="Net Profit" amount={`$${(data?.netProfit || 0).toFixed(2)}`} icon={TrendingUp} trend={data?.netProfit >= 0 ? 'Profitable' : 'Loss'} trendUp={data?.netProfit >= 0} />
        <MetricCard title="Total Sales" amount={data?.totalSales || 0} icon={ShoppingBag} trend="Transactions" />
        <MetricCard title="Low Stock Items" amount={data?.lowStockCount || 0} icon={AlertTriangle} trend="Needs attention" isWarning={data?.lowStockCount > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expenses Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Revenue vs Expenses</h3>
          <p className="text-sm text-slate-400 mb-6">Last 7 days performance</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.revenueChartData || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dx={-10} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px -4px rgb(0 0 0 / 0.15)', fontSize: '13px' }} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" dot={{ fill: '#4F46E5', r: 4 }} activeDot={{ r: 6 }} />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExp)" dot={{ fill: '#EF4444', r: 4 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Payment Methods</h3>
          <p className="text-sm text-slate-400 mb-4">Transaction breakdown</p>
          {data?.paymentData?.length > 0 ? (
            <>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.paymentData} innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value">
                      {data.paymentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px -4px rgb(0 0 0 / 0.15)', fontSize: '13px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                {data.paymentData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                    <span className="text-sm text-slate-600">{entry.name} ({entry.value})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-52 flex items-center justify-center text-slate-400 text-sm">No sales recorded yet</div>
          )}
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Top Selling Products</h3>
        <p className="text-sm text-slate-400 mb-6">Units sold across all time</p>
        {data?.topProducts?.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topProducts} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dx={-10} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px -4px rgb(0 0 0 / 0.15)', fontSize: '13px' }} />
                <Bar dataKey="sold" name="Units Sold" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
            No sales data yet. Process your first sale in the POS!
          </div>
        )}
      </div>

      {/* Recent Transactions Table */}
      {data?.recentSales?.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Recent Transactions</h3>
          <p className="text-sm text-slate-400 mb-4">Latest sales and the staff who processed them</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                  <th className="p-3 font-medium">Time</th>
                  <th className="p-3 font-medium">Cashier</th>
                  <th className="p-3 font-medium">Payment Method</th>
                  <th className="p-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-slate-500 text-sm">{new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="p-3 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                          {sale.cashier?.[0]?.toUpperCase()}
                        </div>
                        {sale.cashier}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">{sale.paymentMethod}</span>
                    </td>
                    <td className="p-3 text-right font-bold text-slate-800">${sale.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ title, amount, icon: Icon, trend, trendUp, isWarning }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${isWarning ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
        isWarning ? 'bg-red-50 text-red-600' :
        trendUp === false ? 'bg-rose-50 text-rose-600' :
        'bg-emerald-50 text-emerald-600'
      }`}>
        {trend}
      </span>
    </div>
    <div>
      <h4 className="text-slate-500 text-sm font-medium mb-1">{title}</h4>
      <p className="text-2xl font-bold text-slate-800">{amount}</p>
    </div>
  </div>
);

export default Dashboard;
