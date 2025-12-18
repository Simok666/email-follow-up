const express = require('express')
const controller = require('./gmail.controller')
const authMiddleware = require('../../middlewares/auth.middleware')


const router = express.Router()

router.get('/connect', authMiddleware, controller.getAuthUrl)
router.get('/callback', controller.callback)
router.post('/send-test', authMiddleware, controller.testSend)

module.exports = router