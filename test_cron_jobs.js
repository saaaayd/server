require('dotenv').config();
const mongoose = require('mongoose');
const { runAttendanceReminder, runAbsenteeCheck, runPaymentReminder } = require('./services/cronService');

const runTests = async () => {
    // Connect to DB first
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Test');

    console.log('--- Testing Attendance Reminder ---');
    await runAttendanceReminder();

    console.log('--- Testing Absentee Check ---');
    // NOTE: This will mark students absent if they haven't logged attendance today!
    // Be careful running this on production data.
    // For now, let's assume it's okay for testing or we can dry-run it by commenting out the create/send part in cronService if needed.
    // But since the user complained notifications AREN'T working, running it might actually fix the missing notifications for today if that was the issue.
    // However, it's 8:50 AM (local time in metadata says 8:44), so Absentee Check (9PM) shouldn't run yet logic-wise?
    // Wait, the logic just checks if attendance is missing. If I run it now (8AM), everyone will be marked absent!

    // I should skip running Absentee Check for now unless I want to mark everyone absent.
    // Let's stick to Attendance Reminder (8AM) and Payment Reminder.

    // await runAbsenteeCheck(); 

    console.log('--- Testing Payment Reminder ---');
    await runPaymentReminder();

    console.log('Tests Completed.');
    await mongoose.connection.close();
    process.exit();
};

runTests();
