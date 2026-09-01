const mongoose = require('mongoose');

const DoctorLeaveSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor ID is required'],
    index: true
  },
  leaveDate: {
    type: Date,
    required: [true, 'Leave date is required'],
    index: true
  },
  leaveReason: {
    type: String,
    required: [true, 'Leave reason is required'],
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DoctorLeave', DoctorLeaveSchema);
