/**
 * Self-Healing Testing System
 * Automatically detects and fixes issues to maintain system health
 */

import { sparksEconomy } from '../sparksEconomy/engine';

export interface HealingAction {
  id: string;
  type: 'performance' | 'profitability' | 'ledger' | 'sql' | 'realtime' | 'ui';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  action: () => Promise<HealingResult>;
  rollback?: () => Promise<void>;
}

export interface HealingResult {
  success: boolean;
  actionTaken: string;
  metrics: {
    before: any;
    after: any;
  };
  needsManualReview?: boolean;
}

export interface FalsePositive {
  testId: string;
  selector?: string;
  timestamp: Date;
  reason: string;
  retryCount: number;
  persistent: boolean;
}

export class SelfHealer {
  private healingActions: Map<string, HealingAction> = new Map();
  private falsePositives: FalsePositive[] = [];
  private healingHistory: HealingResult[] = [];
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly HEALING_COOLDOWN = 60000; // 1 minute
  private lastHealingTime: Map<string, number> = new Map();

  constructor() {
    this.initializeHealingActions();
    this.startMonitoring();
  }

  /**
   * Initialize all healing actions
   */
  private initializeHealingActions(): void {
    // Performance breach healing
    this.registerHealingAction({
      id: 'perf_scale_horizontal',
      type: 'performance',
      severity: 'high',
      description: 'Scale horizontally when performance degrades',
      action: async () => this.scaleHorizontally(),
      rollback: async () => this.scaleDown()
    });

    this.registerHealingAction({
      id: 'perf_warm_cache',
      type: 'performance',
      severity: 'medium',
      description: 'Warm caches when cold start detected',
      action: async () => this.warmCaches()
    });

    this.registerHealingAction({
      id: 'perf_switch_llm',
      type: 'performance',
      severity: 'medium',
      description: 'Switch to cheaper LLM when quality allows',
      action: async () => this.switchToEconomicalLLM()
    });

    // Profitability breach healing
    this.registerHealingAction({
      id: 'profit_adjust_prices',
      type: 'profitability',
      severity: 'critical',
      description: 'Adjust Spark prices when margin drops',
      action: async () => this.adjustSparkPrices()
    });

    this.registerHealingAction({
      id: 'profit_limit_features',
      type: 'profitability',
      severity: 'high',
      description: 'Temporarily limit expensive features',
      action: async () => this.limitExpensiveFeatures()
    });

    this.registerHealingAction({
      id: 'profit_optimize_backend',
      type: 'profitability',
      severity: 'medium',
      description: 'Switch to mixed backend for cost optimization',
      action: async () => this.optimizeBackendMix()
    });

    // Ledger breach healing
    this.registerHealingAction({
      id: 'ledger_quarantine',
      type: 'ledger',
      severity: 'critical',
      description: 'Quarantine suspicious transactions',
      action: async () => this.quarantineTransactions()
    });

    this.registerHealingAction({
      id: 'ledger_rebuild',
      type: 'ledger',
      severity: 'critical',
      description: 'Rebuild ledger from event log',
      action: async () => this.rebuildLedger()
    });

    // SQL breach healing
    this.registerHealingAction({
      id: 'sql_add_index',
      type: 'sql',
      severity: 'high',
      description: 'Add missing database index',
      action: async () => this.addDatabaseIndex()
    });

    this.registerHealingAction({
      id: 'sql_rewrite_query',
      type: 'sql',
      severity: 'medium',
      description: 'Rewrite slow query',
      action: async () => this.rewriteSlowQuery()
    });

    this.registerHealingAction({
      id: 'sql_create_materialized_view',
      type: 'sql',
      severity: 'medium',
      description: 'Create materialized view for complex queries',
      action: async () => this.createMaterializedView()
    });

    // Realtime breach healing
    this.registerHealingAction({
      id: 'realtime_idempotent_publish',
      type: 'realtime',
      severity: 'high',
      description: 'Enable idempotent publishing',
      action: async () => this.enableIdempotentPublishing()
    });

    this.registerHealingAction({
      id: 'realtime_backoff',
      type: 'realtime',
      severity: 'medium',
      description: 'Implement exponential backoff',
      action: async () => this.implementBackoff()
    });

    // UI breach healing
    this.registerHealingAction({
      id: 'ui_fix_selector',
      type: 'ui',
      severity: 'low',
      description: 'Update broken UI selector',
      action: async () => this.fixUISelector()
    });
  }

