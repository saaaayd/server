const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const destroyer = require('server-destroy');

const KEY_PATH = path.join(__dirname, 'security/credentials.json');
const TOKEN_PATH = path.join(__dirname, 'security/token.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];

async function main() {
    const content = fs.readFileSync(KEY_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;

    // Create an oAuth2 client to authorize the API call
    // We use localhost:3000 as redirect URI because it's a common default/test URI
    // If the user's credentials don't whitelist this, it will error.
    const redirectUri = 'http://localhost:3000/oauth2callback';

    const oAuth2Client = new google.auth.OAuth2(
        key.client_id,
        key.client_secret,
        redirectUri
    );

    // Generate the url that will be used for the consent dialog.
    const authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent' // Force refresh token generation
    });

    // Open the browser to the authorize url to start the workflow
    console.log('Authorize this app by visiting this url:', authorizeUrl);
    fs.writeFileSync('auth_url_only.txt', authorizeUrl);

    const server = http
        .createServer(async (req, res) => {
            try {
                if (req.url.indexOf('/oauth2callback') > -1) {
                    console.log(`Incoming Request: ${req.url}`);
                    const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
                    const code = qs.get('code');
                    const error = qs.get('error');

                    if (error) {
                        console.error(`Error from Google: ${error}`);
                        res.end(`Authentication failed: ${error}`);
                        server.destroy();
                        return;
                    }

                    if (!code) {
                        console.log('No code found in request. Ignoring or waiting...');
                        res.end('No code received. If you just authorized, please try again.');
                        // Do not destroy server here, might be a stray request
                        return;
                    }

                    console.log(`Code received: ${code}`);
                    res.end('Authentication successful! You can close this tab.');

                    try {
                        const { tokens } = await oAuth2Client.getToken(code);
                        oAuth2Client.credentials = tokens;
                        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
                        console.log('Token stored to', TOKEN_PATH);
                    } catch (tokenError) {
                        console.error('Error retrieving token:', tokenError);
                        fs.writeFileSync('auth_error.log', `Token Error: ${tokenError.message}\n${JSON.stringify(tokenError)}`);
                    } finally {
                        server.destroy();
                    }
                }
            } catch (e) {
                console.error(e);
                fs.writeFileSync('auth_error.log', `General Error: ${e.message}\n${e.stack}`);
                res.end('Error during authentication');
                server.destroy();
            }
        })
        .listen(3000, () => {
            console.log('Listening on http://localhost:3000/oauth2callback');
            console.log('NOTE: If you get a "redirect_uri_mismatch" error, you need to add "http://localhost:3000/oauth2callback" to your Allowed Redirect URIs in Google Cloud Console.');
        });

    destroyer(server);
}

main().catch(console.error);
