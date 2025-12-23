const prisma = require('../../config/prisma')

async function getDashboardStats(userId){
    const activeCampaigns = await prisma.campaign.count({
        where: {
            userId,
            status: 'active'
        }
    })

    const followupsSent = await prisma.followup.count({
        where: {
            sentAt: { not: null },
            campaign: {
                userId
            }
        }
    })

    const repliedCampaigns = await prisma.campaign.count({
        where: {
            userId,
            status: 'stopped'
        }
    })

    return {
        activeCampaigns,
        followupsSent,
        repliedCampaigns
    }
}

module.exports = {
    getDashboardStats
}