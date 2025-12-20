const { Queue } = require('bullmq')
const connection = require('../config/redis')

const followupQueue = new Queue('followup-queue', {
    connection
})

module.exports = followupQueue