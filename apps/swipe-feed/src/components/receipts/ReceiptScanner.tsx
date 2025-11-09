import React, { useState, useRef, useEffect } from 'react';
import {
  Camera, Upload, X, Check, AlertCircle, Loader2, 
  Calendar, DollarSign, Building2, Tag, User,
  FileText, Sparkles, Search, ChevronDown, Mail
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ocrService } from '../../lib/services/ocrService';
import { receiptService, Receipt, CostCode } from '../../lib/services/receiptService';
import { projectService } from '../../lib/services/projectService';
import { emailService } from '../../lib/services/emailService';
import { imageEnhancer } from '../../lib/services/imageEnhancer';

interface ReceiptScannerProps {
  projectId?: string;
  onSuccess?: (receipt: Receipt) => void;
  onClose?: () => void;
}

export const ReceiptScanner: React.FC<ReceiptScannerProps> = ({
  projectId,
  onSuccess,
  onClose
}) => {
  const [step, setStep] = useState<'capture' | 'processing' | 'review'>('capture');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Form data
  const [selectedProject, setSelectedProject] = useState(projectId || '');
  const [selectedCostCode, setSelectedCostCode] = useState<string>('');
  const [vendorName, setVendorName] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [receiptDate, setReceiptDate] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  
  // Reference data
  const [projects, setProjects] = useState<any[]>([]);
  const [costCodes, setCostCodes] = useState<CostCode[]>([]);
  const [costCodeSearch, setCostCodeSearch] = useState('');
  const [showCostCodeDropdown, setShowCostCodeDropdown] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProjects();
    loadCostCodes();
  }, []);

  const loadProjects = async () => {
    const userProjects = await projectService.getUserProjects();
    setProjects(userProjects);
    if (!selectedProject && userProjects.length > 0) {
      setSelectedProject(userProjects[0].id);
    }
  };

  const loadCostCodes = async () => {
    const codes = await receiptService.getCostCodes();
    setCostCodes(codes);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setImageFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
      setStep('processing');
      performOCR(file);
    };
    reader.readAsDataURL(file);
  };

  const performOCR = async (file: File) => {
    setProcessing(true);
    setError('');

    try {
      // Enhance the image for better visibility
      const enhancedBlob = await imageEnhancer.enhanceReceipt(file);
      const enhancedFile = new File([enhancedBlob], file.name, { type: 'image/jpeg' });
      
      // Update the stored file with enhanced version
      setImageFile(enhancedFile);
      setImagePreview(URL.createObjectURL(enhancedFile));
      
      // Initialize OCR service
      await ocrService.initialize();
      
      // Process the enhanced image
      const result = await ocrService.processImage(enhancedFile);
      
      // Enhance results with AI
      const enhanced = await ocrService.enhanceWithAI(result);
      
      setOcrResult(enhanced);
      
      // Pre-fill form with extracted data
      if (enhanced.extractedData.vendor) {
        setVendorName(enhanced.extractedData.vendor);
      }
      if (enhanced.extractedData.amount) {
        setAmount(enhanced.extractedData.amount.toString());
      }
      if (enhanced.extractedData.date) {
        // Try to format date as YYYY-MM-DD for input field
        const date = new Date(enhanced.extractedData.date);
        if (!isNaN(date.getTime())) {
          setReceiptDate(date.toISOString().split('T')[0]);
        }
      }
      if (enhanced.extractedData.costCode) {
        const matchedCode = costCodes.find(c => c.code === enhanced.extractedData.costCode);
        if (matchedCode) {
          setSelectedCostCode(matchedCode.id);
        }
      }
      
      setStep('review');
    } catch (err: any) {
      console.error('OCR failed:', err);
      setError('Failed to process image. Please try again.');
      setStep('capture');
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedProject || !amount || !receiptDate) {
      setError('Please fill in all required fields');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      
      // Get user profile for name
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();
      
      const userName = userProfile 
        ? `${userProfile.first_name} ${userProfile.last_name}`
        : user.email?.split('@')[0] || 'Unknown User';

      // Get project details
      const project = projects.find(p => p.id === selectedProject);
      const jobNumber = project?.project_number || 'UNKNOWN';
      
      // Get cost code details
      const costCodeObj = costCodes.find(c => c.id === selectedCostCode);
      const costCodeString = costCodeObj ? `${costCodeObj.code} - ${costCodeObj.name}` : 'No Code';
      
      // Stamp the receipt with project info
      let stampedImage = imageFile;
      if (imageFile) {
        const stampedBlob = await imageEnhancer.stampReceipt(imageFile, {
          userName,
          date: receiptDate,
          jobNumber,
          costCode: costCodeObj?.code || 'N/A',
          status: 'PENDING'
        });
        stampedImage = new File([stampedBlob], 'stamped_' + imageFile.name, { type: 'image/jpeg' });
      }

      // Upload images to storage
      let imageUrl = '';
      let thumbnailUrl = '';
      
      if (stampedImage) {
        imageUrl = await ocrService.uploadReceiptImage(stampedImage, user.id, selectedProject);
        thumbnailUrl = await ocrService.createThumbnail(stampedImage);
      }

      // Create receipt record
      const receipt = await receiptService.createReceipt({
        project_id: selectedProject,
        company_cost_code_id: selectedCostCode || undefined,
        vendor_name: vendorName,
        amount: parseFloat(amount),
        total_amount: parseFloat(amount),
        receipt_date: receiptDate,
        image_url: imageUrl,
        thumbnail_url: thumbnailUrl,
        description,
        notes,
        ocr_text: ocrResult?.text,
        ocr_confidence: ocrResult?.confidence,
        ocr_processed: true,
        extracted_vendor: ocrResult?.extractedData?.vendor,
        extracted_amount: ocrResult?.extractedData?.amount?.toString(),
        extracted_date: ocrResult?.extractedData?.date,
        extracted_items: ocrResult?.extractedData?.items,
        status: 'pending'
      });

      if (receipt) {
        // Send email notification
        const emailSent = await emailService.sendReceiptEmail({
          userName,
          userEmail: user.email || '',
          jobNumber,
          transactionDate: receiptDate,
          costCode: costCodeString,
          vendorName: vendorName || 'Unknown Vendor',
          amount: parseFloat(amount),
          receiptImage: imageFile!,
          enhancedImage: stampedImage
        });
        
        if (!emailSent) {
          console.warn('Email notification failed, but receipt was saved');
        }
        
        onSuccess?.(receipt);
        resetForm();
      } else {
        throw new Error('Failed to create receipt');
      }
    } catch (err: any) {
      console.error('Failed to save receipt:', err);
      setError('Failed to save receipt. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setStep('capture');
    setImageFile(null);
    setImagePreview('');
    setOcrResult(null);
    setVendorName('');
    setAmount('');
    setReceiptDate('');
    setDescription('');
    setNotes('');
    setSelectedCostCode('');
    setError('');
  };

  const filteredCostCodes = costCodes.filter(code => 
    code.code.toLowerCase().includes(costCodeSearch.toLowerCase()) ||
    code.name.toLowerCase().includes(costCodeSearch.toLowerCase()) ||
    code.category.toLowerCase().includes(costCodeSearch.toLowerCase())
  );

  const selectedCostCodeObj = costCodes.find(c => c.id === selectedCostCode);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Receipt Scanner</h2>
              <p className="text-cyan-100 mt-1">
                {step === 'capture' && 'Take a photo or upload receipt'}
                {step === 'processing' && 'Processing image with OCR...'}
                {step === 'review' && 'Review and confirm details'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {error && (
            <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-300">{error}</span>
            </div>
          )}

          {/* Step 1: Capture */}
          {step === 'capture' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Camera Capture */}
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="p-8 bg-gray-800 border-2 border-dashed border-gray-600 rounded-xl hover:border-cyan-500 hover:bg-gray-700 transition-all group"
                >
                  <Camera className="w-12 h-12 text-gray-400 group-hover:text-cyan-400 mx-auto mb-3" />
                  <span className="text-gray-300 font-medium">Take Photo</span>
                  <p className="text-xs text-gray-500 mt-1">Use camera</p>
                </button>

                {/* File Upload */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 bg-gray-800 border-2 border-dashed border-gray-600 rounded-xl hover:border-purple-500 hover:bg-gray-700 transition-all group"
                >
                  <Upload className="w-12 h-12 text-gray-400 group-hover:text-purple-400 mx-auto mb-3" />
                  <span className="text-gray-300 font-medium">Upload Image</span>
                  <p className="text-xs text-gray-500 mt-1">From gallery</p>
                </button>
              </div>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Sparkles className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-blue-300 font-semibold">AI-Powered OCR</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Our system will automatically extract vendor, amount, date, and suggest the appropriate cost code
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Processing */}
          {step === 'processing' && (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Processing Receipt</h3>
              <p className="text-gray-400">Extracting text and analyzing content...</p>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Receipt"
                  className="mt-6 max-w-sm mx-auto rounded-lg shadow-lg"
                />
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {step === 'review' && (
            <div className="space-y-6">
              {/* Email Notification Info */}
              <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-blue-300 font-medium">Email Notification</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Receipt will be automatically emailed to: <span className="text-white font-medium">justincronk@pm.me</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      You will be CC'd on this email
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <img
                    src={imagePreview}
                    alt="Receipt"
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              )}

              {/* OCR Confidence */}
              {ocrResult && (
                <div className="p-3 bg-gray-800 rounded-lg flex items-center justify-between">
                  <span className="text-gray-400 text-sm">OCR Confidence</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all"
                        style={{ width: `${(ocrResult.confidence || 0) * 100}%` }}
                      />
                    </div>
                    <span className="text-white text-sm font-medium">
                      {((ocrResult.confidence || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Project */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Project *
                  </label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name} ({project.project_number})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cost Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    Cost Code
                  </label>
                  <div className="relative">
                    <div
                      onClick={() => setShowCostCodeDropdown(!showCostCodeDropdown)}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white cursor-pointer flex items-center justify-between"
                    >
                      <span>
                        {selectedCostCodeObj 
                          ? `${selectedCostCodeObj.code} - ${selectedCostCodeObj.name}`
                          : 'Select Cost Code'
                        }
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                    
                    {showCostCodeDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
                        <div className="p-2">
                          <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={costCodeSearch}
                              onChange={(e) => setCostCodeSearch(e.target.value)}
                              placeholder="Search cost codes..."
                              className="w-full pl-9 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                            />
                          </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {filteredCostCodes.map(code => (
                            <button
                              key={code.id}
                              onClick={() => {
                                setSelectedCostCode(code.id);
                                setShowCostCodeDropdown(false);
                                setCostCodeSearch('');
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors"
                            >
                              <div className="font-medium text-white">
                                {code.code} - {code.name}
                              </div>
                              <div className="text-xs text-gray-400">{code.category}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vendor */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Vendor Name
                  </label>
                  <input
                    type="text"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="e.g. Home Depot"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Total Amount *
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Receipt Date *
                  </label>
                  <input
                    type="date"
                    value={receiptDate}
                    onChange={(e) => setReceiptDate(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="Brief description of purchase"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="Additional notes..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold text-white transition-colors"
                >
                  Start Over
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={processing || !selectedProject || !amount || !receiptDate}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving & Emailing...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      <span>Save & Send Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
