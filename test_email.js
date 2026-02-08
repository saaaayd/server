require('dotenv').config();
const emailService = require('./services/emailService');

const testEmail = async () => {
    console.log('Testing Email Service...');
    console.log('SMTP Config:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER ? 'Set' : 'Not Set',
        pass: process.env.SMTP_PASS ? 'Set' : 'Not Set'
    });

    try {
        await emailService.sendEmail(
            process.env.SMTP_USER, // Send to self
            'Test Email from DormSync',
            '<h1>It Works!</h1><p>This is a test email to verify the notification system.</p>'
        );
        console.log('Test email sent successfully.');
    } catch (error) {
        console.error('Test email failed:', error);
    }
};

testEmail();
