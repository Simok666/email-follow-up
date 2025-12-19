const express = require('express');
const controller = require('./followup.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = express.Router();

router.post('/:campaignId', authMiddleware, controller.add);
router.get('/:campaignId', authMiddleware, controller.list);
router.delete('/:id', authMiddleware, controller.remove)


module.exports = router;