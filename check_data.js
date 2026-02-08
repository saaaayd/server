require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Attendance = require('./models/Attendance');

const checkData = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const students = await User.find({ role: 'student' });
    console.log(`Found ${students.length} students.`);

    for (const student of students) {
        console.log(`- ${student.email}: Role=${student.role}, Status=${student.status}`);

        // Check attendance for today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const attendance = await Attendance.findOne({
            student: student._id,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        console.log(`  Attendance Today: ${attendance ? 'Yes' : 'No'}`);
    }

    await mongoose.connection.close();
    process.exit();
};

checkData();
