const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './.env' });

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const users = await User.find({});
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`ID: ${u._id}`);
            console.log(`Email: ${u.email}`);
            console.log(`Name: ${u.name || u.firstName + ' ' + u.lastName}`);
            console.log(`Role: ${u.role}`);
            console.log(`Status: ${u.status}`);
            console.log('-------------------');
        });

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkUser();
