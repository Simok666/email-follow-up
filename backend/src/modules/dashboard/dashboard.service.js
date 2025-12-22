const pool = require('../../config/db')

async function getDashboardStats(userId){
    const activeCampaigns = await pool.query(
        `
        SELECT COUNT(*)
        FROM campaigns
        WHERE user_id = $1
        AND status = 'active'
        `,
        [userId]
    )

    const followupsSent = await pool.query(
        `
        SELECT COUNT(*)
        FROM followups f 
        JOIN campaigns c ON f.campaign_id = c.id
        WHERE c.user_id = $1
        AND f.sent_at IS NOT NULL
        `,
        [userId]
    )

    const repliedCampaigns = await pool.query(
        `
        SELECT COUNT(*)
        FROM campaigns
        WHERE user_id = $1
        AND status = 'stopped'
        `,
        [userId]
    )

    return {
        activeCampaigns: Number(activeCampaigns.rows[0].count),
        followupsSent: Number(followupsSent.rows[0].count),
        repliedCampaigns: Number(repliedCampaigns.rows[0].count)
    }
}

module.exports = {
    getDashboardStats
}