require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@dormsync.com';
        const adminPass = 'admin123';

        const existingUser = await User.findOne({ email: adminEmail });
        if (existingUser) {
            // Update password to ensure we know it
            const hashedPassword = await bcrypt.hash(adminPass, 10);
            existingUser.password = hashedPassword;
            existingUser.role = 'admin'; // Ensure role is admin
            await existingUser.save();
            console.log(`Admin user updated: ${adminEmail} / ${adminPass}`);
        } else {
            const hashedPassword = await bcrypt.hash(adminPass, 10);
            const newAdmin = new User({
                name: 'System Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin'
            });
            await newAdmin.save();
            console.log(`Created admin user: ${adminEmail} / ${adminPass}`);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

createAdmin();
