const testAppointments = async () => {
  const baseUrl = 'http://localhost:5000/api/v1';
  let adminCookies = '';
  let patientCookies = '';
  let doctorCookies = '';

  const getCookies = (res) => {
    const setCookieHeaders = res.headers.getSetCookie();
    const cookies = [];
    setCookieHeaders.forEach(cookieStr => {
      cookies.push(cookieStr.split(';')[0]);
    });
    return cookies.join('; ');
  };

  try {
    console.log('--- Starting Appointment, Leave, & Email Integration Tests ---');

    // 1. Login Admin
    console.log('\n1. Logging in as Admin to set up Doctor profile...');
    let res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@healthai.com', password: 'AdminSecurePass123!' })
    });
    adminCookies = getCookies(res);
    console.log(`Admin Logged In: ${res.status === 200}`);

    // Delete existing doctor test data if any to avoid uniqueness clashes
    console.log('Cleaning up existing test doctor profile...');
    const searchRes = await fetch(`${baseUrl}/doctors?search=Kavita`, {
      method: 'GET',
      headers: { 'Cookie': adminCookies }
    });
    const searchData = await searchRes.json();
    if (searchData.data && searchData.data.length > 0) {
      for (const doc of searchData.data) {
        await fetch(`${baseUrl}/doctors/${doc._id}`, {
          method: 'DELETE',
          headers: { 'Cookie': adminCookies }
        });
      }
    }

    // 2. Create Doctor Kavita Desai
    console.log('\n2. Creating Doctor profile (Dr. Kavita Desai)...');
    const doctorPayload = {
      name: 'Dr. Kavita Desai',
      email: 'kavita.desai@gmail.com',
      password: 'Password123!',
      specialization: 'Neurologist',
      city: 'Surat',
      hospital: 'Desai Neuro Center',
      consultationDuration: 20,
      availability: ['Monday', 'Wednesday', 'Friday'],
      timings: {
        morningShift: { startTime: '10:00', endTime: '13:00' }, // 180 mins duration
        lunchBreak: { startTime: '13:00', endTime: '14:30' },
        eveningShift: { startTime: '14:30', endTime: '19:00' } // 270 mins duration
      }
    };
    res = await fetch(`${baseUrl}/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': adminCookies },
      body: JSON.stringify(doctorPayload)
    });
    const doctorData = await res.json();
    const doctorId = doctorData.data?._id;
    console.log(`Doctor created ID: ${doctorId} (Status: ${res.status})`);

    // 3. Register & Login Patient (Arjun Patel)
    console.log('\n3. Logging in/Registering Patient (Arjun Patel)...');
    const patientEmail = `arjun.patel.test@gmail.com`;
    const patientPassword = 'SecurePassword123!';
    
    // Register
    res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Arjun Patel', email: patientEmail, password: patientPassword })
    });
    console.log(`Patient Register Status: ${res.status}`);

    // Login
    res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: patientEmail, password: patientPassword })
    });
    patientCookies = getCookies(res);
    console.log(`Patient Logged In: ${res.status === 200}`);

    // Login Doctor to capture doctor cookies
    console.log('\nLogging in Doctor (Dr. Kavita Desai)...');
    res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'kavita.desai@gmail.com', password: 'Password123!' })
    });
    doctorCookies = getCookies(res);
    console.log(`Doctor Logged In: ${res.status === 200}`);

    // 4. Test Availability fetch
    console.log('\n4. Fetching Doctor Availability details...');
    res = await fetch(`${baseUrl}/appointments/availability?doctorId=${doctorId}`, {
      method: 'GET',
      headers: { 'Cookie': patientCookies }
    });
    let data = await res.json();
    console.log('Availability details:', JSON.stringify(data.data, null, 2));

    // Choose next Wednesday for test bookings (e.g. Wednesday is one of availability days)
    const bookingDate = new Date();
    // Get next Wednesday
    const dayOffset = (3 - bookingDate.getDay() + 7) % 7 || 7;
    bookingDate.setDate(bookingDate.getDate() + dayOffset);
    const bookingDateString = bookingDate.toISOString().split('T')[0];
    console.log(`Selected test booking date (Wednesday): ${bookingDateString}`);

    // 5. Patient Books Appointment #1
    console.log('\n5. Booking Appointment #1 (Arjun Patel)...');
    res = await fetch(`${baseUrl}/appointments/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': patientCookies },
      body: JSON.stringify({ doctorId, appointmentDate: bookingDateString, disease: 'Migraine' })
    });
    data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Book #1 Response:', JSON.stringify(data, null, 2));
    const appointment1Id = data.data?._id;

    // 6. Patient Books Appointment #2 (using a secondary mock patient user to test queue increments)
    console.log('\n6. Setting up Patient #2 and Booking Appointment #2...');
    const patient2Email = `patient2.test@gmail.com`;
    // Register Patient 2
    await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Patient Two', email: patient2Email, password: 'SecurePassword123!' })
    });
    // Login Patient 2
    res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: patient2Email, password: 'SecurePassword123!' })
    });
    const patient2Cookies = getCookies(res);

    res = await fetch(`${baseUrl}/appointments/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': patient2Cookies },
      body: JSON.stringify({ doctorId, appointmentDate: bookingDateString, disease: 'Cluster Headache' })
    });
    data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Book #2 Response:', JSON.stringify(data, null, 2));

    // 7. Doctor Submits Leave (for the booking date)
    console.log(`\n7. Doctor Kavita Desai logs leave on date: ${bookingDateString}...`);
    res = await fetch(`${baseUrl}/appointments/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': doctorCookies },
      body: JSON.stringify({ leaveDate: bookingDateString, leaveReason: 'Attending Medical Conference' })
    });
    data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Leave Submit Response (Expect appointments cancelled):', JSON.stringify(data, null, 2));

    // 8. Try to Book on Leave Date (Should fail)
    console.log(`\n8. Patient tries to book on Leave Date ${bookingDateString}...`);
    res = await fetch(`${baseUrl}/appointments/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': patientCookies },
      body: JSON.stringify({ doctorId, appointmentDate: bookingDateString, disease: 'Migraine' })
    });
    data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Expected Error Response:', JSON.stringify(data, null, 2));

    // 9. Book on the NEXT availability day (following Friday)
    const nextFriday = new Date(bookingDate);
    nextFriday.setDate(nextFriday.getDate() + 2); // Wed + 2 days = Fri
    const nextFridayString = nextFriday.toISOString().split('T')[0];
    console.log(`\n9. Booking appointment on next Friday ${nextFridayString}...`);
    res = await fetch(`${baseUrl}/appointments/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': patientCookies },
      body: JSON.stringify({ doctorId, appointmentDate: nextFridayString, disease: 'Migraine' })
    });
    data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Book Response (Friday):', JSON.stringify(data, null, 2));
    const appointment2Id = data.data?._id;

    // 10. Doctor approves the appointment
    console.log(`\n10. Doctor approves appointment ID: ${appointment2Id}...`);
    res = await fetch(`${baseUrl}/appointments/${appointment2Id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Cookie': doctorCookies },
      body: JSON.stringify({ status: 'approved' })
    });
    data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Approve response:', JSON.stringify(data, null, 2));

    // 11. Doctor completes the appointment (writes prescription)
    console.log(`\n11. Doctor completes appointment ID: ${appointment2Id}...`);
    res = await fetch(`${baseUrl}/appointments/${appointment2Id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': doctorCookies },
      body: JSON.stringify({
        medicines: [
          { name: 'Sumatriptan 50mg', dosage: '1 tablet at onset of headache', duration: 'As needed' },
          { name: 'Naproxen 500mg', dosage: '1 tablet twice daily with food', duration: '5 days' }
        ],
        notes: 'Keep a headache trigger journal. Rest in a dark, quiet room during attacks.'
      })
    });
    data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Complete response:', JSON.stringify(data, null, 2));

    console.log('\n--- Appointment, Leave, & Email Integration Tests Completed ---');
  } catch (error) {
    console.error('Test execution failed:', error);
  }
};

testAppointments();
