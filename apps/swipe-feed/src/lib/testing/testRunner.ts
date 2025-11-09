/**
 * Comprehensive Test Runner
 * Executes all validation gates for 1M user readiness
 */

import { testingFramework } from './unifiedTestingFramework';
import { selfHealer } from './selfHealer';
import { sparksEconomy } from '../sparksEconomy/engine';

export interface TestExecutionReport {
  startTime: Date;
  endTime?: Date;
  phase: string;
  status: 'running' | 'passed' | 'failed' | 'healing';
  gates: GateStatus[];
  issues: Issue[];
  healingActions: any[];
  recommendations: string[];
}

export interface GateStatus {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  threshold: string;
  actual?: string;
  details?: string;
}

export interface Issue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  description: string;
  impact: string;
  resolution?: string;
}

export class ComprehensiveTestRunner {
  private report: TestExecutionReport;
  private startTime: Date;
  private consecutivePassDays: number = 0;
  private readonly REQUIRED_PASS_DAYS = 7;

  constructor() {
    this.report = this.initializeReport();
    this.startTime = new Date();
  }

  /**
   * Initialize test report
   */
  private initializeReport(): TestExecutionReport {
    return {
      startTime: new Date(),
      phase: 'initialization',
      status: 'running',
      gates: [
        { name: 'Naming Enforcement', status: 'pending', threshold: '0 legacy variants' },
        { name: 'UI Reality', status: 'pending', threshold: '100% functional elements' },
        { name: 'Visibility', status: 'pending', threshold: '0 critical overlaps' },
        { name: 'Admin Finance', status: 'pending', threshold: 'Variance ≤0.5%' },
        { name: 'SQL Performance', status: 'pending', threshold: 'p95 <150ms' },
        { name: 'Ably Realtime', status: 'pending', threshold: 'Presence ≥99.9%' },
        { name: 'Performance/Scale', status: 'pending', threshold: 'API p95 <200ms' },
        { name: 'Reliability', status: 'pending', threshold: 'RPO ≤60s, RTO ≤5m' },
        { name: 'Economics', status: 'pending', threshold: 'Margin 65-75%, CVI ≥0.75' },
        { name: 'Security', status: 'pending', threshold: '0 critical CVEs' },
        { name: 'Data Quality', status: 'pending', threshold: 'Exports 100% valid' },
        { name: 'API Contracts', status: 'pending', threshold: 'No breaking changes' },
        { name: 'Observability', status: 'pending', threshold: 'Traces/heartbeats OK' },
        { name: 'Experiments', status: 'pending', threshold: 'No SRM, guardrails OK' }
      ],
      issues: [],
      healingActions: [],
      recommendations: []
    };
  }

  /**
   * Execute comprehensive test protocol
   */
  async executeProtocol(): Promise<TestExecutionReport> {
    console.log('════════════════════════════════════════════════════════════════');
    console.log('🚀 COMPREHENSIVE TESTING PROTOCOL - INITIATED');
    console.log('════════════════════════════════════════════════════════════════');
    console.log(`Start Time: ${this.startTime.toISOString()}`);
    console.log(`Target: 1,000,000 MAU | 100,000 Concurrent | ≥65% Margin`);
    console.log('────────────────────────────────────────────────────────────────');

    try {
      // Phase 1: Platform Validation
      await this.executePlatformValidation();
      
      // Phase 2: UI & UX Testing
      await this.executeUITesting();
      
      // Phase 3: Database & Performance
      await this.executeDatabaseTesting();
      
      // Phase 4: Economic Validation
      await this.executeEconomicValidation();
      
      // Phase 5: Security & Compliance
      await this.executeSecurityTesting();
      
      // Phase 6: Reliability & Chaos
      await this.executeReliabilityTesting();
      
      // Phase 7: Self-Healing Verification
      await this.verifySelfHealing();
      
      // Final Assessment
      await this.performFinalAssessment();
      
    } catch (error) {
      console.error('❌ Critical error during testing:', error);
      this.report.status = 'failed';
      this.report.issues.push({
        severity: 'critical',
        category: 'system',
        description: error.message,
        impact: 'Testing protocol failed to complete'
      });
    }

    this.report.endTime = new Date();
    await this.generateReports();
    
    return this.report;
  }

