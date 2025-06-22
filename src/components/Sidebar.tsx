import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiKey, FiList, FiStar, FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { profiles } from '../utils/api';

interface Profile {
  id: string;
  name: string;
}

const categoryFilters = [
  { id: 'all', name: 'All Entries', icon: FiHome },
  { id: 'mnemonic_phrase', name: 'Mnemonic Phrases', icon: FiList },
  { id: 'private_key', name: 'Private Keys', icon: FiKey },
  { id: 'password', name: 'Passwords', icon: FiKey },
  { id: 'pinned', name: 'Pinned', icon: FiStar },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userProfiles, setUserProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch profiles
  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      const response = await profiles.getAll();
      setUserProfiles(response.data.profiles || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (window.confirm('Are you sure you want to delete this profile? All associated entries will also be deleted.')) {
      try {
        await profiles.delete(profileId);
        fetchProfiles(); // Refresh the profiles list
        // If the user is currently viewing the deleted profile, navigate away
        if (location.search.includes(`profile_id=${profileId}`)) {
          navigate('/');
        }
      } catch (error) {
        console.error('Error deleting profile:', error);
        alert('Failed to delete profile. Please try again.');
      }
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const isActiveCategory = (category: string) => {
    const params = new URLSearchParams(location.search);
    return params.get('category') === category || 
           (category === 'all' && !params.has('category')) ||
           (category === 'pinned' && params.get('pinned') === '1');
  };

  const getProfileQueryParam = (profileId: string) => {
    return `?profile_id=${profileId}`;
  };

  const getCategoryQueryParam = (categoryId: string) => {
    if (categoryId === 'all') return '';
    if (categoryId === 'pinned') return '?pinned=1';
    return `?category=${categoryId}`;
  };

  return (
    <div className="hidden sm:block w-64 bg-white border-r border-gray-200 overflow-y-auto h-[calc(100vh-4rem)]">
      <div className="px-4 py-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Categories</h2>
        </div>

        <nav className="mt-4 space-y-1">
          {categoryFilters.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <Link
                key={category.id}
                to={`/${getCategoryQueryParam(category.id)}`}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActiveCategory(category.id)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <CategoryIcon
                  className={`mr-3 h-5 w-5 ${
                    isActiveCategory(category.id)
                      ? 'text-primary-600'
                      : 'text-gray-400'
                  }`}
                />
                {category.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Profiles</h2>
            <button
              onClick={fetchProfiles}
              className="text-gray-400 hover:text-gray-600"
              title="Refresh profiles"
            >
              <FiRefreshCw className="h-4 w-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="py-4 text-center text-gray-500">Loading...</div>
          ) : (
            <>
              <nav className="mt-4 space-y-1">
                {userProfiles.map((profile) => (
                  <div key={profile.id} className="flex items-center group">
                    <Link
                      to={`/${getProfileQueryParam(profile.id)}`}
                      className={`flex-1 flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        location.search.includes(`profile_id=${profile.id}`)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="mr-3 h-5 w-5 text-gray-400 flex items-center justify-center">
                        {profile.name.charAt(0).toUpperCase()}
                      </span>
                      {profile.name}
                    </Link>
                    <button
                      onClick={() => handleDeleteProfile(profile.id)}
                      className="ml-2 p-1 text-gray-400 hover:text-red-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete profile"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </nav>

              <Link
                to="/profiles/new"
                className="mt-4 flex items-center px-3 py-2 text-sm font-medium text-primary-600 rounded-md hover:bg-gray-50"
              >
                <FiPlus className="mr-3 h-5 w-5" />
                New Profile
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 