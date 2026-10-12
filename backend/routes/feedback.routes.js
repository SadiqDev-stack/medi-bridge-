const express = require('express');
const Feedback = require('../models/Feedback');
const { protectHospital, protectAdmin } = require('../middlewares/auth');

const router = express.Router();

router.post('/', protectHospital, async (req, res, next) => {
  try {
    const { type, subject, message } = req.body;
    if (!subject || !message) return res.status(400).json({ message: 'subject and message required' });
    const fb = await Feedback.create({ hospital: req.hospital._id, type: type || 'feedback', subject, message });
    res.status(201).json({ message: 'Feedback submitted', feedback: fb });
  } catch (err) { next(err); }
});

router.get('/', protectAdmin, async (req, res, next) => {
  try { res.json(await Feedback.find().populate('hospital', 'name email').sort({ createdAt: -1 })); } catch (err) { next(err); }
});

module.exports = router;
