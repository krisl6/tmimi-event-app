import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DollarSign, User, LogOut, Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from './Button';

export const Navbar: React.FC = () => {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <DollarSign size={32} className="font-bold" />
            <span className="text-2xl font-bold">Tmimi</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link to="/" className="text-text-secondary hover:text-primary transition-colors">
                  My Events
                </Link>
                <Link to="/events/new" className="text-text-secondary hover:text-primary transition-colors">
                  Create Event
                </Link>
                <div className="flex items-center gap-3 ml-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <User size={18} />
                      )}
                    </div>
                    <span className="text-sm font-medium text-text-primary">{user.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" icon={LogOut} onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <Button onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-text-secondary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white">
          <div className="px-4 py-4 space-y-3">
            {user ? (
              <>
                <Link
                  to="/"
                  className="block py-2 text-text-secondary hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Events
                </Link>
                <Link
                  to="/events/new"
                  className="block py-2 text-text-secondary hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create Event
                </Link>
                <div className="pt-3 border-t border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <User size={18} />
                      )}
                    </div>
                    <span className="text-sm font-medium text-text-primary">{user.name}</span>
                  </div>
                  <Button variant="outline" size="sm" icon={LogOut} onClick={handleLogout} fullWidth>
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <Button onClick={() => navigate('/auth')} fullWidth>
                Sign In
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
