const express = require('express');
const controller = require('./contract.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = express.Router();

router.post('/create', authMiddleware, controller.createContract);
router.get('/:id', authMiddleware, controller.getContract);
router.post('/:id/sign', controller.signContract);

module.exports = router