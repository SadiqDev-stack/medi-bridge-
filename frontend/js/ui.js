// ui.js - shared UI helpers
function toast(message, type = 'info', timeout = 3500) {
  let host = document.getElementById('toast');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toast';
    document.body.appendChild(host);
  }
  const el = document.createElement('div');
  el.className = `alert alert-${type}`;
  el.textContent = message;
  host.appendChild(el);
  setTimeout(() => el.remove(), timeout);
}

function showAlert(containerId, message, type = 'info') {
  const host = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  if (!host) return;
  host.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
}

function clearAlert(containerId) {
  const host = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  if (host) host.innerHTML = '';
}

function setLoading(button, loading, originalText) {
  if (!button) return;
  if (loading) {
    button.dataset.original = originalText || button.textContent;
    button.disabled = true;
    button.innerHTML = '<span class="spinner"></span>Please wait...';
  } else {
    button.disabled = false;
    button.textContent = button.dataset.original || originalText || 'Submit';
  }
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString();
}

function formatDateOnly(d) {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function qs(sel, root = document) { return root.querySelector(sel); }
function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }
