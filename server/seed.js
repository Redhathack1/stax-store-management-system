require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stax-store';

const seedProducts = [
  { name: 'Premium Coffee Beans', sku: 'COF-001', category: 'Beverages', price: 15.99, cost: 8.00, stock: 45, minStockLevel: 10 },
  { name: 'Organic Almond Milk', sku: 'MIL-002', category: 'Dairy', price: 4.99, cost: 2.50, stock: 4, minStockLevel: 10 },
  { name: 'Whole Wheat Bread', sku: 'BRE-003', category: 'Bakery', price: 3.49, cost: 1.20, stock: 8, minStockLevel: 5 },
  { name: 'Avocado (Large)', sku: 'AVO-004', category: 'Produce', price: 2.50, cost: 1.00, stock: 30, minStockLevel: 15 },
  { name: 'Free Range Eggs (12)', sku: 'EGG-005', category: 'Dairy', price: 6.99, cost: 3.50, stock: 50, minStockLevel: 20 },
  { name: 'Sea Salt Chocolate', sku: 'SNA-006', category: 'Snacks', price: 4.50, cost: 2.00, stock: 25, minStockLevel: 10 }
];

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Clearing old products...');
    await Product.deleteMany({});
    console.log('Seeding new products...');
    await Product.insertMany(seedProducts);
    console.log('Database seeded successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error seeding database:', err);
    process.exit(1);
  });
