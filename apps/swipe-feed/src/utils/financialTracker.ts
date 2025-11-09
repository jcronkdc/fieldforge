/**
 * Financial Tracker - Secure revenue tracking with QuickBooks compatibility
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * CRITICAL: This handles financial data - maximum security required
 */

import { PurchaseLogger } from './purchaseLogger';
import type { PurchaseAttempt } from '../components/admin/PurchaseAuditDashboard';

export interface FinancialTransaction {
  id: string;
  date: Date;
  type: 'income' | 'expense' | 'refund' | 'fee';
  category: string;
  description: string;
  amount: number;
  tax: number;
  net: number;
  paymentMethod: string;
  customerEmail?: string;
  customerId?: string;
  invoiceNumber?: string;
  referenceNumber?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  quickbooksCategory?: string;
  metadata?: Record<string, any>;
}

export interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  taxesCollected: number;
  refundsIssued: number;
  averageTransactionValue: number;
  monthlyRecurringRevenue: number;
  customerLifetimeValue: number;
  customerAcquisitionCost: number;
  churnRate: number;
  growthRate: number;
}

export interface QuickBooksExport {
  transactions: Array<{
    Date: string;
    Type: string;
    Num: string;
    Name: string;
    Memo: string;
    Account: string;
    Debit: string;
    Credit: string;
    Balance: string;
    TaxAmount: string;
    TaxCode: string;
  }>;
}

export interface TaxReport {
  period: { start: Date; end: Date };
  grossRevenue: number;
  taxableRevenue: number;
  salesTaxCollected: number;
  deductions: number;
  netTaxableIncome: number;
  estimatedTax: number;
  byState?: Record<string, number>;
}

class FinancialTracker {
  private static instance: FinancialTracker;
  private transactions: FinancialTransaction[] = [];
  private readonly ENCRYPTION_KEY = 'mythatron_financial_2025'; // In production, use env variable
  private readonly TAX_RATE = 0.0825; // 8.25% sales tax (configurable)
  private readonly STRIPE_FEE_PERCENTAGE = 0.029; // 2.9% + $0.30
  private readonly STRIPE_FEE_FIXED = 0.30;

  private constructor() {
    this.loadTransactions();
  }

  static getInstance(): FinancialTracker {
    if (!FinancialTracker.instance) {
      FinancialTracker.instance = new FinancialTracker();
    }
    return FinancialTracker.instance;
  }

  /**
   * Record a revenue transaction
   */
  recordRevenue(
    amount: number,
    description: string,
    customerEmail: string,
    paymentMethod: string = 'card',
    metadata?: Record<string, any>
  ): string {
    const stripeFee = amount * this.STRIPE_FEE_PERCENTAGE + this.STRIPE_FEE_FIXED;
    const tax = amount * this.TAX_RATE;
    const net = amount - stripeFee - tax;

    const transaction: FinancialTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date(),
      type: 'income',
      category: 'product_sales',
      description,
      amount,
      tax,
      net,
      paymentMethod,
      customerEmail,
      customerId: this.hashEmail(customerEmail),
      invoiceNumber: this.generateInvoiceNumber(),
      referenceNumber: `REF${Date.now()}`,
      status: 'completed',
      quickbooksCategory: 'Sales:Digital Products',
      metadata,
    };

    // Record Stripe fee as expense
    this.recordExpense(
      stripeFee,
      'Stripe Processing Fee',
      'payment_processing',
      { relatedTransaction: transaction.id }
    );

    this.transactions.push(transaction);
    this.saveTransactions();
    
