const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.models.medibridge_Counter
  || mongoose.model('medibridge_Counter', counterSchema);

const generateHealthId = async () => {
  const year = new Date().getFullYear();
  const key = `patient-${year}`;
  const counter = await Counter.findByIdAndUpdate(
    key,
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  const seq = String(counter.seq).padStart(6, '0');
  return `MB-${year}-${seq}`;
};

module.exports = generateHealthId;
