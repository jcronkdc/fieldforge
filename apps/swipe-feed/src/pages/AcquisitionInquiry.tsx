import React, { useState } from 'react';
import { Building, Code, DollarSign, Users, Zap, Shield, CheckCircle, ArrowRight, Compass, Ruler, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const AcquisitionInquiry: React.FC = () => {
  const navigate = useNavigate();
  const [inquiryType, setInquiryType] = useState<'acquire' | 'custom' | null>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    projectDescription: '',
    timeline: '',
    budget: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inquiryType) {
      setSubmitError('Please select an inquiry type');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/acquisition-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiryType,
          ...formData,
          submittedAt: new Date().toISOString(),
          ipAddress: '', // Will be set server-side
          userAgent: navigator.userAgent
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit inquiry');
      }

      setIsSuccess(true);
      
      // Reset form and redirect after delay
      setTimeout(() => {
        setFormData({
          companyName: '',
          contactName: '',
          email: '',
          phone: '',
          projectDescription: '',
          timeline: '',
          budget: ''
        });
        setInquiryType(null);
        setIsSuccess(false);
        navigate('/');
      }, 3000);
      
    } catch (error: any) {
      console.error('Error submitting acquisition inquiry:', error);
      setSubmitError(error.message || 'Failed to submit. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    { 
      icon: Shield, 
      title: 'Battle-Tested Platform',
      description: 'Proven in the field with 500+ crews and 45+ minutes saved daily'
    },
    {
      icon: Users,
      title: 'Full Team Transfer',
      description: 'Our entire development team available for seamless transition'
    },
    {
      icon: Zap,
      title: 'Industry Expertise',
      description: 'Built specifically for T&D and substation construction'
    },
    {
      icon: Building,
      title: 'White-Label Ready',
      description: 'Rebrand as your own platform with custom domain and branding'
    }
  ];

  return (
    <div className="min-h-screen  ">
      {/* Renaissance Decorations */}
      <div className="" />
      
      <div className="max-w-6xl mx-auto p-[34px]">
        {/* Header */}
        <Link to="/" className="inline-flex items-center gap-[13px] text-blue-400 hover:text-blue-300 mb-[34px] " >
          <ArrowRight className="w-5 h-5 rotate-180" />
          Back to Home
        </Link>

        <div className="text-center mb-[55px]">
          <h1 className="text-golden-3xl font-bold text-white mb-[21px] ">
            Partner with FieldForge
          </h1>
          <p className="text-lg text-blue-400/80 max-w-3xl mx-auto ">
            Acquire our platform or commission custom construction software built by experts who understand your industry
          </p>
        </div>

        {/* Option Cards */}
        <div className="grid md:grid-cols-2 gap-[34px] mb-[55px]">
          {/* Acquisition Option */}
          <div 
            className={`bg-gray-800/50 border border-gray-700 rounded-lg p-[34px] rounded-[21px] border border-gray-700   cursor-pointer transition-all ${
              inquiryType === 'acquire' ? 'ring-2 ring-amber-400 scale-[1.02]' : 'hover:scale-[1.01]'
            }`}
            onClick={() => setInquiryType('acquire')}
          >
            <div className="flex items-center gap-[21px] mb-[21px]">
              <div className="">
                <DollarSign className="w-[34px] h-[34px] text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white ">
                Acquire FieldForge
              </h2>
            </div>
            <p className="text-base text-blue-400/60 mb-[21px] ">
              Purchase the entire FieldForge platform, including source code, infrastructure, 
              and our development team. Perfect for companies looking to own their construction 
              management solution outright.
            </p>
            <ul className="space-y-[13px]">
              <li className="flex items-start gap-[8px]">
                <CheckCircle className="w-5 h-5 text-green-400 mt-[2px]" />
                <span className="text-sm text-blue-400/80">Full source code ownership</span>
              </li>
              <li className="flex items-start gap-[8px]">
                <CheckCircle className="w-5 h-5 text-green-400 mt-[2px]" />
                <span className="text-sm text-blue-400/80">Existing customer base (optional)</span>
              </li>
              <li className="flex items-start gap-[8px]">
                <CheckCircle className="w-5 h-5 text-green-400 mt-[2px]" />
                <span className="text-sm text-blue-400/80">Development team retention</span>
              </li>
            </ul>
          </div>

          {/* Custom Development Option */}
          <div 
            className={`bg-gray-800/50 border border-gray-700 rounded-lg p-[34px] rounded-[21px] border border-gray-700   cursor-pointer transition-all ${
              inquiryType === 'custom' ? 'ring-2 ring-amber-400 scale-[1.02]' : 'hover:scale-[1.01]'
            }`}
            onClick={() => setInquiryType('custom')}
          >
            <div className="flex items-center gap-[21px] mb-[21px]">
              <div className="">
                <Code className="w-[34px] h-[34px] text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white ">
                Custom Development
              </h2>
            </div>
            <p className="text-base text-blue-400/60 mb-[21px] ">
              Commission a custom construction management platform tailored to your specific 
              needs. Leverage our deep industry expertise to build exactly what your teams 
              need to succeed.
            </p>
            <ul className="space-y-[13px]">
              <li className="flex items-start gap-[8px]">
                <CheckCircle className="w-5 h-5 text-green-400 mt-[2px]" />
                <span className="text-sm text-blue-400/80">Built to your specifications</span>
              </li>
              <li className="flex items-start gap-[8px]">
                <CheckCircle className="w-5 h-5 text-green-400 mt-[2px]" />
                <span className="text-sm text-blue-400/80">Industry best practices built-in</span>
              </li>
              <li className="flex items-start gap-[8px]">
                <CheckCircle className="w-5 h-5 text-green-400 mt-[2px]" />
                <span className="text-sm text-blue-400/80">Ongoing support & maintenance</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Why Partner Section */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-[34px] rounded-[21px] border border-gray-700  mb-[55px]">
          <h2 className="text-xl font-bold text-white mb-[34px]  text-center">
            Why Partner with FieldForge
          </h2>
          <div className="grid md:grid-cols-2 gap-[21px]">
            {benefits.map((benefit, index) => (
              <div key={benefit.title} className="flex gap-[21px] " style={{ animationDelay: `${index * 0.1}s` }}>
                <div className=" flex-shrink-0">
                  <benefit.icon className="w-[21px] h-[21px] text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base mb-[8px]">{benefit.title}</h3>
                  <p className="text-sm text-blue-400/60">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Message */}
        {isSuccess && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-[21px] p-[55px] text-center max-w-2xl mx-auto mb-[34px]">
            <CheckCircle2 className="w-[55px] h-[55px] text-green-400 mx-auto mb-[21px]" />
            <h2 className="text-xl font-bold text-white mb-[13px]">Thank You!</h2>
            <p className="text-blue-400/80">
              We've received your inquiry and will contact you within 24 hours.
            </p>
          </div>
        )}

        {/* Contact Form */}
        {inquiryType && !isSuccess && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-[34px] rounded-[21px] border border-gray-700  ">
            <h2 className="text-xl font-bold text-white mb-[34px]  text-center">
              {inquiryType === 'acquire' ? 'Acquisition Inquiry' : 'Custom Development Inquiry'}
            </h2>
            
            {submitError && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-[21px] mb-[34px] flex items-center gap-[13px]">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-400 text-sm">{submitError}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-[21px]">
              <div className="grid md:grid-cols-2 gap-[21px]">
                <div>
                  <label className="block text-sm font-medium text-blue-400 mb-[8px] " >
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 px-[21px] py-[13px] rounded-[8px] bg-slate-800/50 text-white "
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-400 mb-[8px] " >
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 px-[21px] py-[13px] rounded-[8px] bg-slate-800/50 text-white "
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-[21px]">
                <div>
                  <label className="block text-sm font-medium text-blue-400 mb-[8px] " >
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 px-[21px] py-[13px] rounded-[8px] bg-slate-800/50 text-white "
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-400 mb-[8px]">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 px-[21px] py-[13px] rounded-[8px] bg-slate-800/50 text-white "
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-400 mb-[8px] " >
                  {inquiryType === 'acquire' ? 'Acquisition Goals' : 'Project Description'} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.projectDescription}
                  onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                  className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 px-[21px] py-[13px] rounded-[8px] bg-slate-800/50 text-white "
                  placeholder={inquiryType === 'acquire' 
                    ? "Tell us about your acquisition goals and how FieldForge fits into your strategy..." 
                    : "Describe your construction management needs and specific requirements..."}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-[21px]">
                <div>
                  <label className="block text-sm font-medium text-blue-400 mb-[8px]">
                    Timeline
                  </label>
                  <select 
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 px-[21px] py-[13px] rounded-[8px] bg-slate-800/50 text-white "
                  >
                    <option value="">Select timeline</option>
                    <option value="immediate">Immediate (&lt; 1 month)</option>
                    <option value="quarter">This Quarter</option>
                    <option value="half-year">Next 6 Months</option>
                    <option value="year">Within a Year</option>
                    <option value="exploring">Just Exploring</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-400 mb-[8px]">
                    Budget Range
                  </label>
                  <select 
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 px-[21px] py-[13px] rounded-[8px] bg-slate-800/50 text-white "
                  >
                    <option value="">Select budget</option>
                    <option value="under-100k">Under $100K</option>
                    <option value="100-500k">$100K - $500K</option>
                    <option value="500k-1m">$500K - $1M</option>
                    <option value="1m-5m">$1M - $5M</option>
                    <option value="over-5m">Over $5M</option>
                    <option value="tbd">To Be Determined</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-center pt-[21px]">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all px-[55px] py-[13px] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-[8px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Submit Inquiry</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default AcquisitionInquiry;
