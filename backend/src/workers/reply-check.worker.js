require('dotenv').config()

const { Worker } = require('bullmq')
const { google } = require('googleapis')
const pool = require('../config/db')
const connection = require('../config/redis')
const { stopCampaign } = require('../services/campaign.service')

new Worker(
    'reply-check-queue', 
    async () => {
        console.log('check replies')
        const campaigns = await pool.query(`
            SELECT DISTINCT c.id, c.user_id
            FROM campaigns c
            JOIN followups f ON f.campaign_id = c.id
            WHERE c.status = 'active'
                AND f.thread_id IS NOT NULL    
        `)

        for (const campaign of campaigns.rows) {
            await checkReplies(campaign)
            console.log('replies checked')
        }
    },
    {connection}
)

async function checkReplies(campaign){
    const tokens = await pool.query(
        `SELECT * FROM gmail_accounts WHERE user_id = $1`,
        [campaign.user_id]
    )

    if (!tokens.rows.length) return

    const oauth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    )

    oauth.setCredentials(tokens.rows[0])

    const gmail = google.gmail({version: 'v1', auth: oauth})

    const threads = await pool.query(
        `
            SELECT DISTINCT thread_id
            FROM followups
            WHERE campaign_id = $1
            AND sent_at IS NOT NULL
        `,
        [campaign.id]
    )

    for (const t of threads.rows){
        const thread = await gmail.users.threads.get({
            userId: 'me',
            id: t.thread_id
        })   

        if (thread.data.messages.length > 1){
            console.log('masuk stop campaign')
            await stopCampaign(campaign.id)
            break
        }
    }
}
