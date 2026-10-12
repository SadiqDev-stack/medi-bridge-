require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./utils/db');
const errorHandler = require('./middlewares/error');

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

// ---- static frontend ----
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
app.use(express.static(FRONTEND_DIR));

// ---- health check ----
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'MediBridge' }));

// ---- API routes ----
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/stats', statsRoutes);

// ---- fallback to landing page for any non-API route ----
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// root API health
app.get('/api', (req, res) => {
  res.json({
    ok: true,
    service: 'MediBridge API',
    status: 'healthy',
    time: new Date().toISOString(),
  });
});

// detailed health
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'MediBridge',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ---- error handler ----
app.use(errorHandler);

// ---- start ----
const PORT = process.env.PORT || 5000;



app.listen(PORT, () => {
  console.log(`MediBridge server running at http://localhost:${PORT}`);
  console.log(`Frontend served from ${FRONTEND_DIR}`);
  console.log(`API available at http://localhost:${PORT}/api`);

  connectDB()
    .then(() => {
      console.log('MongoDB connected');
    })
    .catch((err) => {
      console.error('MongoDB connection failed:', err.message);
      console.error('Server is running, but DB routes will fail until MongoDB is reachable.');
    });
});