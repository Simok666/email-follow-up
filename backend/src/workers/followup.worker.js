require('dotenv').config()
const { Worker } = require('bullmq')
const connection = require('../config/redis')
const prisma = require('../config/prisma')
const sendEmail = require('../utils/gmailSender')

new Worker(
    'followup-queue',
    async job => {
        try{
            console.log('processing job:', job.id, job.data)
            console.log('DB PASSWORD:', process.env.DB_PASSWORD)
            const { followupId } = job.data

            const followup = await prisma.followup.findUnique({
                where: {
                    id: followupId
                },
                include: {
                    campaign: {
                        select: {
                            userId: true,
                            subject: true,
                            status: true
                        }
                    }
                }
            })


            if (!followup) throw new Error('Followup not found')

            const { threadId } = await sendEmail({
                userId: followup.campaign.userId,
                body: followup.emailBody
            })

            await prisma.followup.update({
                where: { id: followupId },
                data: {
                    sentAt: new Date(),
                    threadId
                }
            })

            console.log('follow-up sent:', followupId)
        } catch (err) {
            console.log('Worker Error: ', err.message)
            throw err
        }
    },
    { connection }
)

console.log('Follow-up Worker Running')