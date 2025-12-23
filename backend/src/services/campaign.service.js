const followupQueue = require('../queues/followup.queue')
const prisma = require('../config/prisma')

async function stopCampaign(campaignId){
     try{
        console.log('ini campaign id', campaignId)
        await prisma.campaign.update({
            where: { id: campaignId },
            data: { status: 'stopped' }
        })

        const followups = await prisma.followup.findMany({
            where: {
                campaignId,
                sentAt: null,
                cancelledAt: null
            },
            select: {
                id: true
            }
        })

        for (const f of followups) {
            await followupQueue.remove(f.id)
        }

        await prisma.followup.updateMany({
            where:{
                campaignId,
                sentAt:null,
                cancelledAt:null
            },
            data: {
                cancelledAt: new Date()
            }
        })

    console.log('Campaign stopped:', campaignId)
     } catch (err) {
            console.log('Stop Campaign Error: ', err.message)
            throw err
        }
}

module.exports = {
    stopCampaign
}