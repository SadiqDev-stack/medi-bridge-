const AuditLog = require('../models/AuditLog');

const logAction = async ({ actor, actorType = 'hospital', action, targetType, targetId, meta }) => {
  try {
    await AuditLog.create({ actor, actorType, action, targetType, targetId, meta });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
};

module.exports = { logAction };
