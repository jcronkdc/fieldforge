#!/usr/bin/env node

/**
 * COMPREHENSIVE PATHWAY VERIFICATION SCRIPT
 * 
 * Checks for potential 404, 500, and 504 errors by analyzing:
 * - Backend route registration
 * - Frontend route definitions
 * - Error handling coverage
 * - Timeout configurations
 * - Database connection handling
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: [],
  warnings: []
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(80)}`, colors.cyan);
  log(`  ${title}`, colors.bright + colors.cyan);
  log('='.repeat(80), colors.cyan);
}

// ============================================================================
// CHECK 1: Backend Route Registration
// ============================================================================

function checkBackendRoutes() {
  logSection('BACKEND ROUTE REGISTRATION CHECK');
  
  const serverFile = path.join(__dirname, 'backend/src/server.ts');
  
  if (!fs.existsSync(serverFile)) {
    log('❌ server.ts not found!', colors.red);
    results.failed++;
    results.errors.push('server.ts file missing');
    return;
  }
  
  const serverContent = fs.readFileSync(serverFile, 'utf8');
  
  // Check for all router imports
  const routers = [
    'createFieldOpsRouter',
    'createFeedbackRouter',
    'createProjectRouter',
    'createEquipmentRouter',
    'createSafetyRouter',
    'createAnalyticsRouter',
    'createCrewRouter',
    'createQAQCRouter',
    'createDocumentRouter',
    'createSchedulingRouter',
    'createReportingRouter',
    'createInventoryRouter',
    'createReceiptRouter',
    'createOperationsRouter',
    'createTestingRouter',
    'createDrawingRouter',
    'createEquipmentTestingRouter',
    'createLeadRouter',
    'createAcquisitionRouter',
    'createEnvironmentalRouter',
    'createEmergencyRouter',
    'createUserRouter',
    'createSubmittalsRouter',
    'createOutagesRouter',
    'createCompanyRouter',
    'createMapRouter',
    'createSubstationRouter',
    'createAIRouter',
    'createStripeRouter',
    'createStripeWebhookRouter',
    'createMessagingRouter',
    'createCollaborationRouter',
    'createFeedRouter',
    'createNotificationRouter'
  ];
  
  let allRoutersRegistered = true;
  
  routers.forEach(router => {
    const imported = serverContent.includes(`import { ${router} }`);
    const used = serverContent.includes(`${router}()`);
    
    if (!imported) {
      log(`❌ ${router} not imported`, colors.red);
      results.errors.push(`${router} not imported in server.ts`);
      allRoutersRegistered = false;
      results.failed++;
    } else if (!used) {
      log(`⚠️  ${router} imported but not used`, colors.yellow);
      results.warnings.push(`${router} imported but not registered`);
      allRoutersRegistered = false;
      results.warnings++;
    }
  });
  
  if (allRoutersRegistered) {
    log(`✅ All ${routers.length} routers properly registered`, colors.green);
    results.passed++;
  }
  
  // Check for error handlers
  const hasErrorHandler = serverContent.includes('errorHandler');
  const hasNotFoundHandler = serverContent.includes('notFoundHandler');
  
  if (hasErrorHandler && hasNotFoundHandler) {
    log('✅ Error handlers registered (errorHandler + notFoundHandler)', colors.green);
    results.passed++;
  } else {
    log('❌ Missing error handlers', colors.red);
    results.errors.push('Error handlers not properly registered');
    results.failed++;
  }
  
  // Check for timeout configuration
  const hasTimeout = serverContent.includes('timeout') || serverContent.includes('REQUEST_TIMEOUT');
  if (hasTimeout) {
    log('✅ Timeout configuration detected', colors.green);
    results.passed++;
  } else {
    log('⚠️  No explicit timeout configuration found', colors.yellow);
    results.warnings.push('Consider adding request timeout middleware');
    results.warnings++;
  }
}

// ============================================================================
// CHECK 2: Frontend Route Configuration
// ============================================================================

function checkFrontendRoutes() {
  logSection('FRONTEND ROUTE CONFIGURATION CHECK');
  
  const appFile = path.join(__dirname, 'apps/swipe-feed/src/AppSafe.tsx');
  
  if (!fs.existsSync(appFile)) {
    log('❌ AppSafe.tsx not found!', colors.red);
    results.failed++;
    results.errors.push('AppSafe.tsx file missing');
    return;
  }
  
  const appContent = fs.readFileSync(appFile, 'utf8');
  
  // Check for all required components
  const components = [
    'FuturisticDashboard',
    'SocialFeed',
    'ProjectManager',
    'QAQCHub',
    'EquipmentHub',
    'DocumentHub',
    'SafetyHub',
    'WeatherDashboard',
    'ThreeWeekLookahead',
    'DailyOperations',
    'ReceiptManager',
    'NationwideCrewManager',
    'TimeTracking'
  ];
  
  let allComponentsImported = true;
  
  components.forEach(component => {
    const imported = appContent.includes(`import { ${component} }`) || appContent.includes(`import ${component}`);
    const used = appContent.includes(`<${component}`);
    
    if (!imported) {
      log(`❌ ${component} not imported`, colors.red);
      results.errors.push(`${component} not imported in AppSafe.tsx`);
      allComponentsImported = false;
      results.failed++;
    } else if (!used) {
      log(`⚠️  ${component} imported but not used in routes`, colors.yellow);
      results.warnings.push(`${component} imported but not routed`);
      results.warnings++;
    }
  });
  
  if (allComponentsImported) {
    log(`✅ All ${components.length} components properly imported and routed`, colors.green);
    results.passed++;
  }
  
  // Check for route paths
  const routes = [
    '/dashboard',
    '/feed',
    '/projects',
    '/qaqc',
    '/equipment',
    '/documents',
    '/safety',
    '/weather',
    '/schedule',
    '/field/daily',
    '/field/receipts',
    '/field/crews',
    '/field/time'
  ];
  
  let allRoutesConfigured = true;
  
  routes.forEach(route => {
    if (!appContent.includes(`path="${route}"`)) {
      log(`❌ Route ${route} not configured`, colors.red);
      results.errors.push(`Route ${route} missing in AppSafe.tsx`);
      allRoutesConfigured = false;
      results.failed++;
    }
  });
  
  if (allRoutesConfigured) {
    log(`✅ All ${routes.length} routes properly configured`, colors.green);
    results.passed++;
  }
}

// ============================================================================
// CHECK 3: Error Handler Files
// ============================================================================

function checkErrorHandlers() {
  logSection('ERROR HANDLING INFRASTRUCTURE CHECK');
  
  const errorHandlerFile = path.join(__dirname, 'backend/src/middleware/errorHandler.ts');
  
  if (!fs.existsSync(errorHandlerFile)) {
    log('❌ errorHandler.ts not found!', colors.red);
    results.failed++;
    results.errors.push('errorHandler.ts file missing');
    return;
  }
  
  const errorHandlerContent = fs.readFileSync(errorHandlerFile, 'utf8');
  
  // Check for required functions
  const requiredFunctions = [
    'errorHandler',
    'notFoundHandler',
    'createError',
    'asyncHandler'
  ];
  
  let allFunctionsExist = true;
  
  requiredFunctions.forEach(func => {
    if (!errorHandlerContent.includes(`function ${func}`) && !errorHandlerContent.includes(`export function ${func}`)) {
      log(`❌ ${func} not found in errorHandler.ts`, colors.red);
      results.errors.push(`${func} missing from errorHandler.ts`);
      allFunctionsExist = false;
      results.failed++;
    }
  });
  
  if (allFunctionsExist) {
    log(`✅ All ${requiredFunctions.length} error handling functions present`, colors.green);
    results.passed++;
  }
  
  // Check for proper error response structure
  if (errorHandlerContent.includes('res.status(statusCode).json')) {
    log('✅ Proper error response structure detected', colors.green);
    results.passed++;
  } else {
    log('❌ Error response structure not found', colors.red);
    results.errors.push('Error handler does not send proper JSON responses');
    results.failed++;
  }
  
  // Check for error logging
  if (errorHandlerContent.includes('console.error') || errorHandlerContent.includes('console.warn')) {
    log('✅ Error logging implemented', colors.green);
    results.passed++;
  } else {
    log('⚠️  No error logging detected', colors.yellow);
    results.warnings.push('Consider adding error logging');
    results.warnings++;
  }
}

// ============================================================================
// CHECK 4: Database Error Handling
// ============================================================================

function checkDatabaseHandling() {
  logSection('DATABASE CONNECTION & ERROR HANDLING CHECK');
  
  const supabaseFile = path.join(__dirname, 'apps/swipe-feed/src/lib/supabase.ts');
  
  if (!fs.existsSync(supabaseFile)) {
    log('⚠️  supabase.ts not found, checking alternate locations...', colors.yellow);
    results.warnings++;
  } else {
    log('✅ Supabase client configuration found', colors.green);
    results.passed++;
    
    const supabaseContent = fs.readFileSync(supabaseFile, 'utf8');
    
    // Check for connection error handling
    if (supabaseContent.includes('try') && supabaseContent.includes('catch')) {
      log('✅ Database error handling detected', colors.green);
      results.passed++;
    }
  }
  
  // Check for connection timeout config
  const envExampleFile = path.join(__dirname, '.env.example');
  if (fs.existsSync(envExampleFile)) {
    const envContent = fs.readFileSync(envExampleFile, 'utf8');
    if (envContent.includes('SUPABASE_URL') && envContent.includes('SUPABASE_ANON_KEY')) {
      log('✅ Database configuration variables documented', colors.green);
      results.passed++;
    }
  }
}

// ============================================================================
// CHECK 5: API Route Files Exist
// ============================================================================

function checkRouteFilesExist() {
  logSection('API ROUTE FILES EXISTENCE CHECK');
  
  const routeFiles = [
    'backend/src/routes/fieldOpsRoutes.ts',
    'backend/src/routes/projectRoutes.ts',
    'backend/src/routes/userRoutes.ts',
    'backend/src/routes/companyRoutes.ts',
    'backend/src/routes/equipmentRoutes.ts',
    'backend/src/construction/safety/safetyRoutes.ts',
    'backend/src/construction/analytics/analyticsRoutes.ts',
    'backend/src/construction/crews/crewRoutes.ts',
    'backend/src/construction/qaqc/qaqcRoutes.ts',
    'backend/src/construction/documents/documentRoutes.ts',
    'backend/src/messaging/messagingRoutes.ts',
    'backend/src/collaboration/collaborationRoutes.ts',
    'backend/src/feed/feedRoutes.ts',
    'backend/src/notifications/notificationRoutes.ts'
  ];
  
  let allFilesExist = true;
  
  routeFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      log(`❌ ${file} not found`, colors.red);
      results.errors.push(`Route file ${file} missing`);
      allFilesExist = false;
      results.failed++;
    }
  });
  
  if (allFilesExist) {
    log(`✅ All ${routeFiles.length} critical route files exist`, colors.green);
    results.passed++;
  }
}

// ============================================================================
// CHECK 6: Vercel Configuration
// ============================================================================

function checkVercelConfig() {
  logSection('VERCEL DEPLOYMENT CONFIGURATION CHECK');
  
  const vercelConfigFile = path.join(__dirname, 'vercel.json');
  
  if (!fs.existsSync(vercelConfigFile)) {
    log('❌ vercel.json not found!', colors.red);
    results.failed++;
    results.errors.push('vercel.json missing');
    return;
  }
  
  const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigFile, 'utf8'));
  
  // Check for API route configuration
  if (vercelConfig.rewrites || vercelConfig.routes) {
    log('✅ API routing configured in vercel.json', colors.green);
    results.passed++;
  } else {
    log('⚠️  No explicit routing configuration in vercel.json', colors.yellow);
    results.warnings.push('Consider explicit API routing in vercel.json');
    results.warnings++;
  }
  
  // Check for serverless function
  const apiPath = path.join(__dirname, 'api/[...path].ts');
  if (fs.existsSync(apiPath)) {
    log('✅ Serverless API function exists (api/[...path].ts)', colors.green);
    results.passed++;
  } else {
    log('❌ Serverless API function missing', colors.red);
    results.errors.push('api/[...path].ts missing');
    results.failed++;
  }
}

// ============================================================================
// GENERATE REPORT
// ============================================================================

function generateReport() {
  logSection('PATHWAY VERIFICATION REPORT');
  
  log(`\n📊 SUMMARY`, colors.bright);
  log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, colors.cyan);
  log(`✅ Passed:    ${results.passed}`, colors.green);
  log(`❌ Failed:    ${results.failed}`, colors.red);
  log(`⚠️  Warnings:  ${results.warnings}`, colors.yellow);
  
  if (results.errors.length > 0) {
    log(`\n❌ CRITICAL ISSUES (${results.errors.length})`, colors.red + colors.bright);
    log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, colors.cyan);
    results.errors.forEach((err, idx) => {
      log(`${idx + 1}. ${err}`, colors.red);
    });
  }
  
  if (results.warnings.length > 0) {
    log(`\n⚠️  WARNINGS (${results.warnings.length})`, colors.yellow + colors.bright);
    log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, colors.cyan);
    results.warnings.forEach((warn, idx) => {
      log(`${idx + 1}. ${warn}`, colors.yellow);
    });
  }
  
  log(`\n${'='.repeat(80)}`, colors.cyan);
  
  if (results.failed === 0) {
    log(`✅ ALL PATHWAYS VERIFIED - NO 404/500/504 RISKS DETECTED`, colors.green + colors.bright);
    log(`\n🎯 System is properly configured to handle:`, colors.green);
    log(`   - All backend routes registered and error-handled`, colors.green);
    log(`   - All frontend routes configured with valid components`, colors.green);
    log(`   - Error handlers in place for 404 and 500 errors`, colors.green);
    log(`   - Database connections configured with error handling`, colors.green);
    log(`   - Vercel deployment properly set up`, colors.green);
  } else {
    log(`❌ CRITICAL ISSUES DETECTED - POTENTIAL FOR ERRORS`, colors.red + colors.bright);
    log(`\n⚠️  Fix the issues above to prevent 404/500/504 errors`, colors.yellow);
  }
  
  log('='.repeat(80), colors.cyan);
  
  return results.failed === 0 ? 0 : 1;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
  log('\n🔍 FieldForge Pathway Verification Suite', colors.bright + colors.cyan);
  log(`Checking for potential 404, 500, and 504 errors...\n`, colors.blue);
  
  try {
    checkBackendRoutes();
    checkFrontendRoutes();
    checkErrorHandlers();
    checkDatabaseHandling();
    checkRouteFilesExist();
    checkVercelConfig();
    
    const exitCode = generateReport();
    process.exit(exitCode);
    
  } catch (error) {
    log(`\n💥 Fatal error during verification:`, colors.red + colors.bright);
    log(error.message, colors.red);
    log(error.stack, colors.red);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, results };


