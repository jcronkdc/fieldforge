import React, { useState } from 'react';
import { Building, Code, DollarSign, Users, Zap, Shield, CheckCircle, ArrowRight, Compass, Ruler } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send to backend
    alert('Thank you for your inquiry. We will contact you within 24 hours.');
    navigate('/');
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
    <div className="min-h-screen davinci-grid paper-texture">
      {/* Renaissance Decorations */}
      <div className="compass-rose" />
      
      <div className="max-w-6xl mx-auto p-[34px]">
        {/* Header */}
        <Link to="/" className="inline-flex items-center gap-[13px] text-amber-400 hover:text-amber-300 mb-[34px] technical-annotation" data-note="RETURN">
          <ArrowRight className="w-5 h-5 rotate-180" />
          Back to Home
        </Link>

        <div className="text-center mb-[55px]">
          <h1 className="text-golden-3xl font-bold text-white mb-[21px] measurement-line">
            Partner with FieldForge
          </h1>
          <p className="text-golden-lg text-amber-400/80 max-w-3xl mx-auto field-readable">
            Acquire our platform or commission custom construction software built by experts who understand your industry
          </p>
        </div>

        {/* Option Cards */}
        <div className="grid md:grid-cols-2 gap-[34px] mb-[55px]">
          {/* Acquisition Option */}
          <div 
            className={`card-vitruvian p-[34px] rounded-[21px] tech-border depth-layer-1 corner-sketch cursor-pointer transition-all ${
              inquiryType === 'acquire' ? 'ring-2 ring-amber-400 scale-[1.02]' : 'hover:scale-[1.01]'
            }`}
            onClick={() => setInquiryType('acquire')}
          >
            <div className="flex items-center gap-[21px] mb-[21px]">
              <div className="vitruvian-square">
                <DollarSign className="w-[34px] h-[34px] text-amber-400" />
              </div>
              <h2 className="text-golden-xl font-bold text-white measurement-line">
                Acquire FieldForge
              </h2>
            </div>
            <p className="text-golden-base text-amber-400/60 mb-[21px] field-readable">
              Purchase the entire FieldForge platform, including source code, infrastructure, 
              and our development team. Perfect for companies looking to own their construction 
              management solution outright.
            </p>
            <ul className="space-y-[13px]">
              <li className="flex items-start gap-[8px]">
                <CheckCircle className="w-5 h-5 text-green-400 mt-[2px]" />
                <span className="text-golden-sm text-amber-400/80">Full source code ownership</span>
              </li>
              <li className="flex items-start gap-[8px]">
                <CheckCircle className="w-5 h-5 text-green-400 mt-[2px]" />
                <span className="text-golden-sm text-amber-400/80">Existing customer base (optional)</span>
              </li>
              <li className="flex items-start gap-[8px]">
                <CheckCircle className="w-5 h-5 text-green-400 mt-[2px]" />
                <span className="text-golden-sm text-amber-400/80">Development team retention</span>
              </li>
            </ul>
          </div>

          {/* Custom Development Option */}
          <div 
            className={`card-vitruvian p-[34px] rounded-[21px] tech-border depth-layer-1 corner-sketch cursor-pointer transition-all ${
              inquiryType === 'custom' ? 'ring-2 ring-amber-400 scale-[1.02]' : 'hover:scale-[1.01]'
            }`}
            onClick={() => setInquiryType('custom')}
          >
            <div className="flex items-center gap-[21px] mb-[21px]">
              <div className="vitruvian-square">
                <Code className="w-[34px] h-[34px] text-amber-400" />
              </div>
              <h2 className="text-golden-xl font-bold text-white measurement-line">
                Custom Development
              </h2>
            </div>
            <p className="text-golden-base text-amber-400/60 mb-[21px] field-readable">
              Commission a custom construction management platform tailored to your specific 
              needs. Leverage our deep industry expertise to build exactly what your teams 
              need to succeed.
            </p>
            <ul className="space-y-[13px]">
              <li className="flex items-start gap-[8px]">
                <CheckCircle className="w-5 h-5 text-green-400 mt-[2px]" />
                <span className="text-golden-sm text-amber-400/80">Built to your specifications</span>
              </li>
              <li className="flex items-start gap-[8px]">
                <CheckCircle className="w-5 h-5 text-green-400 mt-[2px]" />
                <span className="text-golden-sm text-amber-400/80">Industry best practices built-in</span>
              </li>
              <li className="flex items-start gap-[8px]">
                <CheckCircle className="w-5 h-5 text-green-400 mt-[2px]" />
                <span className="text-golden-sm text-amber-400/80">Ongoing support & maintenance</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Why Partner Section */}
        <div className="dashboard-card p-[34px] rounded-[21px] tech-border depth-layer-1 mb-[55px]">
          <h2 className="text-golden-xl font-bold text-white mb-[34px] measurement-line text-center">
            Why Partner with FieldForge
          </h2>
          <div className="grid md:grid-cols-2 gap-[21px]">
            {benefits.map((benefit, index) => (
              <div key={benefit.title} className="flex gap-[21px] breathe" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="vitruvian-rect flex-shrink-0">
                  <benefit.icon className="w-[21px] h-[21px] text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-golden-base mb-[8px]">{benefit.title}</h3>
                  <p className="text-golden-sm text-amber-400/60">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        {inquiryType && (
          <div className="card-vitruvian p-[34px] rounded-[21px] tech-border depth-layer-1 corner-sketch">
            <h2 className="text-golden-xl font-bold text-white mb-[34px] measurement-line text-center">
              {inquiryType === 'acquire' ? 'Acquisition Inquiry' : 'Custom Development Inquiry'}
            </h2>
            
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-[21px]">
              <div className="grid md:grid-cols-2 gap-[21px]">
                <div>
                  <label className="block text-golden-sm font-medium text-amber-400 mb-[8px] technical-annotation" data-note="REQUIRED">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full input-davinci px-[21px] py-[13px] rounded-[8px] bg-slate-800/50 text-white field-readable"
                  />
                </div>
                
                <div>
                  <label className="block text-golden-sm font-medium text-amber-400 mb-[8px] technical-annotation" data-note="REQUIRED">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full input-davinci px-[21px] py-[13px] rounded-[8px] bg-slate-800/50 text-white field-readable"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-[21px]">
                <div>
                  <label className="block text-golden-sm font-medium text-amber-400 mb-[8px] technical-annotation" data-note="REQUIRED">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full input-davinci px-[21px] py-[13px] rounded-[8px] bg-slate-800/50 text-white field-readable"
                  />
                </div>
                
                <div>
                  <label className="block text-golden-sm font-medium text-amber-400 mb-[8px]">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full input-davinci px-[21px] py-[13px] rounded-[8px] bg-slate-800/50 text-white field-readable"
                  />
                </div>
              </div>

              <div>
                <label className="block text-golden-sm font-medium text-amber-400 mb-[8px] technical-annotation" data-note="DESCRIBE">
                  {inquiryType === 'acquire' ? 'Acquisition Goals' : 'Project Description'} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.projectDescription}
                  onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                  className="w-full input-davinci px-[21px] py-[13px] rounded-[8px] bg-slate-800/50 text-white field-readable"
                  placeholder={inquiryType === 'acquire' 
                    ? "Tell us about your acquisition goals and how FieldForge fits into your strategy..." 
                    : "Describe your construction management needs and specific requirements..."}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-[21px]">
                <div>
                  <label className="block text-golden-sm font-medium text-amber-400 mb-[8px]">
                    Timeline
                  </label>
                  <select 
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    className="w-full input-davinci px-[21px] py-[13px] rounded-[8px] bg-slate-800/50 text-white field-readable"
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
                  <label className="block text-golden-sm font-medium text-amber-400 mb-[8px]">
                    Budget Range
                  </label>
                  <select 
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full input-davinci px-[21px] py-[13px] rounded-[8px] bg-slate-800/50 text-white field-readable"
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
                  className="btn-davinci px-[55px] py-[13px] text-white font-semibold field-touch glow-renaissance breathe"
                >
                  Submit Inquiry
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Leonardo Quote */}
        <div className="text-center opacity-30 mt-[89px]">
          <p className="text-golden-sm text-amber-400/60 font-light italic">
            "Where the spirit does not work with the hand, there is no art."
          </p>
          <p className="text-xs text-amber-400/40 mt-2">— Leonardo da Vinci</p>
        </div>
      </div>
    </div>
  );
};

export default AcquisitionInquiry;
