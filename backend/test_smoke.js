const BASE_URL = 'http://localhost:3001/api';

async function testAllPhases() {
  console.log('🧪 Running Comprehensive 7-Phase Integration Test Suite for YeneLearning...\n');
  let passed = 0;
  let total = 0;

  async function assert(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}:`, err.message);
    }
  }

  // Phase 0: Health Check
  await assert('Phase 0: Server Health & API Root', async () => {
    const res = await fetch(`${BASE_URL}`);
    const data = await res.json();
    if (res.status !== 200 || !data.message) {
      throw new Error(`Invalid status: ${res.status}`);
    }
  });

  // Phase 1: Authentication & RBAC
  let adminToken = '';
  let parentToken = '';
  let testParentId = '';
  const testEmail = `parent_${Date.now()}@test.com`;

  await assert('Phase 1A: Admin Login & RBAC Role Verification', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@yenelearning.com',
        password: 'AdminPassword123!',
      }),
    });
    const data = await res.json();
    if (!data.accessToken || data.user?.role !== 'admin') {
      throw new Error(`Admin login failed: ${JSON.stringify(data)}`);
    }
    adminToken = data.accessToken;
  });

  await assert('Phase 1B: Parent User Registration', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'ParentPassword123!',
        firstName: 'Tigist',
        lastName: 'Alemu',
        role: 'parent',
      }),
    });
    const data = await res.json();
    testParentId = data.user?.id || data.id;
    if (!testParentId) {
      throw new Error(`Registration failed: ${JSON.stringify(data)}`);
    }
  });

  await assert('Phase 1C: Parent User Login', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'ParentPassword123!',
      }),
    });
    const data = await res.json();
    if (!data.accessToken || data.user?.role !== 'parent') {
      throw new Error(`Parent login failed: ${JSON.stringify(data)}`);
    }
    parentToken = data.accessToken;
  });

  // Phase 1: Schools Module & B2B Licensing
  let schoolId = '';
  const schoolCode = `SCH-${Date.now()}`;

  await assert('Phase 1D: B2B School Creation (Admin Only)', async () => {
    const res = await fetch(`${BASE_URL}/schools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Lideta Cathedral Primary School',
        code: schoolCode,
        address: 'Addis Ababa',
        contactEmail: 'admin@cathedral.edu.et',
        licenseCount: 100,
      }),
    });
    const data = await res.json();
    if (!data.id || data.code !== schoolCode) {
      throw new Error(`School creation failed: ${JSON.stringify(data)}`);
    }
    schoolId = data.id;
  });

  await assert('Phase 1E: B2B Bulk Credential Provisioning', async () => {
    const res = await fetch(`${BASE_URL}/schools/${schoolId}/provision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        users: [
          {
            email: `student1_${Date.now()}@school.edu.et`,
            firstName: 'Dawit',
            lastName: 'Haile',
            role: 'parent',
          },
          {
            email: `teacher1_${Date.now()}@school.edu.et`,
            firstName: 'Aster',
            lastName: 'Bedada',
            role: 'teacher',
          },
        ],
      }),
    });
    const data = await res.json();
    if (!data.credentials || data.credentials.length !== 2) {
      throw new Error(`Provisioning failed: ${JSON.stringify(data)}`);
    }
  });

  // Phase 2: Children Management & Grade Levels
  let childId = '';
  await assert('Phase 2A: Create Child Profile with Grade Level', async () => {
    const res = await fetch(`${BASE_URL}/children`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${parentToken}`,
      },
      body: JSON.stringify({
        name: 'Abebe Junior',
        age: 6,
        grade: 'kg',
        currentLanguage: 'amharic',
        dailyTimeLimitMinutes: 30,
      }),
    });
    const data = await res.json();
    if (!data.id || data.name !== 'Abebe Junior') {
      throw new Error(`Child creation failed: ${JSON.stringify(data)}`);
    }
    childId = data.id;
  });

  // Phase 3 & 4: Mini-Game Results & Weekly Summary Aggregations
  await assert('Phase 3: Record Mini-Game Results (Shape Match & Count)', async () => {
    const res = await fetch(`${BASE_URL}/progress/${childId}/game-result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${parentToken}`,
      },
      body: JSON.stringify({
        gameType: 'shape_match',
        score: 100,
        maxScore: 100,
        timeSpentSeconds: 45,
        starsEarned: 3,
      }),
    });
    const data = await res.json();
    if (!data.id || data.starsEarned !== 3) {
      throw new Error(`Game result recording failed: ${JSON.stringify(data)}`);
    }
  });

  await assert('Phase 4: Parent Weekly Mastery & Benchmark Aggregation', async () => {
    const res = await fetch(`${BASE_URL}/progress/${childId}/weekly-summary`, {
      headers: {
        Authorization: `Bearer ${parentToken}`,
      },
    });
    const data = await res.json();
    if (typeof data.totalStars !== 'number' || typeof data.accuracy !== 'number') {
      throw new Error(`Weekly summary failed: ${JSON.stringify(data)}`);
    }
  });

  // Phase 5: Stories & Supplementary Content Filtering
  await assert('Phase 5: Story & Content Endpoints', async () => {
    const res = await fetch(`${BASE_URL}/content/stories?page=1&pageSize=10`);
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data.items)) {
      throw new Error(`Stories retrieval failed: ${JSON.stringify(data)}`);
    }
  });

  // Phase 6: Teacher-Parent Messaging
  await assert('Phase 6: Teacher-Parent Direct Messaging', async () => {
    const res = await fetch(`${BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        recipientId: testParentId,
        subject: 'Weekly Study Reminder',
        body: 'Please make sure Abebe completes Month 1 Story chapter.',
      }),
    });
    const data = await res.json();
    if (!data.id) {
      throw new Error(`Sending message failed: ${JSON.stringify(data)}`);
    }

    const inboxRes = await fetch(`${BASE_URL}/messages/inbox`, {
      headers: {
        Authorization: `Bearer ${parentToken}`,
      },
    });
    const inbox = await inboxRes.json();
    if (!Array.isArray(inbox) || inbox.length === 0) {
      throw new Error('Message not found in parent inbox');
    }
  });

  // Phase 7: Chapa Payment Gateway (Grade Upgrade & Verification)
  await assert('Phase 7: Chapa Payment Initialization & Auto-Fulfillment', async () => {
    const initRes = await fetch(`${BASE_URL}/payments/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${parentToken}`,
      },
      body: JSON.stringify({
        amount: 299,
        purpose: 'grade_upgrade',
        childId: childId,
        targetGrade: 'grade_1',
      }),
    });
    const initData = await initRes.json();
    if (!initData.txRef) {
      throw new Error(`Payment initialization failed: ${JSON.stringify(initData)}`);
    }

    const verifyRes = await fetch(`${BASE_URL}/payments/verify/${initData.txRef}`, {
      headers: {
        Authorization: `Bearer ${parentToken}`,
      },
    });
    const verifyData = await verifyRes.json();
    if (verifyData.status !== 'success') {
      throw new Error(`Payment verification failed: ${JSON.stringify(verifyData)}`);
    }
  });

  console.log(`\n======================================================`);
  console.log(`🏁 Complete Test Results: ${passed}/${total} Phase Tests Passed (${Math.round((passed/total)*100)}% Success)`);
  console.log(`======================================================\n`);
}

testAllPhases().catch(console.error);
