const pool = require('../config/db')
const { google } = require('googleapis')

async function sendEmail({ userId, body }){
    const result = await pool.query(
        `SELECT access_token, refresh_token FROM gmail_accounts WHERE user_id = $1`,
        [userId]
    )

    const tokens = result.rows[0]

    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    )

    auth.setCredentials(tokens)

    const gmail = google.gmail({ version: 'v1', auth })

    const message = [
        'To: komisartgaming11@gmail.com',
        'Subject: Follow Up',
        '',
        body 
    ].join('\n')

    const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '-')

    const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: encodedMessage
        }
    })

    const threadId = response.data.threadId

    return { threadId }
}

module.exports = sendEmail