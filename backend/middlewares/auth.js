const jwt = require('jsonwebtoken');
const Hospital = require('../models/Hospital');

const protectHospital = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) return res.status(401).json({ message: 'No token provided' });
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    if (decoded.role !== 'hospital') return res.status(403).json({ message: 'Hospital access only' });
    const hospital = await Hospital.findById(decoded.id).select('-password');
    if (!hospital) return res.status(401).json({ message: 'Hospital not found' });
    if (hospital.status !== 'approved') return res.status(403).json({ message: 'Hospital not approved yet' });
    req.hospital = hospital;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const protectAdmin = (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) return res.status(401).json({ message: 'No token provided' });
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Admin access only' });
    req.admin = { id: decoded.id, email: decoded.email, role: 'admin' };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { protectHospital, protectAdmin };
