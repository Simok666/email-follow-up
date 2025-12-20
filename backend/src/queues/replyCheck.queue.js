const { Queue } = require('bullmq')
const connection = require('../config/redis')

const replyCheckQueue = new Queue('reply-check-queue', { 
    connection 
})

module.exports = replyCheckQueue