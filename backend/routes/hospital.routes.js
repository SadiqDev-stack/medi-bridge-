const express = require('express');
const Hospital = require('../models/Hospital');
const { protectAdmin, protectHospital } = require('../middlewares/auth');
const { logAction } = require('../utils/audit');

const router = express.Router();

router.get('/pending', protectAdmin, async (req, res, next) => {
  try { res.json(await Hospital.find({ status: 'pending' }).select('-password')); } catch (err) { next(err); }
});

router.get('/', protectAdmin, async (req, res, next) => {
  try { res.json(await Hospital.find().select('-password').sort({ createdAt: -1 })); } catch (err) { next(err); }
});

router.patch('/:id/approve', protectAdmin, async (req, res, next) => {
  try {
    const h = await Hospital.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true }).select('-password');
    if (!h) return res.status(404).json({ message: 'Hospital not found' });
    await logAction({ actor: req.admin.id, actorType: 'admin', action: 'HOSPITAL_APPROVED', targetType: 'Hospital', targetId: h._id });
    res.json({ message: 'Hospital approved', hospital: h });
  } catch (err) { next(err); }
});

router.patch('/:id/reject', protectAdmin, async (req, res, next) => {
  try {
    const h = await Hospital.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true }).select('-password');
    if (!h) return res.status(404).json({ message: 'Hospital not found' });
    await logAction({ actor: req.admin.id, actorType: 'admin', action: 'HOSPITAL_REJECTED', targetType: 'Hospital', targetId: h._id });
    res.json({ message: 'Hospital rejected', hospital: h });
  } catch (err) { next(err); }
});

router.get('/me', protectHospital, async (req, res) => res.json(req.hospital));

module.exports = router;
