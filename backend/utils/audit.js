const AuditLog = require('../models/AuditLog');

const logAction = async ({ actor, actorType = 'hospital', action, targetType, targetId, meta }) => {
  try {
    await AuditLog.create({
      actor: actor ? String(actor) : null,
      actorType,
      action,
      targetType,
      targetId: targetId ? String(targetId) : undefined,
      meta,
    });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
};

module.exports = { logAction };
