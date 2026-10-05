const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const seed = require('../seed/seed'); // We will export the seed function

let mongoServer;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;
    let isMemoryServer = false;

    // Use memory server if pointing to localhost and MONGODB_URI doesn't explicitly disable it
    if (uri && uri.includes('localhost')) {
      console.log('Starting MongoDB Memory Server for local development...');
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      isMemoryServer = true;
      console.log(`MongoDB Memory Server started at ${uri}`);
    }

    await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);

    if (isMemoryServer) {
      console.log('Checking if memory database needs seeding...');
      const User = require('../models/User');
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('Seeding memory database...');
        await seed();
        console.log('Memory database seeded successfully!');
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
