const mongoose = require('mongoose');

let connected = false;
let lastError = null;

async function connect() {
  if (connected) return true;
  try {
    await mongoose.connect(process.env.DB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    connected = true;
    lastError = null;
    console.log('✅ Mongo connected:', process.env.DB_URI);
    return true;
  } catch (err) {
    connected = false;
    lastError = err.message;
    console.error('❌ Mongo connection failed:', err.message);
    return false;
  }
}

function status() {
  return {
    connected,
    readyState: mongoose.connection.readyState,
    error: lastError,
    uri: process.env.DB_URI
      ? process.env.DB_URI.replace(/\/\/.*@/, '//***@')
      : null,
  };
}

// background retry every 15s if disconnected
setInterval(() => { if (!connected) connect(); }, 15000);

module.exports = { connect, status };