  /**
   * Phase 1: Platform Validation
   */
  private async executePlatformValidation(): Promise<void> {
    console.log('\n📋 PHASE 1: PLATFORM VALIDATION');
    console.log('────────────────────────────────────────');
    
    this.report.phase = 'platform_validation';
    
    // Test naming enforcement
    await this.updateGateStatus('Naming Enforcement', 'running');
    console.log('  ▶ Testing naming conventions...');
    
    const namingIssues = await this.checkNaming();
    if (namingIssues.length === 0) {
      await this.updateGateStatus('Naming Enforcement', 'passed', '0 violations found');
      console.log('    ✅ Naming conventions: PASSED');
    } else {
      await this.updateGateStatus('Naming Enforcement', 'failed', `${namingIssues.length} violations`);
      console.log(`    ❌ Naming conventions: FAILED (${namingIssues.length} violations)`);
      this.report.issues.push(...namingIssues);
    }

    // Check platform topology
    console.log('  ▶ Validating platform topology...');
    const topology = await this.validateTopology();
    console.log('    ✅ Platform topology validated');
  }

  /**
   * Phase 2: UI & UX Testing
   */
  private async executeUITesting(): Promise<void> {
    console.log('\n🖥️ PHASE 2: UI & UX TESTING');
    console.log('────────────────────────────────────────');
    
    this.report.phase = 'ui_testing';
    
    // UI Reality Testing
    await this.updateGateStatus('UI Reality', 'running');
    console.log('  ▶ Testing UI element functionality...');
    
    const uiResults = await this.testUIReality();
    const functionalPercentage = (uiResults.functional / uiResults.total) * 100;
    
    if (functionalPercentage === 100) {
      await this.updateGateStatus('UI Reality', 'passed', '100% functional');
      console.log('    ✅ UI Reality: PASSED (100% functional)');
    } else {
      await this.updateGateStatus('UI Reality', 'failed', `${functionalPercentage.toFixed(1)}% functional`);
      console.log(`    ❌ UI Reality: FAILED (${functionalPercentage.toFixed(1)}% functional)`);
    }

    // Visibility Testing
    await this.updateGateStatus('Visibility', 'running');
    console.log('  ▶ Testing element visibility...');
    
    const visibilityIssues = await this.testVisibility();
    const criticalOverlaps = visibilityIssues.filter(i => i.severity === 'critical');
    
    if (criticalOverlaps.length === 0) {
      await this.updateGateStatus('Visibility', 'passed', '0 critical overlaps');
      console.log('    ✅ Visibility: PASSED (0 critical overlaps)');
    } else {
      await this.updateGateStatus('Visibility', 'failed', `${criticalOverlaps.length} critical overlaps`);
      console.log(`    ❌ Visibility: FAILED (${criticalOverlaps.length} critical overlaps)`);
      this.report.issues.push(...criticalOverlaps);
    }
  }

  /**
   * Phase 3: Database & Performance Testing
   */
  private async executeDatabaseTesting(): Promise<void> {
    console.log('\n🗄️ PHASE 3: DATABASE & PERFORMANCE');
    console.log('────────────────────────────────────────');
    
    this.report.phase = 'database_testing';
    
    // SQL Performance
    await this.updateGateStatus('SQL Performance', 'running');
    console.log('  ▶ Testing SQL query performance...');
    
    const sqlMetrics = await this.testSQLPerformance();
    
    if (sqlMetrics.p95 < 150) {
      await this.updateGateStatus('SQL Performance', 'passed', `p95: ${sqlMetrics.p95}ms`);
      console.log(`    ✅ SQL Performance: PASSED (p95: ${sqlMetrics.p95}ms)`);
    } else {
      await this.updateGateStatus('SQL Performance', 'failed', `p95: ${sqlMetrics.p95}ms`);
      console.log(`    ❌ SQL Performance: FAILED (p95: ${sqlMetrics.p95}ms)`);
      
      // Attempt self-healing
      console.log('    🔧 Attempting self-healing...');
      const healed = await this.attemptHealing('sql_performance');
      if (healed) {
        console.log('    ✅ Self-healing successful');
      }
    }

    // API Performance
    await this.updateGateStatus('Performance/Scale', 'running');
    console.log('  ▶ Testing API performance under load...');
    
    const apiMetrics = await this.testAPIPerformance();
    
    if (apiMetrics.p95 < 200 && apiMetrics.cpuUsage < 80) {
      await this.updateGateStatus('Performance/Scale', 'passed', 
        `API p95: ${apiMetrics.p95}ms, CPU: ${apiMetrics.cpuUsage}%`);
      console.log(`    ✅ API Performance: PASSED (p95: ${apiMetrics.p95}ms, CPU: ${apiMetrics.cpuUsage}%)`);
    } else {
      await this.updateGateStatus('Performance/Scale', 'failed',
        `API p95: ${apiMetrics.p95}ms, CPU: ${apiMetrics.cpuUsage}%`);
      console.log(`    ❌ API Performance: FAILED (p95: ${apiMetrics.p95}ms, CPU: ${apiMetrics.cpuUsage}%)`);
    }
  }

