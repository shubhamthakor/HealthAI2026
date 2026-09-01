require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/healthai';
    console.log(`Connecting to database at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    // Check if admin already exists
    const email = 'admin@healthai.com';
    const adminExists = await Admin.findOne({ email });

    if (adminExists) {
      console.log(`Admin account with email ${email} already exists.`);
    } else {
      await Admin.create({
        email,
        password: 'AdminSecurePass123!'
      });
      console.log(`Successfully created admin account:`);
      console.log(`Email: ${email}`);
      console.log(`Password: AdminSecurePass123!`);
    }

    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding admin: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
