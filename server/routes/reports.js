const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Expense = require('../models/Expense');

// GET /api/reports/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const sales = await Sale.find();
    const expenses = await Expense.find();
    const products = await Product.find();

    // Total revenue from all sales
    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);

    // Total expenses
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Total cost of goods sold
    const totalCOGS = sales.reduce((sum, s) => {
      return sum + s.items.reduce((iSum, i) => iSum + (i.cost * i.quantity), 0);
    }, 0);

    // Gross Profit = Revenue - COGS
    const grossProfit = totalRevenue - totalCOGS;

    // Net Profit = Gross Profit - Other Expenses
    const netProfit = grossProfit - totalExpenses;

    // Sales by day (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const daySales = sales.filter(s => s.createdAt.toISOString().split('T')[0] === dateStr);
      const dayExpenses = expenses.filter(e => new Date(e.date).toISOString().split('T')[0] === dateStr);
      last7Days.push({
        name: dayName,
        revenue: parseFloat(daySales.reduce((sum, s) => sum + s.total, 0).toFixed(2)),
        expenses: parseFloat(dayExpenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)),
      });
    }

    // Payment method breakdown
    const paymentBreakdown = sales.reduce((acc, s) => {
      const method = s.paymentMethod;
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});
    const paymentData = Object.entries(paymentBreakdown).map(([name, value]) => ({ name, value }));

    // Top selling products
    const productSales = {};
    sales.forEach(s => {
      s.items.forEach(item => {
        if (!productSales[item.name]) productSales[item.name] = 0;
        productSales[item.name] += item.quantity;
      });
    });
    const topProducts = Object.entries(productSales)
      .map(([name, sold]) => ({ name, sold }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    // Low stock items count
    const lowStockCount = products.filter(p => p.stock <= p.minStockLevel).length;

    // Recent sales
    const recentSales = sales
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(s => ({ id: s._id, total: s.total, cashier: s.cashier, paymentMethod: s.paymentMethod, date: s.createdAt }));

    res.json({
      totalRevenue,
      totalExpenses,
      grossProfit,
      netProfit,
      totalSales: sales.length,
      lowStockCount,
      revenueChartData: last7Days,
      paymentData,
      topProducts,
      recentSales
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
