const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  patient:   { type: mongoose.Schema.Types.ObjectId, ref: 'medibridge_Patient', required: true },
  hospital:  { type: mongoose.Schema.Types.ObjectId, ref: 'medibridge_Hospital', required: true },
  date:      { type: Date, required: true, default: Date.now },
  reason:    { type: String, required: true },
  diagnosis: { type: String, required: true },
  treatment: { type: String, required: true },
  notes:     { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'medibridge_Hospital', required: true },
}, { timestamps: true });

module.exports = mongoose.model('medibridge_Record', recordSchema);
