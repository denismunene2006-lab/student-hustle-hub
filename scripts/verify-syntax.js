const fs = require('fs');

const backendFiles = [
  'backend/server.js',
  'backend/middleware/securityMiddleware.js',
  'backend/middleware/authMiddleware.js',
  'backend/models/AuditLog.js',
  'backend/models/User.js',
  'backend/models/Service.js',
  'backend/models/reviewModel.js',
  'backend/models/Report.js',
  'backend/models/Job.js',
  'backend/controllers/authController.js',
  'backend/controllers/serviceController.js',
  'backend/controllers/reviewController.js',
  'backend/controllers/reportController.js',
  'backend/controllers/jobController.js',
  'backend/controllers/adminController.js',
  'backend/routes/authRoutes.js',
  'backend/routes/serviceRoutes.js',
  'backend/routes/reviewRoutes.js',
  'backend/routes/jobRoutes.js',
  'backend/routes/reportRoutes.js',
  'backend/routes/adminRoutes.js',
];

const frontendFiles = [
  'frontend/app.js',
  'frontend/dashboard.js',
  'frontend/home.js',
  'frontend/profile.js',
  'frontend/config.js',
  'frontend/sw.js',
];

const htmlFiles = [
  'frontend/admin.html',
  'frontend/service.html',
  'frontend/login.html',
  'frontend/register.html',
  'frontend/index.html',
  'frontend/create-service.html',
  'frontend/profile.html',
  'frontend/dashboard.html',
  'frontend/terms.html',
  'frontend/guidelines.html',
  'frontend/settings.html',
];

let ok = true;

// Check JS files
console.log('=== Checking JavaScript files ===');
for (const f of [...backendFiles, ...frontendFiles]) {
  try {
    new Function(fs.readFileSync(f, 'utf8'));
    console.log('OK:', f);
  } catch (e) {
    console.error('FAIL:', f, '-', e.message);
    ok = false;
  }
}

// Check HTML inline scripts (skip JSON-LD and src= scripts)
console.log('\n=== Checking HTML inline scripts ===');
for (const f of htmlFiles) {
  const content = fs.readFileSync(f, 'utf8');
  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/g;
  let match;
  let fileOk = true;

  while ((match = scriptRegex.exec(content)) !== null) {
    const attrs = match[1] || '';
    const code = (match[2] || '').trim();

    // Skip external scripts and JSON-LD
    if (/\bsrc\s*=/.test(attrs)) continue;
    if (/type\s*=\s*["']application\/ld\+json["']/.test(attrs)) continue;
    if (!code) continue;

    try {
      new Function(code);
    } catch (e) {
      console.error('FAIL:', f, '-', e.message);
      fileOk = false;
      ok = false;
    }
  }

  if (fileOk) console.log('OK:', f);
}

console.log('\n' + (ok ? '=== ALL SYNTAX CHECKS PASSED ===' : '=== SYNTAX ERRORS FOUND ==='));
process.exit(ok ? 0 : 1);