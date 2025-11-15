import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '../../lib/auth';
import { 
  Zap, Shield, Eye, EyeOff, AlertCircle, CheckCircle, 
  Loader2, Building2, User, Mail, Phone, Briefcase,
  ArrowRight
} from 'lucide-react';

export const SignUpPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    company: '',
    jobTitle: '',
    employeeId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Complete the required fields.');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least eight characters.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.firstName || !formData.lastName || !formData.company || !formData.jobTitle) {
      setError('Complete the required fields.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      handleSignUp();
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create auth user with profile data
      await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        company: formData.company,
        jobTitle: formData.jobTitle,
        employeeId: formData.employeeId
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Account creation failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl mb-4">
            <Zap className="w-10 h-10 text-white" />
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Join FieldForge</h1>
          <p className="text-slate-400">Create your construction management account</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'
            }`}>
              1
            </div>
            <div className={`w-20 h-1 ${step >= 2 ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-red-400" role="alert">
              <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <p className="text-sm" id="signup-error">
                {error}
              </p>
            </div>
          )}
          
          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-green-400" role="status">
              <CheckCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <p className="text-sm">Account created. Check your email to verify.</p>
            </div>
          )}

          {/* Step 1: Account Details */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="mb-4 text-xl font-bold text-white">Account details</h2>
              
              <div>
                <label htmlFor="signup-email" className="mb-2 block text-sm font-medium text-slate-300">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email address *
                </label>
                <input
                  id="signup-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="foreman@construction.com"
                  required
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'signup-error' : undefined}
                />
              </div>

              <div>
                <label htmlFor="signup-password" className="mb-2 block text-sm font-medium text-slate-300">
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'signup-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="btn btn-ghost absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-slate-300"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="signup-confirm-password" className="mb-2 block text-sm font-medium text-slate-300">
                  Confirm password *
                </label>
                <input
                  id="signup-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'signup-error' : undefined}
                />
              </div>
            </div>
          )}

          {/* Step 2: Profile Information */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="mb-4 text-xl font-bold text-white">Profile information</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="signup-first-name" className="mb-2 block text-sm font-medium text-slate-300">
                    <User className="w-4 h-4 inline mr-1" />
                    First name *
                  </label>
                  <input
                    id="signup-first-name"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', e.target.value)}
                    placeholder="John"
                    required
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="signup-last-name" className="mb-2 block text-sm font-medium text-slate-300">
                    Last name *
                  </label>
                  <input
                    id="signup-last-name"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                    placeholder="Smith"
                    required
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-phone" className="mb-2 block text-sm font-medium text-slate-300">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone number
                </label>
                <input
                  id="signup-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="signup-company" className="mb-2 block text-sm font-medium text-slate-300">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  Company *
                </label>
                <input
                  id="signup-company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => updateFormData('company', e.target.value)}
                  placeholder="Construction Company Inc."
                  required
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="signup-job-title" className="mb-2 block text-sm font-medium text-slate-300">
                  <Briefcase className="w-4 h-4 inline mr-1" />
                  Job title *
                </label>
                <input
                  id="signup-job-title"
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => updateFormData('jobTitle', e.target.value)}
                  placeholder="Project Manager"
                  required
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="signup-employee-id" className="mb-2 block text-sm font-medium text-slate-300">
                  Employee ID
                </label>
                <input
                  id="signup-employee-id"
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => updateFormData('employeeId', e.target.value)}
                  placeholder="Optional"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="btn btn-ghost"
              >
                Back
              </button>
            )}
            
            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="btn btn-primary ml-auto flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  Creating account
                </>
              ) : step === 2 ? (
                'Create account'
              ) : (
                <>
                  Next
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sign In Link */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="link font-medium">
            Sign in
          </Link>
        </p>

        {/* Security Badge */}
        <div className="mt-6 flex items-center justify-center space-x-2 text-slate-500">
          <Shield className="w-4 h-4" />
          <span className="text-xs">Your data is encrypted and secure</span>
        </div>
      </div>
    </div>
  );
};
