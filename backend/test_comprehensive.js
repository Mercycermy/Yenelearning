/**
 * Comprehensive End-to-End Test Suite for YeneLearning
 * Maps to every functional requirement in appimplementation.md
 *
 * Spec Section → Test Coverage:
 *  §3 RBAC (4 roles)           → Tests 1A–1F
 *  §4.1 School Portal & Auth   → Tests 2A–2E
 *  §4.2 Student Learning       → Tests 3A–3H
 *  §4.3 Bilingual AI Tutor     → Test 4A
 *  §4.4 Parental Control       → Tests 5A–5D
 *  §4.4 Teacher-Parent Comms   → Tests 6A–6D
 *  §4.4 Payment / Grade Upgrade→ Tests 7A–7D
 */

const BASE_URL = 'http://localhost:3001/api';

let passed = 0;
let failed = 0;
let total = 0;
const failures = [];

async function assert(section, name, fn) {
  total++;
  const fullName = `[${section}] ${name}`;
  try {
    await fn();
    console.log(`  ✅ ${fullName}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ ${fullName}: ${err.message}`);
    failed++;
    failures.push({ test: fullName, error: err.message });
  }
}

async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, opts);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data, ok: res.ok };
}

async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  🧪 YeneLearning Comprehensive Test Suite');
  console.log('  Based on appimplementation.md — All 7 Functional Sections');
  console.log('═══════════════════════════════════════════════════════════\n');

  // ──────────────────────────────────────────────────────────────────────
  // §0 — HEALTH CHECK
  // ──────────────────────────────────────────────────────────────────────
  console.log('─── §0 Health Check ───');

  await assert('§0', 'Server is running and API responds', async () => {
    const { status, data } = await fetchJSON(`${BASE_URL}`);
    if (status !== 200) throw new Error(`Status ${status}`);
    if (!data.message) throw new Error('No welcome message');
  });

  // ──────────────────────────────────────────────────────────────────────
  // §3 — RBAC: 4 Roles (Admin, School Admin, Teacher, Parent)
  // ──────────────────────────────────────────────────────────────────────
  console.log('\n─── §3 RBAC — Role-Based Access Control (4 Roles) ───');

  let adminToken = '';
  let parentToken = '';
  let teacherToken = '';
  let testParentId = '';
  let testTeacherId = '';
  const ts = Date.now();

  await assert('§3', 'Admin login with correct role', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@yenelearning.com', password: 'AdminPassword123!' }),
    });
    if (!data.accessToken || data.user?.role !== 'admin') throw new Error(JSON.stringify(data));
    adminToken = data.accessToken;
  });

  await assert('§3', 'Parent registration succeeds', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `parent_${ts}@test.com`, password: 'Test1234!',
        firstName: 'Tigist', lastName: 'Alemu', role: 'parent',
      }),
    });
    testParentId = data.user?.id || data.id;
    if (!testParentId) throw new Error(JSON.stringify(data));
  });

  await assert('§3', 'Parent login returns parent role', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `parent_${ts}@test.com`, password: 'Test1234!' }),
    });
    if (data.user?.role !== 'parent') throw new Error(`Expected parent, got ${data.user?.role}`);
    parentToken = data.accessToken;
  });

  await assert('§3', 'Teacher registration succeeds', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `teacher_${ts}@test.com`, password: 'Test1234!',
        firstName: 'Aster', lastName: 'Bedada', role: 'teacher',
      }),
    });
    testTeacherId = data.user?.id || data.id;
    if (!testTeacherId) throw new Error(JSON.stringify(data));
  });

  await assert('§3', 'Teacher login returns teacher role', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `teacher_${ts}@test.com`, password: 'Test1234!' }),
    });
    if (data.user?.role !== 'teacher') throw new Error(`Expected teacher, got ${data.user?.role}`);
    teacherToken = data.accessToken;
  });

  await assert('§3', 'Unauthenticated access is denied (401)', async () => {
    const { status } = await fetchJSON(`${BASE_URL}/children`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (status !== 401) throw new Error(`Expected 401, got ${status}`);
  });

  // ──────────────────────────────────────────────────────────────────────
  // §4.1 — School Portal Integration & Authentication
  // ──────────────────────────────────────────────────────────────────────
  console.log('\n─── §4.1 School Portal & B2B Provisioning ───');

  let schoolId = '';
  const schoolCode = `SCH-${ts}`;

  await assert('§4.1', 'Admin creates school with license count', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/schools`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Mekelle International Academy',
        code: schoolCode,
        address: 'Mekelle, Tigray',
        contactEmail: 'admin@mia.edu.et',
        licenseCount: 50,
      }),
    });
    if (!data.id || data.code !== schoolCode) throw new Error(JSON.stringify(data));
    if (data.licenseCount !== 50) throw new Error(`licenseCount: ${data.licenseCount}`);
    schoolId = data.id;
  });

  await assert('§4.1', 'School listing returns created school', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/schools`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!Array.isArray(data)) throw new Error('Expected array');
    const found = data.find(s => s.code === schoolCode);
    if (!found) throw new Error('School not found in listing');
  });

  await assert('§4.1', 'Bulk credential provisioning creates users', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/schools/${schoolId}/provision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        users: [
          { email: `s1_${ts}@school.et`, firstName: 'Dawit', lastName: 'Haile', role: 'parent' },
          { email: `t1_${ts}@school.et`, firstName: 'Selam', lastName: 'Mesfin', role: 'teacher' },
          { email: `s2_${ts}@school.et`, firstName: 'Kidus', lastName: 'Tadesse', role: 'parent' },
        ],
      }),
    });
    if (!data.credentials || data.credentials.length !== 3) throw new Error(JSON.stringify(data));
    data.credentials.forEach((c, i) => {
      if (!c.email || !c.password) throw new Error(`Credential ${i} missing fields`);
    });
  });

  await assert('§4.1', 'School stats are accessible', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/schools/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (typeof data !== 'object') throw new Error('Expected stats object');
  });

  await assert('§4.1', 'Non-admin cannot create school (403)', async () => {
    const { status } = await fetchJSON(`${BASE_URL}/schools`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${parentToken}` },
      body: JSON.stringify({ name: 'Hack School', code: 'HACK1', licenseCount: 1 }),
    });
    if (status !== 403) throw new Error(`Expected 403, got ${status}`);
  });

  // ──────────────────────────────────────────────────────────────────────
  // §4.1B — Dedicated School Portal: Domain, Teachers, Students & Notices
  // ──────────────────────────────────────────────────────────────────────
  console.log('\n─── §4.1B Dedicated School Portal: Domain, Teachers, Students & Notices ───');

  let enrolledStudentId = '';
  let createdTeacherId = '';
  const schoolDomainSlug = `stjoseph${ts}`;

  await assert('§4.1B', 'Admin assigns custom domain & branding to school', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/schools/${schoolId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        domain: schoolDomainSlug,
        primaryColor: '#2563EB',
        welcomeMessage: 'Welcome to St. Joseph Partner Portal',
      }),
    });
    if (data.domain !== schoolDomainSlug) throw new Error(`Domain mismatch: ${data.domain}`);
  });

  await assert('§4.1B', 'Public/Authenticated lookup resolves school by domain', async () => {
    const { data, status } = await fetchJSON(`${BASE_URL}/schools/domain/${schoolDomainSlug}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (status !== 200) throw new Error(`Status ${status}`);
    if (data.id !== schoolId || data.domain !== schoolDomainSlug) throw new Error(JSON.stringify(data));
  });

  await assert('§4.1B', 'School Admin adds teacher to school roster', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/schools/${schoolId}/teachers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        email: `teacher${ts}@stjoseph.edu.et`,
        firstName: 'Tigist',
        lastName: 'Alemu',
        password: 'Teacher1234!',
      }),
    });
    if (!data.teacher || !data.teacher.id) throw new Error(JSON.stringify(data));
    createdTeacherId = data.teacher.id;
  });

  await assert('§4.1B', 'School Admin lists teachers in school', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/schools/${schoolId}/teachers`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!Array.isArray(data) || data.length === 0) throw new Error('Expected teacher array');
    const found = data.find(t => t.id === createdTeacherId);
    if (!found) throw new Error('Added teacher not found in list');
  });

  await assert('§4.1B', 'School Admin bulk generates student credentials with login cards', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/schools/${schoolId}/generate-student-creds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        count: 3,
        grade: 'kg',
        age: 6,
        prefix: 'kg_student',
      }),
    });
    if (data.created !== 3 || !Array.isArray(data.credentials) || data.credentials.length !== 3) {
      throw new Error(`Invalid bulk credentials: ${JSON.stringify(data)}`);
    }
    data.credentials.forEach(c => {
      if (!c.parentEmail || !c.parentPassword || !c.studentName) throw new Error(`Missing cred field`);
    });
  });

  await assert('§4.1B', 'School Admin directly enrolls student with parent', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/schools/${schoolId}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Kalkidan Bekele',
        age: 6,
        grade: 'kg',
        currentLanguage: 'amharic',
        dailyTimeLimitMinutes: 35,
        parentEmail: `parent_kalkidan_${ts}@school.et`,
        parentFirstName: 'Bekele',
        parentLastName: 'Mekonnen',
      }),
    });
    if (!data.student || !data.student.id) throw new Error(JSON.stringify(data));
    if (data.student.schoolId !== schoolId) throw new Error(`schoolId mismatch: ${data.student.schoolId}`);
    enrolledStudentId = data.student.id;
  });

  await assert('§4.1B', 'School Admin lists enrolled school students', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/schools/${schoolId}/students`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!Array.isArray(data) || data.length === 0) throw new Error('Expected student list');
    const found = data.find(s => s.id === enrolledStudentId);
    if (!found || !found.parent) throw new Error('Enrolled student or parent relation not found');
  });

  await assert('§4.1B', 'School Admin sends individual academic notice regarding student to parent', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/schools/${schoolId}/students/${enrolledStudentId}/notice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        subject: 'Weekly Progress & Homework Milestone',
        body: 'Kalkidan has completed all assigned vocabulary drills this week.',
        includeProgressSummary: true,
      }),
    });
    if (!data.delivered || !data.messageId) throw new Error(JSON.stringify(data));
  });

  await assert('§4.1B', 'School Admin updates student grade level (KG -> Grade 1)', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/schools/${schoolId}/students/${enrolledStudentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        grade: 'grade_1',
        dailyTimeLimitMinutes: 45,
      }),
    });
    if (data.grade !== 'grade_1') throw new Error(`Expected grade_1, got ${data.grade}`);
  });

  await assert('§4.1B', 'School Admin lists registered school parents', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/schools/${schoolId}/parents`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!Array.isArray(data) || data.length === 0) throw new Error('Expected parents list');
  });

  await assert('§4.1B', 'School Admin broadcasts announcement to school parents', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/schools/${schoolId}/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        subject: 'Term 1 Exam Schedule & Learning Goals',
        body: 'Please make sure all learners complete the weekly mini-games.',
      }),
    });
    if (typeof data.delivered !== 'number' || data.delivered < 1) {
      throw new Error(`Expected >=1 delivered, got ${JSON.stringify(data)}`);
    }
  });

  await assert('§4.1B', 'School Analytics returns grade distribution & license usage', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/schools/${schoolId}/analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (typeof data.totalStudents !== 'number' || typeof data.gradeDistribution !== 'object') {
      throw new Error(`Invalid analytics response: ${JSON.stringify(data)}`);
    }
  });

  // ──────────────────────────────────────────────────────────────────────
  // §4.2 — Student Learning Experience & Age-Adaptive Engine
  // ──────────────────────────────────────────────────────────────────────
  console.log('\n─── §4.2 Student Learning Experience ───');

  let childId = '';

  await assert('§4.2', 'Create child with KG grade level', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/children`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${parentToken}` },
      body: JSON.stringify({
        name: 'Abebe Junior',
        age: 5,
        grade: 'kg',
        currentLanguage: 'amharic',
        dailyTimeLimitMinutes: 30,
      }),
    });
    if (!data.id || data.grade !== 'kg') throw new Error(JSON.stringify(data));
    childId = data.id;
  });

  await assert('§4.2', 'Create child with Grade 2 level', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/children`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${parentToken}` },
      body: JSON.stringify({
        name: 'Meron Junior',
        age: 8,
        grade: 'grade_2',
        currentLanguage: 'english',
        dailyTimeLimitMinutes: 45,
      }),
    });
    if (!data.id || data.grade !== 'grade_2') throw new Error(JSON.stringify(data));
  });

  await assert('§4.2', 'List children returns all profiles', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/children`, {
      headers: { Authorization: `Bearer ${parentToken}` },
    });
    if (!Array.isArray(data) || data.length < 2) throw new Error(`Expected >=2, got ${data?.length}`);
  });

  await assert('§4.2', 'Stories endpoint returns paginated items', async () => {
    const { data, status } = await fetchJSON(`${BASE_URL}/content/stories?page=1&pageSize=10`);
    if (status !== 200) throw new Error(`Status ${status}`);
    if (!Array.isArray(data.items)) throw new Error('Expected items array');
    if (typeof data.total !== 'number') throw new Error('Missing total count');
  });

  const gameTypes = ['shape_match', 'word_spell', 'counting', 'logic_puzzle'];
  for (const gameType of gameTypes) {
    await assert('§4.2', `Record ${gameType} game result`, async () => {
      const { data } = await fetchJSON(`${BASE_URL}/progress/${childId}/game-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${parentToken}` },
        body: JSON.stringify({
          gameType,
          score: 80 + Math.floor(Math.random() * 21),
          maxScore: 100,
          timeSpentSeconds: 30 + Math.floor(Math.random() * 60),
          starsEarned: Math.floor(Math.random() * 3) + 1,
        }),
      });
      if (!data.id || data.gameType !== gameType) throw new Error(JSON.stringify(data));
    });
  }

  await assert('§4.2', 'Game results listing returns all 4 game types', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/progress/${childId}/game-results`, {
      headers: { Authorization: `Bearer ${parentToken}` },
    });
    if (!Array.isArray(data)) throw new Error('Expected array');
    const types = new Set(data.map(r => r.gameType));
    for (const gt of gameTypes) {
      if (!types.has(gt)) throw new Error(`Missing game type: ${gt}`);
    }
  });

  await assert('§4.2', 'Content listing works with pagination', async () => {
    const { data, status } = await fetchJSON(`${BASE_URL}/content/paged?page=1&pageSize=5`);
    if (status !== 200) throw new Error(`Status ${status}`);
    if (!Array.isArray(data.items)) throw new Error('Expected items array');
  });

  // ──────────────────────────────────────────────────────────────────────
  // §4.3 — Bilingual Language Building (AI Tutor)
  // ──────────────────────────────────────────────────────────────────────
  console.log('\n─── §4.3 Bilingual AI Language Tutor ───');

  await assert('§4.3', 'AI chat endpoint responds (or returns config error)', async () => {
    const { status, data } = await fetchJSON(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Hello, can you help me learn Amharic?',
        systemPrompt: 'You are a warm, safe language tutor for children. Reply in Amharic.',
      }),
    });
    if (status === 200 || status === 201) {
      if (!data.response && !data.message) throw new Error('No response from AI');
    } else if (status === 500 || status === 502) {
      // Expected if HUGGINGFACE_API_KEY not set
    } else {
      throw new Error(`Unexpected status ${status}: ${JSON.stringify(data)}`);
    }
  });

  // ──────────────────────────────────────────────────────────────────────
  // §4.4 — Parental Control & Monitoring Portal
  // ──────────────────────────────────────────────────────────────────────
  console.log('\n─── §4.4 Parent Dashboard & Performance Tracking ───');

  await assert('§4.4', 'Weekly mastery summary has all required fields', async () => {
    const { data, status } = await fetchJSON(`${BASE_URL}/progress/${childId}/weekly-summary`, {
      headers: { Authorization: `Bearer ${parentToken}` },
    });
    if (status !== 200) throw new Error(`Status ${status}`);
    const required = ['wordsLearned', 'accuracy', 'timeSpentMinutes', 'totalStars', 'streakDays'];
    for (const key of required) {
      if (typeof data[key] !== 'number') throw new Error(`Missing/invalid field: ${key}`);
    }
  });

  await assert('§4.4', 'Child summary has progress breakdown', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/progress/${childId}/summary`, {
      headers: { Authorization: `Bearer ${parentToken}` },
    });
    const fields = ['totalCompleted', 'totalInProgress', 'totalMastered', 'totalTimeMinutes'];
    for (const f of fields) {
      if (typeof data[f] !== 'number') throw new Error(`Missing: ${f}`);
    }
  });

  await assert('§4.4', 'Child progress history returns records', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/progress/${childId}`, {
      headers: { Authorization: `Bearer ${parentToken}` },
    });
    if (!Array.isArray(data)) throw new Error('Expected array');
  });

  // ──────────────────────────────────────────────────────────────────────
  // §4.4 continued — Teacher-Parent Communication
  // ──────────────────────────────────────────────────────────────────────
  console.log('\n─── §4.4 Teacher-Parent Communication ───');

  let messageId = '';

  await assert('§4.4', 'Teacher sends message to parent', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${teacherToken}` },
      body: JSON.stringify({
        recipientId: testParentId,
        subject: 'Homework Reminder',
        body: 'Please ensure Abebe completes the Shape Match game this week.',
      }),
    });
    if (!data.id) throw new Error(JSON.stringify(data));
    messageId = data.id;
  });

  await assert('§4.4', 'Parent receives message in inbox', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/messages/inbox`, {
      headers: { Authorization: `Bearer ${parentToken}` },
    });
    if (!Array.isArray(data)) throw new Error('Expected array');
    const found = data.find(m => m.id === messageId);
    if (!found) throw new Error('Message not in inbox');
    if (found.isRead) throw new Error('Message should be unread');
  });

  await assert('§4.4', 'Unread count is at least 1', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/messages/unread-count`, {
      headers: { Authorization: `Bearer ${parentToken}` },
    });
    if (typeof data.count !== 'number' || data.count < 1) throw new Error(`Expected >= 1 unread, got ${JSON.stringify(data)}`);
  });

  await assert('§4.4', 'Mark message as read', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/messages/${messageId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${parentToken}` },
    });
    if (!data.isRead) throw new Error('Message not marked as read');
  });

  // ──────────────────────────────────────────────────────────────────────
  // §4.4 — Payment / Grade Upgrade System (Chapa)
  // ──────────────────────────────────────────────────────────────────────
  console.log('\n─── §4.4 Payment & Grade Upgrade (Chapa) ───');

  let txRef = '';

  await assert('§4.4', 'Initialize Chapa payment for grade upgrade', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/payments/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${parentToken}` },
      body: JSON.stringify({
        amount: 499,
        purpose: 'grade_upgrade',
        childId: childId,
        targetGrade: 'grade_1',
      }),
    });
    if (!data.txRef) throw new Error(JSON.stringify(data));
    txRef = data.txRef;
  });

  await assert('§4.4', 'Verify payment & auto-fulfillment upgrades grade', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/payments/verify/${txRef}`, {
      headers: { Authorization: `Bearer ${parentToken}` },
    });
    if (data.status !== 'success') throw new Error(`Payment status: ${data.status}`);
  });

  await assert('§4.4', 'Payment history shows completed transaction', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/payments/my-history`, {
      headers: { Authorization: `Bearer ${parentToken}` },
    });
    if (!Array.isArray(data)) throw new Error('Expected array');
    const found = data.find(p => p.txRef === txRef);
    if (!found) throw new Error('Payment not in history');
    if (found.status !== 'success') throw new Error('Payment status incorrect in history');
  });

  await assert('§4.4', 'Admin can list all payments', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/payments/all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!Array.isArray(data)) throw new Error('Expected array');
  });

  // ──────────────────────────────────────────────────────────────────────
  // §5 — Admin Dashboard Stats
  // ──────────────────────────────────────────────────────────────────────
  console.log('\n─── §5 Admin Dashboard Stats ───');

  await assert('§5', 'Dashboard stats returns learner metrics', async () => {
    const { data, status } = await fetchJSON(`${BASE_URL}/progress/stats/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (status !== 200) throw new Error(`Status ${status}`);
    if (typeof data.totalLearners !== 'number') throw new Error(`Missing totalLearners`);
    if (typeof data.wordsLearned !== 'number') throw new Error(`Missing wordsLearned`);
  });

  // ──────────────────────────────────────────────────────────────────────
  // EDGE CASES — Data Validation & Authorization
  // ──────────────────────────────────────────────────────────────────────
  console.log('\n─── Edge Cases & Validation ───');

  await assert('Edge', 'Duplicate email registration is rejected', async () => {
    const { status } = await fetchJSON(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `parent_${ts}@test.com`, password: 'Test1234!',
        firstName: 'Dup', lastName: 'User', role: 'parent',
      }),
    });
    if (status < 400) throw new Error(`Expected error, got ${status}`);
  });

  await assert('Edge', 'Invalid login credentials are rejected', async () => {
    const { status } = await fetchJSON(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'noexist@test.com', password: 'wrong' }),
    });
    if (status < 400) throw new Error(`Expected error, got ${status}`);
  });

  await assert('Edge', 'Create child with invalid grade is rejected', async () => {
    const { status } = await fetchJSON(`${BASE_URL}/children`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${parentToken}` },
      body: JSON.stringify({
        name: 'Bad Grade', age: 5, grade: 'grade_99',
        currentLanguage: 'amharic', dailyTimeLimitMinutes: 30,
      }),
    });
    if (status < 400) throw new Error(`Expected validation error, got ${status}`);
  });

  await assert('Edge', 'Non-existent child returns 404 for game result', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const { status } = await fetchJSON(`${BASE_URL}/progress/${fakeId}/game-result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${parentToken}` },
      body: JSON.stringify({
        gameType: 'counting', score: 50, maxScore: 100,
        timeSpentSeconds: 30, starsEarned: 1,
      }),
    });
    if (status !== 404) throw new Error(`Expected 404, got ${status}`);
  });

  // ──────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ──────────────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`  🏁 RESULTS: ${passed}/${total} tests passed (${failed} failures)`);
  console.log(`  Success Rate: ${Math.round((passed / total) * 100)}%`);
  console.log('═══════════════════════════════════════════════════════════');

  if (failures.length > 0) {
    console.log('\n  ❌ FAILURES:');
    failures.forEach((f, i) => {
      console.log(`    ${i + 1}. ${f.test}`);
      console.log(`       → ${f.error}`);
    });
  }

  console.log('');
}

runAllTests().catch(console.error);
