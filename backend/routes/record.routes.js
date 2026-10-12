const express = require('express');
const Record = require('../models/Record');
const Patient = require('../models/Patient');
const { protectHospital } = require('../middlewares/auth');
const { logAction } = require('../utils/audit');

const router = express.Router();

router.post('/', protectHospital, async (req, res, next) => {
  try {
    const { patient, date, reason, diagnosis, treatment, notes } = req.body;
    if (!patient || !reason || !diagnosis || !treatment) return res.status(400).json({ message: 'patient, reason, diagnosis, treatment required' });
    const exists = await Patient.findById(patient);
    if (!exists) return res.status(404).json({ message: 'Patient not found' });
    const record = await Record.create({ patient, hospital: req.hospital._id, createdBy: req.hospital._id, date: date || new Date(), reason, diagnosis, treatment, notes });
    await logAction({ actor: req.hospital._id, action: 'RECORD_ADDED', targetType: 'Record', targetId: record._id, meta: { patientId: patient } });
    res.status(201).json({ message: 'Encounter recorded', record });
  } catch (err) { next(err); }
});

router.get('/patient/:patientId', protectHospital, async (req, res, next) => {
  try {
    const records = await Record.find({ patient: req.params.patientId }).populate('hospital', 'name').sort({ date: -1 });
    await logAction({ actor: req.hospital._id, action: 'RECORD_HISTORY_VIEWED', targetType: 'Patient', targetId: req.params.patientId });
    res.json(records);
  } catch (err) { next(err); }
});

module.exports = router;
