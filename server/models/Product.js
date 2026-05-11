const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  price: { type: Number, required: true }, // Selling price
  cost: { type: Number, required: true },  // Buying price (used for profit)
  stock: { type: Number, required: true, default: 0 },
  minStockLevel: { type: Number, required: true, default: 5 }, // For low stock alerts
  expiryDate: { type: Date }, // For expiry alerts
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
