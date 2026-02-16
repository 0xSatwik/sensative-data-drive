import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiPlus, FiShield } from 'react-icons/fi';
import { auth } from '../utils/api';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await auth.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear indicator cookie client-side as fallback
      document.cookie = 'is_logged_in=; Path=/; Max-Age=0';
      navigate('/login');
    }
  };

  return (
    <nav className="navbar">
      <div className="container-app">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-all duration-300 group-hover:scale-105">
                <FiShield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient hidden sm:block">SecureVault</span>
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/entries/new"
              className="btn-primary"
            >
              <FiPlus className="h-4 w-4" />
              New Entry
            </Link>
            <button
              onClick={handleLogout}
              className="btn-ghost text-gray-600"
            >
              <FiLogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 transition-all duration-200"
            >
              <span className="sr-only">Open menu</span>
              {mobileMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl animate-slide-up">
          <div className="p-4 space-y-3">
            <Link
              to="/entries/new"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary w-full"
            >
              <FiPlus className="h-4 w-4" />
              New Entry
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="btn-ghost w-full justify-center text-gray-600"
            >
              <FiLogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;