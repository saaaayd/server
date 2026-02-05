const { uploadFile } = require('./utils/driveService');
require('dotenv').config();

const run = async () => {
    try {
        const dummyFile = {
            buffer: Buffer.from('test content'),
            mimetype: 'text/plain',
            originalname: 'test-upload.txt'
        };
        console.log('Using Folder ID:', process.env.DRIVE_FOLDER_ID);
        console.log('Attempting upload...');
        const link = await uploadFile(dummyFile);
        console.log('Upload success! Link:', link);
    } catch (e) {
        console.error('Test failed:', e.message);
        if (e.response) {
            console.error('Response data:', JSON.stringify(e.response.data, null, 2));
        }
    }
};

run();
