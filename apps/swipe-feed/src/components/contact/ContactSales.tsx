import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, Users, DollarSign, Clock, Phone, Mail, 
  Calendar, ChevronRight, ChevronLeft, Check, Send,
  Loader2, CheckCircle2, ArrowRight, Briefcase, Target
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FormData {
  // Company Info
  companyName: string;
  industrySegment: string;
  companySize: string;
  annualRevenue: string;
  currentSoftware: string[];
  
  // Project Info
  avgProjectSize: string;
  projectsPerYear: string;
  projectDuration: string;
  mainChallenges: string[];
  
  // Contact Info
  fullName: string;
  title: string;
  email: string;
  phone: string;
  bestTimeToCall: string;
  timezone: string;
  
  // Additional
  source: string;
  interestedFeatures: string[];
  timeline: string;
  notes: string;
}

const initialFormData: FormData = {
  companyName: '',
  industrySegment: '',
  companySize: '',
  annualRevenue: '',
  currentSoftware: [],
  avgProjectSize: '',
  projectsPerYear: '',
  projectDuration: '',
  mainChallenges: [],
  fullName: '',
  title: '',
  email: '',
  phone: '',
  bestTimeToCall: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  source: '',
  interestedFeatures: [],
  timeline: '',
  notes: ''
};