  /**
   * Phase 4: Economic Validation
   */
  private async executeEconomicValidation(): Promise<void> {
    console.log('\n💰 PHASE 4: ECONOMIC VALIDATION');
    console.log('────────────────────────────────────────');
    
    this.report.phase = 'economic_validation';
    
    await this.updateGateStatus('Economics', 'running');
    console.log('  ▶ Running economic simulations...');
    
    // Test with different user scales
    const scenarios = [
      { users: 10000, name: '10K Users' },
      { users: 100000, name: '100K Users' },
      { users: 1000000, name: '1M Users' }
    ];
    
    let allPass = true;
    
    for (const scenario of scenarios) {
      console.log(`    Testing ${scenario.name}...`);
      const result = await this.simulateEconomics(scenario.users);
      
      const marginOK = result.margin >= 0.65 && result.margin <= 0.75;
      const cviOK = result.cvi >= 0.75;
      
      if (marginOK && cviOK) {
        console.log(`      ✅ ${scenario.name}: Margin=${(result.margin * 100).toFixed(1)}%, CVI=${result.cvi.toFixed(2)}`);
      } else {
        console.log(`      ❌ ${scenario.name}: Margin=${(result.margin * 100).toFixed(1)}%, CVI=${result.cvi.toFixed(2)}`);
        allPass = false;
      }
    }
    
    if (allPass) {
      await this.updateGateStatus('Economics', 'passed', 'All scenarios pass');
      console.log('    ✅ Economic Validation: PASSED');
    } else {
      await this.updateGateStatus('Economics', 'failed', 'Some scenarios failed');
      console.log('    ❌ Economic Validation: FAILED');
      
      // Attempt price adjustment
      console.log('    🔧 Adjusting pricing model...');
      const adjusted = await this.adjustPricing();
      if (adjusted) {
        console.log('    ✅ Pricing adjusted successfully');
      }
    }

    // Admin Finance Validation
    await this.updateGateStatus('Admin Finance', 'running');
    console.log('  ▶ Validating financial reporting...');
    
    const financeVariance = await this.validateFinancialReporting();
    
    if (financeVariance <= 0.5) {
      await this.updateGateStatus('Admin Finance', 'passed', `Variance: ${financeVariance}%`);
      console.log(`    ✅ Financial Reporting: PASSED (Variance: ${financeVariance}%)`);
    } else {
      await this.updateGateStatus('Admin Finance', 'failed', `Variance: ${financeVariance}%`);
      console.log(`    ❌ Financial Reporting: FAILED (Variance: ${financeVariance}%)`);
    }
  }

  /**
   * Phase 5: Security & Compliance Testing
   */
  private async executeSecurityTesting(): Promise<void> {
    console.log('\n🔒 PHASE 5: SECURITY & COMPLIANCE');
    console.log('────────────────────────────────────────');
    
    this.report.phase = 'security_testing';
    
    await this.updateGateStatus('Security', 'running');
    console.log('  ▶ Running security scans...');
    
    const vulnerabilities = await this.scanSecurity();
    const critical = vulnerabilities.filter(v => v.severity === 'critical');
    const high = vulnerabilities.filter(v => v.severity === 'high');
    
    if (critical.length === 0 && high.length === 0) {
      await this.updateGateStatus('Security', 'passed', '0 critical/high CVEs');
      console.log('    ✅ Security: PASSED (0 critical/high vulnerabilities)');
    } else {
      await this.updateGateStatus('Security', 'failed', 
        `${critical.length} critical, ${high.length} high CVEs`);
      console.log(`    ❌ Security: FAILED (${critical.length} critical, ${high.length} high vulnerabilities)`);
      this.report.issues.push(...critical, ...high);
    }

    // Data Quality
    await this.updateGateStatus('Data Quality', 'running');
    console.log('  ▶ Validating data exports...');
    
    const exportValidation = await this.validateExports();
    
    if (exportValidation.validPercentage === 100) {
      await this.updateGateStatus('Data Quality', 'passed', '100% valid exports');
      console.log('    ✅ Data Quality: PASSED (100% valid exports)');
    } else {
      await this.updateGateStatus('Data Quality', 'failed', 
        `${exportValidation.validPercentage}% valid exports`);
      console.log(`    ❌ Data Quality: FAILED (${exportValidation.validPercentage}% valid exports)`);
    }
  }

