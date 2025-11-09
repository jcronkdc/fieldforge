/**
 * Export & Accounting Pack
 * Comprehensive data export system for taxes, audits, and data science
 */

import React, { useState } from 'react';
import { Icons } from '../../icons/Icons';

export interface ExportConfig {
  format: 'csv' | 'json' | 'xml' | 'excel' | 'pdf';
  dateRange: {
    start: Date;
    end: Date;
  };
  categories: string[];
  includeMetadata: boolean;
  compression: boolean;
  encryption: boolean;
  schedule?: ExportSchedule;
}

export interface ExportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  time: string; // HH:MM format
  email: string;
  autoUpload?: {
    service: 'gdrive' | 'dropbox' | 's3' | 'azure';
    path: string;
  };
}

export interface TaxReport {
  period: string;
  revenue: {
    gross: number;
    net: number;
    byCategory: Record<string, number>;
    byJurisdiction: Record<string, number>;
  };
  expenses: {
    total: number;
    byCategory: Record<string, number>;
    deductible: number;
    nonDeductible: number;
  };
  taxes: {
    salesTax: number;
    incomeTax: number;
    vat: number;
    other: number;
  };
  forms: {
    form1099: any[];
    formW2: any[];
    schedule: any[];
  };
}

export interface AuditPackage {
  timestamp: string;
  period: string;
  financials: {
    incomeStatement: any;
    balanceSheet: any;
    cashFlow: any;
  };
  transactions: Transaction[];
  users: UserAudit[];
  compliance: ComplianceReport;
  signatures: DigitalSignature[];
}

export interface Transaction {
  id: string;
  date: Date;
  type: 'revenue' | 'expense' | 'refund' | 'adjustment';
  amount: number;
  currency: string;
  description: string;
  category: string;
  userId?: string;
  metadata: Record<string, any>;
}

export interface UserAudit {
  userId: string;
  joinDate: Date;
  tier: string;
  revenue: number;
  activity: any[];
  compliance: boolean;
}

export interface ComplianceReport {
  gdpr: boolean;
  ccpa: boolean;
  pci: boolean;
  sox: boolean;
  issues: string[];
  recommendations: string[];
}

export interface DigitalSignature {
  signatory: string;
  timestamp: string;
  hash: string;
  certificate: string;
}

interface Props {
  onExport?: (config: ExportConfig, data: any) => void;
}

