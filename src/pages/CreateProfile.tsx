import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profiles } from '../utils/api';

const CreateProfile: React.FC = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Profile name cannot be empty.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await profiles.create(name);
      navigate('/'); // Or to a specific profile page
    } catch (err) {
      setError('Failed to create profile. Please try again.');
      console.error('Create profile error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Create New Profile</h1>
      <form onSubmit={handleSubmit} className="card">
        <div className="mb-4">
          <label htmlFor="profileName" className="label">
            Profile Name
          </label>
          <input
            id="profileName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="e.g., Personal, Work"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary mr-2"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProfile; 