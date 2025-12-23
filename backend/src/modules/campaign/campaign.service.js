const prisma = require('../../config/prisma')
const { v4: uuidv4 } = require('uuid');


async function upsertCampaign(userId, data) {
    const { id, subject, name, status } = data;

    if (id) {
       return prisma.campaign.update({
            where: {
                id_userId: {
                    id,
                    userId
                }
            },
            data: {
                subject,
                status: status || 'active'
            }
       })
    }

    return prisma.campaign.create({
        data: {
            id: uuidv4(),
            userId,
            subject,
            name,
        }
    })
}

async function getCampaigns(userId) {
    return prisma.campaign.findMany({
        where: {userId},
        orderBy: {
            createdAt: 'desc'
        }
    })
}

async function getCampaignById(userId, campaignId) {
    return prisma.campaign.findFirst({
        where: {
            id: campaignId,
            userId
        }
    })
}

async function deleteCampaign(userId, campaignId) {
  return prisma.campaign.deleteMany({
    where: {
      id: campaignId,
      userId
    }
  })
}

async function stopCampaing(userId, campaignId){
    return prisma.campaign.updateMany({
        where: {
            id: campaignId,
            userId
        },
        data: {
            status: 'stopped'
        }
    })
}


module.exports = {
    upsertCampaign,
    getCampaigns,
    getCampaignById,
    deleteCampaign,
    stopCampaing
}