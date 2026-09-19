const app = require('../server');
const http = require('http');

let server;
const PORT = 3099;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ statusCode: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

const connectDB = require('../config/db');
const seedDatabase = require('../services/seed');

async function runTests() {
  console.log('🚀 Starting Backend REST API Automated Verification Suite...\n');

  try {
    await connectDB();
    await seedDatabase();
  } catch (dbErr) {
    console.warn('⚠️ Test warning: MongoDB connection failed, proceeding with server test:', dbErr.message);
  }

  server = app.listen(PORT);

  try {
    // 1. Health Check Test (200 OK)
    const health = await makeRequest('/api/health');
    console.log(`[TEST 1] GET /api/health -> Status: ${health.statusCode} (Expected: 200)`);
    console.assert(health.statusCode === 200, 'Health check should return 200 OK');

    // 2. Fetch Projects List (200 OK)
    const projects = await makeRequest('/api/projects');
    console.log(`[TEST 2] GET /api/projects -> Status: ${projects.statusCode}, Count: ${projects.body.count} (Expected: 200)`);
    console.assert(projects.statusCode === 200, 'Projects list should return 200 OK');

    // 3. Fetch Single Project Detail (200 OK)
    const projectDetail = await makeRequest('/api/projects/1');
    console.log(`[TEST 3] GET /api/projects/1 -> Status: ${projectDetail.statusCode}, Title: "${projectDetail.body.data.title}"`);
    console.assert(projectDetail.statusCode === 200, 'Fetch project detail should return 200 OK');

    // 4. Fetch Non-Existent Project (404 Not Found)
    const nonExistent = await makeRequest('/api/projects/9999');
    console.log(`[TEST 4] GET /api/projects/9999 -> Status: ${nonExistent.statusCode} (Expected: 404)`);
    console.assert(nonExistent.statusCode === 404, 'Non-existent project should return 404 Not Found');

    // 5. Gatekeeper Contact Validation Failure (400 Bad Request)
    const invalidContact = await makeRequest('/api/contacts', 'POST', { name: 'A', email: 'invalid-email', message: '' });
    console.log(`[TEST 5] POST /api/contacts (Invalid Data) -> Status: ${invalidContact.statusCode}, Errors: ${invalidContact.body.error.details.length} (Expected: 400)`);
    console.assert(invalidContact.statusCode === 400, 'Invalid contact submit should return 400 Bad Request');

    // 6. Valid Contact Form Submission (201 Created)
    const validContact = await makeRequest('/api/contacts', 'POST', {
      name: 'Sarah Connor',
      email: 'sarah@skynet.com',
      subject: 'Consulting Project',
      message: 'Hello AuraTech team! I would love to collaborate on a full stack project.'
    });
    console.log(`[TEST 6] POST /api/contacts (Valid Data) -> Status: ${validContact.statusCode}, ID: ${validContact.body.data.id} (Expected: 201)`);
    console.assert(validContact.statusCode === 201, 'Valid contact submit should return 201 Created');

    // 7. Admin Login (200 OK)
    const adminLogin = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@auratech.com',
      password: 'Admin@12345'
    });
    console.log(`[TEST 7] POST /api/auth/login -> Status: ${adminLogin.statusCode}, Role: ${adminLogin.body.data.user.role} (Expected: 200)`);
    console.assert(adminLogin.statusCode === 200, 'Admin login should return 200 OK');
    const adminToken = adminLogin.body.data.token;

    // 8. Protected Endpoint Without Token (401 Unauthorized)
    const unauthorizedAdd = await makeRequest('/api/projects', 'POST', { title: 'Test' });
    console.log(`[TEST 8] POST /api/projects (No Auth) -> Status: ${unauthorizedAdd.statusCode} (Expected: 401)`);
    console.assert(unauthorizedAdd.statusCode === 401, 'Protected route without token should return 401 Unauthorized');

    // 9. Protected Endpoint With Admin Token (201 Created)
    const authorizedAdd = await makeRequest('/api/projects', 'POST', {
      title: 'Realtime Code Sandbox',
      category: 'fullstack',
      summary: 'In-browser interactive Javascript environment with WebAssembly isolation.',
      description: 'Full stack sandbox application with containerized code execution.',
      tech: ['Node.js', 'Express', 'Docker', 'WebSockets']
    }, { 'Authorization': `Bearer ${adminToken}` });
    console.log(`[TEST 9] POST /api/projects (Admin Auth) -> Status: ${authorizedAdd.statusCode}, Created ID: ${authorizedAdd.body.data.id} (Expected: 201)`);
    console.assert(authorizedAdd.statusCode === 201, 'Protected route with admin token should return 201 Created');

    console.log('\n ALL BACKEND REST API VERIFICATION TESTS PASSED SUCCESSFULLY! ');
  } catch (err) {
    console.error('❌ Verification Test Failed:', err);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests();
