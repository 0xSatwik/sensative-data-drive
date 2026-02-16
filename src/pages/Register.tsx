import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiArrowRight } from 'react-icons/fi';
import { auth } from '../utils/api';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), ''], 'Passwords must match')
        .required('Please confirm your password'),
    }),
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        setError('');

        const response = await auth.register(values.email, values.password);

        if (response.data.success) {
          navigate('/');
        } else {
          setError('Registration failed. Please try again.');
        }
      } catch (error: any) {
        console.error('Registration error:', error);
        setError(
          error.response?.data?.message ||
          'An error occurred during registration. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-accent-200/30 rounded-full blur-3xl floating-element" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl floating-element" style={{ animationDelay: '-3s' }} />
      </div>

      <div className="relative z-10 slide-up">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 shadow-xl shadow-primary-500/30 mb-6 floating-element">
            <FiShield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gradient mb-2">SecureVault</h1>
          <p className="text-gray-500">
            Start protecting your crypto secrets
          </p>
        </div>

        {/* Register Card */}
        <div className="card-glass">
          <h2 className="heading-3 text-center mb-6">Create your account</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`input pl-11 ${formik.touched.email && formik.errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-500/10' : ''
                    }`}
                />
              </div>
              {formik.touched.email && formik.errors.email ? (
                <div className="form-error">{formik.errors.email}</div>
              ) : null}
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`input pl-11 pr-11 ${formik.touched.password && formik.errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-500/10' : ''
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
              <PasswordStrengthMeter password={formik.values.password} showRequirements={false} />
              {formik.touched.password && formik.errors.password ? (
                <div className="form-error">{formik.errors.password}</div>
              ) : null}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`input pl-11 ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-400 focus:border-red-400 focus:ring-red-500/10' : ''
                    }`}
                />
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                <div className="form-error">{formik.errors.confirmPassword}</div>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-6"
            >
              {isLoading ? (
                <>
                  <div className="spinner" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <FiArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;