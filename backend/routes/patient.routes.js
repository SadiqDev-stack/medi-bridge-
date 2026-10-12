const express = require('express');
const Patient = require('../models/Patient');
const { protectHospital } = require('../middlewares/auth');
const generateHealthId = require('../utils/generateId');
const { logAction } = require('../utils/audit');

const router = express.Router();

router.post('/', protectHospital, async (req, res, next) => {
  try {
    const { fullName, dob, gender, phone, address } = req.body;
    if (!fullName || !dob || !gender) return res.status(400).json({ message: 'fullName, dob, gender are required' });
    const healthId = await generateHealthId();
    const patient = await Patient.create({ healthId, fullName, dob, gender, phone, address, registeredBy: req.hospital._id });
    await logAction({ actor: req.hospital._id, action: 'PATIENT_REGISTERED', targetType: 'Patient', targetId: patient._id, meta: { healthId } });
    res.status(201).json({ message: 'Patient registered', patient });
  } catch (err) { next(err); }
});

router.get('/search', protectHospital, async (req, res, next) => {
  try {
    const { healthId } = req.query;
    if (!healthId) return res.status(400).json({ message: 'healthId query required' });
    const patient = await Patient.findOne({ healthId }).populate('registeredBy', 'name');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    await logAction({ actor: req.hospital._id, action: 'PATIENT_SEARCHED', targetType: 'Patient', targetId: patient._id, meta: { healthId } });
    res.json(patient);
  } catch (err) { next(err); }
});

router.get('/:id', protectHospital, async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('registeredBy', 'name');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    await logAction({ actor: req.hospital._id, action: 'PATIENT_VIEWED', targetType: 'Patient', targetId: patient._id });
    res.json(patient);
  } catch (err) { next(err); }
});

module.exports = router;
