import React from 'react';
import { Link } from 'react-router-dom';
import {
    FiShield, FiLock, FiKey, FiEye, FiArrowRight,
    FiCheckCircle, FiCloud, FiSmartphone, FiZap,
    FiGlobe, FiCpu, FiUserCheck, FiGrid
} from 'react-icons/fi';
import { isLoggedIn } from '../utils/api';

const Home: React.FC = () => {
    // Check if user is logged in via indicator cookie
    const loggedIn = isLoggedIn();

    const features = [
        {
            icon: FiLock,
            title: 'AES-256-GCM Encryption',
            description: 'Military-grade encryption with 600,000 PBKDF2 iterations',
            color: 'from-blue-500 to-indigo-600'
        },
        {
            icon: FiEye,
            title: 'Zero-Knowledge',
            description: 'We never see your data. Only you hold the key.',
            color: 'from-purple-500 to-pink-600'
        },
        {
            icon: FiCloud,
            title: 'Cloud Synced',
            description: 'Access your secrets from anywhere, anytime.',
            color: 'from-cyan-500 to-blue-600'
        },
        {
            icon: FiSmartphone,
            title: 'Fully Responsive',
            description: 'Works flawlessly on desktop, tablet, and mobile.',
            color: 'from-green-500 to-emerald-600'
        },
        {
            icon: FiZap,
            title: 'Lightning Fast',
            description: 'Instant encryption and decryption.',
            color: 'from-amber-500 to-orange-600'
        },
        {
            icon: FiUserCheck,
            title: 'Auto-Logout',
            description: 'Session timeout protects unattended devices.',
            color: 'from-rose-500 to-red-600'
        }
    ];

    const securityPoints = [
        'Client-side encryption — data never leaves your device unencrypted',
        'No password recovery — we cannot access your secrets',
        'Auto-hide decrypted data after 60 seconds',
        'Clipboard auto-clears after copying sensitive data',
        'Strong password enforcement for encryption'
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                                <FiShield className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gradient">SecureVault</span>
                        </Link>
                        <div className="flex items-center gap-2 sm:gap-3">
                            {loggedIn ? (
                                // Show Dashboard button if logged in
                                <Link to="/dashboard" className="btn-primary">
                                    <FiGrid className="h-4 w-4" />
                                    <span className="hidden sm:inline">Dashboard</span>
                                </Link>
                            ) : (
                                // Show Sign In / Get Started if not logged in
                                <>
                                    <Link to="/login" className="btn-ghost text-gray-600 text-sm sm:text-base">
                                        Sign In
                                    </Link>
                                    <Link to="/register" className="btn-primary text-sm sm:text-base">
                                        <span className="hidden sm:inline">Get Started</span>
                                        <span className="sm:hidden">Sign Up</span>
                                        <FiArrowRight className="h-4 w-4" />
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 overflow-hidden">
                {/* Background decorations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-64 sm:w-96 h-64 sm:h-96 bg-primary-200/40 rounded-full blur-3xl floating-element" />
                    <div className="absolute top-40 right-10 w-56 sm:w-80 h-56 sm:h-80 bg-accent-200/30 rounded-full blur-3xl floating-element" style={{ animationDelay: '-2s' }} />
                    <div className="absolute bottom-20 left-1/3 w-48 sm:w-72 h-48 sm:h-72 bg-purple-200/30 rounded-full blur-3xl floating-element" style={{ animationDelay: '-4s' }} />
                </div>

                <div className="relative max-w-5xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary-50 border border-primary-200/50 mb-6 sm:mb-8">
                        <FiShield className="h-4 w-4 text-primary-600" />
                        <span className="text-xs sm:text-sm font-medium text-primary-700">Bank-level security for your crypto</span>
                    </div>

                    {/* Main heading */}
                    <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-tight mb-4 sm:mb-6">
                        Protect Your{' '}
                        <span className="text-gradient">Crypto Secrets</span>
                        <br className="hidden sm:block" />
                        <span className="sm:hidden"> </span>Like Never Before
                    </h1>

                    {/* Subtitle */}
                    <p className="text-base sm:text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
                        Store your seed phrases, private keys, and passwords with
                        military-grade encryption. Only you hold the key.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-4">
                        {loggedIn ? (
                            <Link to="/dashboard" className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto">
                                <FiGrid className="h-5 w-5" />
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto">
                                    <FiKey className="h-5 w-5" />
                                    Start Protecting Now
                                </Link>
                                <Link to="/login" className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto">
                                    I Have an Account
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Trust indicators */}
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400 px-2">
                        <div className="flex items-center gap-2">
                            <FiCheckCircle className="h-4 w-4 text-green-500" />
                            <span>Free to use</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FiCheckCircle className="h-4 w-4 text-green-500" />
                            <span>No credit card</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FiCheckCircle className="h-4 w-4 text-green-500" />
                            <span>Zero-knowledge</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-16 sm:py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                            Everything You Need to Stay Safe
                        </h2>
                        <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto px-2">
                            Built from the ground up with security-first principles
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="card-interactive group"
                            >
                                <div className={`w-12 sm:w-14 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 sm:mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="h-6 sm:h-7 w-6 sm:w-7 text-white" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-sm sm:text-base text-gray-500">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Security Section */}
            <section className="py-16 sm:py-20 px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-4 sm:mb-6">
                                <FiCpu className="h-4 w-4 text-primary-400" />
                                <span className="text-xs sm:text-sm font-medium text-white/80">Security Architecture</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
                                Your Secrets Never Leave Your Device Unencrypted
                            </h2>
                            <p className="text-gray-300 text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed">
                                SecureVault uses client-side encryption. Your sensitive data is encrypted
                                in your browser before it ever touches our servers.
                            </p>
                            <ul className="space-y-3 sm:space-y-4">
                                {securityPoints.map((point, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <FiCheckCircle className="h-3 sm:h-4 w-3 sm:w-4 text-green-400" />
                                        </div>
                                        <span className="text-sm sm:text-base text-gray-300">{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative mt-8 lg:mt-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-2xl sm:rounded-3xl blur-2xl" />
                            <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/10 p-6 sm:p-8">
                                <div className="text-center">
                                    <div className="w-20 sm:w-24 h-20 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-primary-500/30 floating-element">
                                        <FiShield className="h-10 sm:h-12 w-10 sm:w-12 text-white" />
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">AES-256-GCM</h3>
                                    <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">Authenticated Encryption</p>
                                    <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
                                        <div className="bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4">
                                            <div className="text-2xl sm:text-3xl font-black text-primary-400">600K</div>
                                            <div className="text-xs sm:text-sm text-gray-400">PBKDF2 Iterations</div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4">
                                            <div className="text-2xl sm:text-3xl font-black text-accent-400">256</div>
                                            <div className="text-xs sm:text-sm text-gray-400">Bit Encryption</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Use Cases */}
            <section className="py-16 sm:py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                            What Can You Protect?
                        </h2>
                        <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
                            Store any sensitive crypto-related information
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                        {[
                            { icon: '🔑', title: 'Seed Phrases', desc: '12/24 word recovery' },
                            { icon: '🔐', title: 'Private Keys', desc: 'Wallet private keys' },
                            { icon: '🔒', title: 'Passwords', desc: 'Exchange passwords' },
                            { icon: '📝', title: 'Notes', desc: 'Sensitive info' }
                        ].map((item, index) => (
                            <div key={index} className="card text-center p-4 sm:p-6">
                                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{item.icon}</div>
                                <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">{item.title}</h3>
                                <p className="text-xs sm:text-sm text-gray-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 sm:py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary-500 via-primary-600 to-indigo-700 p-6 sm:p-12 lg:p-16 text-center">
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-white rounded-full blur-3xl" />
                            <div className="absolute bottom-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white rounded-full blur-3xl" />
                        </div>

                        <div className="relative">
                            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
                                Ready to Secure Your Crypto?
                            </h2>
                            <p className="text-sm sm:text-lg text-white/80 mb-6 sm:mb-8 max-w-2xl mx-auto">
                                Join thousands of crypto holders who trust SecureVault to protect their most valuable secrets.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                                {loggedIn ? (
                                    <Link
                                        to="/dashboard"
                                        className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-600 font-semibold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center justify-center gap-2"
                                    >
                                        <FiGrid className="h-5 w-5" />
                                        Open Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        to="/register"
                                        className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-600 font-semibold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center justify-center gap-2"
                                    >
                                        Create Free Account
                                        <FiArrowRight className="h-5 w-5" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 sm:py-12 px-4 border-t border-gray-100">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center">
                                <FiShield className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-bold text-gray-700">SecureVault</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-400 text-center">
                            © {new Date().getFullYear()} SecureVault. Your secrets, your control.
                        </p>
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-400">
                            <FiGlobe className="h-4 w-4" />
                            <span>Cloudflare Protected</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
