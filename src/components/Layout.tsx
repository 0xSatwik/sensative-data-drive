import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useSessionTimeout } from '../utils/useSessionTimeout';
import { isLoggedIn } from '../utils/api';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

// Session timeout warning modal
const SessionWarningModal: React.FC<{
  remainingTime: number;
  onExtend: () => void;
  onLogout: () => void;
}> = ({ remainingTime, onExtend, onLogout }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 mb-5">
            <svg className="h-7 w-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="heading-3 mb-3">
            Session Expiring
          </h3>
          <p className="text-gray-500 mb-2">
            Your session will expire in
          </p>
          <p className="text-3xl font-bold text-amber-600 mb-4">
            {formatTime(remainingTime)}
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Would you like to stay logged in?
          </p>
          <div className="flex gap-3">
            <button
              onClick={onLogout}
              className="btn-secondary flex-1"
            >
              Log Out
            </button>
            <button
              onClick={onExtend}
              className="btn-primary flex-1"
            >
              Stay Logged In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children, requireAuth = false }) => {
  const location = useLocation();
  const loggedIn = isLoggedIn();

  // Session timeout - only active for authenticated pages
  const { remainingTime, showWarning, extendSession } = useSessionTimeout({
    timeoutMinutes: 15,
    warningMinutes: 2,
    enabled: requireAuth && loggedIn
  });

  const handleLogout = () => {
    document.cookie = 'is_logged_in=; Path=/; Max-Age=0';
    window.location.href = '/login';
  };

  // If authentication is required but user is not logged in
  if (requireAuth && !loggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // For login and register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex justify-center items-center p-4 relative overflow-hidden">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
          <div className="container-app fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Session warning modal */}
      {showWarning && remainingTime !== null && (
        <SessionWarningModal
          remainingTime={remainingTime}
          onExtend={extendSession}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default Layout;