const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  storeName: { type: String, default: 'Stax Store' },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  taxRate: { type: Number, default: 8 },
  currency: { type: String, default: 'USD' },
  lowStockThreshold: { type: Number, default: 5 },
  expiryAlertDays: { type: Number, default: 30 },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
