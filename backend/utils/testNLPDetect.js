const testNLPDetect = async () => {
  const baseUrl = 'http://localhost:5000/api/v1';
  let patientAccessTokenCookie = '';
  let patientRefreshTokenCookie = '';
  let adminCookies = '';

  const parsePatientCookies = (res) => {
    const setCookieHeaders = res.headers.getSetCookie();
    setCookieHeaders.forEach(cookieStr => {
      const parts = cookieStr.split(';')[0];
      if (parts.startsWith('accessToken=')) {
        patientAccessTokenCookie = parts;
      } else if (parts.startsWith('refreshToken=')) {
        patientRefreshTokenCookie = parts;
      }
    });
  };

  const getPatientCookieHeader = () => {
    const cookies = [];
    if (patientAccessTokenCookie) cookies.push(patientAccessTokenCookie);
    if (patientRefreshTokenCookie) cookies.push(patientRefreshTokenCookie);
    return cookies.join('; ');
  };

  const parseAdminCookies = (res) => {
    const setCookieHeaders = res.headers.getSetCookie();
    const cookies = [];
    setCookieHeaders.forEach(cookieStr => {
      cookies.push(cookieStr.split(';')[0]);
    });
    if (cookies.length > 0) {
      adminCookies = cookies.join('; ');
    }
  };

  const doctorIds = [];

  try {
    console.log('=== Starting AI Multilingual Diagnosis /detect API Tests ===');

    // 1. Log in as Admin to seed doctors
    console.log('\nStep 1: Logging in as Admin to seed test doctors...');
    let res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@healthai.com', password: 'AdminSecurePass123!' })
    });
    let data = await res.json();
    console.log(`Admin login status: ${res.status}`);
    parseAdminCookies(res);

    if (res.status !== 200) {
      console.error('Admin login failed. Cannot seed doctors.');
      return;
    }

    // Seed test doctors
    const doctorsToSeed = [
      {
        name: 'Dr. Devendra Shah',
        email: 'devendra.shah.nlp.test@gmail.com',
        password: 'Password123!',
        specialization: 'Allergist',
        city: 'Ahmedabad',
        hospital: 'Apex Allergy Clinic',
        consultationDuration: 15,
        availability: ['Monday', 'Tuesday', 'Wednesday'],
        timings: {
          morningShift: { startTime: '09:00', endTime: '13:00' },
          lunchBreak: { startTime: '13:00', endTime: '15:00' },
          eveningShift: { startTime: '15:00', endTime: '18:00' }
        }
      },
      {
        name: 'Dr. Kavita Desai',
        email: 'kavita.desai.nlp.test@gmail.com',
        password: 'Password123!',
        specialization: 'Pulmonologist',
        city: 'Ahmedabad',
        hospital: 'Desai Chest & Asthma Clinic',
        consultationDuration: 15,
        availability: ['Wednesday', 'Thursday', 'Friday'],
        timings: {
          morningShift: { startTime: '09:00', endTime: '13:00' },
          lunchBreak: { startTime: '13:00', endTime: '15:00' },
          eveningShift: { startTime: '15:00', endTime: '18:00' }
        }
      },
      {
        name: 'Dr. Rajan Patel',
        email: 'rajan.patel.nlp.test@gmail.com',
        password: 'Password123!',
        specialization: 'Gastroenterologist',
        city: 'Ahmedabad',
        hospital: 'Patel Gastro Care',
        consultationDuration: 15,
        availability: ['Monday', 'Wednesday', 'Friday'],
        timings: {
          morningShift: { startTime: '09:00', endTime: '13:00' },
          lunchBreak: { startTime: '13:00', endTime: '15:00' },
          eveningShift: { startTime: '15:00', endTime: '18:00' }
        }
      }
    ];

    console.log('\nSeeding test doctors...');
    for (const doc of doctorsToSeed) {
      res = await fetch(`${baseUrl}/doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': adminCookies
        },
        body: JSON.stringify(doc)
      });
      data = await res.json();
      if (res.status === 201 && data.data?._id) {
        doctorIds.push(data.data._id);
        console.log(`Seeded ${doc.name} (${doc.specialization}) successfully.`);
      } else {
        console.warn(`Failed to seed ${doc.name}:`, data.message || data);
      }
    }

    // 2. Register a test patient
    const randomSuffix = Math.floor(Math.random() * 10000);
    const email = `patient.nlp.${randomSuffix}@gmail.com`;
    const password = 'PatientSecurePass123!';
    const name = 'Symptom Test Patient';

    console.log(`\nStep 2: Registering new patient: ${email}...`);
    res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    data = await res.json();
    console.log(`Status: ${res.status}`);
    
    if (!res.ok) {
      console.error('Registration failed:', data);
      return;
    }

    // 3. Login patient to get cookies
    console.log('\nStep 3: Logging in patient...');
    res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    data = await res.json();
    console.log(`Status: ${res.status}`);
    parsePatientCookies(res);
    
    if (!res.ok) {
      console.error('Login failed:', data);
      return;
    }

    // 4. Test Cases for /detect
    const testCases = [
      {
        name: 'English test (Allergy symptoms with Ahmedabad city filter)',
        body: {
          inputText: 'I have continuous sneezing, watering from eyes, and shivering since morning.',
          lang: 'en',
          city: 'Ahmedabad'
        }
      },
      {
        name: 'Gujarati test (Typhoid / Asthma symptoms with Ahmedabad city filter)',
        body: {
          inputText: 'મને કાલે રાતથી બહુ તાવ આવે છે અને શરીરમાં કમજોરી લાગે છે',
          lang: 'gu',
          city: 'Ahmedabad'
        }
      },
      {
        name: 'Hindi test (Gastroenteritis / Peptic Ulcer symptoms with non-matching city filter)',
        body: {
          inputText: 'मेरे पेट में बहुत दर्द है और उल्टी हो रही है',
          lang: 'hi',
          city: 'Surat' // Doctor is in Ahmedabad, so recommendedDoctors should be empty
        }
      }
    ];

    for (const [index, testCase] of testCases.entries()) {
      console.log(`\n--------------------------------------------------`);
      console.log(`Test Case ${index + 1}: ${testCase.name}`);
      console.log(`Input Text: "${testCase.body.inputText}"`);
      console.log(`Language requested: "${testCase.body.lang}"`);
      if (testCase.body.city) {
        console.log(`City filter: "${testCase.body.city}"`);
      }
      console.log(`Sending to POST /api/v1/ai/detect...`);

      const start = Date.now();
      res = await fetch(`${baseUrl}/ai/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': getPatientCookieHeader()
        },
        body: JSON.stringify(testCase.body)
      });
      data = await res.json();
      const duration = Date.now() - start;

      console.log(`Status: ${res.status} (in ${duration}ms)`);
      console.log('Response Payload:', JSON.stringify(data, null, 2));
    }

    // 5. Cleanup seeded doctors
    console.log(`\n--------------------------------------------------`);
    console.log('Step 5: Cleaning up seeded test doctors...');
    for (const id of doctorIds) {
      res = await fetch(`${baseUrl}/doctors/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': adminCookies
        }
      });
      data = await res.json();
      if (res.status === 200) {
        console.log(`Deleted doctor ID: ${id} successfully.`);
      } else {
        console.warn(`Failed to delete doctor ID ${id}:`, data.message || data);
      }
    }

    console.log(`\n--------------------------------------------------`);
    console.log('=== AI Multilingual Diagnosis /detect API Tests Completed ===');
  } catch (error) {
    console.error('Integration test crashed:', error);
  }
};

testNLPDetect();
