const { google } = require('googleapis');
const stream = require('stream');
const path = require('path');
const fs = require('fs');

// Load credentials
const CREDENTIALS_PATH = path.join(__dirname, '../security/credentials.json');
const TOKEN_PATH = path.join(__dirname, '../security/token.json');

const getAuthClient = () => {
    const content = fs.readFileSync(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;

    const client = new google.auth.OAuth2(
        key.client_id,
        key.client_secret,
        'http://localhost:3000/oauth2callback'
    );

    if (fs.existsSync(TOKEN_PATH)) {
        const tokenToken = fs.readFileSync(TOKEN_PATH);
        client.setCredentials(JSON.parse(tokenToken));
    }
    return client;
};

const auth = getAuthClient();
const drive = google.drive({ version: 'v3', auth });

/**
 * Upload a file to Google Drive and return the public view link.
 * @param {Object} fileObject - Multer file object
 * @returns {Promise<string>} - The webViewLink (or webContentLink)
 */
const uploadFile = async (fileObject) => {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileObject.buffer);

    try {
        const { data } = await drive.files.create({
            media: {
                mimeType: fileObject.mimetype,
                body: bufferStream,
            },
            requestBody: {
                name: fileObject.originalname,
                parents: process.env.DRIVE_FOLDER_ID ? [process.env.DRIVE_FOLDER_ID] : [],
            },
            fields: 'id, name, webViewLink, webContentLink',
        });

        // Make file public (optional, based on requirement)
        await drive.permissions.create({
            fileId: data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        return data.webContentLink; // Direct link for images
    } catch (error) {
        console.error('GDrive Upload Error:', error);
        throw error;
    }
};

module.exports = { uploadFile };
