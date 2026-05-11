import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart2, Loader2, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + '/reports/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
        <p className="text-lg font-medium">Calculating profit & loss...</p>
      </div>
    );
  }

  const profitMargin = data?.totalRevenue > 0 ? ((data?.grossProfit / data?.totalRevenue) * 100).toFixed(1) : 0;
  const netMargin = data?.totalRevenue > 0 ? ((data?.netProfit / data?.totalRevenue) * 100).toFixed(1) : 0;

  const plSummary = [
    { name: 'Revenue', value: data?.totalRevenue || 0, color: '#4F46E5' },
    { name: 'COGS', value: (data?.totalRevenue || 0) - (data?.grossProfit || 0), color: '#F59E0B' },
    { name: 'Gross Profit', value: data?.grossProfit || 0, color: '#10B981' },
    { name: 'Expenses', value: data?.totalExpenses || 0, color: '#EF4444' },
    { name: 'Net Profit', value: data?.netProfit || 0, color: data?.netProfit >= 0 ? '#059669' : '#DC2626' },
  ];

  const exportToCSV = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Revenue', `$${(data?.totalRevenue || 0).toFixed(2)}`],
      ['Total Expenses', `$${(data?.totalExpenses || 0).toFixed(2)}`],
      ['Gross Profit', `$${(data?.grossProfit || 0).toFixed(2)}`],
      ['Net Profit', `$${(data?.netProfit || 0).toFixed(2)}`],
      ['Total Sales Transactions', data?.totalSales || 0],
      [''],
      ['Top Selling Products', 'Units Sold'],
      ...(data?.topProducts || []).map(p => [p.name, p.sold])
    ];
    
    let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Stax_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Profit & Loss Report</h2>
          <p className="text-slate-500">Full financial overview across all recorded transactions.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-all shadow-sm">
            <Download className="w-4 h-4" /> CSV
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 border border-transparent text-white hover:bg-indigo-700 rounded-xl font-medium transition-all shadow-sm">
            <Download className="w-4 h-4" /> PDF / Print
          </button>
        </div>
      </div>

      {/* Top KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <PLCard
          title="Total Revenue"
          value={`$${(data?.totalRevenue || 0).toFixed(2)}`}
          icon={DollarSign}
          color="indigo"
          sub="All time sales"
        />
        <PLCard
          title="Gross Profit"
          value={`$${(data?.grossProfit || 0).toFixed(2)}`}
          icon={TrendingUp}
          color="emerald"
          sub={`${profitMargin}% margin`}
        />
        <PLCard
          title="Total Expenses"
          value={`$${(data?.totalExpenses || 0).toFixed(2)}`}
          icon={TrendingDown}
          color="red"
          sub="Operational costs"
        />
        <PLCard
          title="Net Profit"
          value={`$${(data?.netProfit || 0).toFixed(2)}`}
          icon={BarChart2}
          color={data?.netProfit >= 0 ? 'emerald' : 'red'}
          sub={`${netMargin}% net margin`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* P&L Summary Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-1">P&L Breakdown</h3>
          <p className="text-sm text-slate-400 mb-6">Visual summary of your financials</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plSummary} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} dx={-10} />
                <Tooltip
                  formatter={(val) => [`$${val.toFixed(2)}`, '']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px -4px rgb(0 0 0 / 0.15)', fontSize: '13px' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {plSummary.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed P&L Statement Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Income Statement</h3>
          <p className="text-sm text-slate-400 mb-6">Formal profit & loss summary</p>
          <div className="space-y-0">
            {[
              { label: 'Gross Revenue', value: data?.totalRevenue || 0, bold: false, color: 'text-slate-800' },
              { label: 'Cost of Goods Sold (COGS)', value: -((data?.totalRevenue || 0) - (data?.grossProfit || 0)), bold: false, color: 'text-amber-600' },
              { label: 'Gross Profit', value: data?.grossProfit || 0, bold: true, color: 'text-emerald-600', divider: true },
              { label: 'Operating Expenses', value: -(data?.totalExpenses || 0), bold: false, color: 'text-red-600' },
              { label: 'Net Profit / (Loss)', value: data?.netProfit || 0, bold: true, color: data?.netProfit >= 0 ? 'text-emerald-700' : 'text-red-700', divider: true, large: true },
            ].map(({ label, value, bold, color, divider, large }) => (
              <div key={label}>
                {divider && <div className="border-t border-slate-200 my-3" />}
                <div className="flex justify-between items-center py-2.5">
                  <span className={`${bold ? 'font-semibold text-slate-800' : 'text-slate-600'} ${large ? 'text-base' : 'text-sm'}`}>{label}</span>
                  <span className={`${bold ? 'font-bold' : 'font-medium'} ${color} ${large ? 'text-lg' : 'text-sm'}`}>
                    {value < 0 ? `-$${Math.abs(value).toFixed(2)}` : `$${value.toFixed(2)}`}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 p-4 rounded-xl text-center">
              <p className="text-xs text-indigo-400 font-medium mb-1">Gross Margin</p>
              <p className="text-xl font-bold text-indigo-700">{profitMargin}%</p>
            </div>
            <div className={`p-4 rounded-xl text-center ${data?.netProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <p className={`text-xs font-medium mb-1 ${data?.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>Net Margin</p>
              <p className={`text-xl font-bold ${data?.netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{netMargin}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Selling Products table */}
      {data?.topProducts?.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Top Selling Products</h3>
          <p className="text-sm text-slate-400 mb-6">Best performing products by units sold</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                  <th className="p-3 font-medium">Rank</th>
                  <th className="p-3 font-medium">Product</th>
                  <th className="p-3 font-medium text-right">Units Sold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.topProducts.map((p, i) => (
                  <tr key={p.name} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-100 text-slate-600' : 'bg-orange-50 text-orange-600'}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-800">{p.name}</td>
                    <td className="p-3 text-right">
                      <span className="bg-indigo-50 text-indigo-700 font-semibold px-3 py-1 rounded-full text-sm">{p.sold} units</span>
                    </td>
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

const PLCard = ({ title, value, icon: Icon, color, sub }) => {
  const colorMap = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    red: { bg: 'bg-red-50', text: 'text-red-600' },
  };
  const { bg, text } = colorMap[color] || colorMap.indigo;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl ${bg} ${text} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${text}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  );
};

export default Reports;
