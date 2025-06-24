import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiSearch, FiPlus, FiStar, FiTrash2, FiEdit, FiEye } from 'react-icons/fi';
import { entries as entriesApi } from '../utils/api';
import EntryRevealModal from '../components/EntryRevealModal';
import { Entry, Profile } from '../types';

const Dashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [profiles, setProfiles] = useState<{ [key: string]: Profile }>({});
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Extract filters from URL
  const profileId = searchParams.get('profile_id') || undefined;
  const category = searchParams.get('category') || undefined;
  const pinned = searchParams.has('pinned') ? searchParams.get('pinned') === '1' : undefined;

  // Fetch entries and apply filters
  const fetchEntries = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await entriesApi.getAll({ 
        profile_id: profileId, 
        category,
        pinned,
        search: searchTerm || undefined
      });
      
      if (response.data.success && response.data.entries) {
        setEntries(response.data.entries);
        
        // Extract unique profile IDs and create lookup object
        const profileMap: { [key: string]: Profile } = {};
        response.data.entries.forEach((entry: Entry) => {
          if (entry.profile_id && response.data.profiles && response.data.profiles[entry.profile_id]) {
            profileMap[entry.profile_id] = response.data.profiles[entry.profile_id];
          }
        });
        setProfiles(profileMap);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setIsLoading(false);
    }
  }, [profileId, category, pinned, searchTerm]);

  // Fetch entries when filters change
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEntries();
  };

  // Toggle pin status for an entry
  const handleTogglePin = async (entryId: string) => {
    try {
      await entriesApi.togglePin(entryId);
      // Update local state to reflect the pin status change
      setEntries(prevEntries => 
        prevEntries.map(entry => {
          if (entry.id === entryId) {
            return { ...entry, pinned: entry.pinned ? 0 : 1 };
          }
          return entry;
        })
      );
    } catch (error) {
      console.error('Error toggling pin status:', error);
    }
  };

  // Delete an entry
  const handleDelete = async (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await entriesApi.delete(entryId);
        setEntries(prevEntries => prevEntries.filter(entry => entry.id !== entryId));
      } catch (error) {
        console.error('Error deleting entry:', error);
      }
    }
  };

  // Reveal entry data
  const handleReveal = (entry: Entry) => {
    setSelectedEntry(entry);
    setIsRevealModalOpen(true);
  };

  // Format category name for display
  const formatCategory = (category: string) => {
    switch (category) {
      case 'mnemonic_phrase':
        return 'Mnemonic Phrase';
      case 'private_key':
        return 'Private Key';
      case 'password':
        return 'Password';
      case 'other':
      default:
        return 'Other';
    }
  };

  // Get CSS class for category badge
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'mnemonic_phrase':
        return 'badge-mnemonic';
      case 'private_key':
        return 'badge-private-key';
      case 'password':
        return 'badge-password';
      case 'other':
      default:
        return 'badge-other';
    }
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  // Render the dashboard page
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {category 
            ? `${formatCategory(category)} Entries` 
            : profileId 
              ? `${profiles[profileId]?.name || 'Profile'} Entries` 
              : pinned 
                ? 'Pinned Entries' 
                : 'All Entries'}
        </h1>
        <Link 
          to="/entries/new"
          className="btn-primary inline-flex items-center"
        >
          <FiPlus className="mr-2 h-4 w-4" />
          New Entry
        </Link>
      </div>

      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 input"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn-secondary ml-2"
          >
            Search
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="spinner"></div>
          <span className="ml-2">Loading entries...</span>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-gray-500">No entries found.</p>
          <Link 
            to="/entries/new" 
            className="mt-4 inline-block text-primary-600 hover:text-primary-700"
          >
            Create your first entry
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <div 
              key={entry.id} 
              className="card relative hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900 pr-8">{entry.title}</h3>
                <button
                  onClick={() => handleTogglePin(entry.id)}
                  className="text-gray-400 hover:text-yellow-500 transition-colors duration-150"
                  title={entry.pinned ? "Unpin entry" : "Pin entry"}
                >
                  <FiStar className={`h-5 w-5 ${entry.pinned ? 'text-yellow-500 fill-current' : ''}`} />
                </button>
              </div>
              
              {profiles[entry.profile_id] && (
                <p className="text-sm text-gray-500 mt-1">
                  {profiles[entry.profile_id]?.name}
                </p>
              )}
              
              <div className="mt-3">
                <span className={`${getCategoryBadgeClass(entry.category)}`}>
                  {formatCategory(entry.category)}
                </span>
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                Added on {formatDate(entry.created_at)}
              </p>
              
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={() => handleReveal(entry)}
                  className="btn-secondary text-sm py-1 px-3"
                >
                  <FiEye className="h-4 w-4 mr-1 inline" />
                  Reveal
                </button>
                
                <Link
                  to={`/entries/edit/${entry.id}`}
                  className="btn-secondary text-sm py-1 px-3"
                >
                  <FiEdit className="h-4 w-4 mr-1 inline" />
                  Edit
                </Link>
                
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="btn-danger text-sm py-1 px-3"
                >
                  <FiTrash2 className="h-4 w-4 mr-1 inline" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedEntry && (
        <EntryRevealModal
          isOpen={isRevealModalOpen}
          onClose={() => {
            setIsRevealModalOpen(false);
            setSelectedEntry(null);
          }}
          entry={selectedEntry}
        />
      )}
    </div>
  );
};

export default Dashboard; 