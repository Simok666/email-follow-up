const prisma = require('../config/prisma')
const { google } = require('googleapis')

async function sendEmail({ userId, body }){
    const account = await prisma.gmailAccount.findUnique({
        where: {
            userId
        }
    })

    if (!account) {
        throw new Error('Gmail not connected')
    }

    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    )

    auth.setCredentials({
        access_token: account.accessToken,
        refresh_token: account.refreshToken
    })

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