const BASE_URL = 'http://localhost:5000/api/auth';
const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';

async function runTest() {
    try {
        // 1. Register
        console.log(`1. Registering user: ${TEST_EMAIL}`);
        const registerRes = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: 'Test',
                lastName: 'User',
                email: TEST_EMAIL,
                password: TEST_PASSWORD,
                confirmPassword: TEST_PASSWORD,
                role: 'student',
                studentId: `ST_${Date.now()}`,
                studentProfile: {
                    roomNumber: 'TBD',
                    status: 'inactive'
                }
            })
        });

        console.log('Registration Status:', registerRes.status);
        const registerData = await registerRes.json();
        // console.log('Register Response:', registerData);

        // 2. Get OTP from DB
        const mongoose = require('mongoose');
        require('dotenv').config();

        await mongoose.connect(process.env.MONGO_URI);
        const User = require('./models/User');

        const user = await User.findOne({ email: TEST_EMAIL }).select('+otp');
        if (!user) {
            console.error('User not found in DB!');
            process.exit(1);
        }

        const otp = user.otp;
        console.log(`2. Retrieved OTP from DB: ${otp}`);

        // 3. Verify OTP
        console.log('3. Verifying OTP...');
        const verifyRes = await fetch(`${BASE_URL}/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_EMAIL,
                otp: otp
            })
        });

        console.log('Verify Response Status:', verifyRes.status);
        const verifyData = await verifyRes.json();
        console.log('Verify Response Data:', verifyData);

        if (verifyData.token) {
            console.log('SUCCESS: Token received!');
        } else {
            console.error('FAILURE: No token received!');
        }

        // Cleanup
        await User.deleteOne({ email: TEST_EMAIL });
        await mongoose.connection.close();

    } catch (error) {
        console.error('Test Failed:', error);
        try {
            const mongoose = require('mongoose');
            await mongoose.disconnect();
        } catch (e) { }
    }
}

runTest();
