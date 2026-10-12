const express = require('express');
const Hospital = require('../models/Hospital');
const Patient = require('../models/Patient');
const Record = require('../models/Record');
const Feedback = require('../models/Feedback');
const { protectAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', protectAdmin, async (req, res, next) => {
  try {
    const [hospitals, pending, patients, records, feedback] = await Promise.all([
      Hospital.countDocuments(),
      Hospital.countDocuments({ status: 'pending' }),
      Patient.countDocuments(),
      Record.countDocuments(),
      Feedback.countDocuments(),
    ]);
    res.json({ hospitals: { total: hospitals, pending }, patients, records, feedback });
  } catch (err) { next(err); }
});

module.exports = router;
