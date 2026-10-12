require('mongoose').set('bufferCommands', false);

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middlewares/error');
const dbHandler = require('./middlewares/dbhandler');

const authRoutes = require('./routes/auth.routes');
const hospitalRoutes = require('./routes/hospital.routes');
const patientRoutes = require('./routes/patient.routes');
const recordRoutes = require('./routes/record.routes');
const auditRoutes = require('./routes/audit.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const statsRoutes = require('./routes/stats.routes');

const app = express();
app.use(cors());
app.use(express.json());

// ---- static frontend (no DB needed) ----
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
app.use(express.static(FRONTEND_DIR));

// ---- public health (no DB needed) ----
app.get('/api', (req, res) => {
  res.json({
    ok: true,
    service: 'MediBridge API',
    status: 'healthy',
    time: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'MediBridge',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// GLOBAL DB HANDLER — runs on every /api/* request below this
// Ensures MongoDB is connected before any DB route executes.
// ============================================================
app.use('/api', dbHandler);

// ---- API routes ----
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/stats', statsRoutes);

// ---- fallback to landing for any non-API route ----
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// ---- error handler ----
app.use(errorHandler);

// ---- start ----
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`MediBridge server running at http://localhost:${PORT}`);
    console.log(`Frontend served from ${FRONTEND_DIR}`);
    console.log(`API available at http://localhost:${PORT}/api`);
  });
}

module.exports = app;