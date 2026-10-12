const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  healthId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true, trim: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  phone: { type: String },
  address: { type: String },
  registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
}, { timestamps: true });

module.exports = mongoose.model('medibridge_Patient', patientSchema);