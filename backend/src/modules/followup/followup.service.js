const pool = require('../../config/db')
const followupQueue = require('../../queues/followup.queue')
const { v4: uuidv4 } = require('uuid')

async function addFollowup(campaignId, step, delayDays, emailBody) {
    const delayMs = delayDays * 24 * 60 * 60 * 1000

    const result = await pool.query(
        `
         INSERT INTO followups (id, campaign_id, step, delay_days, email_body, sent_at)
         VALUES ($1, $2, $3, $4, $5, NOW()) 
         RETURNING *
        `,
        [uuidv4(), campaignId, step, delayDays, emailBody]
    )

    const followup = result.rows[0]

    await followupQueue.add(
        'send-followup',
        {
            followupId : followup.id
        },
        {
            delay : delayMs
        }
    )

    return result.rows[0]
}

async function deleteFollowup(id) {
  await pool.query(
    `DELETE FROM followups WHERE id = $1`,
    [id]
  )
}

async function getFollowups(campaignId) {
    const result = await pool.query(
        `
         SELECT * FROM followups
         WHERE campaign_id = $1
         ORDER BY step ASC
        `,
        [campaignId]
    )
    return result.rows
}

module.exports = {
    addFollowup,
    deleteFollowup,
    getFollowups
}