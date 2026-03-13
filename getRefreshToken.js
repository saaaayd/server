/**
 * One-time setup script to generate a Google OAuth2 Refresh Token.
 * 
 * Usage:
 *   1. Make sure your .env has GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET set.
 *   2. Run: node getRefreshToken.js
 *   3. Open the URL printed in the console in your browser.
 *   4. Log in with the Google account that owns the calendar.
 *   5. Grant calendar permission.
 *   6. You will be redirected — the script will capture the code and print the refresh token.
 *   7. Copy the refresh token and paste it into your .env as GOOGLE_REFRESH_TOKEN=<token>
 */

const http = require('http');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const url = require('url');

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ ERROR: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env');
    process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',  // Force consent to ensure we get a refresh token
    scope: ['https://www.googleapis.com/auth/calendar'],
});

console.log('\n========================================');
console.log('  Google Calendar — Refresh Token Setup');
console.log('========================================\n');
console.log('1. Open this URL in your browser:\n');
console.log(`   ${authUrl}\n`);
console.log('2. Log in and grant calendar access.');
console.log('3. You will be redirected to localhost:3000 — the script will handle the rest.\n');
console.log('Waiting for callback...\n');

// Start a temporary server to capture the OAuth2 callback
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (parsedUrl.pathname === '/oauth2callback') {
        const code = parsedUrl.query.code;

        if (!code) {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end('<h1>Error: No authorization code received.</h1>');
            return;
        }

        try {
            const { tokens } = await oauth2Client.getToken(code);

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
                <h1 style="color: green;">✅ Success!</h1>
                <p>Refresh token has been printed in the terminal.</p>
                <p>You can close this tab now.</p>
            `);

            console.log('✅ SUCCESS! Here is your refresh token:\n');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(tokens.refresh_token);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            console.log('Copy the token above and paste it into your .env file as:');
            console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);

            // Close server after a short delay
            setTimeout(() => {
                server.close();
                process.exit(0);
            }, 2000);
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end(`<h1>Error exchanging code</h1><pre>${err.message}</pre>`);
            console.error('❌ Error exchanging code for tokens:', err.message);
        }
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(3000, () => {
    console.log('🔌 Temporary server listening on http://localhost:3000');
});