    return transaction.id;
  }

  /**
   * Record an expense
   */
  recordExpense(
    amount: number,
    description: string,
    category: string,
    metadata?: Record<string, any>
  ): string {
    const transaction: FinancialTransaction = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date(),
      type: 'expense',
      category,
      description,
      amount,
      tax: 0,
      net: -amount,
      paymentMethod: 'bank_transfer',
      status: 'completed',
      quickbooksCategory: this.mapToQuickBooksCategory(category),
      metadata,
    };

    this.transactions.push(transaction);
    this.saveTransactions();
    
    return transaction.id;
  }

  /**
   * Record a refund
   */
  recordRefund(
    originalTransactionId: string,
    amount: number,
    reason: string
  ): string {
    const originalTxn = this.transactions.find(t => t.id === originalTransactionId);
    if (!originalTxn) throw new Error('Original transaction not found');

    const refundTxn: FinancialTransaction = {
      id: `rfd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date(),
      type: 'refund',
      category: 'refund',
      description: `Refund: ${reason}`,
      amount: -amount,
      tax: -(amount * this.TAX_RATE),
      net: -amount,
      paymentMethod: originalTxn.paymentMethod,
      customerEmail: originalTxn.customerEmail,
      customerId: originalTxn.customerId,
      referenceNumber: originalTransactionId,
      status: 'completed',
      quickbooksCategory: 'Refunds',
      metadata: { originalTransaction: originalTransactionId, reason },
    };

    this.transactions.push(refundTxn);
    this.saveTransactions();
    
    return refundTxn.id;
  }

  /**
   * Get financial metrics
   */
  getMetrics(startDate?: Date, endDate?: Date): FinancialMetrics {
    const filtered = this.filterByDateRange(startDate, endDate);
    
    const revenue = filtered
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const refunds = filtered
      .filter(t => t.type === 'refund')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const taxes = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.tax, 0);
    
    const netProfit = revenue - expenses - refunds;
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    
    // Calculate MRR (Monthly Recurring Revenue)
    const subscriptions = filtered.filter(t => 
      t.metadata?.subscription === true && t.status === 'completed'
    );
    const mrr = subscriptions.reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate customer metrics
    const uniqueCustomers = new Set(filtered.map(t => t.customerId)).size;
    const avgTransactionValue = revenue / Math.max(filtered.length, 1);
    const customerLifetimeValue = revenue / Math.max(uniqueCustomers, 1);
    
    // Calculate growth rate (month over month)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthRevenue = this.filterByDateRange(
      new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
      new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0)
    )
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const growthRate = lastMonthRevenue > 0 
      ? ((revenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    return {
      totalRevenue: revenue,
      totalExpenses: expenses,
      netProfit,
      profitMargin,
      taxesCollected: taxes,
      refundsIssued: refunds,
      averageTransactionValue: avgTransactionValue,
      monthlyRecurringRevenue: mrr,
      customerLifetimeValue,
      customerAcquisitionCost: expenses / Math.max(uniqueCustomers, 1),
      churnRate: 0, // Calculate based on subscription cancellations
      growthRate,
    };
  }

  /**
   * Generate QuickBooks-compatible export
   */
  exportToQuickBooks(startDate?: Date, endDate?: Date): QuickBooksExport {
    const filtered = this.filterByDateRange(startDate, endDate);
    
    const qbTransactions = filtered.map(t => {
      const isDebit = t.type === 'expense' || t.type === 'refund';
      
      return {
        Date: this.formatDate(t.date),
        Type: this.mapTransactionType(t.type),
        Num: t.invoiceNumber || t.referenceNumber || '',
        Name: t.customerEmail || 'N/A',
        Memo: t.description,
        Account: t.quickbooksCategory || 'Uncategorized',
        Debit: isDebit ? Math.abs(t.amount).toFixed(2) : '',
        Credit: !isDebit ? t.amount.toFixed(2) : '',
        Balance: t.net.toFixed(2),
        TaxAmount: t.tax.toFixed(2),
        TaxCode: t.tax > 0 ? 'TAX' : 'NON',
      };
    });

    return { transactions: qbTransactions };
  }

  /**
   * Generate tax report
   */
  generateTaxReport(startDate: Date, endDate: Date): TaxReport {
    const filtered = this.filterByDateRange(startDate, endDate);
    
    const grossRevenue = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const salesTaxCollected = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.tax, 0);
    
    const deductions = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const refunds = filtered
      .filter(t => t.type === 'refund')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const taxableRevenue = grossRevenue - refunds;
    const netTaxableIncome = taxableRevenue - deductions;
    const estimatedTax = netTaxableIncome * 0.25; // 25% estimated tax rate

    return {
      period: { start: startDate, end: endDate },
      grossRevenue,
      taxableRevenue,
      salesTaxCollected,
      deductions,
      netTaxableIncome,
      estimatedTax,
    };
  }

  /**
   * Export to CSV
   */
  exportToCSV(startDate?: Date, endDate?: Date): string {
    const filtered = this.filterByDateRange(startDate, endDate);
    
    const headers = [
      'Date',
      'Transaction ID',
      'Type',
      'Category',
      'Description',
      'Customer',
      'Amount',
      'Tax',
      'Fees',
      'Net',
      'Payment Method',
      'Status',
      'Invoice #',
      'Reference #'
    ];
    
    const rows = filtered.map(t => [
      this.formatDate(t.date),
      t.id,
      t.type,
      t.category,
      t.description,
      t.customerEmail || '',
      t.amount.toFixed(2),
      t.tax.toFixed(2),
      (t.amount - t.net - t.tax).toFixed(2), // Calculate fees
      t.net.toFixed(2),
      t.paymentMethod,
      t.status,
      t.invoiceNumber || '',
      t.referenceNumber || ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Security: Encrypt sensitive data
   */
  private encrypt(data: string): string {
    // Simple XOR encryption for demo - use proper encryption in production
    return btoa(data.split('').map((c, i) => 
      String.fromCharCode(c.charCodeAt(0) ^ this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length))
    ).join(''));
  }

  /**
   * Security: Decrypt sensitive data
   */
  private decrypt(data: string): string {
    try {
      const decoded = atob(data);
      return decoded.split('').map((c, i) => 
        String.fromCharCode(c.charCodeAt(0) ^ this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length))
      ).join('');
    } catch {
      return data; // Return as-is if decryption fails
    }
  }

  /**
   * Helper methods
   */
  private filterByDateRange(startDate?: Date, endDate?: Date): FinancialTransaction[] {
    if (!startDate || !endDate) return this.transactions;
    
    return this.transactions.filter(t => 
      t.date >= startDate && t.date <= endDate
    );
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private hashEmail(email: string): string {
    // Simple hash for customer ID - use proper hashing in production
    return btoa(email).substring(0, 10);
  }

  private generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}-${random}`;
  }

  private mapTransactionType(type: string): string {
    const mapping: Record<string, string> = {
      income: 'Sales Receipt',
      expense: 'Expense',
      refund: 'Credit Memo',
      fee: 'Service Charge',
    };
    return mapping[type] || 'General Journal';
  }

  private mapToQuickBooksCategory(category: string): string {
    const mapping: Record<string, string> = {
      product_sales: 'Sales:Digital Products',
      subscription: 'Sales:Subscriptions',
      payment_processing: 'Expenses:Bank Charges',
      refund: 'Refunds',
      marketing: 'Expenses:Advertising',
      hosting: 'Expenses:Computer and Internet',
      development: 'Expenses:Contract Labor',
    };
    return mapping[category] || 'Uncategorized';
  }

  private loadTransactions(): void {
    try {
      const encrypted = localStorage.getItem('mythatron_financial_data');
      if (encrypted) {
        const decrypted = this.decrypt(encrypted);
        this.transactions = JSON.parse(decrypted);
      }
    } catch (error) {
      console.error('Error loading financial data:', error);
      this.transactions = [];
    }
  }

  private saveTransactions(): void {
    try {
      const encrypted = this.encrypt(JSON.stringify(this.transactions));
      localStorage.setItem('mythatron_financial_data', encrypted);
    } catch (error) {
      console.error('Error saving financial data:', error);
    }
  }

  /**
   * Security: Validate admin access
   */
  static validateAdminAccess(userId: string, token: string): boolean {
    // In production, validate against backend
    return userId === 'admin' || localStorage.getItem('mythatron_user_role') === 'admin';
  }

  /**
   * Get secure instance with validation
   */
  static getSecureInstance(userId: string, token: string): FinancialTracker | null {
    if (!this.validateAdminAccess(userId, token)) {
      console.error('Unauthorized access to financial data');
      return null;
    }
    return this.getInstance();
  }
}

export const FinancialTracking = FinancialTracker.getInstance();