const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required'],
    index: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor ID is required'],
    index: true
  },
  disease: {
    type: String,
    required: [true, 'Predicted disease is required']
  },
  queueNumber: {
    type: Number,
    required: [true, 'Queue number is required']
  },
  estimatedWaitTime: {
    type: Number,
    required: [true, 'Estimated wait time is required'],
    min: [0, 'Wait time cannot be negative'] // in minutes
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed', 'in-progress'],
    default: 'pending',
    index: true
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required'],
    index: true
  },
  prescription: {
    medicines: [{
      name: { type: String, required: true },
      dosage: { type: String, required: true },
      duration: { type: String, required: true }
    }],
    notes: { type: String },
    issuedAt: { type: Date }
  },
  cancellationReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
