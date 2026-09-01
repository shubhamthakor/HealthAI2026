const testDoctors = async () => {
  const baseUrl = 'http://localhost:5000/api/v1';
  let adminCookies = '';

  const parseCookies = (res) => {
    const setCookieHeaders = res.headers.getSetCookie();
    const cookies = [];
    setCookieHeaders.forEach(cookieStr => {
      cookies.push(cookieStr.split(';')[0]);
    });
    if (cookies.length > 0) {
      adminCookies = cookies.join('; ');
    }
  };

  try {
    console.log('--- Starting Doctor Management API Tests ---');

    // 1. Unified Login as Admin
    console.log('\n1. Logging in as Admin...');
    let res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@healthai.com', password: 'AdminSecurePass123!' })
    });
    let data = await res.json();
    console.log(`Status: ${res.status}`);
    parseCookies(res);
    console.log(`Admin cookies captured: ${!!adminCookies}`);

    if (res.status !== 200) {
      console.error('Admin login failed. Cannot proceed with doctor management testing.');
      return;
    }

    // 2. Create a Doctor
    console.log('\n2. Creating a Doctor (Dr. Kavita Desai)...');
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
        morningShift: { startTime: '10:00', endTime: '13:00' },
        lunchBreak: { startTime: '13:00', endTime: '14:30' },
        eveningShift: { startTime: '14:30', endTime: '19:00' }
      }
    };

    res = await fetch(`${baseUrl}/doctors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': adminCookies
      },
      body: JSON.stringify(doctorPayload)
    });
    data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));

    const doctorId = data.data?._id;
    if (!doctorId) {
      console.error('Doctor creation failed. Cannot proceed with remaining tests.');
      return;
    }

    // 3. Testing Validation Checks (invalid email and password strength)
    console.log('\n3. Testing validator checks (creation with invalid input)...');
    res = await fetch(`${baseUrl}/doctors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': adminCookies
      },
      body: JSON.stringify({
        name: 'Dr. Bad Input',
        email: 'invalid-email',
        password: 'short',
        specialization: 'Cardiologist',
        city: 'Mumbai',
        hospital: 'Mumbai Clinic'
      })
    });
    data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));

    // 4. Retrieve Doctors (Search and Filter)
    console.log('\n4. Retrieve doctors matching specialization=Neurologist and city=Surat...');
    res = await fetch(`${baseUrl}/doctors?specialization=Neurologist&city=Surat`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': adminCookies
      }
    });
    data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Count matching: ${data.count}`);
    console.log('Sample matching doctor:', JSON.stringify(data.data?.[0], null, 2));

    // 5. Update Doctor Details
    console.log(`\n5. Updating Doctor profile hospital & consultationDuration for ID: ${doctorId}...`);
    res = await fetch(`${baseUrl}/doctors/${doctorId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': adminCookies
      },
      body: JSON.stringify({
        hospital: 'Desai Super Specialty Hospital',
        consultationDuration: 30
      })
    });
    data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Updated Doctor response:', JSON.stringify(data, null, 2));

    // 6. Retrieve Doctor by ID
    console.log(`\n6. Retrieving Doctor by ID: ${doctorId}...`);
    res = await fetch(`${baseUrl}/doctors/${doctorId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': adminCookies
      }
    });
    data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Retrieve by ID response:', JSON.stringify(data, null, 2));

    // 7. Delete Doctor
    console.log(`\n7. Deleting Doctor profile ID: ${doctorId}...`);
    res = await fetch(`${baseUrl}/doctors/${doctorId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': adminCookies
      }
    });
    data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Delete response:', JSON.stringify(data, null, 2));

    console.log('\n--- Doctor Management API Tests Completed ---');
  } catch (error) {
    console.error('Test script failed:', error);
  }
};

testDoctors();
