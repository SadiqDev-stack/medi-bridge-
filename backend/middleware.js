const jwt = require('jsonwebtoken');
const { User, Log } = require('./models');

async function auth(req, res, next) {
  try {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'No token' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('-password');
    if (!user) return res.status(401).json({ error: 'Bad token' });
    req.user = user;
    next();
  } catch (e) { res.status(401).json({ error: 'Auth failed' }); }
}

const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Forbidden' });

async function logAction(action, { patientId = null, actor = 'System', role = null, meta = {} } = {}) {
  try { await Log.create({ action, patientId, actor, role, meta }); } catch (e) {}
}

module.exports = { auth, requireRole, logAction };