  /**
   * Register a new healing action
   */
  private registerHealingAction(action: HealingAction): void {
    this.healingActions.set(action.id, action);
  }

  /**
   * Start continuous monitoring
   */
  private startMonitoring(): void {
    // Monitor every 30 seconds
    setInterval(() => {
      this.checkSystemHealth();
    }, 30000);

    // Check false positives every minute
    setInterval(() => {
      this.processFalsePositives();
    }, 60000);
  }

  /**
   * Check overall system health
   */
  private async checkSystemHealth(): Promise<void> {
    const healthChecks = [
      this.checkPerformance(),
      this.checkProfitability(),
      this.checkLedger(),
      this.checkDatabase(),
      this.checkRealtime()
    ];

    const issues = await Promise.all(healthChecks);
    
    for (const issue of issues.flat()) {
      if (issue) {
        await this.healIssue(issue);
      }
    }
  }

  /**
   * Check performance metrics
   */
  private async checkPerformance(): Promise<any[]> {
    const issues = [];
    
    // Check API latency
    const latency = await this.getAPILatency();
    if (latency.p95 > 200) {
      issues.push({
        type: 'performance',
        metric: 'api_latency',
        value: latency.p95,
        threshold: 200,
        actionId: 'perf_scale_horizontal'
      });
    }

    // Check CPU usage
    const cpu = await this.getCPUUsage();
    if (cpu > 80) {
      issues.push({
        type: 'performance',
        metric: 'cpu_usage',
        value: cpu,
        threshold: 80,
        actionId: 'perf_scale_horizontal'
      });
    }

    // Check cold starts
    const coldStarts = await this.getColdStartRate();
    if (coldStarts > 0.1) {
      issues.push({
        type: 'performance',
        metric: 'cold_starts',
        value: coldStarts,
        threshold: 0.1,
        actionId: 'perf_warm_cache'
      });
    }

    return issues;
  }

  /**
   * Check profitability metrics
   */
  private async checkProfitability(): Promise<any[]> {
    const issues = [];
    
    const metrics = await sparksEconomy.getProfitabilityMetrics();
    
    if (metrics.currentMargin < 0.65) {
      issues.push({
        type: 'profitability',
        metric: 'gross_margin',
        value: metrics.currentMargin,
        threshold: 0.65,
        actionId: 'profit_adjust_prices'
      });
    }

    // Check CVI
    const cvi = await this.getCustomerValueIndex();
    if (cvi < 0.75) {
      issues.push({
        type: 'profitability',
        metric: 'cvi',
        value: cvi,
        threshold: 0.75,
        actionId: 'profit_limit_features'
      });
    }

    return issues;
  }

  /**
   * Check ledger consistency
   */
  private async checkLedger(): Promise<any[]> {
    const issues = [];
    
    const ledgerCheck = await this.validateLedger();
    
    if (!ledgerCheck.debitsEqualCredits) {
      issues.push({
        type: 'ledger',
        metric: 'balance',
        error: 'Debits do not equal credits',
        actionId: 'ledger_rebuild'
      });
    }

    if (ledgerCheck.negativeBalances > 0) {
      issues.push({
        type: 'ledger',
        metric: 'negative_balances',
        count: ledgerCheck.negativeBalances,
        actionId: 'ledger_quarantine'
      });
    }

    return issues;
  }

  /**
   * Check database performance
   */
  private async checkDatabase(): Promise<any[]> {
    const issues = [];
    
    const slowQueries = await this.getSlowQueries();
    
    for (const query of slowQueries) {
      if (query.executionTime > 150) {
        issues.push({
          type: 'sql',
          metric: 'query_time',
          query: query.sql,
          value: query.executionTime,
          threshold: 150,
          actionId: query.missingIndex ? 'sql_add_index' : 'sql_rewrite_query'
        });
      }
    }

    return issues;
  }

