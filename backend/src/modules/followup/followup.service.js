const prisma = require('../../config/prisma')
const followupQueue = require('../../queues/followup.queue')
const { v4: uuidv4 } = require('uuid')

async function addFollowup(campaignId, step, delayDays, emailBody) {
    const delayMs = delayDays * 24 * 60 * 60 * 1000

    const followup = await prisma.followup.create({
        data: {
            campaignId,
            step,
            delayDays,
            emailBody
        }
    })

    await followupQueue.add(
        'send-followup',
        {
            followupId : followup.id
        },
        {
            delay : delayMs
        }
    )

    return followup
}

async function deleteFollowup(id) {
  return prisma.followup.delete({
    where: {
      id
    }
  })
}

async function getFollowups(campaignId) {
    return prisma.followup.findMany({
        where: {
            campaignId
        },
        orderBy: {
            step: 'asc'
        }
    })
}

module.exports = {
    addFollowup,
    deleteFollowup,
    getFollowups
}