require('dotenv').config()
const { Worker } = require('bullmq')
const connection = require('../config/redis')
const pool = require('../config/db')
const sendEmail = require('../utils/gmailSender')

new Worker(
    'followup-queue',
    async job => {
        try{
            console.log('processing job:', job.id, job.data)
            console.log('DB PASSWORD:', process.env.DB_PASSWORD)
            const { followupId } = job.data

            const result = await pool.query(
                `
                SELECT f.*, c.user_id
                FROM followups f
                JOIN campaigns c ON c.id = f.campaign_id
                WHERE f.id = $1
                `,
                [followupId]
            )

            const followup = result.rows[0]

            if (!followup) throw new Error('Followup not found')

            const {threadId } = await sendEmail({
                userId: followup.user_id,
                body: followup.email_body
            })

            await pool.query(
                `
                UPDATE followups
                SET sent_at = NOW(),
                    thread_id = $1
                WHERE id = $2
                `,
                [threadId, followupId]
            )

            console.log('follow-up sent:', followupId)
        } catch (err) {
            console.log('Worker Error: ', err.message)
            throw err
        }
    },
    { connection }
)

console.log('Follow-up Worker Running')