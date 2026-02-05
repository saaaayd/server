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

const checkFolder = async () => {
    const folderId = process.env.DRIVE_FOLDER_ID;
    console.log(`Checking access for Folder ID: ${folderId}`);

    try {
        const res = await drive.files.get({
            fileId: folderId,
            fields: 'id, name, capabilities, owners, permissions',
        });

        console.log('Folder found!');
        console.log('Name:', res.data.name);
        console.log('Capabilities:', JSON.stringify(res.data.capabilities, null, 2));
        console.log('Owners:', res.data.owners.map(o => o.emailAddress));
    } catch (error) {
        console.error('Error accessing folder:', error.message);
        if (error.response) {
            console.error('Code:', error.response.status);
            console.error('Status:', error.response.statusText);
        }
    }
};

checkFolder();
