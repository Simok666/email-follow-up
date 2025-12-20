require('dotenv').config()

const replyCheckQueue = require('../queues/replyCheck.queue')

async function start() {
    await replyCheckQueue.add('check-replies',{},
        {
            repeat: {
                every: 5 * 60 * 1000    
            },
            removeOnComplete: true,
        }
    )
}

start()