export const ExportAccountingPack: React.FC<Props> = ({ onExport }) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'tax' | 'audit' | 'science' | 'schedule'>('quick');
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'csv',
    dateRange: {
      start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      end: new Date()
    },
    categories: [],
    includeMetadata: true,
    compression: false,
    encryption: false
  });

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  const exportCategories = [
    { id: 'revenue', name: 'Revenue & Sales', icon: Icons.Revenue },
    { id: 'expenses', name: 'Expenses & Costs', icon: Icons.Chart },
    { id: 'users', name: 'User Data', icon: Icons.Collaborate },
    { id: 'transactions', name: 'Transactions', icon: Icons.Database },
    { id: 'analytics', name: 'Analytics & Metrics', icon: Icons.Analytics },
    { id: 'compliance', name: 'Compliance Reports', icon: Icons.Security },
    { id: 'inventory', name: 'Digital Inventory', icon: Icons.Dashboard },
    { id: 'marketing', name: 'Marketing Metrics', icon: Icons.Fire }
  ];

  const handleExport = async (type: 'quick' | 'tax' | 'audit' | 'science') => {
    setIsExporting(true);
    
    try {
      let data: any;
      
      switch (type) {
        case 'tax':
          data = await generateTaxReport();
          break;
        case 'audit':
          data = await generateAuditPackage();
          break;
        case 'science':
          data = await generateDataScienceExport();
          break;
        default:
          data = await generateQuickExport();
      }

      if (onExport) {
        onExport(exportConfig, data);
      } else {
        downloadExport(data, exportConfig);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const generateTaxReport = async (): Promise<TaxReport> => {
    // In production, fetch from API
    return {
      period: `${exportConfig.dateRange.start.toISOString()} - ${exportConfig.dateRange.end.toISOString()}`,
      revenue: {
        gross: 148920,
        net: 126382,
        byCategory: {
          subscriptions: 89352,
          oneTime: 29830,
          marketplace: 29738
        },
        byJurisdiction: {
          US: 89352,
          EU: 44676,
          Other: 14892
        }
      },
      expenses: {
        total: 58240,
        byCategory: {
          infrastructure: 18500,
          payroll: 25000,
          marketing: 8740,
          operations: 6000
        },
        deductible: 55240,
        nonDeductible: 3000
      },
      taxes: {
        salesTax: 8935,
        incomeTax: 22338,
        vat: 10425,
        other: 1489
      },
      forms: {
        form1099: [],
        formW2: [],
        schedule: []
      }
    };
  };

  const generateAuditPackage = async (): Promise<AuditPackage> => {
    return {
      timestamp: new Date().toISOString(),
      period: `${exportConfig.dateRange.start.toISOString()} - ${exportConfig.dateRange.end.toISOString()}`,
      financials: {
        incomeStatement: {},
        balanceSheet: {},
        cashFlow: {}
      },
      transactions: [],
      users: [],
      compliance: {
        gdpr: true,
        ccpa: true,
        pci: true,
        sox: false,
        issues: [],
        recommendations: ['Implement SOX compliance procedures']
      },
      signatures: []
    };
  };

  const generateDataScienceExport = async () => {
    return {
      users: [],
      events: [],
      features: [],
      experiments: [],
      models: [],
      predictions: []
    };
  };

  const generateQuickExport = async () => {
    const data: any = {};
    
    selectedCategories.forEach(category => {
      data[category] = {}; // Fetch category data
    });
    
    return data;
  };

  const downloadExport = (data: any, config: ExportConfig) => {
    let content: string;
    let mimeType: string;
    let extension: string;

    switch (config.format) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        extension = 'json';
        break;
      case 'xml':
        content = jsonToXML(data);
        mimeType = 'application/xml';
        extension = 'xml';
        break;
      case 'csv':
      default:
        content = jsonToCSV(data);
        mimeType = 'text/csv';
        extension = 'csv';
    }

    if (config.compression) {
      // In production, use pako or similar for compression
      console.log('Compression enabled');
    }

    if (config.encryption) {
      // In production, use crypto-js for encryption
      console.log('Encryption enabled');
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export_${Date.now()}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const jsonToCSV = (data: any): string => {
    // Simplified CSV conversion
    const rows: string[] = [];
    
    const flatten = (obj: any, prefix = ''): any => {
      return Object.keys(obj).reduce((acc, k) => {
        const pre = prefix.length ? prefix + '_' : '';
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
          Object.assign(acc, flatten(obj[k], pre + k));
        } else {
          acc[pre + k] = obj[k];
        }
        return acc;
      }, {} as any);
    };

    const flatData = flatten(data);
    rows.push(Object.keys(flatData).join(','));
    rows.push(Object.values(flatData).join(','));
    
    return rows.join('\n');
  };

  const jsonToXML = (data: any): string => {
    // Simplified XML conversion
    const convert = (obj: any, name = 'root'): string => {
      let xml = `<${name}>`;
      
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
          xml += convert(value, key);
        } else {
          xml += `<${key}>${value}</${key}>`;
        }
      }
      
      xml += `</${name}>`;
      return xml;
    };
    
    return '<?xml version="1.0" encoding="UTF-8"?>' + convert(data);
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Icons.Export size={24} />
            Export & Accounting Pack
          </h2>
          <p className="text-gray-400 mt-1">Comprehensive data export for taxes, audits, and analytics</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-gray-700">
        {(['quick', 'tax', 'audit', 'science', 'schedule'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 capitalize ${
              activeTab === tab 
                ? 'border-b-2 border-blue-500 text-blue-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'science' ? 'Data Science' : tab}
          </button>
        ))}
      </div>

      {/* Quick Export */}
      {activeTab === 'quick' && (
        <div className="space-y-6">
          {/* Date Range */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Date Range</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Start Date</label>
                <input
                  type="date"
                  className="w-full bg-gray-700 rounded px-3 py-2"
                  value={exportConfig.dateRange.start.toISOString().split('T')[0]}
                  onChange={(e) => setExportConfig({
                    ...exportConfig,
                    dateRange: {
                      ...exportConfig.dateRange,
                      start: new Date(e.target.value)
                    }
                  })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">End Date</label>
                <input
                  type="date"
                  className="w-full bg-gray-700 rounded px-3 py-2"
                  value={exportConfig.dateRange.end.toISOString().split('T')[0]}
                  onChange={(e) => setExportConfig({
                    ...exportConfig,
                    dateRange: {
                      ...exportConfig.dateRange,
                      end: new Date(e.target.value)
                    }
                  })}
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Export Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {exportCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => {
                    const newSelected = new Set(selectedCategories);
                    if (newSelected.has(category.id)) {
                      newSelected.delete(category.id);
                    } else {
                      newSelected.add(category.id);
                    }
                    setSelectedCategories(newSelected);
                  }}
                  className={`p-3 rounded-lg border transition-colors ${
                    selectedCategories.has(category.id)
                      ? 'bg-blue-600 border-blue-500'
                      : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <category.icon size={20} className="mx-auto mb-2" />
                  <p className="text-xs">{category.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Format & Options */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Format & Options</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Format</label>
                <select
                  className="w-full bg-gray-700 rounded px-3 py-2"
                  value={exportConfig.format}
                  onChange={(e) => setExportConfig({
                    ...exportConfig,
                    format: e.target.value as any
                  })}
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                  <option value="xml">XML</option>
                  <option value="excel">Excel</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exportConfig.compression}
                    onChange={(e) => setExportConfig({
                      ...exportConfig,
                      compression: e.target.checked
                    })}
                    className="rounded"
                  />
                  <span className="text-sm">Compress</span>
                </label>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exportConfig.encryption}
                    onChange={(e) => setExportConfig({
                      ...exportConfig,
                      encryption: e.target.checked
                    })}
                    className="rounded"
                  />
                  <span className="text-sm">Encrypt</span>
                </label>
              </div>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={() => handleExport('quick')}
            disabled={isExporting || selectedCategories.size === 0}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Exporting...
              </>
            ) : (
              <>
                <Icons.Export size={20} />
                Export Selected Data
              </>
            )}
          </button>
        </div>
      )}

      {/* Tax Reports */}
      {activeTab === 'tax' && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Tax Report Generator</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tax Year</label>
                <select className="w-full bg-gray-700 rounded px-3 py-2">
                  <option>2024</option>
                  <option>2023</option>
                  <option>2022</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Quarter</label>
                <select className="w-full bg-gray-700 rounded px-3 py-2">
                  <option>Q1</option>
                  <option>Q2</option>
                  <option>Q3</option>
                  <option>Q4</option>
                  <option>Annual</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-3">
              <button className="w-full py-2 bg-green-600 hover:bg-green-700 rounded flex items-center justify-center gap-2">
                Generate 1099 Forms
              </button>
              <button className="w-full py-2 bg-green-600 hover:bg-green-700 rounded flex items-center justify-center gap-2">
                Generate W-2 Forms
              </button>
              <button className="w-full py-2 bg-green-600 hover:bg-green-700 rounded flex items-center justify-center gap-2">
                Generate Schedule C
              </button>
              <button
                onClick={() => handleExport('tax')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded flex items-center justify-center gap-2"
              >
                <Icons.Export size={20} />
                Export Complete Tax Package
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Package */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Audit Package Generator</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                <span>Financial Statements</span>
                <Icons.Success size={20} className="text-green-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                <span>Transaction Logs</span>
                <Icons.Success size={20} className="text-green-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                <span>User Activity Reports</span>
                <Icons.Success size={20} className="text-green-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                <span>Compliance Documentation</span>
                <Icons.Success size={20} className="text-green-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                <span>Digital Signatures</span>
                <Icons.Warning size={20} className="text-yellow-500" />
              </div>
            </div>
            
            <button
              onClick={() => handleExport('audit')}
              className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 rounded flex items-center justify-center gap-2"
            >
              <Icons.Security size={20} />
              Generate Audit Package
            </button>
          </div>
        </div>
      )}

      {/* Data Science Export */}
      {activeTab === 'science' && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Data Science Export</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 bg-gray-700 rounded cursor-pointer">
                <input type="checkbox" className="rounded" defaultChecked />
                <span>User Behavior Data</span>
                <span className="ml-auto text-sm text-gray-400">~2.3GB</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-700 rounded cursor-pointer">
                <input type="checkbox" className="rounded" defaultChecked />
                <span>Event Stream Data</span>
                <span className="ml-auto text-sm text-gray-400">~5.1GB</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-700 rounded cursor-pointer">
                <input type="checkbox" className="rounded" defaultChecked />
                <span>Feature Engineering Tables</span>
                <span className="ml-auto text-sm text-gray-400">~1.8GB</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-700 rounded cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span>ML Model Artifacts</span>
                <span className="ml-auto text-sm text-gray-400">~890MB</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-700 rounded cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span>A/B Test Results</span>
                <span className="ml-auto text-sm text-gray-400">~340MB</span>
              </label>
            </div>
            
            <div className="mt-6 p-4 bg-gray-700 rounded">
              <p className="text-sm text-gray-300 mb-3">
                Export format optimized for data science workflows. Compatible with:
              </p>
              <div className="flex gap-3">
                <span className="px-2 py-1 bg-gray-600 rounded text-xs">Pandas</span>
                <span className="px-2 py-1 bg-gray-600 rounded text-xs">NumPy</span>
                <span className="px-2 py-1 bg-gray-600 rounded text-xs">TensorFlow</span>
                <span className="px-2 py-1 bg-gray-600 rounded text-xs">PyTorch</span>
                <span className="px-2 py-1 bg-gray-600 rounded text-xs">R</span>
              </div>
            </div>
            
            <button
              onClick={() => handleExport('science')}
              className="w-full mt-6 py-3 bg-purple-600 hover:bg-purple-700 rounded flex items-center justify-center gap-2"
            >
              <Icons.Database size={20} />
              Export for Data Science
            </button>
          </div>
        </div>
      )}

      {/* Scheduled Exports */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Scheduled Exports</h3>
            
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gray-700 rounded">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">Daily Financial Report</p>
                    <p className="text-sm text-gray-400">Every day at 6:00 AM</p>
                  </div>
                  <button className="text-red-500 hover:text-red-400">
                    <Icons.Error size={16} />
                  </button>
                </div>
                <div className="text-xs text-gray-400">
                  → admin@mythatron.com | Google Drive: /Reports/Daily/
                </div>
              </div>
              
              <div className="p-4 bg-gray-700 rounded">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">Weekly User Analytics</p>
                    <p className="text-sm text-gray-400">Every Monday at 9:00 AM</p>
                  </div>
                  <button className="text-red-500 hover:text-red-400">
                    <Icons.Error size={16} />
                  </button>
                </div>
                <div className="text-xs text-gray-400">
                  → analytics@mythatron.com | S3: mythatron-analytics/weekly/
                </div>
              </div>
            </div>
            
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded flex items-center justify-center gap-2">
              <Icons.Settings size={20} />
              Add New Schedule
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportAccountingPack;
