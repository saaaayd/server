const mongoose = require('mongoose');
require('dotenv').config();

async function checkLatestUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = require('./models/User');

        const user = await User.findOne().sort({ _id: -1 });

        if (user) {
            console.log('Latest User:', {
                id: user._id,
                email: user.email,
                role: user.role,
                status: user.status,
                studentId: user.studentId,
                otp: user.otp ? 'Present' : 'None',
                createdAt: user._id.getTimestamp()
            });
        } else {
            console.log('No users found.');
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkLatestUser();
