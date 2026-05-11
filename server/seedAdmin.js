require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stax-store';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Creating admin user...');
    await User.deleteMany({ email: 'admin@staxstore.com' });
    await User.create({
      name: 'Admin',
      email: 'admin@staxstore.com',
      password: 'stax123',
      role: 'Admin'
    });
    console.log('Admin user created!');
    console.log('Email: admin@staxstore.com');
    console.log('Password: stax123');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
