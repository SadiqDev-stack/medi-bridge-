const { Schema, model } = require('mongoose');

const Counter = model('Counter', new Schema({
  _id: { type: String, default: 'healthId' },
  seq: { type: Number, default: 1000 }
}));

const User = model('User', new Schema({
  email: { type: String, unique: true, lowercase: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['PATIENT','PROFESSIONAL','FACILITY_ADMIN','PLATFORM_ADMIN'], required: true },
  fullName: { type: String, required: true }
}, { timestamps: true }));

const Patient = model('Patient', new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  healthId: { type: String, unique: true, required: true },
  fullName: String, email: String, dob: String, gender: String, phone: String
}, { timestamps: true }));

const Facility = model('Facility', new Schema({
  name: String, type: String, address: String,
  adminId: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'ACTIVE' }
}, { timestamps: true }));

const Professional = model('Professional', new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: String, email: String,
  professionalRole: String, licenceNo: String,
  facilityId: { type: Schema.Types.ObjectId, ref: 'Facility' },
  status: { type: String, default: 'ACTIVE' }
}, { timestamps: true }));

const Record_ = model('Record', new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  facilityName: String, professionalName: String,
  reason: String, diagnosis: String, treatment: String
}, { timestamps: true }));

const AccessRequest = model('AccessRequest', new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  patientHealthId: String,
  professionalId: { type: Schema.Types.ObjectId, ref: 'Professional', required: true },
  professionalName: String,
  facilityName: String,
  status: { type: String, enum: ['PENDING','APPROVED','DENIED'], default: 'PENDING' }
}, { timestamps: true }));

const Log = model('Log', new Schema({
  action: String,
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient' },
  actor: String, role: String, meta: Object
}, { timestamps: true }));

module.exports = { Counter, User, Patient, Facility, Professional, Record_, AccessRequest, Log };
