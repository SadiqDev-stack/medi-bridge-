const mongoose = require('mongoose');

// Disable buffering globally — if not connected, fail fast instead of hanging.
mongoose.set('bufferCommands', false);

let cached = global.__mb_mongo;
if (!cached) cached = global.__mb_mongo = { conn: null, promise: null };

const state = () => {
  switch (mongoose.connection.readyState) {
    case 1: return 'connected';
    case 2: return 'connecting';
    case 3: return 'disconnecting';
    case 0: return 'disconnected';
    default: return 'unknown';
  }
};

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) return cached.conn;
  if (cached.promise) return cached.promise;

  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not set');

  cached.promise = mongoose
    .connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      autoIndex: false,
      maxPoolSize: 5,
    })
    .then((m) => {
      cached.conn = m.connection;
      console.log('MongoDB connected:', m.connection.host);
      return cached.conn;
    })
    .catch((err) => {
      cached.promise = null;
      throw err;
    });

  return cached.promise;
}

// Middleware — ensures DB is live before the route runs
async function dbHandler(req, res, next) {
  req.dbConnected = false;
  req.dbState = state();

  try {
    await connectDB();
    req.dbConnected = true;
    req.dbState = state();
    return next();
  } catch (err) {
    console.error('Mongo connect error:', err.message);
    return res.status(503).json({
      success: false,
      message: 'Database unavailable. Please try again shortly.',
      state: state(),
    });
  }
}

module.exports = dbHandler;
module.exports.connectDB = connectDB;
module.exports.state = state;
