import { useEffect, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseSessionTimeoutOptions {
    timeoutMinutes?: number;
    warningMinutes?: number;
    onTimeout?: () => void;
    enabled?: boolean;
}

interface UseSessionTimeoutReturn {
    remainingTime: number | null;
    showWarning: boolean;
    resetTimer: () => void;
    extendSession: () => void;
}

export const useSessionTimeout = ({
    timeoutMinutes = 15,
    warningMinutes = 2,
    onTimeout,
    enabled = true
}: UseSessionTimeoutOptions = {}): UseSessionTimeoutReturn => {
    const navigate = useNavigate();
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lastActivityRef = useRef<number>(Date.now());
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const showWarningRef = useRef(false);

    const [remainingTime, setRemainingTime] = useState<number | null>(null);
    const [showWarning, setShowWarning] = useState(false);

    const timeoutMs = timeoutMinutes * 60 * 1000;
    const warningMs = warningMinutes * 60 * 1000;
    const DEBOUNCE_MS = 1000; // Debounce activity detection to prevent re-render storm

    // Keep ref in sync with state
    useEffect(() => {
        showWarningRef.current = showWarning;
    }, [showWarning]);

    const logout = useCallback(() => {
        // Clear indicator cookie
        document.cookie = 'is_logged_in=; Path=/; Max-Age=0';
        if (onTimeout) {
            onTimeout();
        }
        navigate('/login', {
            replace: true,
            state: { message: 'You have been logged out due to inactivity.' }
        });
    }, [navigate, onTimeout]);

    const clearAllTimers = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (warningRef.current) {
            clearTimeout(warningRef.current);
            warningRef.current = null;
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
            debounceRef.current = null;
        }
    }, []);

    const startTimer = useCallback(() => {
        if (!enabled) return;

        // Check if user is still logged in via indicator cookie
        const loggedIn = document.cookie.split(';').some(c => c.trim().startsWith('is_logged_in=1'));
        if (!loggedIn) return;

        // Clear existing timers but don't reset state unnecessarily
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (warningRef.current) clearTimeout(warningRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);

        const endTime = Date.now() + timeoutMs;

        // Show warning before timeout
        warningRef.current = setTimeout(() => {
            setShowWarning(true);

            // Start countdown
            intervalRef.current = setInterval(() => {
                const remaining = Math.max(0, endTime - Date.now());
                setRemainingTime(Math.ceil(remaining / 1000));

                if (remaining <= 0) {
                    clearAllTimers();
                    logout();
                }
            }, 1000);
        }, timeoutMs - warningMs);

        // Actual logout timeout
        timeoutRef.current = setTimeout(logout, timeoutMs);
    }, [enabled, timeoutMs, warningMs, clearAllTimers, logout]);

    const resetTimer = useCallback(() => {
        // Don't reset rapidly - debounce
        const now = Date.now();
        if (now - lastActivityRef.current < DEBOUNCE_MS) {
            return;
        }
        lastActivityRef.current = now;

        // Only reset if warning is not showing
        if (!showWarningRef.current) {
            setRemainingTime(null);
            setShowWarning(false);
            startTimer();
        }
    }, [startTimer]);

    const extendSession = useCallback(() => {
        setShowWarning(false);
        setRemainingTime(null);
        startTimer();
    }, [startTimer]);

    // Track user activity - set up ONCE, not on every state change
    useEffect(() => {
        if (!enabled) return;

        const loggedIn = document.cookie.split(';').some(c => c.trim().startsWith('is_logged_in=1'));
        if (!loggedIn) return;

        const activityEvents = ['mousedown', 'keydown', 'touchstart'];

        const handleActivity = () => {
            // Use ref to check if warning is showing (avoids dependency on state)
            if (showWarningRef.current) return;

            // Debounce: only reset if enough time has passed
            const now = Date.now();
            if (now - lastActivityRef.current < DEBOUNCE_MS) {
                return;
            }
            lastActivityRef.current = now;

            // Cancel any pending debounced reset
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            // Debounce the actual timer reset
            debounceRef.current = setTimeout(() => {
                if (!showWarningRef.current) {
                    startTimer();
                }
            }, 100);
        };

        // Add event listeners with passive option for better performance
        activityEvents.forEach(event => {
            window.addEventListener(event, handleActivity, { passive: true });
        });

        // Start initial timer
        startTimer();

        // Cleanup
        return () => {
            clearAllTimers();
            activityEvents.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled]); // Only depend on enabled, not on functions that change

    return {
        remainingTime,
        showWarning,
        resetTimer,
        extendSession
    };
};

export default useSessionTimeout;
