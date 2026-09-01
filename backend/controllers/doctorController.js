const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { AppError } = require('../moddleware/errorMiddleware');
const queueService = require('../services/queueService');

// Helper to normalize input date strings into a UTC Midnight Date object
const getMidnightDate = (dateStr) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(d.getTime())) {
    throw new AppError('Invalid date format. Use YYYY-MM-DD.', 400, 'BAD_REQUEST');
  }
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// @desc    Create a new doctor profile and credentials (Admin only)
// @route   POST /api/v1/doctors
// @access  Private (Admin only)
const createDoctor = async (req, res, next) => {
  const {
    name,
    email,
    password,
    specialization,
    city,
    hospital,
    timings,
    consultationDuration,
    availability
  } = req.body;

  try {
    // 1. Check if user credentials already exist in User collection
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new AppError('A user with this email already exists.', 400, 'BAD_REQUEST'));
    }

    // 2. Check if doctor profile already exists in Doctor collection
    const doctorExists = await Doctor.findOne({ email });
    if (doctorExists) {
      return next(new AppError('A doctor profile with this email already exists.', 400, 'BAD_REQUEST'));
    }

    // 3. Create login credentials in User collection first
    const user = await User.create({
      name,
      email,
      password,
      role: 'doctor'
    });

    try {
      // 4. Create detailed profile in Doctor collection
      const doctor = await Doctor.create({
        name,
        email,
        specialization,
        city,
        hospital,
        timings,
        consultationDuration,
        availability
      });

      res.status(201).json({
        success: true,
        message: 'Doctor profile and credentials generated successfully.',
        data: doctor
      });
    } catch (err) {
      // Rollback User creation if Doctor creation fails
      await User.findByIdAndDelete(user._id);
      return next(err);
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Retrieve doctors list with search and filtering
// @route   GET /api/v1/doctors
// @access  Private
const getDoctors = async (req, res, next) => {
  const { specialization, city, search } = req.query;

  try {
    const query = {};

    if (specialization) {
      query.specialization = { $regex: new RegExp(`^${specialization.trim()}$`, 'i') };
    }

    if (city) {
      query.city = { $regex: new RegExp(`^${city.trim()}$`, 'i') };
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: { $regex: searchRegex } },
        { hospital: { $regex: searchRegex } }
      ];
    }

    const doctors = await Doctor.find(query);

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get detailed doctor profile by ID
// @route   GET /api/v1/doctors/:id
// @access  Private
const getDoctorById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return next(new AppError(`Doctor with ID ${id} not found.`, 404, 'NOT_FOUND'));
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update doctor profile (Admin only)
// @route   PATCH /api/v1/doctors/:id
// @access  Private (Admin only)
const updateDoctor = async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return next(new AppError(`Doctor with ID ${id} not found.`, 404, 'NOT_FOUND'));
    }

    const oldEmail = doctor.email;
    const oldName = doctor.name;

    // Check email uniqueness if email is being updated
    if (updates.email && updates.email.toLowerCase() !== oldEmail.toLowerCase()) {
      const emailExistsInUsers = await User.findOne({ email: updates.email });
      const emailExistsInDoctors = await Doctor.findOne({ email: updates.email });

      if (emailExistsInUsers || emailExistsInDoctors) {
        return next(new AppError('An account with this email already exists.', 400, 'BAD_REQUEST'));
      }
    }

    // Apply updates to Doctor model
    Object.keys(updates).forEach(key => {
      // Prevent updating roles or internal properties directly
      if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt') {
        doctor[key] = updates[key];
      }
    });

    const updatedDoctor = await doctor.save();

    // Synchronize User credentials if name or email changed
    if (updates.name || updates.email) {
      const userUpdates = {};
      if (updates.name) userUpdates.name = updates.name;
      if (updates.email) userUpdates.email = updates.email;

      await User.findOneAndUpdate({ email: oldEmail }, userUpdates);
    }

    res.status(200).json({
      success: true,
      message: 'Doctor record modified successfully.',
      data: updatedDoctor
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete doctor profile and credentials (Admin only)
// @route   DELETE /api/v1/doctors/:id
// @access  Private (Admin only)
const deleteDoctor = async (req, res, next) => {
  const { id } = req.params;

  try {
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return next(new AppError(`Doctor with ID ${id} not found.`, 404, 'NOT_FOUND'));
    }

    const doctorEmail = doctor.email;

    // Delete doctor profile
    await Doctor.findByIdAndDelete(id);

    // Delete corresponding credentials in User collection
    await User.findOneAndDelete({ email: doctorEmail });

    res.status(200).json({
      success: true,
      message: 'Doctor record modified successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update doctor's own consultation duration (Doctor only)
// @route   PATCH /api/v1/doctors/self/duration
// @access  Private (Doctor only)
const updateSelfDuration = async (req, res, next) => {
  const { consultationDuration, date } = req.body;

  try {
    if (!consultationDuration) {
      return next(new AppError('consultationDuration is required.', 400, 'BAD_REQUEST'));
    }

    const durationInt = parseInt(consultationDuration, 10);
    if (isNaN(durationInt) || durationInt <= 0) {
      return next(new AppError('consultationDuration must be a positive integer.', 400, 'BAD_REQUEST'));
    }

    // Retrieve the doctor profile linked to the logged-in user account
    const doctor = await Doctor.findOne({ email: req.user.email });
    if (!doctor) {
      return next(new AppError('Doctor profile not found for this account.', 404, 'NOT_FOUND'));
    }

    doctor.consultationDuration = durationInt;
    await doctor.save();

    // Trigger queue progression update if queue exists for that date
    const midnightDate = getMidnightDate(date);
    const updatedQueue = await queueService.updateQueueProgression(doctor._id, midnightDate);

    res.status(200).json({
      success: true,
      message: 'Consultation duration updated successfully and queue updated.',
      data: {
        consultationDuration: doctor.consultationDuration,
        queue: updatedQueue
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  updateSelfDuration
};