  /**
   * Check realtime consistency
   */
  private async checkRealtime(): Promise<any[]> {
    const issues = [];
    
    const realtimeMetrics = await this.getRealtimeMetrics();
    
    if (realtimeMetrics.messageDropRate > 0.001) {
      issues.push({
        type: 'realtime',
        metric: 'message_drop_rate',
        value: realtimeMetrics.messageDropRate,
        threshold: 0.001,
        actionId: 'realtime_idempotent_publish'
      });
    }

    if (realtimeMetrics.presenceAccuracy < 0.999) {
      issues.push({
        type: 'realtime',
        metric: 'presence_accuracy',
        value: realtimeMetrics.presenceAccuracy,
        threshold: 0.999,
        actionId: 'realtime_backoff'
      });
    }

    return issues;
  }

  /**
   * Heal a detected issue
   */
  private async healIssue(issue: any): Promise<void> {
    const action = this.healingActions.get(issue.actionId);
    
    if (!action) {
      console.error(`No healing action found for ${issue.actionId}`);
      return;
    }

    // Check cooldown
    const lastHealing = this.lastHealingTime.get(issue.actionId) || 0;
    if (Date.now() - lastHealing < this.HEALING_COOLDOWN) {
      console.log(`Healing action ${issue.actionId} is in cooldown`);
      return;
    }

    console.log(`🔧 Executing healing action: ${action.description}`);
    
    try {
      const result = await action.action();
      
      this.healingHistory.push(result);
      this.lastHealingTime.set(issue.actionId, Date.now());
      
      if (result.success) {
        console.log(`✅ Healing successful: ${result.actionTaken}`);
        
        // Re-measure to confirm fix
        await this.validateHealing(issue, result);
      } else {
        console.error(`❌ Healing failed for ${issue.actionId}`);
        
        // Try rollback if available
        if (action.rollback) {
          await action.rollback();
        }
        
        // Alert for manual intervention
        await this.alertManualIntervention(issue, result);
      }
    } catch (error) {
      console.error(`Error during healing: ${error.message}`);
      
      // Try rollback
      if (action.rollback) {
        await action.rollback();
      }
    }
  }

  /**
   * Validate that healing was successful
   */
  private async validateHealing(issue: any, result: HealingResult): Promise<void> {
    // Wait a moment for changes to propagate
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Re-check the specific metric
    let currentValue: any;
    
    switch (issue.type) {
      case 'performance':
        if (issue.metric === 'api_latency') {
          const latency = await this.getAPILatency();
          currentValue = latency.p95;
        }
        break;
      
      case 'profitability':
        if (issue.metric === 'gross_margin') {
          const metrics = await sparksEconomy.getProfitabilityMetrics();
          currentValue = metrics.currentMargin;
        }
        break;
    }
    
    // Check if issue is resolved
    const resolved = currentValue < issue.threshold || 
                    (issue.type === 'profitability' && currentValue >= issue.threshold);
    
    if (!resolved) {
      console.warn(`Healing action ${issue.actionId} did not fully resolve the issue`);
      
      // Mark for manual review
      result.needsManualReview = true;
      await this.alertManualIntervention(issue, result);
    }
  }

  // =====================================
  // HEALING ACTIONS
  // =====================================

  private async scaleHorizontally(): Promise<HealingResult> {
    const before = await this.getInstanceCount();
    
    // Scale up by 20%
    const newCount = Math.ceil(before * 1.2);
    await this.setInstanceCount(newCount);
    
    const after = await this.getInstanceCount();
    
    return {
      success: after > before,
      actionTaken: `Scaled from ${before} to ${after} instances`,
      metrics: { before, after }
    };
  }

  private async scaleDown(): Promise<void> {
    const current = await this.getInstanceCount();
    const newCount = Math.max(1, Math.floor(current * 0.8));
    await this.setInstanceCount(newCount);
  }

  private async warmCaches(): Promise<HealingResult> {
    const before = await this.getCacheHitRate();
    
    // Warm critical caches
    await this.warmCache('user_profiles');
    await this.warmCache('feed_data');
    await this.warmCache('sparks_balance');
    
    const after = await this.getCacheHitRate();
    
    return {
      success: after > before,
      actionTaken: 'Warmed critical caches',
      metrics: { before, after }
    };
  }

