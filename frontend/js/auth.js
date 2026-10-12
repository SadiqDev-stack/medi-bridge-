// auth.js - session helpers for hospital + admin
const HOSPITAL_KEY = 'mb_hospital';
const ADMIN_KEY = 'mb_admin';

function saveHospitalSession(token, hospital) {
  setToken(token);
  localStorage.setItem(HOSPITAL_KEY, JSON.stringify(hospital));
  localStorage.removeItem(ADMIN_KEY);
}

function saveAdminSession(token, admin) {
  setToken(token);
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  localStorage.removeItem(HOSPITAL_KEY);
}

function getHospital() {
  try { return JSON.parse(localStorage.getItem(HOSPITAL_KEY)); } catch { return null; }
}

function getAdmin() {
  try { return JSON.parse(localStorage.getItem(ADMIN_KEY)); } catch { return null; }
}

function isHospitalLoggedIn() { return !!getToken() && !!getHospital(); }
function isAdminLoggedIn()    { return !!getToken() && !!getAdmin(); }

function logout() {
  clearToken();
  localStorage.removeItem(HOSPITAL_KEY);
  localStorage.removeItem(ADMIN_KEY);
}

function requireHospital() {
  if (!isHospitalLoggedIn()) {
    window.location.href = '/pages/login.html';
    return false;
  }
  return true;
}

function requireAdmin() {
  if (!isAdminLoggedIn()) {
    window.location.href = '/pages/admin-login.html';
    return false;
  }
  return true;
}
