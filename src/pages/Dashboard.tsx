import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  FiSearch, FiPlus, FiStar, FiTrash2, FiEdit, FiEye, FiShield,
  FiKey, FiLock, FiFileText, FiCopy, FiCheck, FiCheckSquare,
  FiSquare, FiX, FiMove
} from 'react-icons/fi';
import { entries as entriesApi } from '../utils/api';
import EntryRevealModal from '../components/EntryRevealModal';
import QuickCopyModal from '../components/QuickCopyModal';
import { Entry, Profile } from '../types';

const Dashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [profiles, setProfiles] = useState<{ [key: string]: Profile }>({});
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Quick copy state
  const [quickCopyEntry, setQuickCopyEntry] = useState<Entry | null>(null);

  // Copied confirmation
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const profileId = searchParams.get('profile_id') || undefined;
  const category = searchParams.get('category') || undefined;
  const pinned = searchParams.has('pinned') ? searchParams.get('pinned') === '1' : undefined;

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

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Clear selection when leaving selection mode
  useEffect(() => {
    if (!isSelectionMode) {
      setSelectedIds(new Set());
    }
  }, [isSelectionMode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEntries();
  };

  const handleTogglePin = async (entryId: string) => {
    try {
      await entriesApi.togglePin(entryId);
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

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    const confirmMessage = `Are you sure you want to delete ${selectedIds.size} ${selectedIds.size === 1 ? 'entry' : 'entries'}?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      // Delete all selected entries
      await Promise.all(Array.from(selectedIds).map(id => entriesApi.delete(id)));

      // Remove from local state
      setEntries(prevEntries => prevEntries.filter(entry => !selectedIds.has(entry.id)));
      setSelectedIds(new Set());
      setIsSelectionMode(false);
    } catch (error) {
      console.error('Error bulk deleting:', error);
    }
  };

  // Selection handlers
  const toggleSelection = (entryId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(entries.map(e => e.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleReveal = (entry: Entry) => {
    setSelectedEntry(entry);
    setIsRevealModalOpen(true);
  };

  // Quick copy - opens password prompt, then copies
  const handleQuickCopy = (entry: Entry) => {
    setQuickCopyEntry(entry);
  };

  const handleQuickCopySuccess = (text: string, entryId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(entryId);
    setTimeout(() => setCopiedId(null), 2000);
    setQuickCopyEntry(null);
  };

  // Drag and drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(entries);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setEntries(items);
    // Note: In production, you'd save this order to the backend
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mnemonic_phrase': return FiFileText;
      case 'private_key': return FiKey;
      case 'password': return FiLock;
      default: return FiShield;
    }
  };

  const formatCategory = (category: string) => {
    switch (category) {
      case 'mnemonic_phrase': return 'Seed Phrase';
      case 'private_key': return 'Private Key';
      case 'password': return 'Password';
      default: return 'Other';
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'mnemonic_phrase': return 'badge-mnemonic';
      case 'private_key': return 'badge-private-key';
      case 'password': return 'badge-password';
      default: return 'badge-other';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getPageTitle = () => {
    if (category) return `${formatCategory(category)}s`;
    if (profileId && profiles[profileId]) return profiles[profileId].name;
    if (pinned) return 'Pinned Entries';
    return 'All Entries';
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="heading-1">{getPageTitle()}</h1>
          <p className="text-gray-500 mt-1">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
        <div className="flex gap-2">
          {!isSelectionMode ? (
            <>
              <button
                onClick={() => setIsSelectionMode(true)}
                className="btn-ghost text-sm"
                disabled={entries.length === 0}
              >
                <FiCheckSquare className="h-4 w-4" />
                Select
              </button>
              <Link to="/entries/new" className="btn-primary">
                <FiPlus className="h-4 w-4" />
                New Entry
              </Link>
            </>
          ) : (
            <>
              <button onClick={selectAll} className="btn-ghost text-sm">
                Select All
              </button>
              <button onClick={deselectAll} className="btn-ghost text-sm">
                Deselect
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={selectedIds.size === 0}
                className="btn-danger text-sm"
              >
                <FiTrash2 className="h-4 w-4" />
                Delete ({selectedIds.size})
              </button>
              <button
                onClick={() => setIsSelectionMode(false)}
                className="btn-ghost text-sm"
              >
                <FiX className="h-4 w-4" />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="input pl-12"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-secondary">
            Search
          </button>
        </form>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="spinner-lg mx-auto mb-4" />
            <p className="text-gray-500">Loading entries...</p>
          </div>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-100 to-indigo-100 flex items-center justify-center">
            <FiShield className="h-10 w-10 text-primary-500" />
          </div>
          <h3 className="heading-3 mb-2">No entries yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Start securing your crypto secrets by creating your first entry.
          </p>
          <Link to="/entries/new" className="btn-primary">
            <FiPlus className="h-4 w-4" />
            Create First Entry
          </Link>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="entries" direction="vertical">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
              >
                {entries.map((entry, index) => {
                  const CategoryIcon = getCategoryIcon(entry.category);
                  const isSelected = selectedIds.has(entry.id);
                  const isCopied = copiedId === entry.id;

                  return (
                    <Draggable key={entry.id} draggableId={entry.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`card group transition-all duration-200 ${snapshot.isDragging ? 'shadow-2xl rotate-2 scale-105' : ''
                            } ${isSelected ? 'ring-2 ring-primary-500 bg-primary-50/50' : ''}`}
                        >
                          {/* Drag Handle & Selection */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              {isSelectionMode ? (
                                <button
                                  onClick={() => toggleSelection(entry.id)}
                                  className={`p-1 rounded transition-colors ${isSelected ? 'text-primary-600' : 'text-gray-400'
                                    }`}
                                >
                                  {isSelected ? (
                                    <FiCheckSquare className="h-5 w-5" />
                                  ) : (
                                    <FiSquare className="h-5 w-5" />
                                  )}
                                </button>
                              ) : (
                                <div
                                  {...provided.dragHandleProps}
                                  className="p-1 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"
                                >
                                  <FiMove className="h-4 w-4" />
                                </div>
                              )}
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${entry.category === 'mnemonic_phrase' ? 'bg-blue-100 text-blue-600' :
                                  entry.category === 'private_key' ? 'bg-purple-100 text-purple-600' :
                                    entry.category === 'password' ? 'bg-emerald-100 text-emerald-600' :
                                      'bg-gray-100 text-gray-600'
                                }`}>
                                <CategoryIcon className="h-5 w-5" />
                              </div>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleTogglePin(entry.id); }}
                              className={`p-2 rounded-lg transition-all duration-200 ${entry.pinned
                                  ? 'text-amber-500 bg-amber-50'
                                  : 'text-gray-300 hover:text-amber-500 hover:bg-amber-50'
                                }`}
                            >
                              <FiStar className={`h-4 w-4 ${entry.pinned ? 'fill-current' : ''}`} />
                            </button>
                          </div>

                          {/* Title */}
                          <div className="mb-3">
                            <h3 className="font-semibold text-gray-900 truncate">{entry.title}</h3>
                            {profiles[entry.profile_id] && (
                              <p className="text-xs text-gray-400 truncate">{profiles[entry.profile_id].name}</p>
                            )}
                          </div>

                          {/* Badge & Date */}
                          <div className="flex items-center justify-between mb-4">
                            <span className={getCategoryBadgeClass(entry.category)}>
                              {formatCategory(entry.category)}
                            </span>
                            <span className="text-xs text-gray-400">{formatDate(entry.created_at)}</span>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-4 border-t border-gray-100">
                            {/* Quick Copy */}
                            <button
                              onClick={() => handleQuickCopy(entry)}
                              className={`btn-ghost flex-1 py-2 text-sm justify-center ${isCopied ? 'text-green-600 bg-green-50' : ''
                                }`}
                            >
                              {isCopied ? (
                                <>
                                  <FiCheck className="h-4 w-4" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <FiCopy className="h-4 w-4" />
                                  Copy
                                </>
                              )}
                            </button>

                            {/* Reveal */}
                            <button
                              onClick={() => handleReveal(entry)}
                              className="btn-secondary flex-1 py-2 text-sm"
                            >
                              <FiEye className="h-4 w-4" />
                              Reveal
                            </button>

                            {/* Edit */}
                            <Link
                              to={`/entries/edit/${entry.id}`}
                              className="btn-ghost py-2 px-3 text-sm"
                            >
                              <FiEdit className="h-4 w-4" />
                            </Link>

                            {/* Delete */}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                              className="btn-ghost py-2 px-3 text-red-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Reveal Modal */}
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

      {/* Quick Copy Modal */}
      {quickCopyEntry && (
        <QuickCopyModal
          entry={quickCopyEntry}
          onClose={() => setQuickCopyEntry(null)}
          onSuccess={(text) => handleQuickCopySuccess(text, quickCopyEntry.id)}
        />
      )}
    </div>
  );
};

export default Dashboard;