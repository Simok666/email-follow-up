const oauth2Client = require('../../config/google')
const gmailService = require('./gmail.service')


async function getAuthUrl(req, res){
    const url = gmailService.getAuthUrl(req.user.userId)
    res.json({ url })
}


async function callback(req, res){
    const { code, state } = req.query
    const { tokens } = await oauth2Client.getToken(code)
    
    await gmailService.saveToken(state, tokens)

    res.redirect('http://localhost:5173/gmail-success')
}

async function testSend(req, res) {
    const { to, subject, message } = req.body
    await gmailService.sendEmail(req.user.userId, to, subject, message)
    res.json({ message: 'Email Sent' })
}

module.exports = {
    getAuthUrl,
    callback,
    testSend
}