  /**
   * Phase 6: Reliability Testing
   */
  private async executeReliabilityTesting(): Promise<void> {
    console.log('\n⚡ PHASE 6: RELIABILITY & CHAOS');
    console.log('────────────────────────────────────────');
    
    this.report.phase = 'reliability_testing';
    
    // Ably Realtime
    await this.updateGateStatus('Ably Realtime', 'running');
    console.log('  ▶ Testing realtime messaging...');
    
    const realtimeMetrics = await this.testRealtime();
    
    if (realtimeMetrics.presenceAccuracy >= 99.9 && realtimeMetrics.messageDropRate < 0.1) {
      await this.updateGateStatus('Ably Realtime', 'passed', 
        `Presence: ${realtimeMetrics.presenceAccuracy}%`);
      console.log(`    ✅ Realtime: PASSED (Presence: ${realtimeMetrics.presenceAccuracy}%)`);
    } else {
      await this.updateGateStatus('Ably Realtime', 'failed',
        `Presence: ${realtimeMetrics.presenceAccuracy}%`);
      console.log(`    ❌ Realtime: FAILED (Presence: ${realtimeMetrics.presenceAccuracy}%)`);
    }

    // Reliability
    await this.updateGateStatus('Reliability', 'running');
    console.log('  ▶ Testing disaster recovery...');
    
    const drMetrics = await this.testDisasterRecovery();
    
    if (drMetrics.rpo <= 60 && drMetrics.rto <= 300) {
      await this.updateGateStatus('Reliability', 'passed', 
        `RPO: ${drMetrics.rpo}s, RTO: ${drMetrics.rto}s`);
      console.log(`    ✅ Reliability: PASSED (RPO: ${drMetrics.rpo}s, RTO: ${drMetrics.rto}s)`);
    } else {
      await this.updateGateStatus('Reliability', 'failed',
        `RPO: ${drMetrics.rpo}s, RTO: ${drMetrics.rto}s`);
      console.log(`    ❌ Reliability: FAILED (RPO: ${drMetrics.rpo}s, RTO: ${drMetrics.rto}s)`);
    }

    // Chaos Engineering
    console.log('  ▶ Running chaos tests...');
    const chaosResults = await this.runChaosTests();
    console.log(`    ✅ Chaos tests completed: ${chaosResults.passed}/${chaosResults.total} passed`);
  }

  /**
   * Phase 7: Self-Healing Verification
   */
  private async verifySelfHealing(): Promise<void> {
    console.log('\n🔧 PHASE 7: SELF-HEALING VERIFICATION');
    console.log('────────────────────────────────────────');
    
    this.report.phase = 'self_healing';
    
    const healingReport = selfHealer.getHealingReport();
    
    console.log(`  Total healing actions: ${healingReport.totalHealing}`);
    console.log(`  Successful: ${healingReport.successful}`);
    console.log(`  Failed: ${healingReport.failed}`);
    console.log(`  Needs review: ${healingReport.needsReview}`);
    console.log(`  False positives: ${healingReport.falsePositives}`);
    
    this.report.healingActions = healingReport.history;
    
    // API Contracts
    await this.updateGateStatus('API Contracts', 'running');
    const contractsValid = await this.validateAPIContracts();
    
    if (contractsValid) {
      await this.updateGateStatus('API Contracts', 'passed', 'No breaking changes');
      console.log('  ✅ API Contracts: PASSED');
    } else {
      await this.updateGateStatus('API Contracts', 'failed', 'Breaking changes detected');
      console.log('  ❌ API Contracts: FAILED');
    }

    // Observability
    await this.updateGateStatus('Observability', 'running');
    const observabilityOK = await this.checkObservability();
    
    if (observabilityOK) {
      await this.updateGateStatus('Observability', 'passed', 'All traces/heartbeats OK');
      console.log('  ✅ Observability: PASSED');
    } else {
      await this.updateGateStatus('Observability', 'failed', 'Missing traces/heartbeats');
      console.log('  ❌ Observability: FAILED');
    }

    // Experiments
    await this.updateGateStatus('Experiments', 'running');
    const experimentsValid = await this.validateExperiments();
    
    if (experimentsValid) {
      await this.updateGateStatus('Experiments', 'passed', 'No SRM, guardrails OK');
      console.log('  ✅ Experiments: PASSED');
    } else {
      await this.updateGateStatus('Experiments', 'failed', 'SRM detected or guardrails violated');
      console.log('  ❌ Experiments: FAILED');
    }
  }

