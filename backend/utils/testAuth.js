const testAuth = async () => {
  const baseUrl = 'http://localhost:5000/api/v1/auth';
  let accessTokenCookie = '';
  let refreshTokenCookie = '';

  const parseCookies = (res) => {
    const setCookieHeaders = res.headers.getSetCookie();
    setCookieHeaders.forEach(cookieStr => {
      const parts = cookieStr.split(';')[0];
      if (parts.startsWith('accessToken=')) {
        accessTokenCookie = parts;
      } else if (parts.startsWith('refreshToken=')) {
        refreshTokenCookie = parts;
      }
    });
  };

  const getCookieHeader = () => {
    const cookies = [];
    if (accessTokenCookie) cookies.push(accessTokenCookie);
    if (refreshTokenCookie) cookies.push(refreshTokenCookie);
    return cookies.join('; ');
  };

  try {
    console.log('--- Starting Auth API Tests ---');

    // 1. Clean up existing test user if any (we will just try to register a random name/email)
    const randomSuffix = Math.floor(Math.random() * 10000);
    const email = `test.user${randomSuffix}@gmail.com`;
    const password = 'TestSecurePass123!';
    const name = 'Test User';

    console.log(`\n1. Registering new patient: ${email}...`);
    let res = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    let data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));

    // 2. Validate email syntax validation check
    console.log('\n2. Testing validation error (invalid email)...');
    res = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User', email: 'invalidemail', password: 'Short' })
    });
    data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));

    // 3. Login
    console.log(`\n3. Logging in with ${email}...`);
    res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    parseCookies(res);
    console.log(`Cookies captured: accessToken? ${!!accessTokenCookie}, refreshToken? ${!!refreshTokenCookie}`);

    // 4. Access /me protected route
    console.log('\n4. Accessing /me (Authenticated session)...');
    res = await fetch(`${baseUrl}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': getCookieHeader()
      }
    });
    data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));

    // 5. Test token refresh
    console.log('\n5. Refreshing token...');
    // We only send the refreshToken cookie
    res = await fetch(`${baseUrl}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': refreshTokenCookie
      }
    });
    data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    parseCookies(res);

    // 6. Test Admin Unified Login
    console.log('\n6. Testing Admin Login (Unified)...');
    res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@healthai.com', password: 'AdminSecurePass123!' })
    });
    data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));

    // 7. Logout
    console.log('\n7. Logging out patient...');
    res = await fetch(`${baseUrl}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': getCookieHeader()
      }
    });
    data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));

    console.log('\n--- Auth API Tests Completed ---');
  } catch (error) {
    console.error('Test script failed:', error);
  }
};

testAuth();