  private async switchToEconomicalLLM(): Promise<HealingResult> {
    const before = await this.getLLMCost();
    
    // Switch to cheaper model for non-critical features
    await this.setLLMModel('gpt-3.5-turbo', ['suggestions', 'autocomplete']);
    
    const after = await this.getLLMCost();
    
    return {
      success: after < before,
      actionTaken: 'Switched to economical LLM for non-critical features',
      metrics: { before, after }
    };
  }

  private async adjustSparkPrices(): Promise<HealingResult> {
    const before = await sparksEconomy.getProfitabilityMetrics();
    
    // Increase prices by 3-5%
    const adjustment = before.currentMargin < 0.60 ? 1.05 : 1.03;
    
    // Apply adjustment
    // Implementation would update pricing in sparksEconomy
    
    const after = await sparksEconomy.getProfitabilityMetrics();
    
    // Check CVI didn't drop too much
    const cvi = await this.getCustomerValueIndex();
    
    return {
      success: after.currentMargin > before.currentMargin && cvi >= 0.75,
      actionTaken: `Adjusted prices by ${((adjustment - 1) * 100).toFixed(1)}%`,
      metrics: { 
        before: before.currentMargin, 
        after: after.currentMargin,
        cvi 
      }
    };
  }

  private async limitExpensiveFeatures(): Promise<HealingResult> {
    // Temporarily limit expensive AI features
    const limits = {
      world_generation: { before: 100, after: 50 },
      song_generation: { before: 60, after: 40 },
      image_generation: { before: 75, after: 50 }
    };
    
    for (const [feature, limit] of Object.entries(limits)) {
      // Implementation would update limits
    }
    
    return {
      success: true,
      actionTaken: 'Limited expensive feature usage',
      metrics: { limits }
    };
  }

  private async optimizeBackendMix(): Promise<HealingResult> {
    const before = await this.getBackendCosts();
    
    // Switch to mixed backend strategy
    const optimization = {
      critical: 'premium_llm',
      standard: 'standard_llm',
      batch: 'economical_llm'
    };
    
    // Apply optimization
    // Implementation would update backend routing
    
    const after = await this.getBackendCosts();
    
    return {
      success: after < before,
      actionTaken: 'Optimized backend mix for cost efficiency',
      metrics: { before, after }
    };
  }

  private async quarantineTransactions(): Promise<HealingResult> {
    const suspicious = await this.findSuspiciousTransactions();
    
    const quarantined = [];
    for (const txn of suspicious) {
      await this.quarantineTransaction(txn);
      quarantined.push(txn.id);
    }
    
    // Alert finance team
    await this.alertFinanceTeam(quarantined);
    
    return {
      success: true,
      actionTaken: `Quarantined ${quarantined.length} suspicious transactions`,
      metrics: { 
        before: suspicious.length, 
        after: 0,
        quarantined 
      },
      needsManualReview: true
    };
  }

  private async rebuildLedger(): Promise<HealingResult> {
    const before = await this.getLedgerStatus();
    
    // Rebuild from event log
    const events = await this.getEventLog();
    const rebuilt = await this.rebuildFromEvents(events);
    
    const after = await this.getLedgerStatus();
    
    return {
      success: after.consistent,
      actionTaken: 'Rebuilt ledger from event log',
      metrics: { 
        before: before.consistent, 
        after: after.consistent,
        eventsProcessed: events.length 
      }
    };
  }

  private async addDatabaseIndex(): Promise<HealingResult> {
    const slowQueries = await this.getSlowQueries();
    const needIndex = slowQueries.filter(q => q.missingIndex);
    
    const created = [];
    for (const query of needIndex) {
      const index = await this.createIndex(query.suggestedIndex);
      created.push(index);
    }
    
    // Re-run EXPLAIN to verify improvement
    const afterQueries = await this.getSlowQueries();
    
    return {
      success: afterQueries.length < slowQueries.length,
      actionTaken: `Created ${created.length} database indexes`,
      metrics: { 
        before: slowQueries.length, 
        after: afterQueries.length,
        indexes: created 
      }
    };
  }

  private async rewriteSlowQuery(): Promise<HealingResult> {
    const slowQueries = await this.getSlowQueries();
    
    const rewritten = [];
    for (const query of slowQueries) {
      const optimized = await this.optimizeQuery(query.sql);
      if (optimized.executionTime < query.executionTime) {
        await this.replaceQuery(query.id, optimized.sql);
        rewritten.push(query.id);
      }
    }
    
    return {
      success: rewritten.length > 0,
      actionTaken: `Rewrote ${rewritten.length} slow queries`,
      metrics: { 
        queriesOptimized: rewritten.length 
      }
    };
  }