export const ContactSales: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const steps = [
    { number: 1, title: "Company Info", icon: Building2 },
    { number: 2, title: "Project Details", icon: Briefcase },
    { number: 3, title: "Contact Info", icon: Phone },
    { number: 4, title: "Final Details", icon: Target }
  ];

  const industrySements = [
    'Electrical Contractor',
    'General Contractor',
    'Transmission & Distribution',
    'Substation Construction',
    'Solar/Renewable Energy',
    'Heavy Civil',
    'Industrial Construction',
    'Other'
  ];

  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '500+ employees'
  ];

  const challenges = [
    'Time tracking accuracy',
    'Safety compliance',
    'Equipment management',
    'Document control',
    'Field communication',
    'Resource scheduling',
    'Project visibility',
    'Reporting efficiency'
  ];

  const features = [
    'Voice control',
    'Offline capability',
    'Equipment testing',
    'Safety management',
    'Real-time analytics',
    'Document management',
    'API integrations',
    'Custom workflows'
  ];

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.companyName || !formData.industrySegment || !formData.companySize) {
          toast.error('Please fill in all required fields');
          return false;
        }
        break;
      case 2:
        if (!formData.avgProjectSize || !formData.projectsPerYear) {
          toast.error('Please provide project information');
          return false;
        }
        break;
      case 3:
        if (!formData.fullName || !formData.title || !formData.email || !formData.phone) {
          toast.error('Please fill in all contact information');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          toast.error('Please enter a valid email address');
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
          ipAddress: '', // Will be set server-side
          userAgent: navigator.userAgent
        })
      });

      if (!response.ok) throw new Error('Failed to submit');

      setIsSuccess(true);
      toast.success('Thank you! We\'ll be in touch within 24 hours.');
      
      // Clear form after short delay
      setTimeout(() => {
        setFormData(initialFormData);
        setStep(1);
        setIsSuccess(false);
      }, 5000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit. Please try again or call us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950   flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-[55px] max-w-2xl"
        >
          <CheckCircle2 className="w-[89px] h-[89px] text-green-400 mx-auto mb-[34px]" />
          <h1 className="text-xl font-bold text-white mb-[21px]">Thank You!</h1>
          <p className="text-xl text-slate-300 mb-[34px]">
            We've received your information and will be in touch within 24 hours.
          </p>
          <p className="text-lg text-slate-400">
            Check your email for a confirmation and calendar link to schedule a demo at your convenience.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950  ">
      <div className="max-w-4xl mx-auto px-4 py-[89px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-[55px]"
        >
          <h1 className="text-xl md:text-2xl font-bold text-white mb-[21px]">
            Let's Transform Your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              Field Operations
            </span>
          </h1>
          <p className="text-xl text-slate-300">
            Tell us about your business and we'll show you exactly how FieldForge can help
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-[55px]">
          {steps.map((s, index) => (
            <React.Fragment key={s.number}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`flex flex-col items-center ${
                  s.number === step ? 'opacity-100' : 'opacity-50'
                }`}
              >
                <div className={`w-[55px] h-[55px] rounded-full flex items-center justify-center mb-[8px] ${
                  s.number < step
                    ? 'bg-green-500'
                    : s.number === step
                    ? 'bg-blue-500'
                    : 'bg-slate-700'
                }`}>
                  {s.number < step ? (
                    <Check className="w-6 h-6 text-white" />
                  ) : (
                    <s.icon className="w-6 h-6 text-white" />
                  )}
                </div>
                <span className="text-sm text-slate-400 hidden md:block">{s.title}</span>
              </motion.div>
              {index < steps.length - 1 && (
                <div className={`w-[89px] h-[2px] mx-[13px] ${
                  s.number < step ? 'bg-green-500' : 'bg-slate-700'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card-vitruvian  p-[55px] rounded-[21px] mb-[34px]"
        >
          {/* Step 1: Company Info */}
          {step === 1 && (
            <div className="space-y-[34px]">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                  placeholder="ABC Construction Inc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                  Industry Segment *
                </label>
                <select
                  value={formData.industrySegment}
                  onChange={(e) => setFormData({ ...formData, industrySegment: e.target.value })}
                  className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                >
                  <option value="">Select industry...</option>
                  {industrySements.map(segment => (
                    <option key={segment} value={segment}>{segment}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                  Company Size *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-[13px]">
                  {companySizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setFormData({ ...formData, companySize: size })}
                      className={`px-[21px] py-[13px] rounded-[8px] text-sm transition-all ${
                        formData.companySize === size
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                  Annual Revenue (Optional)
                </label>
                <select
                  value={formData.annualRevenue}
                  onChange={(e) => setFormData({ ...formData, annualRevenue: e.target.value })}
                  className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                >
                  <option value="">Prefer not to say</option>
                  <option value="< $1M">Less than $1M</option>
                  <option value="$1M - $5M">$1M - $5M</option>
                  <option value="$5M - $20M">$5M - $20M</option>
                  <option value="$20M - $50M">$20M - $50M</option>
                  <option value="$50M+">$50M+</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Project Details */}
          {step === 2 && (
            <div className="space-y-[34px]">
              <div className="grid md:grid-cols-2 gap-[34px]">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                    Average Project Size *
                  </label>
                  <select
                    value={formData.avgProjectSize}
                    onChange={(e) => setFormData({ ...formData, avgProjectSize: e.target.value })}
                    className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                  >
                    <option value="">Select range...</option>
                    <option value="< $100K">Less than $100K</option>
                    <option value="$100K - $500K">$100K - $500K</option>
                    <option value="$500K - $1M">$500K - $1M</option>
                    <option value="$1M - $5M">$1M - $5M</option>
                    <option value="$5M+">$5M+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                    Projects Per Year *
                  </label>
                  <input
                    type="number"
                    value={formData.projectsPerYear}
                    onChange={(e) => setFormData({ ...formData, projectsPerYear: e.target.value })}
                    className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                    placeholder="10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                  Main Challenges (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-[13px]">
                  {challenges.map(challenge => (
                    <label key={challenge} className="flex items-center gap-[8px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.mainChallenges.includes(challenge)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, mainChallenges: [...formData.mainChallenges, challenge] });
                          } else {
                            setFormData({ ...formData, mainChallenges: formData.mainChallenges.filter(c => c !== challenge) });
                          }
                        }}
                        className="w-5 h-5 text-blue-500 bg-slate-800/50 border-slate-600 rounded"
                      />
                      <span className="text-sm text-slate-300">{challenge}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                  Current Software Used
                </label>
                <input
                  type="text"
                  value={formData.currentSoftware.join(', ')}
                  onChange={(e) => setFormData({ ...formData, currentSoftware: e.target.value.split(', ').filter(s => s) })}
                  className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                  placeholder="Procore, Excel, Paper forms..."
                />
              </div>
            </div>
          )}

          {/* Step 3: Contact Info */}
          {step === 3 && (
            <div className="space-y-[34px]">
              <div className="grid md:grid-cols-2 gap-[34px]">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                    Title/Role *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                    placeholder="Operations Manager"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-[34px]">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                    placeholder="john@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                  Best Time to Call
                </label>
                <select
                  value={formData.bestTimeToCall}
                  onChange={(e) => setFormData({ ...formData, bestTimeToCall: e.target.value })}
                  className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                >
                  <option value="">Any time</option>
                  <option value="Morning (8am-12pm)">Morning (8am-12pm)</option>
                  <option value="Afternoon (12pm-5pm)">Afternoon (12pm-5pm)</option>
                  <option value="Evening (5pm-7pm)">Evening (5pm-7pm)</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 4: Final Details */}
          {step === 4 && (
            <div className="space-y-[34px]">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                  Features You're Interested In
                </label>
                <div className="grid grid-cols-2 gap-[13px]">
                  {features.map(feature => (
                    <label key={feature} className="flex items-center gap-[8px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.interestedFeatures.includes(feature)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, interestedFeatures: [...formData.interestedFeatures, feature] });
                          } else {
                            setFormData({ ...formData, interestedFeatures: formData.interestedFeatures.filter(f => f !== feature) });
                          }
                        }}
                        className="w-5 h-5 text-blue-500 bg-slate-800/50 border-slate-600 rounded"
                      />
                      <span className="text-sm text-slate-300">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                  Implementation Timeline
                </label>
                <select
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                  className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                >
                  <option value="">Select timeline...</option>
                  <option value="ASAP">As soon as possible</option>
                  <option value="1 month">Within 1 month</option>
                  <option value="3 months">Within 3 months</option>
                  <option value="6 months">Within 6 months</option>
                  <option value="Just researching">Just researching</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                  How did you hear about FieldForge?
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                >
                  <option value="">Select source...</option>
                  <option value="Google Search">Google Search</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Referral">Referral</option>
                  <option value="Trade Show">Trade Show</option>
                  <option value="Industry Publication">Industry Publication</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px] min-h-[144px]"
                  placeholder="Tell us more about your specific needs..."
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-[8px] px-[34px] py-[13px] text-white hover:text-blue-400 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          )}
          
          <div className="ml-auto">
            {step < 4 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-[8px] px-[34px] py-[13px] bg-blue-500 hover:bg-blue-600 text-white rounded-[8px] font-semibold transition-all bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-[8px] px-[34px] py-[13px] bg-blue-500 hover:bg-blue-600 text-white rounded-[8px] font-semibold transition-all bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all  disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Schedule Demo
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
