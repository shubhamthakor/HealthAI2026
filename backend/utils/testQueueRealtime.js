require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const { io } = require('socket.io-client');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

const baseUrl = 'http://localhost:5000/api/v1';

const getCookies = (res) => {
  const setCookieHeaders = res.headers.getSetCookie();
  const cookies = [];
  setCookieHeaders.forEach(cookieStr => {
    cookies.push(cookieStr.split(';')[0]);
  });
  return cookies.join('; ');
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const testQueueRealtime = async () => {
  let adminCookies = '';
  let patient1Cookies = '';
  let patient2Cookies = '';
  let doctorCookies = '';

  let patient1Id = '';
  let patient2Id = '';
  let doctorId = '';
  let appointment1Id = '';
  let appointment2Id = '';

  let socket1 = null;
  let socket2 = null;

  const eventsReceived1 = [];
  const eventsReceived2 = [];

  try {
    console.log('=== Starting Realtime Queue Socket.IO Integration Tests ===');

    // Connect mongoose to database
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/healthai';
    console.log(`Connecting to database at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    // 1. Setup Doctor Sarah Queue
    console.log('\nStep 1: Logging in as Admin to seed doctor...');
    let res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@healthai.com', password: 'AdminSecurePass123!' })
    });
    adminCookies = getCookies(res);
    console.log(`Admin login status: ${res.status}`);

    // Clean old profile if exists
    await Doctor.deleteMany({ email: 'sarah.queue@gmail.com' });
    await User.deleteMany({ email: { $in: ['patient1.queue@gmail.com', 'patient2.queue@gmail.com'] } });

    const doctorPayload = {
      name: 'Dr. Sarah Queue',
      email: 'sarah.queue@gmail.com',
      password: 'Password123!',
      specialization: 'General Physician',
      city: 'Ahmedabad',
      hospital: 'Apex Queue Hospital',
      consultationDuration: 15,
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      timings: {
        morningShift: { startTime: '09:00', endTime: '13:00' },
        lunchBreak: { startTime: '13:00', endTime: '15:00' },
        eveningShift: { startTime: '15:00', endTime: '18:00' }
      }
    };

    res = await fetch(`${baseUrl}/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': adminCookies },
      body: JSON.stringify(doctorPayload)
    });
    const doctorData = await res.json();
    doctorId = doctorData.data?._id;
    console.log(`Doctor created ID: ${doctorId} (Status: ${res.status})`);

    // Log in Doctor
    res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sarah.queue@gmail.com', password: 'Password123!' })
    });
    doctorCookies = getCookies(res);
    console.log(`Doctor logged in status: ${res.status}`);

    // 2. Setup Patients
    console.log('\nStep 2: Registering and logging in Patient 1 & Patient 2...');
    
    // Register Patient 1
    res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Patient One Queue', email: 'patient1.queue@gmail.com', password: 'SecurePassword123!' })
    });
    let patientData = await res.json();
    patient1Id = patientData.data?.id;

    // Login Patient 1
    res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient1.queue@gmail.com', password: 'SecurePassword123!' })
    });
    patient1Cookies = getCookies(res);
    console.log(`Patient 1 ID: ${patient1Id} (Login Status: ${res.status})`);

    // Register Patient 2
    res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Patient Two Queue', email: 'patient2.queue@gmail.com', password: 'SecurePassword123!' })
    });
    patientData = await res.json();
    patient2Id = patientData.data?.id;

    // Login Patient 2
    res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient2.queue@gmail.com', password: 'SecurePassword123!' })
    });
    patient2Cookies = getCookies(res);
    console.log(`Patient 2 ID: ${patient2Id} (Login Status: ${res.status})`);

    // Normalize date to today's UTC midnight
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const bookingDateString = today.toISOString().split('T')[0];

    // Clean old appointments for this doctor/date
    await Appointment.deleteMany({ doctorId, appointmentDate: today });

    // 3. Connect Sockets
    console.log('\nStep 3: Connecting Patient sockets to Socket.IO Server...');
    socket1 = io('http://localhost:5000');
    socket2 = io('http://localhost:5000');

    socket1.on('connect', () => {
      console.log(`Patient 1 Socket Connected: ${socket1.id}`);
      socket1.emit('join_room', { doctorId });
      socket1.emit('join_patient_room', { patientId: patient1Id });
    });

    socket2.on('connect', () => {
      console.log(`Patient 2 Socket Connected: ${socket2.id}`);
      socket2.emit('join_room', { doctorId });
      socket2.emit('join_patient_room', { patientId: patient2Id });
    });

    // Attach listeners for events
    ['queueUpdated', 'appointmentCompleted', 'nextPatient', 'queuePositionChanged'].forEach(evt => {
      socket1.on(evt, (payload) => {
        console.log(`[Socket 1][Event: ${evt}]`, JSON.stringify(payload));
        eventsReceived1.push({ event: evt, payload });
      });

      socket2.on(evt, (payload) => {
        console.log(`[Socket 2][Event: ${evt}]`, JSON.stringify(payload));
        eventsReceived2.push({ event: evt, payload });
      });
    });

    await delay(1000);

    // 4. Patient 1 Books Appointment
    console.log('\nStep 4: Patient 1 books appointment...');
    res = await fetch(`${baseUrl}/appointments/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': patient1Cookies },
      body: JSON.stringify({ doctorId, appointmentDate: bookingDateString, disease: 'Malaria' })
    });
    let data = await res.json();
    appointment1Id = data.data?._id;
    console.log(`Book #1 Status: ${res.status}, ID: ${appointment1Id}`);

    await delay(1000);

    // 5. Patient 2 Books Appointment
    console.log('\nStep 5: Patient 2 books appointment...');
    res = await fetch(`${baseUrl}/appointments/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': patient2Cookies },
      body: JSON.stringify({ doctorId, appointmentDate: bookingDateString, disease: 'Allergy' })
    });
    data = await res.json();
    appointment2Id = data.data?._id;
    console.log(`Book #2 Status: ${res.status}, ID: ${appointment2Id}`);

    await delay(1000);

    // 6. Doctor advances queue (calls Patient 1)
    console.log('\nStep 6: Doctor advances queue (calls next patient -> Patient 1)...');
    res = await fetch(`${baseUrl}/queue/next`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': doctorCookies },
      body: JSON.stringify({ date: bookingDateString })
    });
    data = await res.json();
    console.log(`Status: ${res.status}, Message: ${data.message}`);

    await delay(1000);

    // 7. Doctor completes consultation for Patient 1
    console.log('\nStep 7: Doctor completes consultation for Patient 1 (issues prescription)...');
    res = await fetch(`${baseUrl}/appointments/${appointment1Id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': doctorCookies },
      body: JSON.stringify({
        medicines: [{ name: 'Paracetamol 650mg', dosage: '1-0-1', duration: '3 days' }],
        notes: 'Take rest and drink plenty of fluids.'
      })
    });
    data = await res.json();
    console.log(`Status: ${res.status}, Message: ${data.message}`);

    await delay(1000);

    // 8. Doctor advances queue again (calls Patient 2)
    console.log('\nStep 8: Doctor advances queue again (calls next patient -> Patient 2)...');
    res = await fetch(`${baseUrl}/queue/next`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': doctorCookies },
      body: JSON.stringify({ date: bookingDateString })
    });
    data = await res.json();
    console.log(`Status: ${res.status}, Message: ${data.message}`);

    await delay(1500);

    // 9. Assertions & Summary
    console.log('\n=== Evaluation & Assertions ===');
    
    // Check queueUpdated
    const hasQueueUpdated = eventsReceived1.some(e => e.event === 'queueUpdated');
    console.log(`- Received 'queueUpdated' event: ${hasQueueUpdated ? 'PASS' : 'FAIL'}`);

    // Check nextPatient
    const hasNextPatient = eventsReceived1.some(e => e.event === 'nextPatient' && e.payload.appointmentId === appointment1Id);
    console.log(`- Received 'nextPatient' event targeting Patient 1: ${hasNextPatient ? 'PASS' : 'FAIL'}`);

    // Check appointmentCompleted
    const hasApptCompleted = eventsReceived2.some(e => e.event === 'appointmentCompleted' && e.payload.appointmentId === appointment1Id);
    console.log(`- Received 'appointmentCompleted' event: ${hasApptCompleted ? 'PASS' : 'FAIL'}`);

    // Check queuePositionChanged
    const posChangedEvent = eventsReceived2.find(e => e.event === 'queuePositionChanged');
    const hasPosChanged = posChangedEvent && 
                          posChangedEvent.payload.appointmentId === appointment2Id &&
                          posChangedEvent.payload.oldPosition === 2 &&
                          posChangedEvent.payload.newPosition === 1;
    console.log(`- Received 'queuePositionChanged' event (Patient 2 shifted 2 -> 1): ${hasPosChanged ? 'PASS' : 'FAIL'}`);

    // 10. Clean up
    console.log('\nStep 10: Cleaning up database test records...');
    await Appointment.deleteMany({ doctorId });
    await Doctor.deleteMany({ _id: doctorId });
    await User.deleteMany({ email: { $in: ['patient1.queue@gmail.com', 'patient2.queue@gmail.com'] } });
    console.log('Cleanup complete.');

  } catch (error) {
    console.error('Realtime queue test crashed:', error);
  } finally {
    if (socket1) socket1.disconnect();
    if (socket2) socket2.disconnect();
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

testQueueRealtime();