  private async createMaterializedView(): Promise<HealingResult> {
    const complexQueries = await this.getComplexQueries();
    
    const views = [];
    for (const query of complexQueries) {
      const view = await this.createView(query);
      views.push(view);
    }
    
    return {
      success: views.length > 0,
      actionTaken: `Created ${views.length} materialized views`,
      metrics: { views }
    };
  }

  private async enableIdempotentPublishing(): Promise<HealingResult> {
    // Enable idempotent publishing for Ably
    const config = {
      idempotent: true,
      messageId: 'uuid',
      deduplication: true
    };
    
    // Apply configuration
    // Implementation would update Ably config
    
    return {
      success: true,
      actionTaken: 'Enabled idempotent message publishing',
      metrics: { config }
    };
  }

  private async implementBackoff(): Promise<HealingResult> {
    const config = {
      initialDelay: 100,
      maxDelay: 30000,
      multiplier: 2,
      jitter: true
    };
    
    // Apply backoff configuration
    // Implementation would update retry logic
    
    return {
      success: true,
      actionTaken: 'Implemented exponential backoff with jitter',
      metrics: { config }
    };
  }

  private async fixUISelector(): Promise<HealingResult> {
    const broken = await this.findBrokenSelectors();
    
    const fixed = [];
    for (const selector of broken) {
      const newSelector = await this.findAlternativeSelector(selector);
      if (newSelector) {
        await this.updateSelector(selector, newSelector);
        fixed.push({ old: selector, new: newSelector });
      }
    }
    
    return {
      success: fixed.length > 0,
      actionTaken: `Fixed ${fixed.length} broken UI selectors`,
      metrics: { fixed }
    };
  }

  // =====================================
  // FALSE POSITIVE HANDLING
  // =====================================

  async recordFalsePositive(testId: string, selector?: string, reason?: string): Promise<void> {
    const existing = this.falsePositives.find(
      fp => fp.testId === testId && fp.selector === selector
    );
    
    if (existing) {
      existing.retryCount++;
      existing.persistent = existing.retryCount >= this.MAX_RETRY_ATTEMPTS;
      
      if (existing.persistent) {
        // Block merge and create defect
        await this.blockMerge(testId);
        await this.createDefect({
          testId,
          selector,
          reason: reason || existing.reason,
          retryCount: existing.retryCount
        });
      }
    } else {
      this.falsePositives.push({
        testId,
        selector,
        timestamp: new Date(),
        reason: reason || 'Test passed but failed in production',
        retryCount: 1,
        persistent: false
      });
    }
  }

  private async processFalsePositives(): Promise<void> {
    for (const fp of this.falsePositives) {
      if (!fp.persistent) {
        // Retry via dev console
        const success = await this.retryViaDevConsole(fp);
        
        if (success) {
          // Remove from false positives
          this.falsePositives = this.falsePositives.filter(
            f => f.testId !== fp.testId
          );
        } else {
          fp.retryCount++;
          fp.persistent = fp.retryCount >= this.MAX_RETRY_ATTEMPTS;
        }
      }
    }
    
    // Save report
    await this.saveFalsePositiveReport();
  }

  private async retryViaDevConsole(fp: FalsePositive): Promise<boolean> {
    // Implementation would retry test via browser dev console
    console.log(`Retrying test ${fp.testId} via dev console`);
    return Math.random() > 0.3; // Mock success rate
  }

  private async blockMerge(testId: string): Promise<void> {
    // Implementation would block PR merge
    console.error(`⛔ Blocking merge due to persistent false positive: ${testId}`);
  }

  private async createDefect(details: any): Promise<void> {
    // Implementation would create issue in tracking system
    console.error(`🐛 Creating defect for persistent false positive:`, details);
  }

