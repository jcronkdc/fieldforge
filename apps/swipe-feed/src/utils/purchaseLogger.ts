/**
 * Purchase Logger - Comprehensive logging for all purchase attempts
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import type { PurchaseAttempt } from '../components/admin/PurchaseAuditDashboard';

export class PurchaseLogger {
  private static STORAGE_KEY = 'mythatron_purchase_audit';
  private static MAX_LOGS = 1000; // Keep last 1000 attempts

  /**
   * Log a purchase attempt - ALWAYS call this when user clicks buy
   */
  static logAttempt(
    userId: string,
    userEmail: string,
    type: 'sparks' | 'subscription',
    amount: number,
    price: number,
    metadata?: Record<string, any>
  ): string {
    const attemptId = `pa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const attempt: PurchaseAttempt = {
      id: attemptId,
      userId,
      userEmail,
      timestamp: new Date().toISOString(),
      type,
      status: 'initiated',
      amount,
      price,
      currency: 'USD',
      ipAddress: this.getIPAddress(),
      userAgent: navigator.userAgent,
      metadata,
    };

    this.saveAttempt(attempt);
    console.log('[PURCHASE ATTEMPT]', attempt);
    
    return attemptId;
  }

  /**
   * Update purchase status - call this at each stage
   */
  static updateStatus(
    attemptId: string,
    status: PurchaseAttempt['status'],
    additionalData?: Partial<PurchaseAttempt>
  ): void {
    const attempts = this.getAttempts();
    const index = attempts.findIndex(a => a.id === attemptId);
    
    if (index !== -1) {
      attempts[index] = {
        ...attempts[index],
        status,
        ...additionalData,
      };
      
      this.saveAttempts(attempts);
      console.log(`[PURCHASE ${status.toUpperCase()}]`, attemptId, additionalData);
    }
  }

  /**
   * Log successful purchase
   */
  static logSuccess(
    attemptId: string,
    stripePaymentIntentId?: string,
    stripeChargeId?: string
  ): void {
    this.updateStatus(attemptId, 'completed', {
      stripePaymentIntentId,
      stripeChargeId,
    });
  }

  /**
   * Log failed purchase
   */
  static logFailure(
    attemptId: string,
    errorMessage: string,
    errorCode?: string,
    stripeErrorType?: string
  ): void {
    this.updateStatus(attemptId, 'failed', {
      errorMessage,
      errorCode,
      stripeErrorType,
    });
  }

  /**
   * Log declined purchase
   */
  static logDecline(
    attemptId: string,
    errorMessage: string,
    errorCode?: string,
    retryCount?: number
  ): void {
    this.updateStatus(attemptId, 'declined', {
      errorMessage,
      errorCode,
      retryCount,
    });
  }

  /**
   * Get all purchase attempts
   */
  static getAttempts(): PurchaseAttempt[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading purchase attempts:', error);
      return [];
    }
  }

  /**
   * Get attempts for a specific user
   */
  static getUserAttempts(userId: string): PurchaseAttempt[] {
    return this.getAttempts().filter(a => a.userId === userId);
  }

  /**
   * Get recent failures for debugging
   */
  static getRecentFailures(hours = 24): PurchaseAttempt[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.getAttempts().filter(a => 
      (a.status === 'failed' || a.status === 'declined') &&
      new Date(a.timestamp) > cutoff
    );
  }

  /**
   * Clear old logs to prevent storage bloat
   */
  static cleanup(): void {
    const attempts = this.getAttempts();
    if (attempts.length > this.MAX_LOGS) {
      const sorted = attempts.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      this.saveAttempts(sorted.slice(0, this.MAX_LOGS));
    }
  }

  private static saveAttempt(attempt: PurchaseAttempt): void {
    const attempts = this.getAttempts();
    attempts.unshift(attempt);
    this.saveAttempts(attempts);
  }

  private static saveAttempts(attempts: PurchaseAttempt[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(attempts));
    } catch (error) {
      console.error('Error saving purchase attempts:', error);
    }
  }

  private static getIPAddress(): string {
    // In production, this would come from the backend
    // For now, return a placeholder
    return 'CLIENT_IP';
  }

  /**
   * Generate customer support ticket data
   */
  static generateSupportTicket(attemptId: string): string {
    const attempt = this.getAttempts().find(a => a.id === attemptId);
    if (!attempt) return 'Purchase attempt not found';

    return `
CUSTOMER SUPPORT TICKET
=======================
Purchase ID: ${attempt.id}
User Email: ${attempt.userEmail}
User ID: ${attempt.userId}
Timestamp: ${new Date(attempt.timestamp).toLocaleString()}
Type: ${attempt.type}
Amount: ${attempt.amount} Sparks
Price: $${attempt.price.toFixed(2)} ${attempt.currency}
Status: ${attempt.status}
${attempt.errorMessage ? `Error: ${attempt.errorMessage}` : ''}
${attempt.errorCode ? `Error Code: ${attempt.errorCode}` : ''}
${attempt.stripePaymentIntentId ? `Stripe Payment: ${attempt.stripePaymentIntentId}` : ''}
${attempt.stripeChargeId ? `Stripe Charge: ${attempt.stripeChargeId}` : ''}
${attempt.retryCount ? `Retry Attempts: ${attempt.retryCount}` : ''}

User Agent: ${attempt.userAgent}
IP Address: ${attempt.ipAddress || 'Unknown'}

RECOMMENDED ACTION:
${attempt.status === 'declined' ? '- Check card details with customer\n- Suggest alternative payment method' : ''}
${attempt.status === 'failed' ? '- Check Stripe dashboard for payment status\n- Verify network connectivity' : ''}
${attempt.status === 'completed' ? '- Verify Sparks were credited\n- Check transaction in Stripe' : ''}
    `;
  }
}

// Auto-cleanup on load
PurchaseLogger.cleanup();
