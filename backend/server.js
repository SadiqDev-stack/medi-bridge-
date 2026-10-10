require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const { auth, requireRole, logAction } = require('./middleware');
const { Counter, User, Patient, Facility, Professional, Record_, AccessRequest, Log } = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

const sign = (u) => jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

/* ---------- HEALTH (always available, even if DB is down) ---------- */
app.get('/api/health', (_req, res) => {
  const s = db.status ? db.status() : { connected: false };
  res.status(s.connected ? 200 : 503).json({ ok: s.connected, db: s, time: new Date().toISOString() });
});

/* ---------- BLOCK /api/* WHEN DB IS DOWN ---------- */
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  const s = db.status ? db.status() : { connected: false, error: 'unknown' };
  if (!s.connected) {
    return res.status(503).json({
      error: 'Database unavailable',
      detail: s.error || 'Mongo connection failed',
      hint: 'Check MONGO_URI and network access (Atlas IP whitelist?)'
    });
  }
  next();
});

async function genHealthId() {
  const c = await Counter.findByIdAndUpdate('healthId', { $inc: { seq: 1 } },
    { new: true, upsert: true });
  return 'MB-' + String(c.seq).padStart(6, '0');
}

const r = express.Router();

/* ---------- AUTH ---------- */
r.post('/auth/register', async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;
    if (!email || !password || !fullName || !role)
      return res.status(400).json({ error: 'Missing fields' });
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(400).json({ error: 'Email exists' });

    const user = await User.create({
      email: email.toLowerCase(),
      password: await bcrypt.hash(password, 10),
      role, fullName
    });

    let profile = null;
    if (role === 'PATIENT') {
      profile = await Patient.create({
        userId: user._id, healthId: await genHealthId(),
        fullName, email, dob: req.body.dob, gender: req.body.gender, phone: req.body.phone
      });
    } else if (role === 'PROFESSIONAL') {
      if (!req.body.facilityId) return res.status(400).json({ error: 'facilityId required' });
      profile = await Professional.create({
        userId: user._id, fullName, email,
        professionalRole: req.body.professionalRole,
        licenceNo: req.body.licenceNo, facilityId: req.body.facilityId
      });
    } else if (role === 'FACILITY_ADMIN') {
      profile = await Facility.create({
        name: req.body.name, type: req.body.type, address: req.body.address, adminId: user._id
      });
    }

    await logAction('REGISTER', { actor: fullName, role, meta: { email } });
    res.json({ token: sign(user),
      user: { id: user._id, email: user.email, role: user.role, fullName: user.fullName },
      profile });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

r.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    if (!(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ error: 'Invalid credentials' });
    await logAction('LOGIN', { actor: user.fullName, role: user.role, meta: { email } });
    res.json({ token: sign(user),
      user: { id: user._id, email: user.email, role: user.role, fullName: user.fullName } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---------- PUBLIC ---------- */
r.get('/facilities', async (_req, res) => {
  const list = await Facility.find({ status: 'ACTIVE' }).select('_id name type address');
  res.json(list);
});

/* ---------- PATIENT ---------- */
r.get('/patient/me', auth, requireRole('PATIENT'), async (req, res) => {
  const me = await Patient.findOne({ userId: req.user._id });
  if (!me) return res.status(404).json({ error: 'No patient profile' });
  const [records, requests, logs] = await Promise.all([
    Record_.find({ patientId: me._id }).sort({ createdAt: -1 }),
    AccessRequest.find({ patientId: me._id }).sort({ createdAt: -1 }),
    Log.find({ patientId: me._id }).sort({ createdAt: -1 }).limit(30)
  ]);
  res.json({ patient: me, records, requests, logs });
});

/* ---------- REQUESTS ---------- */
r.patch('/requests/:id', auth, requireRole('PATIENT'), async (req, res) => {
  const { status } = req.body;
  if (!['APPROVED','DENIED'].includes(status))
    return res.status(400).json({ error: 'Invalid status' });
  const me = await Patient.findOne({ userId: req.user._id });
  const reqDoc = await AccessRequest.findOne({ _id: req.params.id, patientId: me._id });
  if (!reqDoc) return res.status(404).json({ error: 'Request not found' });
  reqDoc.status = status;
  await reqDoc.save();
  await logAction(status, { patientId: me._id, actor: req.user.fullName, role: 'PATIENT',
    meta: { professionalName: reqDoc.professionalName } });
  res.json(reqDoc);
});

/* ---------- PROFESSIONAL ---------- */
r.get('/professionals/me/patients/:healthId', auth, requireRole('PROFESSIONAL'),
  async (req, res) => {
    const me = await Professional.findOne({ userId: req.user._id });
    const fac = me ? await Facility.findById(me.facilityId) : null;
    const p = await Patient.findOne({ healthId: req.params.healthId.toUpperCase() });
    if (!p) return res.status(404).json({ error: 'Patient not found' });

    const approved = await AccessRequest.findOne({
      patientId: p._id, professionalId: me._id, status: 'APPROVED'
    });

    if (!approved) {
      const pending = await AccessRequest.findOne({
        patientId: p._id, professionalId: me._id, status: 'PENDING'
      });
      if (!pending) {
        await AccessRequest.create({
          patientId: p._id, patientHealthId: p.healthId,
          professionalId: me._id, professionalName: me.fullName,
          facilityName: fac?.name || '', status: 'PENDING'
        });
        await logAction('REQUESTED_ACCESS',
          { patientId: p._id, actor: req.user.fullName, role: 'PROFESSIONAL',
            meta: { healthId: p.healthId } });
      }
      return res.status(202).json({ status: 'PENDING', patient: { fullName: p.fullName, healthId: p.healthId } });
    }

    const records = await Record_.find({ patientId: p._id }).sort({ createdAt: -1 });
    await logAction('VIEWED_RECORD',
      { patientId: p._id, actor: req.user.fullName, role: 'PROFESSIONAL',
        meta: { healthId: p.healthId } });
    res.json({ status: 'APPROVED', patient: p, records });
  });

/* ---------- RECORDS ---------- */
r.post('/records', auth, requireRole('PROFESSIONAL'), async (req, res) => {
  const { patientId, reason, diagnosis, treatment } = req.body;
  if (!patientId || !reason || !diagnosis)
    return res.status(400).json({ error: 'Missing fields' });
  const me = await Professional.findOne({ userId: req.user._id });
  const fac = await Facility.findById(me.facilityId);
  const rec = await Record_.create({
    patientId, reason, diagnosis, treatment,
    professionalName: me.fullName, facilityName: fac?.name || ''
  });
  await logAction('CREATED_RECORD',
    { patientId, actor: req.user.fullName, role: 'PROFESSIONAL', meta: { reason } });
  res.json(rec);
});

/* ---------- FACILITY ---------- */
r.get('/facility/me/staff', auth, requireRole('FACILITY_ADMIN'), async (req, res) => {
  const fac = await Facility.findOne({ adminId: req.user._id });
  if (!fac) return res.status(404).json({ error: 'No facility' });
  const staff = await Professional.find({ facilityId: fac._id });
  res.json({ facility: fac, staff });
});

/* ---------- ADMIN ---------- */
r.get('/admin/stats', auth, requireRole('PLATFORM_ADMIN'), async (_req, res) => {
  const [patients, professionals, facilities, records] = await Promise.all([
    Patient.countDocuments(), Professional.countDocuments(),
    Facility.countDocuments(), Record_.countDocuments()
  ]);
  res.json({ patients, professionals, facilities, records });
});

r.get('/admin/logs', auth, requireRole('PLATFORM_ADMIN'), async (_req, res) => {
  res.json(await Log.find().sort({ createdAt: -1 }).limit(200));
});

app.use('/api', r);

/* ---------- SERVE FRONTEND (frontend/ is sibling of backend/) ---------- */
const FRONTEND = path.join(__dirname, '..', 'frontend');
app.use(express.static(FRONTEND));
app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(FRONTEND, 'index.html')));

/* ---------- BOOT (only when run directly, not inside Vercel) ---------- */
if (require.main === module) {
  db.connect().then((ok) => {
    if (!ok) console.warn('⚠️  Starting server WITHOUT DB — /api/health will report down');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 MediBridge on http://localhost:${process.env.PORT || 5000}`);
      console.log('   DB status:', db.status());
    });
  });
}

module.exports = app;