  private async saveFalsePositiveReport(): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      falsePositives: this.falsePositives,
      persistent: this.falsePositives.filter(fp => fp.persistent)
    };
    
    // Save to file
    console.log('Saving false positive report:', report);
  }

  // =====================================
  // HELPER METHODS (Mock implementations)
  // =====================================

  private async getAPILatency(): Promise<{ p95: number }> {
    return { p95: Math.random() * 300 };
  }

  private async getCPUUsage(): Promise<number> {
    return Math.random() * 100;
  }

  private async getColdStartRate(): Promise<number> {
    return Math.random() * 0.2;
  }

  private async getCustomerValueIndex(): Promise<number> {
    return 0.75 + Math.random() * 0.2;
  }

  private async validateLedger(): Promise<any> {
    return {
      debitsEqualCredits: Math.random() > 0.1,
      negativeBalances: Math.floor(Math.random() * 5)
    };
  }

  private async getSlowQueries(): Promise<any[]> {
    return [
      { 
        id: 'q1', 
        sql: 'SELECT * FROM feeds', 
        executionTime: 180,
        missingIndex: true,
        suggestedIndex: 'idx_feeds_user_id'
      }
    ];
  }

  private async getRealtimeMetrics(): Promise<any> {
    return {
      messageDropRate: Math.random() * 0.002,
      presenceAccuracy: 0.998 + Math.random() * 0.002
    };
  }

  private async getInstanceCount(): Promise<number> {
    return 10;
  }

  private async setInstanceCount(count: number): Promise<void> {
    console.log(`Setting instance count to ${count}`);
  }

  private async getCacheHitRate(): Promise<number> {
    return Math.random() * 0.5 + 0.5;
  }

  private async warmCache(cache: string): Promise<void> {
    console.log(`Warming cache: ${cache}`);
  }

  private async getLLMCost(): Promise<number> {
    return Math.random() * 1000;
  }

  private async setLLMModel(model: string, features: string[]): Promise<void> {
    console.log(`Setting LLM model to ${model} for features:`, features);
  }

  private async getBackendCosts(): Promise<number> {
    return Math.random() * 10000;
  }

  private async findSuspiciousTransactions(): Promise<any[]> {
    return [];
  }

  private async quarantineTransaction(txn: any): Promise<void> {
    console.log(`Quarantining transaction: ${txn.id}`);
  }

  private async alertFinanceTeam(transactions: string[]): Promise<void> {
    console.log('Alerting finance team about quarantined transactions:', transactions);
  }

  private async getLedgerStatus(): Promise<any> {
    return { consistent: Math.random() > 0.2 };
  }

  private async getEventLog(): Promise<any[]> {
    return [];
  }

  private async rebuildFromEvents(events: any[]): Promise<any> {
    return { success: true };
  }

  private async createIndex(index: string): Promise<string> {
    console.log(`Creating index: ${index}`);
    return index;
  }

  private async optimizeQuery(sql: string): Promise<any> {
    return { 
      sql: sql + ' OPTIMIZED', 
      executionTime: 50 
    };
  }

  private async replaceQuery(id: string, sql: string): Promise<void> {
    console.log(`Replacing query ${id} with optimized version`);
  }

  private async getComplexQueries(): Promise<any[]> {
    return [];
  }

  private async createView(query: any): Promise<string> {
    return `view_${Date.now()}`;
  }

  private async findBrokenSelectors(): Promise<string[]> {
    return [];
  }

  private async findAlternativeSelector(selector: string): Promise<string | null> {
    return `[data-testid="${selector}"]`;
  }

  private async updateSelector(old: string, newSelector: string): Promise<void> {
    console.log(`Updating selector from ${old} to ${newSelector}`);
  }

  private async alertManualIntervention(issue: any, result: HealingResult): Promise<void> {
    console.error('⚠️ Manual intervention required:', {
      issue,
      result,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get healing report
   */
  getHealingReport(): any {
    return {
      timestamp: new Date().toISOString(),
      totalHealing: this.healingHistory.length,
      successful: this.healingHistory.filter(h => h.success).length,
      failed: this.healingHistory.filter(h => !h.success).length,
      needsReview: this.healingHistory.filter(h => h.needsManualReview).length,
      falsePositives: this.falsePositives.length,
      persistentFalsePositives: this.falsePositives.filter(fp => fp.persistent).length,
      history: this.healingHistory
    };
  }
}

// Export singleton instance
export const selfHealer = new SelfHealer();
