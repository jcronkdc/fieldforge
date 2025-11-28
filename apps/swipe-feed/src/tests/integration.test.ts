/**
 * FieldForge Integration Tests
 * Run these tests to verify all features are working correctly
 * 
 * Note: This file is designed to be run in the browser via TestRunner.tsx
 */

import { supabase } from '../lib/supabase';

// Test configuration
const TEST_EMAIL = `test_${Date.now()}@fieldforge.com`;
const TEST_PASSWORD = 'TestPassword123!';
const DEMO_EMAIL = 'demo@fieldforge.com';
const DEMO_PASSWORD = 'FieldForge2025!Demo';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// Test result tracking
let passedTests = 0;
let failedTests = 0;
const testResults: { name: string; passed: boolean; error?: string }[] = [];

// Helper function to log test results
function logTest(name: string, passed: boolean, error?: string) {
  const status = passed 
    ? `${colors.green}✓ PASS${colors.reset}` 
    : `${colors.red}✗ FAIL${colors.reset}`;
  
  console.log(`${status} ${name}`);
  if (error) {
    console.log(`  ${colors.red}Error: ${error}${colors.reset}`);
  }
  
  if (passed) passedTests++;
  else failedTests++;
  
  testResults.push({ name, passed, error });
}

// Test Suite
export async function runIntegrationTests() {
  console.log(`\n${colors.cyan}${colors.bold}========================================`);
  console.log(`       FieldForge Integration Tests     `);
  console.log(`========================================${colors.reset}\n`);

  // 1. Test Supabase Connection
  await testSupabaseConnection();
  
  // 2. Test Authentication
  await testAuthentication();
  
  // 3. Test Demo Account
  await testDemoAccount();
  
  // 4. Test Project Management
  await testProjectManagement();
  
  // 5. Test Social Feed
  await testSocialFeed();
  
  // 6. Test Database Tables
  await testDatabaseTables();
  
  // Print summary
  printTestSummary();
}

// Test Functions

async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    logTest('Supabase Connection', true);
  } catch (error: any) {
    logTest('Supabase Connection', false, error.message);
  }
}

async function testAuthentication() {
  // Test Sign Up
  try {
    const { data, error } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
          company: 'Test Co',
          job_title: 'Tester',
        }
      }
    });
    
    if (error) throw error;
    logTest('User Sign Up', true);
    
    // Clean up - sign out
    await supabase.auth.signOut();
  } catch (error: any) {
    logTest('User Sign Up', false, error.message);
  }
  
  // Test Sign In
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    
    if (error) throw error;
    logTest('User Sign In', true);
    
    // Test Sign Out
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) throw signOutError;
    logTest('User Sign Out', true);
    
  } catch (error: any) {
    logTest('User Sign In', false, error.message);
  }
}

async function testDemoAccount() {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });
    
    if (error) throw error;
    logTest('Demo Account Login', true);
    
    // Check demo user profile exists
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', DEMO_EMAIL)
      .single();
    
    if (profileError) throw profileError;
    logTest('Demo User Profile', true);
    
    await supabase.auth.signOut();
  } catch (error: any) {
    logTest('Demo Account', false, error.message);
  }
}

async function testProjectManagement() {
  try {
    // Sign in as demo user
    await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });
    
    // Test fetching projects
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .limit(5);
    
    if (projectError) throw projectError;
    logTest('Fetch Projects', true);
    
    // Test project team
    if (projects && projects.length > 0) {
      const { data: team, error: teamError } = await supabase
        .from('project_team')
        .select('*')
        .eq('project_id', projects[0].id)
        .limit(5);
      
      if (teamError) throw teamError;
      logTest('Fetch Project Team', true);
    }
    
    await supabase.auth.signOut();
  } catch (error: any) {
    logTest('Project Management', false, error.message);
  }
}

async function testSocialFeed() {
  try {
    // Sign in as demo user
    await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });
    
    // Test creating a post
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('No user found');
    
    // Get a project first
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .limit(1);
    
    if (!projects || projects.length === 0) {
      logTest('Social Feed - No Projects', false, 'No projects to post to');
      return;
    }
    
    const { data: post, error: postError } = await supabase
      .from('feed_posts')
      .insert({
        project_id: projects[0].id,
        author_id: user.user.id,
        post_type: 'update',
        content: 'Integration test post',
        visibility: 'project'
      })
      .select()
      .single();
    
    if (postError) throw postError;
    logTest('Create Feed Post', true);
    
    // Test fetching posts
    const { data: posts, error: fetchError } = await supabase
      .from('feed_posts')
      .select('*')
      .limit(10);
    
    if (fetchError) throw fetchError;
    logTest('Fetch Feed Posts', true);
    
    // Clean up - delete test post
    if (post) {
      await supabase
        .from('feed_posts')
        .delete()
        .eq('id', post.id);
    }
    
    await supabase.auth.signOut();
  } catch (error: any) {
    logTest('Social Feed', false, error.message);
  }
}

async function testDatabaseTables() {
  const tables = [
    'user_profiles',
    'projects',
    'project_team',
    'project_invitations',
    'crew_assignments',
    'crew_members',
    'feed_posts',
    'feed_reactions',
    'feed_comments'
  ];
  
  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error && !error.message.includes('no rows')) {
        throw error;
      }
      logTest(`Table: ${table}`, true);
    } catch (error: any) {
      logTest(`Table: ${table}`, false, error.message);
    }
  }
}

function printTestSummary() {
  console.log(`\n${colors.cyan}${colors.bold}========================================`);
  console.log(`              Test Summary              `);
  console.log(`========================================${colors.reset}\n`);
  
  const total = passedTests + failedTests;
  const passRate = total > 0 ? ((passedTests / total) * 100).toFixed(1) : '0';
  
  console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
  console.log(`Total: ${total}`);
  console.log(`Pass Rate: ${passRate}%\n`);
  
  if (failedTests > 0) {
    console.log(`${colors.red}Failed Tests:${colors.reset}`);
    testResults
      .filter(t => !t.passed)
      .forEach(t => {
        console.log(`  - ${t.name}`);
        if (t.error) {
          console.log(`    ${colors.yellow}${t.error}${colors.reset}`);
        }
      });
  }
  
  if (passedTests === total) {
    console.log(`\n${colors.green}${colors.bold}🎉 All tests passed! FieldForge is ready!${colors.reset}\n`);
  } else {
    console.log(`\n${colors.red}${colors.bold}⚠️  Some tests failed. Please review and fix issues.${colors.reset}\n`);
  }
}

// Tests can be run manually via TestRunner.tsx or the browser console:
// import { runIntegrationTests } from './tests/integration.test';
// runIntegrationTests();
