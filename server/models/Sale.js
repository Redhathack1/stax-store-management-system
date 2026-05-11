const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  cost: { type: Number, required: true }, // Needed for profit calculations
});

const saleSchema = new mongoose.Schema({
  items: [saleItemSchema],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['Cash', 'Card', 'Bank Transfer', 'Transfer'], required: true },
  cashTendered: { type: Number },
  changeDue: { type: Number, default: 0 },
  cashier: { type: String, default: 'Admin' }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
