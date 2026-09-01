const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    index: true,
    lowercase: true,
    trim: true
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    index: true,
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    index: true,
    trim: true
  },
  hospital: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true
  },
  timings: {
    morningShift: {
      startTime: { type: String, default: "09:00" },
      endTime: { type: String, default: "13:00" }
    },
    lunchBreak: {
      startTime: { type: String, default: "13:00" },
      endTime: { type: String, default: "15:00" }
    },
    eveningShift: {
      startTime: { type: String, default: "15:00" },
      endTime: { type: String, default: "18:00" }
    }
  },
  consultationDuration: {
    type: Number,
    default: 15, // standard mins per patient
    min: [1, 'Consultation duration must be at least 1 minute']
  },
  availability: {
    type: [String],
    default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Doctor', DoctorSchema);
