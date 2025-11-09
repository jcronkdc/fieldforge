import { supabase } from '../supabase';

export interface Receipt {
  id: string;
  project_id: string;
  user_id: string;
  company_cost_code_id?: string;
  receipt_number?: string;
  vendor_name?: string;
  amount: number;
  tax_amount?: number;
  total_amount?: number;
  receipt_date: string;
  image_url: string;
  thumbnail_url?: string;
  ocr_text?: string;
  ocr_confidence?: number;
  ocr_processed: boolean;
  extracted_vendor?: string;
  extracted_amount?: string;
  extracted_date?: string;
  extracted_items?: any;
  description?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  capture_location?: any;
  capture_device?: string;
  created_at: string;
  updated_at: string;
}

export interface CostCode {
  id: string;
  code: string;
  name: string;
  category: string;
  items: string[];
  company: string;
  is_active: boolean;
}

export interface ExpenseReport {
  id: string;
  project_id: string;
  user_id: string;
  report_number: string;
  period_start: string;
  period_end: string;
  total_amount: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  submitted_at?: string;
  approved_by?: string;
  approved_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

class ReceiptService {
  
  // Create a new receipt
  async createReceipt(receipt: Partial<Receipt>): Promise<Receipt | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('receipts')
        .insert({
          ...receipt,
          user_id: user.id,
          status: 'processing'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create receipt:', error);
      return null;
    }
  }

  // Get all cost codes
  async getCostCodes(): Promise<CostCode[]> {
    try {
      const { data, error } = await supabase
        .from('company_cost_codes')
        .select('*')
        .eq('is_active', true)
        .order('code');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch cost codes:', error);
      return [];
    }
  }

  // Get receipts for a user or project
  async getReceipts(projectId?: string, userId?: string): Promise<Receipt[]> {
    try {
      let query = supabase
        .from('receipts')
        .select(`
          *,
          cost_code:company_cost_codes(code, name, category),
          project:projects(name, project_number),
          user:user_profiles(first_name, last_name)
        `)
        .order('receipt_date', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch receipts:', error);
      return [];
    }
  }

  // Get a single receipt
  async getReceipt(receiptId: string): Promise<Receipt | null> {
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select(`
          *,
          cost_code:company_cost_codes(*),
          project:projects(*),
          user:user_profiles(*)
        `)
        .eq('id', receiptId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to fetch receipt:', error);
      return null;
    }
  }

  // Update receipt
  async updateReceipt(receiptId: string, updates: Partial<Receipt>): Promise<Receipt | null> {
    try {
      const { data, error } = await supabase
        .from('receipts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', receiptId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to update receipt:', error);
      return null;
    }
  }

  // Update receipt with OCR results
  async updateReceiptWithOCR(
    receiptId: string,
    ocrText: string,
    confidence: number,
    extractedData: any
  ): Promise<Receipt | null> {
    try {
      const updates: Partial<Receipt> = {
        ocr_text: ocrText,
        ocr_confidence: confidence,
        ocr_processed: true,
        status: 'pending',
        extracted_vendor: extractedData.vendor,
        extracted_amount: extractedData.amount?.toString(),
        extracted_date: extractedData.date,
        extracted_items: extractedData.items
      };

      if (extractedData.vendor) {
        updates.vendor_name = extractedData.vendor;
      }
      
      if (extractedData.amount) {
        updates.total_amount = extractedData.amount;
        updates.amount = extractedData.amount; // Assuming no tax for now
      }

      if (extractedData.date) {
        // Try to parse the date
        const parsedDate = this.parseDate(extractedData.date);
        if (parsedDate) {
          updates.receipt_date = parsedDate;
        }
      }

      return this.updateReceipt(receiptId, updates);
    } catch (error) {
      console.error('Failed to update receipt with OCR:', error);
      return null;
    }
  }

  // Parse various date formats
  private parseDate(dateStr: string): string | null {
    try {
      // Try different date formats
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }

      // Try MM/DD/YYYY format
      const mmddyyyy = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (mmddyyyy) {
        const [_, month, day, year] = mmddyyyy;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }

      // Try DD/MM/YYYY format
      const ddmmyyyy = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (ddmmyyyy) {
        const [_, day, month, year] = ddmmyyyy;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }

      return null;
    } catch {
      return null;
    }
  }

  // Approve receipt
  async approveReceipt(receiptId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('receipts')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', receiptId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to approve receipt:', error);
      return false;
    }
  }

  // Reject receipt
  async rejectReceipt(receiptId: string, reason: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('receipts')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', receiptId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to reject receipt:', error);
      return false;
    }
  }

  // Delete receipt
  async deleteReceipt(receiptId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('id', receiptId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to delete receipt:', error);
      return false;
    }
  }

  // Create expense report
  async createExpenseReport(report: Partial<ExpenseReport>): Promise<ExpenseReport | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Generate report number
      const { data: reportNumber } = await supabase
        .rpc('generate_expense_report_number');

      const { data, error } = await supabase
        .from('expense_reports')
        .insert({
          ...report,
          user_id: user.id,
          report_number: reportNumber,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create expense report:', error);
      return null;
    }
  }

  // Add receipts to expense report
  async addReceiptsToReport(reportId: string, receiptIds: string[]): Promise<boolean> {
    try {
      const inserts = receiptIds.map(receiptId => ({
        expense_report_id: reportId,
        receipt_id: receiptId
      }));

      const { error } = await supabase
        .from('expense_report_receipts')
        .insert(inserts);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to add receipts to report:', error);
      return false;
    }
  }

  // Get expense reports
  async getExpenseReports(projectId?: string, userId?: string): Promise<ExpenseReport[]> {
    try {
      let query = supabase
        .from('expense_reports')
        .select(`
          *,
          project:projects(name, project_number),
          user:user_profiles(first_name, last_name),
          receipts:expense_report_receipts(
            receipt:receipts(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch expense reports:', error);
      return [];
    }
  }

  // Get analytics for cost codes
  async getCostCodeAnalytics(projectId: string, startDate?: string, endDate?: string): Promise<any[]> {
    try {
      let query = supabase
        .from('cost_code_analytics')
        .select(`
          *,
          cost_code:company_cost_codes(code, name, category)
        `)
        .eq('project_id', projectId)
        .order('total_amount', { ascending: false });

      if (startDate) {
        query = query.gte('month', startDate);
      }

      if (endDate) {
        query = query.lte('month', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch cost code analytics:', error);
      return [];
    }
  }

  // Bulk approve receipts
  async bulkApproveReceipts(receiptIds: string[]): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('receipts')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .in('id', receiptIds)
        .eq('status', 'pending');

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to bulk approve receipts:', error);
      return false;
    }
  }
}

export const receiptService = new ReceiptService();
