const pool = require('../../config/db');
const { v4: uuidv4 } = require('uuid');


async function upsertCampaign(userId, data) {
    const { id, subject, status } = data;

    if (id) {
        const result = await pool.query(
            `UPDATE campaigns SET subject = $1, status = $2 WHERE id = $3 AND user_id = $4 RETURNING *`,
            [subject, status || 'active', id, userId]
        );
        return result.rows[0];
    }

    const result = await pool.query(
        `INSERT INTO campaigns (id, user_id, subject) VALUES ($1, $2, $3) RETURNING *`,
        [uuidv4(), userId, subject]
    );
    return result.rows[0];
}

async function getCampaigns(userId) {
    const result = await pool.query(
        `SELECT * FROM campaigns WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
    );
    return result.rows;
}

async function getCampaignById(userId, campaignId) {
    const result = await pool.query(
        `SELECT * FROM campaigns WHERE id = $1 AND user_id = $2`,
        [campaignId, userId]
    );
    return result.rows[0];
}

async function deleteCampaign(userId, campaignId) {
  await pool.query(
    `
    DELETE FROM campaigns
    WHERE id = $1 AND user_id = $2
    `,
    [campaignId, userId]
  )
}

async function stopCampaing(userId, campaignId){
    await pool.query(
        `
            UPDATE campaigns
            SET status = 'stopped'
            WHERE id = $1 AND user_id = $2
        `,
        [campaignId, userId]
    )
}


module.exports = {
    upsertCampaign,
    getCampaigns,
    getCampaignById,
    deleteCampaign,
    stopCampaing
}