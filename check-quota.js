const { google } = require('googleapis');
const path = require('path');
require('dotenv').config();

const KEYFILEPATH = path.join(__dirname, '../server/security/dormsync-479923-b3b695aa406c.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

const checkQuota = async () => {
    try {
        const res = await drive.about.get({
            fields: 'storageQuota',
        });
        console.log('Quota:', JSON.stringify(res.data.storageQuota, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
};

checkQuota();
