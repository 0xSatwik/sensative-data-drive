import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FiArrowLeft, FiEye, FiEyeOff, FiInfo, FiShield } from 'react-icons/fi';
import { profiles as profilesApi, entries as entriesApi } from '../utils/api';
import { encryptData, isPasswordStrongEnough } from '../utils/crypto';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';

interface Profile {
  id: string;
  name: string;
}

const categoryOptions = [
  { value: 'mnemonic_phrase', label: 'Mnemonic Phrase' },
  { value: 'private_key', label: 'Private Key' },
  { value: 'password', label: 'Password' },
  { value: 'other', label: 'Other' },
];

const CreateEditEntry: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [showData, setShowData] = useState(false);
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      title: '',
      profile_id: '',
      category: 'other' as 'mnemonic_phrase' | 'private_key' | 'password' | 'other',
      data: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Title is required'),
      profile_id: Yup.string().required('Please select a profile'),
      category: Yup.string().required('Please select a category'),
      data: Yup.string().required('Data is required'),
      password: Yup.string()
        .required('Password is required for encryption')
        .test(
          'password-strength',
          'Password is too weak. Use 12+ characters with uppercase, lowercase, numbers, and symbols.',
          (value) => value ? isPasswordStrongEnough(value) : false
        ),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), ''], 'Passwords must match')
        .required('Please confirm your password'),
    }),
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        setError('');

        // Encrypt the data with the provided password (async with AES-GCM)
        const { encryptedData, iv, salt, version } = await encryptData(values.data, values.password);

        // Prepare data for API
        const entryData = {
          profile_id: values.profile_id,
          title: values.title,
          encrypted_data: encryptedData,
          iv,
          salt,
          category: values.category,
          version // Include encryption version for backward compatibility
        };

        // Create or update entry
        let response;
        if (isEditMode) {
          response = await entriesApi.update(id, entryData);
        } else {
          response = await entriesApi.create(entryData);
        }

        if (response.data.success) {
          navigate('/');
        } else {
          setError('Failed to save entry. Please try again.');
        }
      } catch (error) {
        console.error('Error saving entry:', error);
        setError('An error occurred. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    },
  });

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await profilesApi.getAll();
        if (response.data.success && response.data.profiles) {
          setProfiles(response.data.profiles);

          // If there's at least one profile and we're in create mode, select the first one
          if (response.data.profiles.length > 0 && !isEditMode) {
            formik.setFieldValue('profile_id', response.data.profiles[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
        setError('Failed to load profiles. Please try again later.');
      }
    };

    const fetchEntry = async () => {
      if (!isEditMode) return;

      try {
        setIsFetching(true);
        const response = await entriesApi.getById(id);

        if (response.data.success && response.data.entry) {
          const entry = response.data.entry;

          // Set form values
          formik.setValues({
            title: entry.title,
            profile_id: entry.profile_id,
            category: entry.category,
            data: '', // We don't load the encrypted data for editing
            password: '',
            confirmPassword: '',
          });
        }
      } catch (error) {
        console.error('Error fetching entry:', error);
        setError('Failed to load entry details. Please try again later.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfiles();
    fetchEntry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]); // Don't include formik - it causes infinite re-renders

  const formatCategoryInfo = () => {
    switch (formik.values.category) {
      case 'mnemonic_phrase':
        return "Enter your mnemonic phrase (seed phrase) for your crypto wallet. This will be stored securely encrypted.";
      case 'private_key':
        return "Enter your private key. It will be displayed in two parts for extra security when you decrypt it.";
      case 'password':
        return "Enter the password you want to save securely.";
      case 'other':
      default:
        return "Enter any sensitive information you want to store securely.";
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="spinner"></div>
        <span className="ml-2">Loading entry...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-gray-600 hover:text-gray-800"
        >
          <FiArrowLeft className="mr-1 h-4 w-4" />
          Back
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditMode ? 'Edit Entry' : 'Add New Entry'}
        </h1>

        {/* Security info banner */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
          <FiShield className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-green-700">
            <strong>Enhanced Security:</strong> Your data is encrypted with AES-256-GCM using 600,000 PBKDF2 iterations.
            Only you can decrypt it with your password.
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="title" className="form-label">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`input ${formik.touched.title && formik.errors.title ? 'border-red-500' : ''
                  }`}
                placeholder="E.g., Metamask Wallet"
              />
              {formik.touched.title && formik.errors.title ? (
                <div className="form-error">{formik.errors.title}</div>
              ) : null}
            </div>

            <div>
              <label htmlFor="profile_id" className="form-label">
                Profile
              </label>
              {profiles.length === 0 ? (
                <div className="flex flex-col space-y-2">
                  <div className="text-gray-500 italic text-sm">
                    No profiles found. Please create a profile first.
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/profiles/new')}
                    className="btn-secondary text-sm inline-block"
                  >
                    Create Profile
                  </button>
                </div>
              ) : (
                <>
                  <select
                    id="profile_id"
                    name="profile_id"
                    value={formik.values.profile_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`input ${formik.touched.profile_id && formik.errors.profile_id
                      ? 'border-red-500'
                      : ''
                      }`}
                  >
                    <option value="">Select a profile</option>
                    {profiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name}
                      </option>
                    ))}
                  </select>
                  {formik.touched.profile_id && formik.errors.profile_id ? (
                    <div className="form-error">{formik.errors.profile_id}</div>
                  ) : null}
                </>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="category" className="form-label">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formik.values.category}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`input ${formik.touched.category && formik.errors.category
                ? 'border-red-500'
                : ''
                }`}
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {formik.touched.category && formik.errors.category ? (
              <div className="form-error">{formik.errors.category}</div>
            ) : null}

            <div className="mt-2 flex items-start text-sm text-gray-500">
              <FiInfo className="h-5 w-5 mr-2 flex-shrink-0 text-gray-400" />
              <p>{formatCategoryInfo()}</p>
            </div>
          </div>

          <div>
            <label htmlFor="data" className="form-label">
              {formik.values.category === 'mnemonic_phrase'
                ? 'Mnemonic Phrase'
                : formik.values.category === 'private_key'
                  ? 'Private Key'
                  : formik.values.category === 'password'
                    ? 'Password'
                    : 'Data'}
            </label>
            <div className="relative">
              <textarea
                id="data"
                name="data"
                value={formik.values.data}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`input h-24 resize-none ${formik.touched.data && formik.errors.data ? 'border-red-500' : ''
                  }`}
                placeholder={`Enter your ${formik.values.category === 'mnemonic_phrase'
                  ? 'seed phrase'
                  : formik.values.category === 'private_key'
                    ? 'private key'
                    : formik.values.category === 'password'
                      ? 'password'
                      : 'secure data'}`}
              />
            </div>
            {formik.touched.data && formik.errors.data ? (
              <div className="form-error">{formik.errors.data}</div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="password" className="form-label">
                Encryption Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showData ? 'text' : 'password'}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`input pr-10 ${formik.touched.password && formik.errors.password ? 'border-red-500' : ''
                    }`}
                  placeholder="Enter password for encryption"
                />
                <button
                  type="button"
                  onClick={() => setShowData(!showData)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showData ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Password strength meter */}
              <PasswordStrengthMeter password={formik.values.password} />

              {formik.touched.password && formik.errors.password ? (
                <div className="form-error mt-2">{formik.errors.password}</div>
              ) : null}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showData ? 'text' : 'password'}
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`input pr-10 ${formik.touched.confirmPassword && formik.errors.confirmPassword
                    ? 'border-red-500'
                    : ''
                    }`}
                  placeholder="Confirm password"
                />
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                <div className="form-error">{formik.errors.confirmPassword}</div>
              ) : null}
            </div>
          </div>

          <div className="pt-4">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || profiles.length === 0}
                className="btn-primary"
              >
                {isLoading
                  ? isEditMode
                    ? 'Updating...'
                    : 'Creating...'
                  : isEditMode
                    ? 'Update Entry'
                    : 'Create Entry'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEditEntry;