require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Connect to MongoDB (reuse existing connection logic if any)
const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB with URI:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected...');
    } catch (err) {
        console.error('MongoDB connection error:', err.stack || err);
        process.exit(1);
        process.exit(1);
    }
};

const seedUsers = async () => {
    await connectDB();

    const users = [
        {
            firstName: 'Super',
            lastName: 'Admin',
            email: 'superadmin@buksu.edu.ph',
            password: 'ValidPass@123',
            role: 'super_admin',
        },
        {
            firstName: 'Manager',
            lastName: 'User',
            email: 'manager@buksu.edu.ph',
            password: 'Manager@2025',
            role: 'manager',
        },
        {
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@buksu.edu.ph',
            password: 'Admin@123',
            role: 'admin',
        },
    ];

    for (const u of users) {
        const exists = await User.findOne({ email: u.email });
        if (exists) {
            console.log(`User ${u.email} already exists, skipping.`);
            continue;
        }
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(u.password, salt);
        await User.create({
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            password: hashed,
            role: u.role,
            status: 'pending', // default status as in other seeds
        });
        console.log(`Created ${u.role} account: ${u.email}`);
    }

    mongoose.disconnect();
    console.log('Seeding completed.');
};

seedUsers();
