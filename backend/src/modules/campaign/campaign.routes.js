const express = require('express');
const { create, list, detail, stop, upsert, remove } = require('./campaign.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = express.Router();

router.post('/', authMiddleware, upsert);
router.get('/', authMiddleware, list);
router.get('/:id', authMiddleware, detail);
router.put('/:id', authMiddleware, stop);
router.delete('/:id', authMiddleware, remove);

module.exports = router;