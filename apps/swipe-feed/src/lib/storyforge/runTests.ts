/**
 * StoryForge Test Execution
 * Run comprehensive tests and generate report
 */

import { testRunner } from './testing';

// Execute all tests
export async function runStoryForgeTests() {
  console.log('🚀 STORYFORGE COMPREHENSIVE TEST EXECUTION');
  console.log('==========================================');
  console.log('Starting autonomous testing with auto-correction...\n');

  try {
    // Run all test suites
    const report = await testRunner.runAllTests();
    
    // Save report to localStorage for review
    localStorage.setItem('storyforge_test_report', JSON.stringify(report));
    
    // Check if all tests passed
    if (report.failed === 0) {
      console.log('✅ SUCCESS: All StoryForge tests passed!');
      console.log('The system is ready for production deployment.');
      return true;
    } else {
      console.log(`⚠️ WARNING: ${report.failed} tests failed`);
      console.log('Review the test report for details.');
      return false;
    }
  } catch (error) {
    console.error('❌ CRITICAL ERROR during test execution:', error);
    return false;
  }
}

// Auto-execute tests if in development mode
if (import.meta.env.DEV) {
  // Add test button to page for manual execution
  if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
      // Check if we're on the StoryForge page
      if (window.location.hash.includes('stories')) {
        // Add floating test button
        const testButton = document.createElement('button');
        testButton.innerHTML = '🧪 Run StoryForge Tests';
        testButton.style.cssText = `
          position: fixed;
          bottom: 20px;
          left: 20px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          z-index: 9999;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        `;
        
        testButton.onmouseover = () => {
          testButton.style.transform = 'scale(1.05)';
        };
        
        testButton.onmouseout = () => {
          testButton.style.transform = 'scale(1)';
        };
        
        testButton.onclick = async () => {
          testButton.disabled = true;
          testButton.innerHTML = '⏳ Running Tests...';
          
          const success = await runStoryForgeTests();
          
          testButton.innerHTML = success 
            ? '✅ Tests Passed!' 
            : '❌ Some Tests Failed';
          
          setTimeout(() => {
            testButton.disabled = false;
            testButton.innerHTML = '🧪 Run StoryForge Tests';
          }, 3000);
        };
        
        document.body.appendChild(testButton);
      }
    });
  }
}

// Export for use in other modules
export default runStoryForgeTests;