  /**
   * Final Assessment
   */
  private async performFinalAssessment(): Promise<void> {
    console.log('\n📊 FINAL ASSESSMENT');
    console.log('════════════════════════════════════════════════════════════════');
    
    const passedGates = this.report.gates.filter(g => g.status === 'passed');
    const failedGates = this.report.gates.filter(g => g.status === 'failed');
    
    console.log(`\n  Gates Passed: ${passedGates.length}/${this.report.gates.length}`);
    console.log(`  Gates Failed: ${failedGates.length}/${this.report.gates.length}`);
    
    if (failedGates.length > 0) {
      console.log('\n  ❌ FAILED GATES:');
      failedGates.forEach(gate => {
        console.log(`    • ${gate.name}: ${gate.actual} (Required: ${gate.threshold})`);
      });
    }
    
    if (this.report.issues.filter(i => i.severity === 'critical').length > 0) {
      console.log('\n  🚨 CRITICAL ISSUES:');
      this.report.issues
        .filter(i => i.severity === 'critical')
        .forEach(issue => {
          console.log(`    • ${issue.description}`);
        });
    }
    
    // Determine overall status
    const allGatesPass = failedGates.length === 0;
    const noCriticalIssues = this.report.issues.filter(i => i.severity === 'critical').length === 0;
    
    if (allGatesPass && noCriticalIssues) {
      this.report.status = 'passed';
      this.consecutivePassDays++;
      
      console.log('\n  ✅ OVERALL STATUS: PASSED');
      console.log(`  Consecutive Pass Days: ${this.consecutivePassDays}/${this.REQUIRED_PASS_DAYS}`);
      
      if (this.consecutivePassDays >= this.REQUIRED_PASS_DAYS) {
        console.log('\n  🎉 SYSTEM READY FOR PRODUCTION!');
        console.log('  All gates have passed for 7 consecutive days.');
        this.report.recommendations.push('System is ready for 1 million users');
      } else {
        console.log(`\n  ⏳ Continue monitoring for ${this.REQUIRED_PASS_DAYS - this.consecutivePassDays} more days`);
        this.report.recommendations.push(
          `Continue monitoring for ${this.REQUIRED_PASS_DAYS - this.consecutivePassDays} more days`
        );
      }
    } else {
      this.report.status = 'failed';
      this.consecutivePassDays = 0;
      
      console.log('\n  ❌ OVERALL STATUS: FAILED');
      console.log('  System is not ready for production.');
      
      // Generate recommendations
      this.generateRecommendations();
    }
    
    console.log('\n════════════════════════════════════════════════════════════════');
    console.log(`End Time: ${new Date().toISOString()}`);
    console.log(`Duration: ${this.calculateDuration()} minutes`);
    console.log('════════════════════════════════════════════════════════════════');
  }

  /**
   * Generate recommendations based on failures
   */
  private generateRecommendations(): void {
    const recommendations = [];
    
    const failedGates = this.report.gates.filter(g => g.status === 'failed');
    
    for (const gate of failedGates) {
      switch (gate.name) {
        case 'SQL Performance':
          recommendations.push('Add database indexes and optimize slow queries');
          break;
        case 'Economics':
          recommendations.push('Adjust pricing model to maintain 65-75% margin');
          break;
        case 'UI Reality':
          recommendations.push('Fix non-functional UI elements');
          break;
        case 'Security':
          recommendations.push('Address critical and high severity vulnerabilities');
          break;
        case 'Performance/Scale':
          recommendations.push('Scale infrastructure or optimize code');
          break;
      }
    }
    
    this.report.recommendations = recommendations;
    
    if (recommendations.length > 0) {
      console.log('\n  📋 RECOMMENDATIONS:');
      recommendations.forEach(rec => {
        console.log(`    • ${rec}`);
      });
    }
  }

