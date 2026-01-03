
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, ArrowRight, Receipt, Share2, Smartphone } from 'lucide-react';
import { Button } from '../components/Button';
import { TmimiLogo } from '../components/TmimiLogo';
import { useApp } from '../context/AppContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useApp();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <TmimiLogo size="xl" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-6">
            Welcome to <span className="text-primary">Tmimi</span>
          </h1>
          <p className="text-xl text-text-muted mb-8 max-w-2xl mx-auto">
            Split bills effortlessly with friends and family. Track expenses, settle up instantly, and never worry about who owes what.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              onClick={handleGetStarted}
            >
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-2xl transform rotate-1"></div>
          <img
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop"
            alt="Friends sharing expenses"
            className="relative rounded-2xl shadow-2xl w-full h-96 object-cover"
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-text-primary mb-12">
          Why Choose Tmimi?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Receipt className="text-primary" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-3">
              Smart Receipt Scanning
            </h3>
            <p className="text-text-muted">
              Upload receipts and let our OCR technology automatically extract amounts and details.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="text-success" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-3">
              Flexible Splitting
            </h3>
            <p className="text-text-muted">
              Choose who's involved in each expense. Split equally, by custom amounts, or select specific participants.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Smartphone className="text-purple-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-3">
              Instant Payments
            </h3>
            <p className="text-text-muted">
              Collect TnG, DuitNow, or QR codes from participants for seamless payment settlements.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <TmimiLogo size="sm" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-3">
              Clear Settlements
            </h3>
            <p className="text-text-muted">
              See exactly who owes who with visual settlement cards and payment method details.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="text-error" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-text-primary