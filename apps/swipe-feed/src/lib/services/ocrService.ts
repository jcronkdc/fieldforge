// Note: Tesseract.js needs to be installed: npm install tesseract.js
// For now, we'll use a mock implementation
import { supabase } from '../supabase';

interface OCRResult {
  text: string;
  confidence: number;
  lines: string[];
  extractedData: {
    vendor?: string;
    amount?: number;
    date?: string;
    items?: string[];
    costCode?: string;
  };
}

interface CostCode {
  id: string;
  code: string;
  name: string;
  category: string;
  items: string[];
}

class OCRService {
  private costCodes: CostCode[] = [];
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Note: In production, you would initialize Tesseract.js here
      // For now, we'll use a mock implementation
      
      // Load cost codes
      await this.loadCostCodes();
      
      this.initialized = true;
      console.log('OCR Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OCR service:', error);
      throw error;
    }
  }

  private async loadCostCodes() {
    try {
      const { data, error } = await supabase
        .from('company_cost_codes')
        .select('*')
        .eq('is_active', true)
        .order('code');
      
      if (error) throw error;
      this.costCodes = data || [];
      console.log(`Loaded ${this.costCodes.length} cost codes`);
    } catch (error) {
      console.error('Failed to load cost codes:', error);
    }
  }

  async processImage(imageFile: File | Blob | string): Promise<OCRResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Mock OCR implementation
      // In production, you would use Tesseract.js or a cloud OCR service
      console.log('Processing image with mock OCR...');
      
      // For demo purposes, we'll create sample data
      const mockText = `RECEIPT
HOME DEPOT
123 MAIN ST
ANYTOWN, USA 12345
DATE: ${new Date().toLocaleDateString()}

ITEMS:
HAMMER                 $25.99
NAILS (BOX)           $12.50
SAFETY GLOVES         $15.00

SUBTOTAL              $53.49
TAX                    $4.28
TOTAL                 $57.77

THANK YOU FOR YOUR PURCHASE`;

      const lines = mockText.split('\n').filter(line => line.trim());
      
      // Extract structured data
      const extractedData = this.extractDataFromText(mockText, lines);
      
      // Try to match cost code
      const matchedCostCode = this.matchCostCode(mockText);
      if (matchedCostCode) {
        extractedData.costCode = matchedCostCode.code;
      }
      
      return {
        text: mockText,
        confidence: 0.85, // Mock confidence
        lines,
        extractedData
      };
    } catch (error) {
      console.error('OCR processing failed:', error);
      throw error;
    }
  }

  private extractDataFromText(text: string, lines: string[]): OCRResult['extractedData'] {
    const extracted: OCRResult['extractedData'] = {};
    const upperText = text.toUpperCase();
    
    // Extract vendor name (usually in first few lines)
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      if (line.length > 3 && !this.isNumeric(line) && !this.isDate(line)) {
        extracted.vendor = line.trim();
        break;
      }
    }
    
    // Extract amount
    const amountPatterns = [
      /TOTAL[:\s]+\$?([\d,]+\.?\d*)/i,
      /AMOUNT[:\s]+\$?([\d,]+\.?\d*)/i,
      /SUBTOTAL[:\s]+\$?([\d,]+\.?\d*)/i,
      /\$\s*([\d,]+\.?\d+)/,
      /USD\s*([\d,]+\.?\d+)/i
    ];
    
    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(amount)) {
          extracted.amount = amount;
          break;
        }
      }
    }
    
    // Extract date
    const datePatterns = [
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
      /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}/i,
      /\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/i
    ];
    
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        extracted.date = match[0];
        break;
      }
    }
    
    // Extract items (lines that look like line items)
    const itemLines: string[] = [];
    const itemPattern = /^[\s\S]*?\$?\s*[\d,]+\.?\d*$/;
    
    for (const line of lines) {
      if (itemPattern.test(line) && line.length > 5) {
        // Clean up the item description
        const cleanedLine = line.replace(/\$?\s*[\d,]+\.?\d*$/, '').trim();
        if (cleanedLine.length > 2) {
          itemLines.push(cleanedLine);
        }
      }
    }
    
    if (itemLines.length > 0) {
      extracted.items = itemLines;
    }
    
    return extracted;
  }

  private matchCostCode(text: string): CostCode | null {
    const upperText = text.toUpperCase();
    
    // First try to find exact cost code matches
    for (const costCode of this.costCodes) {
      if (upperText.includes(costCode.code)) {
        return costCode;
      }
    }
    
    // Then try to match based on items
    for (const costCode of this.costCodes) {
      if (costCode.items && costCode.items.length > 0) {
        for (const item of costCode.items) {
          if (upperText.includes(item.toUpperCase())) {
            return costCode;
          }
        }
      }
    }
    
    // Try keyword matching for common categories
    const keywordMap: Record<string, string[]> = {
      '98-1300': ['MEAL', 'LUNCH', 'DINNER', 'BREAKFAST', 'RESTAURANT', 'FOOD'],
      '98-1500': ['HOTEL', 'MOTEL', 'LODGING', 'INN', 'SUITES'],
      '98-1650': ['UBER', 'LYFT', 'TAXI', 'CAB'],
      '98-2100': ['GAS', 'FUEL', 'DIESEL', 'SHELL', 'EXXON', 'CHEVRON', 'BP'],
      '98-4500': ['TOOLS', 'HARDWARE', 'HOME DEPOT', 'LOWES', 'ACE'],
      '98-6000': ['SAFETY', 'PPE', 'GLOVES', 'GLASSES', 'FIRST AID']
    };
    
    for (const [code, keywords] of Object.entries(keywordMap)) {
      for (const keyword of keywords) {
        if (upperText.includes(keyword)) {
          const matchedCode = this.costCodes.find(c => c.code === code);
          if (matchedCode) {
            return matchedCode;
          }
        }
      }
    }
    
    return null;
  }

  private isNumeric(str: string): boolean {
    return /^\d+$/.test(str.trim());
  }

  private isDate(str: string): boolean {
    return /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(str) ||
           /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(str);
  }

  async enhanceWithAI(ocrResult: OCRResult): Promise<OCRResult> {
    // This could be enhanced with AI/ML models for better accuracy
    // For now, we'll use pattern matching and heuristics
    
    const enhanced = { ...ocrResult };
    
    // Try to improve vendor detection
    if (!enhanced.extractedData.vendor && ocrResult.lines.length > 0) {
      // Look for common vendor patterns
      const vendorPatterns = [
        /^(THE\s+)?[\w\s&']+\s+(INC|LLC|CORP|CO|COMPANY)/i,
        /^[\w\s&']+\s+(STORE|MARKET|SHOP|RESTAURANT|HOTEL)/i
      ];
      
      for (const line of ocrResult.lines.slice(0, 5)) {
        for (const pattern of vendorPatterns) {
          if (pattern.test(line)) {
            enhanced.extractedData.vendor = line.trim();
            break;
          }
        }
        if (enhanced.extractedData.vendor) break;
      }
    }
    
    return enhanced;
  }

  async cleanup() {
    // In production, you would terminate the Tesseract worker here
    this.initialized = false;
  }

  // Utility function to upload receipt image to Supabase Storage
  async uploadReceiptImage(file: File, userId: string, projectId: string): Promise<string> {
    const fileName = `receipts/${projectId}/${userId}/${Date.now()}_${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Failed to upload receipt image:', error);
      throw error;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName);
    
    return publicUrl;
  }

  // Create thumbnail for faster loading
  async createThumbnail(file: File, maxWidth = 200): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          // Calculate dimensions
          const scale = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * scale;
          
          // Draw resized image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Convert to base64
          const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
          resolve(thumbnail);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export const ocrService = new OCRService();
