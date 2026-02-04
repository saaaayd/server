const { google } = require('googleapis');
const stream = require('stream');
const path = require('path');

// Load credentials
// Assume the file is at server root or security folder based on user context
const KEYFILEPATH = path.join(__dirname, '../security/dormsync-479923-b3b695aa406c.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
});

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
                parents: ['1yCq1XjFGu9sU2vJ4Z8lK2pQ4Y5n3b6a7'], // Optional: Folder ID (You might want to make this configurable)
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
