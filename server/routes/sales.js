const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');

// Get all sales
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find().sort({ createdAt: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Process a new sale (POS)
router.post('/', async (req, res) => {
  try {
    const { items, subtotal, discount, total, paymentMethod, cashTendered, changeDue, cashier } = req.body;
    
    // Deduct stock for each item
    for (let item of items) {
      const product = await Product.findById(item.product);
      if (product) {
        if (product.stock < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
        }
        product.stock -= item.quantity;
        await product.save();
      }
    }

    const newSale = new Sale({
      items,
      subtotal,
      discount,
      total,
      paymentMethod,
      cashTendered,
      changeDue,
      cashier
    });

    const savedSale = await newSale.save();
    res.status(201).json(savedSale);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
