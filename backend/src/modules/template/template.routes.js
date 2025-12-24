const express = require('express');
const controller = require('./template.controller');
const upload = require('../../utils/upload');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = express.Router();

router.post('/', authMiddleware, upload.single('file'), controller.uploadTemplate);
router.get('/', authMiddleware, controller.getTemplate);

module.exports = router;