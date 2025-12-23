require('dotenv').config()

const { Worker } = require('bullmq')
const { google } = require('googleapis')
const prisma = require('../config/prisma')
const connection = require('../config/redis')
const { stopCampaign } = require('../services/campaign.service')

new Worker(
    'reply-check-queue', 
    async () => {
        console.log('check replies')
        try {
            const campaigns = await prisma.campaign.findMany({
                where: {
                    status: 'active',
                    followups: {
                        some: {
                            threadId: {
                                not: null
                            },
                            sentAt: {
                                not: null
                            }
                        }
                    }
                },
                select: {
                    id: true,
                    userId: true
                }
            })

            for (const campaign of campaigns) {
                await checkReplies(campaign)
                console.log('replies checked')
            }
        } catch (e) {
            console.log('Worker Error: ', err.message)
            throw err
        }
        
    },
    {connection}
)

async function checkReplies(campaign){
    try{
        const account = await prisma.gmailAccount.findUnique({
            where: {userId: campaign.userId}
        })

        if (!account) return

        const oauth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        )

        oauth.setCredentials({
            access_token: account.accessToken,
            refresh_token: account.refreshToken
        })

        const gmail = google.gmail({version: 'v1', auth: oauth})

        const threads = await prisma.followup.findMany({
            where: {
                campaignId: campaign.id,
                sentAt: { not: null },
                cancelledAt: null,
                threadId: { not: null }
            }
        })

        for (const t of threads){
            const thread = await gmail.users.threads.get({
                userId: 'me',
                id: t.threadId
            })   

            if (thread.data.messages.length > 1){
                console.log('masuk stop campaign')
                await stopCampaign(campaign.id)
                break
            }
        }
    } catch (e) {
        console.log('Worker Error: ', err.message)
        throw err
    }
    
}
