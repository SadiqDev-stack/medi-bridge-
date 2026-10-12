const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  type: { type: String, enum: ['feedback', 'suggestion', 'bug'], default: 'feedback' },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['open', 'reviewed'], default: 'open' },
}, { timestamps: true });

module.exports = mongoose.model('medibridge_Feedback', feedbackSchema);