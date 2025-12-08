import React, { useState } from 'react';
import { FiLock, FiCopy, FiX, FiAlertCircle } from 'react-icons/fi';
import { Entry } from '../types';
import { decryptData } from '../utils/crypto';

interface QuickCopyModalProps {
    entry: Entry;
    onClose: () => void;
    onSuccess: (decryptedText: string) => void;
}

const QuickCopyModal: React.FC<QuickCopyModalProps> = ({ entry, onClose, onSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password.trim()) {
            setError('Please enter your encryption password');
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            // Decrypt the data
            const decrypted = await decryptData(
                entry.encrypted_data,
                password,
                entry.iv,
                entry.salt,
                entry.version
            );

            if (decrypted) {
                onSuccess(decrypted);
            } else {
                setError('Decryption failed. Check your password.');
            }
        } catch (err) {
            console.error('Decryption error:', err);
            setError('Incorrect password or corrupted data');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content max-w-sm"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-indigo-100 flex items-center justify-center">
                            <FiCopy className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Quick Copy</h3>
                            <p className="text-xs text-gray-500 truncate max-w-[180px]">{entry.title}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <FiX className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="copyPassword" className="form-label">
                            Enter encryption password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiLock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="copyPassword"
                                type="password"
                                className="input pl-10"
                                placeholder="Your encryption password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-600">
                            <FiAlertCircle className="h-4 w-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary flex-1"
                        >
                            {isLoading ? (
                                <>
                                    <div className="spinner" />
                                    Decrypting...
                                </>
                            ) : (
                                <>
                                    <FiCopy className="h-4 w-4" />
                                    Copy to Clipboard
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <p className="mt-4 text-xs text-gray-400 text-center">
                    Clipboard will auto-clear in 30 seconds
                </p>
            </div>
        </div>
    );
};

export default QuickCopyModal;