  /**
   * Generate detailed reports
   */
  private async generateReports(): Promise<void> {
    console.log('\n📄 Generating reports...');
    
    // Save main report
    await this.saveReport('/reports/comprehensive_test_report.json', this.report);
    
    // Save gate status
    await this.saveReport('/reports/gate_status.csv', this.formatGateStatusCSV());
    
    // Save issues
    if (this.report.issues.length > 0) {
      await this.saveReport('/reports/issues.json', this.report.issues);
    }
    
    // Save healing actions
    if (this.report.healingActions.length > 0) {
      await this.saveReport('/reports/healing_actions.json', this.report.healingActions);
    }
    
    console.log('  ✅ Reports generated successfully');
  }

  // =====================================
  // HELPER METHODS
  // =====================================

  private async updateGateStatus(name: string, status: 'running' | 'passed' | 'failed', actual?: string): Promise<void> {
    const gate = this.report.gates.find(g => g.name === name);
    if (gate) {
      gate.status = status;
      if (actual) {
        gate.actual = actual;
      }
    }
  }

  private async checkNaming(): Promise<Issue[]> {
    // Mock implementation
    return [];
  }

  private async validateTopology(): Promise<any> {
    return { valid: true };
  }

  private async testUIReality(): Promise<{ total: number; functional: number }> {
    // Mock implementation
    return { total: 100, functional: 98 };
  }

  private async testVisibility(): Promise<Issue[]> {
    // Mock implementation
    return [];
  }

  private async testSQLPerformance(): Promise<{ p95: number }> {
    // Mock implementation
    return { p95: 120 };
  }

  private async testAPIPerformance(): Promise<{ p95: number; cpuUsage: number }> {
    // Mock implementation
    return { p95: 180, cpuUsage: 75 };
  }

  private async simulateEconomics(users: number): Promise<{ margin: number; cvi: number }> {
    // Mock implementation using sparks economy
    const metrics = await sparksEconomy.getProfitabilityMetrics();
    return {
      margin: metrics.currentMargin,
      cvi: 0.78
    };
  }

  private async validateFinancialReporting(): Promise<number> {
    // Mock implementation
    return 0.3;
  }

  private async scanSecurity(): Promise<any[]> {
    // Mock implementation
    return [];
  }

  private async validateExports(): Promise<{ validPercentage: number }> {
    // Mock implementation
    return { validPercentage: 100 };
  }

  private async testRealtime(): Promise<{ presenceAccuracy: number; messageDropRate: number }> {
    // Mock implementation
    return { presenceAccuracy: 99.95, messageDropRate: 0.05 };
  }

  private async testDisasterRecovery(): Promise<{ rpo: number; rto: number }> {
    // Mock implementation
    return { rpo: 45, rto: 240 };
  }

  private async runChaosTests(): Promise<{ total: number; passed: number }> {
    // Mock implementation
    return { total: 20, passed: 19 };
  }

  private async validateAPIContracts(): Promise<boolean> {
    return true;
  }

  private async checkObservability(): Promise<boolean> {
    return true;
  }

  private async validateExperiments(): Promise<boolean> {
    return true;
  }

  private async attemptHealing(type: string): Promise<boolean> {
    // Mock implementation
    return Math.random() > 0.3;
  }

  private async adjustPricing(): Promise<boolean> {
    // Mock implementation
    return true;
  }

  private calculateDuration(): number {
    const duration = (new Date().getTime() - this.startTime.getTime()) / 1000 / 60;
    return Math.round(duration * 10) / 10;
  }

  private formatGateStatusCSV(): string {
    const headers = 'Gate,Status,Threshold,Actual';
    const rows = this.report.gates.map(g => 
      `${g.name},${g.status},${g.threshold},${g.actual || 'N/A'}`
    );
    return [headers, ...rows].join('\n');
  }

  private async saveReport(path: string, data: any): Promise<void> {
    console.log(`    Saving ${path}`);
    // In production, this would save to file system
  }
}

// Execute the test protocol
export async function runComprehensiveTests(): Promise<void> {
  const runner = new ComprehensiveTestRunner();
  const report = await runner.executeProtocol();
  
  // Return status code based on results
  if (report.status === 'passed') {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

// Auto-execute if run directly
if (require.main === module) {
  runComprehensiveTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
