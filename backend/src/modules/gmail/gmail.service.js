const { google } = require('googleapis')
const oauth2Client = require('../../config/google')
const prisma = require('../../config/prisma')

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
   return prisma.gmailAccount.upsert({
    where: {
        userId
    },
    update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token
    },
    create: {
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token
    }
   })
}


async function sendEmail(userId, to, subject, message) {
    const account = await prisma.gmailAccount.findUnique({
        where: {
            userId
        }
    })

    if (!account) throw new Error('Gmail not connected')
    
    oauth2Client.setCredentials({
        access_token: account.accessToken,
        refresh_token: account.refreshToken
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