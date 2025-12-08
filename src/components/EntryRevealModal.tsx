import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiEye, FiEyeOff, FiCopy, FiClock } from 'react-icons/fi';
import { decryptData, splitPrivateKey } from '../utils/crypto';
import { Entry } from '../types';

interface EntryRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: Entry;
}

const AUTO_HIDE_SECONDS = 60; // Auto-hide after 60 seconds
const CLIPBOARD_CLEAR_SECONDS = 30; // Clear clipboard after 30 seconds

const EntryRevealModal: React.FC<EntryRevealModalProps> = ({ isOpen, onClose, entry }) => {
  const [password, setPassword] = useState('');
  const [decryptedData, setDecryptedData] = useState('');
  const [privateKeyParts, setPrivateKeyParts] = useState<{ part1: string, part2: string } | null>(null);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showData, setShowData] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [autoHideCountdown, setAutoHideCountdown] = useState<number | null>(null);

  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const clipboardTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (clipboardTimerRef.current) clearTimeout(clipboardTimerRef.current);
    };
  }, []);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setShowData(false);
    setDecryptedData('');
    setPrivateKeyParts(null);
    setPassword('');
    setAutoHideCountdown(null);
    setError('');

    if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const startAutoHideTimer = () => {
    // Start countdown
    setAutoHideCountdown(AUTO_HIDE_SECONDS);

    countdownRef.current = setInterval(() => {
      setAutoHideCountdown(prev => {
        if (prev === null || prev <= 1) {
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-hide after timeout
    autoHideTimerRef.current = setTimeout(() => {
      handleHideData();
    }, AUTO_HIDE_SECONDS * 1000);
  };

  const handleHideData = () => {
    resetState();
  };

  if (!isOpen) return null;

  const handleDecrypt = async () => {
    try {
      setError('');
      setIsDecrypting(true);

      // Use async decryption (handles both old and new formats)
      const decrypted = await decryptData(
        entry.encrypted_data,
        password,
        entry.iv,
        entry.salt,
        (entry as any).version // Version field if exists
      );

      // Based on category, handle the decrypted data differently
      if (entry.category === 'private_key') {
        // For private keys, split into two parts for added security
        const parts = splitPrivateKey(decrypted);
        setPrivateKeyParts(parts);
        setDecryptedData(''); // Clear the full data for private keys
      } else {
        // For mnemonic phrases, passwords and other categories, show as is
        setDecryptedData(decrypted);
        setPrivateKeyParts(null);
      }

      setShowData(true);
      startAutoHideTimer();
    } catch (error) {
      console.error('Decryption error:', error);
      setError('Incorrect password. Please try again.');
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);

      // Clear clipboard after 30 seconds for security
      if (clipboardTimerRef.current) {
        clearTimeout(clipboardTimerRef.current);
      }
      clipboardTimerRef.current = setTimeout(async () => {
        try {
          // Clear clipboard by writing empty string
          await navigator.clipboard.writeText('');
        } catch (e) {
          // Clipboard clearing may fail if page loses focus
          console.debug('Could not clear clipboard');
        }
      }, CLIPBOARD_CLEAR_SECONDS * 1000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${secs}s`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {entry.title}
          </h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <div className="mt-4">
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-4">
            {entry.category === 'mnemonic_phrase' && 'Mnemonic Phrase'}
            {entry.category === 'private_key' && 'Private Key'}
            {entry.category === 'password' && 'Password'}
            {entry.category === 'other' && 'Other'}
          </div>

          {!showData ? (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Enter your password to reveal the encrypted data.
              </p>

              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password to decrypt"
                  className="input pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleDecrypt()}
                  disabled={isDecrypting}
                />
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  className="btn-primary w-full"
                  onClick={handleDecrypt}
                  disabled={isDecrypting}
                >
                  {isDecrypting ? 'Decrypting...' : 'Reveal Data'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Auto-hide countdown warning */}
              {autoHideCountdown !== null && (
                <div className="mb-4 p-2 bg-amber-50 border border-amber-200 rounded-md flex items-center justify-between">
                  <div className="flex items-center text-amber-700 text-sm">
                    <FiClock className="h-4 w-4 mr-2" />
                    <span>Auto-hiding in {formatCountdown(autoHideCountdown)}</span>
                  </div>
                  <span className="text-xs text-amber-600">
                    Clipboard clears after copy
                  </span>
                </div>
              )}

              {/* Display for regular entries (mnemonic phrases, passwords, other) */}
              {decryptedData && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {entry.category === 'mnemonic_phrase' ? 'Mnemonic Phrase' :
                        entry.category === 'password' ? 'Password' : 'Data'}:
                    </label>
                    <button
                      className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                      onClick={() => handleCopy(decryptedData)}
                    >
                      <FiCopy className="h-4 w-4 mr-1" />
                      {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="mt-1 relative">
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-200 break-all">
                      {decryptedData}
                    </div>
                  </div>
                </div>
              )}

              {/* Special display for private keys (split into two parts) */}
              {privateKeyParts && (
                <div>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Private Key (First Half):
                      </label>
                      <button
                        className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                        onClick={() => handleCopy(privateKeyParts.part1)}
                      >
                        <FiCopy className="h-4 w-4 mr-1" />
                        {isCopied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="mt-1">
                      <div className="p-3 bg-gray-50 rounded-md border border-gray-200 break-all">
                        {privateKeyParts.part1}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Private Key (Second Half):
                      </label>
                      <button
                        className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                        onClick={() => handleCopy(privateKeyParts.part2)}
                      >
                        <FiCopy className="h-4 w-4 mr-1" />
                        {isCopied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="mt-1">
                      <div className="p-3 bg-gray-50 rounded-md border border-gray-200 break-all">
                        {privateKeyParts.part2}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Complete Private Key:
                      </label>
                      <button
                        className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                        onClick={() => handleCopy(privateKeyParts.part1 + privateKeyParts.part2)}
                      >
                        <FiCopy className="h-4 w-4 mr-1" />
                        {isCopied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="mt-1">
                      <div className="p-3 bg-gray-50 rounded-md border border-gray-200 break-all">
                        <span className="opacity-50">Click copy to copy the full key</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-5">
                <button
                  type="button"
                  className="btn-secondary w-full"
                  onClick={handleHideData}
                >
                  Hide Data Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntryRevealModal;