const { google } = require('googleapis')
const oauth2Client = require('../../config/google')
const pool = require('../../config/db')

const SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send'
]

function getAuthUrl(userId) {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: SCOPES,
        state: userId
    })
}


async function saveToken(userId, tokens) {
   await pool.query(
        `
            INSERT INTO gmail_accounts (user_id, access_token, refresh_token)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id) DO UPDATE SET
            access_token = EXCLUDED.access_token,
            refresh_token = EXCLUDED.refresh_token
        `,
        [userId, tokens.access_token, tokens.refresh_token]
   )
}


async function sendEmail(userId, to, subject, message) {
    const result = await pool.query(
        `SELECT * FROM gmail_accounts WHERE user_id = $1`,
        [userId]
    )

    const account = result.rows[0]
    if (!account) throw new Error('Gmail not connected')
    
    oauth2Client.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token
    })

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

    const email = [
        `To: ${to}`,
        `Content-Type: text/plain; charset=utf-8`,
        `MIME-Version: 1.0`,
        `Subject: ${subject}`,
        ``,
        message
    ].join('\r\n')

    const encodedMessage = Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

    await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: encodedMessage
        }
    })
}

module.exports = {
    getAuthUrl,
    saveToken,
    sendEmail
}