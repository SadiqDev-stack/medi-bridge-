const express = require('express');
const AuditLog = require('../models/AuditLog');
const { protectAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', protectAdmin, async (req, res, next) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(500);
    res.json(logs);
  } catch (err) { next(err); }
});

module.exports = router;
