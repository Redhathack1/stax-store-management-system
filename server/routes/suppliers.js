const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a supplier
router.post('/', async (req, res) => {
  const supplier = new Supplier(req.body);
  try {
    const newSupplier = await supplier.save();
    res.status(201).json(newSupplier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
