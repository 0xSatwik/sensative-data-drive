import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiLogIn, FiUserPlus, FiShield } from 'react-icons/fi';

const NotFound: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center p-4">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl floating-element" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl floating-element" style={{ animationDelay: '-3s' }} />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-100/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 text-center max-w-lg mx-auto">
                {/* Logo */}
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 shadow-xl shadow-primary-500/30 mb-6 floating-element">
                        <FiShield className="h-10 w-10 text-white" />
                    </div>
                </div>

                {/* 404 Text */}
                <div className="mb-8">
                    <h1 className="text-8xl md:text-9xl font-black text-gradient mb-4">
                        404
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                        Page Not Found
                    </h2>
                    <p className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed">
                        Oops! The page you're looking for doesn't exist or has been moved.
                        Let's get you back on track.
                    </p>
                </div>

                {/* Action buttons */}
                <div className="space-y-4">
                    <Link
                        to="/"
                        className="btn-primary w-full sm:w-auto px-8"
                    >
                        <FiHome className="h-5 w-5" />
                        Go to Dashboard
                    </Link>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                        <Link
                            to="/login"
                            className="btn-secondary w-full sm:w-auto"
                        >
                            <FiLogIn className="h-4 w-4" />
                            Sign In
                        </Link>
                        <Link
                            to="/register"
                            className="btn-secondary w-full sm:w-auto"
                        >
                            <FiUserPlus className="h-4 w-4" />
                            Create Account
                        </Link>
                    </div>
                </div>

                {/* Footer text */}
                <p className="mt-12 text-sm text-gray-400">
                    SecureVault — Your crypto secrets, safely encrypted
                </p>
            </div>
        </div>
    );
};

export default NotFound;
