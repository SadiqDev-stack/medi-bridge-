const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Hospital = require('../models/Hospital');

const router = express.Router();
const signToken = (p) => jwt.sign(p, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register-hospital', async (req, res, next) => {
  try {
    const { name, email, password, address, phone, licenseNumber } = req.body;
    if (!name || !email || !password || !address || !phone || !licenseNumber) return res.status(400).json({ message: 'All fields are required' });
    const exists = await Hospital.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const hospital = await Hospital.create({ name, email, password: hash, address, phone, licenseNumber });
    res.status(201).json({ message: 'Registration submitted. Awaiting admin approval.', hospital: { id: hospital._id, name: hospital.name, status: hospital.status } });
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const hospital = await Hospital.findOne({ email });
    if (!hospital) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, hospital.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    if (hospital.status !== 'approved') return res.status(403).json({ message: 'Hospital ' + hospital.status });
    const token = signToken({ id: hospital._id, role: 'hospital' });
    res.json({ token, hospital: { id: hospital._id, name: hospital.name, email: hospital.email } });
  } catch (err) { next(err); }
});

router.post('/admin-login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ message: 'Invalid admin credentials' });
    const token = signToken({ id: 'admin', email, role: 'admin' });
    res.json({ token, admin: { email, role: 'admin' } });
  } catch (err) { next(err); }
});

module.exports = router;
