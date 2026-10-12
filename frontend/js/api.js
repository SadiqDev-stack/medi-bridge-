// api.js - all network calls go through here
const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('mb_token');
}

function setToken(token) {
  localStorage.setItem('mb_token', token);
}

function clearToken() {
  localStorage.removeItem('mb_token');
  localStorage.removeItem('mb_hospital');
  localStorage.removeItem('mb_admin');
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try { data = await res.json(); } catch (_) {}

  if (!res.ok) {
    const msg = (data && data.message) || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return data;
}

const api = {
  // auth
  registerHospital: (payload) => request('/auth/register-hospital', { method: 'POST', body: payload, auth: false }),
  loginHospital:    (payload) => request('/auth/login',            { method: 'POST', body: payload, auth: false }),
  loginAdmin:       (payload) => request('/auth/admin-login',      { method: 'POST', body: payload, auth: false }),

  // hospitals (admin)
  pendingHospitals: () => request('/hospitals/pending'),
  allHospitals:     () => request('/hospitals'),
  approveHospital:  (id) => request(`/hospitals/${id}/approve`, { method: 'PATCH' }),
  rejectHospital:   (id) => request(`/hospitals/${id}/reject`,  { method: 'PATCH' }),
  myHospital:       () => request('/hospitals/me'),

  // patients
  registerPatient: (payload) => request('/patients', { method: 'POST', body: payload }),
  searchPatient:   (healthId) => request(`/patients/search?healthId=${encodeURIComponent(healthId)}`),
  getPatient:      (id) => request(`/patients/${id}`),

  // records
  addRecord:          (payload) => request('/records', { method: 'POST', body: payload }),
  patientHistory:     (patientId) => request(`/records/patient/${patientId}`),

  // admin
  auditLogs:  () => request('/audit'),
  stats:      () => request('/stats'),
  feedbacks:  () => request('/feedback'),

  // feedback
  submitFeedback: (payload) => request('/feedback', { method: 'POST', body: payload }),
};
