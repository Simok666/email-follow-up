const followupQueue = require('../queues/followup.queue')
const pool = require('../config/db')

async function stopCampaign(campaignId){
     try{
        console.log('ini campaign id', campaignId)
        await pool.query(
            `UPDATE campaigns SET status = 'stopped' WHERE id = $1`,
            [campaignId]
        )

        const followups = await pool.query(
            `
            SELECT id
            FROM followups
            WHERE campaign_id = $1
                AND sent_at IS NOT NULL
            `,
            [campaignId]
        )

        for (const f of followups.rows) {
            await followupQueue.remove(f.id)
        }

        await pool.query(
        `
        UPDATE followups
        SET cancelled_at = NOW()
        WHERE campaign_id = $1
        `,
        [campaignId]
    )

    console.log('Campaign stopped:', campaignId)
     } catch (err) {
            console.log('Stop Campaign Error: ', err.message)
            throw err
        }
}

module.exports = {
    stopCampaign
}