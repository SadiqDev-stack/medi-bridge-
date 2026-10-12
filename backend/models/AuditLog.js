const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  actorType: { type: String, enum: ['hospital', 'admin'], default: 'hospital' },
  action: { type: String, required: true },
  targetType: { type: String },
  targetId: { type: String },
  meta: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('medibridge_AuditLog', auditLogSchema);