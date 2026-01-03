import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, Eye, EyeOff, Smartphone } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useApp } from '../context/AppContext';

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    emailOrPhone: '',
    password: '',
  });

  const validatePassword = (password: string): PasswordRequirement[] => {
    return [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
      { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
      { label: 'Contains number', met: /[0-9]/.test(password) },
      { label: 'Contains special character (!@#$%^&*)', met: /[!@#$%^&*]/.test(password) },
    ];
  };

  const passwordRequirements = validatePassword(formData.password);
  const allRequirementsMet = passwordRequirements.every(req => req.met);

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const isValidPhone = (value: string) => {
    // Supports formats: +60123456789, 0123456789, 60123456789
    return /^(\+?6?0)?1[0-9]{8,9}$/.test(value.replace(/[\s-]/g, ''));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate email or phone
      const isEmail = isValidEmail(formData.emailOrPhone);
      const isPhone = isValidPhone(formData.emailOrPhone);

      if (!isEmail && !isPhone) {
        throw new Error('Please enter a valid email address or mobile number');
      }

      // For registration, validate password requirements
      if (!isLogin && !allRequirementsMet) {
        throw new Error('Password does not meet all requirements');
      }

      if (isLogin) {
        await login(formData.emailOrPhone, formData.password);
      } else {
        await register(formData.name, formData.emailOrPhone, formData.password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            Welcome to <span className="text-primary">Tmimi</span>
          </h1>
          <p className="text-text-muted">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Email or Mobile Number
              </label>
              <div className="relative">
                {isValidEmail(formData.emailOrPhone) ? (
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                ) : (
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                )}
                <input
                  type="text"
                  name="emailOrPhone"
                  placeholder="you@example.com or +60123456789"
                  value={formData.emailOrPhone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-text-muted">
                Enter your email address or mobile number (e.g., +60123456789)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2 border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {!isLogin && formData.password && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium text-text-secondary">Password requirements:</p>
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${req.met ? 'bg-success' : 'bg-text-muted'}`} />
                      <span className={`text-xs ${req.met ? 'text-success' : 'text-text-muted'}`}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-error rounded-lg text-error text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              icon={isLogin ? LogIn : UserPlus}
              fullWidth
              disabled={loading || (!isLogin && !allRequirementsMet)}
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ name: '', emailOrPhone: '', password: '' });
              }}
              className="text-sm text-primary hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
};
