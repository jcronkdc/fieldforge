import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Zap, Lock, Mail, AlertCircle, ArrowRight, Shield, User, 
  Phone, Building2, CheckCircle, Eye, EyeOff, Briefcase,
  Key, UserPlus, Cpu, Check, X
} from 'lucide-react';
import { toast } from '../common/FuturisticToast';

interface PasswordStrength {
  score: number;
  message: string;
  color: string;
}

export const FuturisticSignUp: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingAccepted, setMarketingAccepted] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    company: '',
    jobTitle: '',
    companyType: 'contractor',
    projectTypes: [] as string[],
    referralSource: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    message: 'Enter a password',
    color: 'text-gray-500'
  });

  // Calculate password strength
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[@$!%*?&#]/.test(password)
    };

    Object.values(checks).forEach(passed => {
      if (passed) score++;
    });

    if (password.length >= 12) score++;
    if (password.length >= 16) score++;

    const strength = {
      0: { message: 'Enter a password', color: 'text-gray-500' },
      1: { message: 'Very Weak', color: 'text-red-500' },
      2: { message: 'Weak', color: 'text-orange-500' },
      3: { message: 'Fair', color: 'text-yellow-500' },
      4: { message: 'Good', color: 'text-blue-500' },
      5: { message: 'Strong', color: 'text-green-500' },
      6: { message: 'Very Strong', color: 'text-emerald-500' },
      7: { message: 'Excellent', color: 'text-cyan-500' }
    };

    return {
      score,
      ...strength[Math.min(score, 7) as keyof typeof strength]
    };
  };

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(formData.password));
  }, [formData.password]);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (passwordStrength.score < 3) {
      newErrors.password = 'Password is too weak';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.company) newErrors.company = 'Company is required';
    if (!formData.jobTitle) newErrors.jobTitle = 'Job title is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      toast.error('Accept the terms to continue.');
      return;
    }

    setLoading(true);
    const loadingId = toast.loading('Creating account.');

    try {
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/welcome`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            company: formData.company,
            job_title: formData.jobTitle,
            company_type: formData.companyType,
            project_types: formData.projectTypes,
            referral_source: formData.referralSource,
            marketing_consent: marketingAccepted,
            terms_accepted_at: new Date().toISOString()
          }
        }
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            job_title: formData.jobTitle,
            // Note: company_id would need to be resolved from company name
            preferences: {
              marketing_consent: marketingAccepted,
              onboarding_completed: false
            }
          });

        if (profileError) {
          console.warn('Profile creation warning:', profileError);
        }
      }

      toast.dismiss(loadingId);
      
      // Show success and redirect
      setStep(4);
      toast.success('Account created.');
      
      // Send welcome email (this would be handled by Supabase email templates)
      // In production, configure email templates in Supabase Dashboard

    } catch (error: any) {
      console.error('Signup error:', error);
      toast.dismiss(loadingId);
      toast.error('Account creation failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const projectTypeOptions = [
    'Transmission Lines',
    'Distribution Systems',
    'Substations',
    'Solar Farms',
    'Wind Farms',
    'Underground Utilities',
    'Industrial Electrical',
    'Data Centers'
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Animated Grid Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950" />
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(cyan 1px, transparent 1px),
              linear-gradient(90deg, cyan 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'slide 10s linear infinite'
          }}
        />
      </div>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-900 z-50">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-2xl px-6">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 animate-pulse shadow-[0_0_40px_rgba(255,184,0,0.5)]">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold font-['Orbitron'] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
            JOIN FIELDFORGE
          </h1>
          <p className="text-cyan-400/80 text-sm tracking-wider">
            {step === 1 && 'Create Your Account'}
            {step === 2 && 'Professional Information'}
            {step === 3 && 'Customize Your Experience'}
            {step === 4 && 'Welcome aboard'}
          </p>
        </div>

        {/* Form Container */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-lg blur opacity-30 animate-pulse" />
          
          <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-lg p-8 border border-cyan-500/30 shadow-[0_0_50px_rgba(0,212,255,0.1)]">
            
            {/* Step 1: Account Credentials */}
            {step === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-cyan-400 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyan-500/50" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-cyan-400 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyan-500/50" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-10 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                      placeholder="Create a strong password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-500/50 hover:text-cyan-400"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Password Strength</span>
                      <span className={`text-xs font-medium ${passwordStrength.color}`}>
                        {passwordStrength.message}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.score <= 2 ? 'bg-red-500' :
                          passwordStrength.score <= 4 ? 'bg-yellow-500' :
                          passwordStrength.score <= 6 ? 'bg-green-500' :
                          'bg-cyan-500'
                        }`}
                        style={{ width: `${(passwordStrength.score / 7) * 100}%` }}
                      />
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center space-x-1">
                        {formData.password.length >= 8 ? 
                          <CheckCircle className="w-3 h-3 text-green-500" /> : 
                          <X className="w-3 h-3 text-gray-500" />
                        }
                        <span className="text-gray-400">8+ characters</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {/[A-Z]/.test(formData.password) ? 
                          <CheckCircle className="w-3 h-3 text-green-500" /> : 
                          <X className="w-3 h-3 text-gray-500" />
                        }
                        <span className="text-gray-400">Uppercase</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {/\d/.test(formData.password) ? 
                          <CheckCircle className="w-3 h-3 text-green-500" /> : 
                          <X className="w-3 h-3 text-gray-500" />
                        }
                        <span className="text-gray-400">Numbers</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {/[@$!%*?&#]/.test(formData.password) ? 
                          <CheckCircle className="w-3 h-3 text-green-500" /> : 
                          <X className="w-3 h-3 text-gray-500" />
                        }
                        <span className="text-gray-400">Special chars</span>
                      </div>
                    </div>
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-cyan-400 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyan-500/50" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-10 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-500/50 hover:text-cyan-400"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="mt-1 text-sm text-red-400">Passwords do not match</p>
                  )}
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-cyan-500/25 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2 group font-['Orbitron']"
                >
                  <span>CONTINUE</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            )}

            {/* Step 2: Professional Information */}
            {step === 2 && (
              <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-cyan-400 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyan-500/50" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                        placeholder="John"
                        required
                      />
                    </div>
                    {errors.firstName && <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cyan-400 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                      placeholder="Doe"
                      required
                    />
                    {errors.lastName && <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cyan-400 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyan-500/50" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cyan-400 mb-2">
                    Company
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyan-500/50" />
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                      placeholder="Your Company Name"
                      required
                    />
                  </div>
                  {errors.company && <p className="mt-1 text-sm text-red-400">{errors.company}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-cyan-400 mb-2">
                    Job Title
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyan-500/50" />
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                      placeholder="Project Manager"
                      required
                    />
                  </div>
                  {errors.jobTitle && <p className="mt-1 text-sm text-red-400">{errors.jobTitle}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-cyan-400 mb-2">
                    Company Type
                  </label>
                  <select
                    name="companyType"
                    value={formData.companyType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                  >
                    <option value="contractor">General Contractor</option>
                    <option value="subcontractor">Subcontractor</option>
                    <option value="utility">Utility Company</option>
                    <option value="engineering">Engineering Firm</option>
                    <option value="supplier">Supplier/Vendor</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all duration-200"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-cyan-500/25 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2 group font-['Orbitron']"
                  >
                    <span>CONTINUE</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Preferences & Terms */}
            {step === 3 && (
              <form onSubmit={handleSignUp} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-cyan-400 mb-3">
                    What types of projects do you work on?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {projectTypeOptions.map(type => (
                      <label key={type} className="flex items-center space-x-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={formData.projectTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                projectTypes: [...prev.projectTypes, type]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                projectTypes: prev.projectTypes.filter(t => t !== type)
                              }));
                            }
                          }}
                          className="w-4 h-4 rounded border-cyan-500/30 bg-slate-800/50 text-cyan-500 focus:ring-cyan-500/50"
                        />
                        <span className="text-sm text-gray-300 group-hover:text-white">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cyan-400 mb-2">
                    How did you hear about FieldForge?
                  </label>
                  <select
                    name="referralSource"
                    value={formData.referralSource}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                  >
                    <option value="">Select an option</option>
                    <option value="search">Search Engine</option>
                    <option value="colleague">Colleague/Friend</option>
                    <option value="trade_show">Trade Show/Conference</option>
                    <option value="social_media">Social Media</option>
                    <option value="email">Email</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-3 p-4 bg-slate-800/30 rounded-lg border border-cyan-500/20">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-cyan-500/30 bg-slate-800/50 text-cyan-500 focus:ring-cyan-500/50"
                      required
                    />
                    <span className="text-sm text-gray-300">
                      I agree to the{' '}
                      <Link to="/terms" className="text-cyan-400 hover:text-cyan-300 underline">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link to="/privacy" className="text-cyan-400 hover:text-cyan-300 underline">
                        Privacy Policy
                      </Link>
                      <span className="text-red-400 ml-1">*</span>
                    </span>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={marketingAccepted}
                      onChange={(e) => setMarketingAccepted(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-cyan-500/30 bg-slate-800/50 text-cyan-500 focus:ring-cyan-500/50"
                    />
                    <span className="text-sm text-gray-300">
                      I'd like to receive product updates, tips, and special offers via email
                    </span>
                  </label>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50"
                  >
                    BACK
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !termsAccepted}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-green-500/25 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group font-['Orbitron']"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        <span>Create account</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-3 font-['Orbitron']">
                  Welcome to FieldForge
                </h2>
                
                <p className="text-gray-300 mb-6">
                  Account created.
                </p>
                
                <div className="p-4 bg-blue-500/10 border border-gray-700 rounded-lg mb-6">
                  <p className="text-blue-400 text-sm">
                    📧 <strong>Check your email.</strong> We've sent a confirmation link to:
                  </p>
                  <p className="text-white font-mono mt-1">{formData.email}</p>
                </div>
                
                <p className="text-gray-400 text-sm mb-6">
                  Please verify your email address to activate all features.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-cyan-500/25 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2 group font-['Orbitron']"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Go to login</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <button
                    onClick={async () => {
            const loadingId = toast.loading('Sending confirmation email.');
                      try {
                        // This would resend confirmation email via Supabase
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        toast.dismiss(loadingId);
                        toast.success('Confirmation email sent.');
                      } catch (error) {
                        toast.dismiss(loadingId);
                        toast.error('Resend failed. Try again.');
                      }
                    }}
                    className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all duration-200"
                  >
                    Resend confirmation email
                  </button>
                </div>
              </div>
            )}

            {/* Footer Links */}
            {step < 4 && (
              <div className="mt-6 pt-6 border-t border-cyan-500/20 text-center">
                <p className="text-sm text-gray-400">
                  Already have an account?{' '}
                  <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
                    Sign In
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex items-center justify-center space-x-6 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>256-bit Encryption</span>
          </div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4" />
            <span>SOC 2 Compliant</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>GDPR Ready</span>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes slide {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
};
