import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiKey, FiList, FiStar, FiPlus, FiRefreshCw, FiTrash2, FiLock } from 'react-icons/fi';
import { profiles } from '../utils/api';

interface Profile {
  id: string;
  name: string;
}

const categoryFilters = [
  { id: 'all', name: 'All Entries', icon: FiHome },
  { id: 'mnemonic_phrase', name: 'Seed Phrases', icon: FiList },
  { id: 'private_key', name: 'Private Keys', icon: FiKey },
  { id: 'password', name: 'Passwords', icon: FiLock },
  { id: 'pinned', name: 'Pinned', icon: FiStar },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userProfiles, setUserProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
    if (window.confirm('Are you sure you want to delete this profile? All entries will also be deleted.')) {
      try {
        await profiles.delete(profileId);
        fetchProfiles();
        if (location.search.includes(`profile_id=${profileId}`)) {
          navigate('/');
        }
      } catch (error) {
        console.error('Error deleting profile:', error);
      }
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const isActiveCategory = (category: string) => {
    const params = new URLSearchParams(location.search);
    return params.get('category') === category ||
      (category === 'all' && !params.has('category') && !params.has('profile_id') && !params.has('pinned')) ||
      (category === 'pinned' && params.get('pinned') === '1');
  };

  const isActiveProfile = (profileId: string) => {
    return location.search.includes(`profile_id=${profileId}`);
  };

  const getCategoryQueryParam = (categoryId: string) => {
    if (categoryId === 'all') return '';
    if (categoryId === 'pinned') return '?pinned=1';
    return `?category=${categoryId}`;
  };

  return (
    <aside className="hidden md:block w-72 sidebar sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-5">
        {/* Categories Section */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-3">
            Categories
          </h2>
          <nav className="space-y-1">
            {categoryFilters.map((category) => {
              const CategoryIcon = category.icon;
              const isActive = isActiveCategory(category.id);
              return (
                <Link
                  key={category.id}
                  to={`/dashboard${getCategoryQueryParam(category.id)}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-gradient-to-r from-primary-50 to-indigo-50 text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <CategoryIcon className={`h-5 w-5 ${isActive ? 'text-primary-500' : 'text-gray-400'}`} />
                  {category.name}
                  {category.id === 'pinned' && (
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
                      ★
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profiles Section */}
        <div className="pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4 px-3">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Profiles
            </h2>
            <button
              onClick={fetchProfiles}
              className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-all duration-200"
              title="Refresh"
            >
              <FiRefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="spinner" />
            </div>
          ) : (
            <>
              <nav className="space-y-1">
                {userProfiles.map((profile) => {
                  const isActive = isActiveProfile(profile.id);
                  return (
                    <div key={profile.id} className="group flex items-center">
                      <Link
                        to={`/dashboard?profile_id=${profile.id}`}
                        className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                          ? 'bg-gradient-to-r from-primary-50 to-indigo-50 text-primary-700 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${isActive
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-gray-100 text-gray-500'
                          }`}>
                          {profile.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate">{profile.name}</span>
                      </Link>
                      <button
                        onClick={() => handleDeleteProfile(profile.id)}
                        className="p-2 text-gray-300 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                        title="Delete"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </nav>

              <Link
                to="/profiles/new"
                className="flex items-center gap-3 px-4 py-3 mt-3 rounded-xl text-sm font-medium text-primary-600 hover:bg-primary-50 transition-all duration-200 border-2 border-dashed border-primary-200 hover:border-primary-300"
              >
                <FiPlus className="h-5 w-5" />
                New Profile
              </Link>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;