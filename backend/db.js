const mongoose = require('mongoose');
let connected = false;
let lastError = null;

async function connect() {
  if (connected) return true;
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    connected = true;
    lastError = null;
    console.log('✅ Mongo connected');
    return true;
  } catch (err) {
    connected = false;
    lastError = err.message;
    console.error('❌ Mongo connection failed:', err.message);
    return false;
  }
}

connect.status = () => ({
  connected,
  readyState: mongoose.connection.readyState,
  error: lastError,
  uri: process.env.MONGO_URI ? process.env.MONGO_URI.replace(/\/\/.*@/, '//***@') : null
});

setInterval(() => { if (!connected) connect(); }, 15000);

module.exports = connect;   // ← still callable as connect()
module.exports.status = connect.status;