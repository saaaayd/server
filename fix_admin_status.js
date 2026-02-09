const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './.env' });

const fixAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const result = await User.updateOne(
            { email: 'lagrosascydiemar@gmail.com' },
            { $set: { status: 'active' } }
        );
        console.log(`Update result: ${JSON.stringify(result)}`);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

fixAdmin();
