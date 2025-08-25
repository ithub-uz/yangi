import { logger } from "@/services/logger";
import { SecurityUtils, validatePinCode } from "@/utils/security";
import { settingsSchema, type Settings } from "@/validation/schemas";
import { deleteItemAsync, getItem, setItem } from "expo-secure-store";
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import NotificationService from '../utils/notification-service';

interface SettingsState {
    themeMode: 'light' | 'dark' | 'system';
    language: 'en' | 'uz' | 'system';
    notifications: boolean;
    hapticFeedback: boolean;
    autoSave: boolean;
    biometricAuth: boolean;
    lockScreen: boolean;
    lockScreenTimeout: number; // seconds
    isLocked: boolean;
    pinCode: string; // 4-digit PIN code
    isLoading: boolean;
    error: string | null;

    // Actions
    setLocked: (locked: boolean) => void;
    setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
    setLanguage: (lang: 'en' | 'uz' | 'system') => void;
    setNotifications: (enabled: boolean) => Promise<void>;
    setHapticFeedback: (enabled: boolean) => void;
    setAutoSave: (enabled: boolean) => void;
    setBiometricAuth: (enabled: boolean) => Promise<void>;
    setLockScreen: (enabled: boolean) => void;
    setLockScreenTimeout: (timeout: number) => void;
    setPinCode: (code: string) => Promise<void>;
    resetToDefaults: () => Promise<void>;
    initializeNotifications: () => Promise<void>;
    clearError: () => void;
    updateSettings: (settings: Partial<Settings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            themeMode: 'system',
            language: 'en',
            notifications: true,
            hapticFeedback: true,
            autoSave: true,
            biometricAuth: false,
            lockScreen: false,
            lockScreenTimeout: 30, // 30 seconds default
            isLocked: false,
            pinCode: '1234', // default PIN code
            isLoading: false,
            error: null,

            setLocked: (locked) => {
                logger.debug('Lock screen state changed', { locked });
                set({ isLocked: locked });
            },

            setThemeMode: (mode) => {
                logger.info('Theme mode changed', { mode });
                set({ themeMode: mode });
            },

            setLanguage: (lang) => {
                logger.info('Language changed', { language: lang });
                set({ language: lang });
            },

            setNotifications: async (enabled) => {
                try {
                    set({ isLoading: true, error: null });

                    if (enabled) {
                        const granted = await NotificationService.getInstance().requestPermissions();
                        if (granted) {
                            NotificationService.getInstance().subscribeListeners();
                            set({ notifications: true, isLoading: false });
                            logger.info('Notifications enabled');
                        } else {
                            set({ notifications: false, isLoading: false });
                            logger.warn('Notification permissions denied');
                        }
                    } else {
                        NotificationService.getInstance().unsubscribeListeners();
                        set({ notifications: false, isLoading: false });
                        logger.info('Notifications disabled');
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to update notifications';
                    set({ isLoading: false, error: errorMessage });
                    logger.error('Failed to update notifications', error);
                    throw error;
                }
            },

            setHapticFeedback: (enabled) => {
                logger.debug('Haptic feedback setting changed', { enabled });
                set({ hapticFeedback: enabled });
            },

            setAutoSave: (enabled) => {
                logger.debug('Auto save setting changed', { enabled });
                set({ autoSave: enabled });
            },

            setBiometricAuth: async (enabled) => {
                try {
                    set({ isLoading: true, error: null });

                    if (enabled) {
                        // Check if biometric is available
                        const { BiometricAuthService } = await import('@/utils/biometric-auth');
                        const isAvailable = await BiometricAuthService.isBiometricAvailable();

                        if (!isAvailable) {
                            throw new Error('Biometric authentication is not available on this device');
                        }

                        // Test biometric authentication
                        const success = await BiometricAuthService.authenticate();
                        if (!success) {
                            throw new Error('Biometric authentication failed');
                        }

                        // Store biometric key
                        const biometricKey = SecurityUtils.generateSecureRandom(32);
                        await SecurityUtils.storeBiometricKey(biometricKey);

                        set({ biometricAuth: true, isLoading: false });
                        logger.info('Biometric authentication enabled');
                    } else {
                        // Clear biometric key
                        await SecurityUtils.clearBiometricKey();
                        set({ biometricAuth: false, isLoading: false });
                        logger.info('Biometric authentication disabled');
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to update biometric auth';
                    set({ isLoading: false, error: errorMessage });
                    logger.error('Failed to update biometric auth', error);
                    throw error;
                }
            },

            setLockScreen: (enabled) => {
                logger.info('Lock screen setting changed', { enabled });
                set({ lockScreen: enabled });
            },

            setLockScreenTimeout: (timeout) => {
                logger.debug('Lock screen timeout changed', { timeout });
                set({ lockScreenTimeout: timeout });
            },

            setPinCode: async (code) => {
                try {
                    set({ isLoading: true, error: null });

                    // Validate PIN code
                    if (!validatePinCode(code)) {
                        throw new Error('PIN code must be exactly 4 digits');
                    }

                    // Store PIN code securely
                    await SecurityUtils.storePinCode(code);

                    set({ pinCode: code, isLoading: false });
                    logger.info('PIN code updated');
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to update PIN code';
                    set({ isLoading: false, error: errorMessage });
                    logger.error('Failed to update PIN code', error);
                    throw error;
                }
            },

            resetToDefaults: async () => {
                try {
                    set({ isLoading: true, error: null });

                    // Clear all secure data
                    await SecurityUtils.clearBiometricKey();
                    await SecurityUtils.clearPinCode();

                    // Unsubscribe from notifications
                    NotificationService.getInstance().unsubscribeListeners();

                    set({
                        themeMode: 'system',
                        language: 'system',
                        notifications: true,
                        hapticFeedback: true,
                        autoSave: true,
                        biometricAuth: false,
                        lockScreen: false,
                        lockScreenTimeout: 30,
                        isLocked: false,
                        pinCode: '1234',
                        isLoading: false,
                        error: null
                    });

                    logger.info('Settings reset to defaults');
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to reset settings';
                    set({ isLoading: false, error: errorMessage });
                    logger.error('Failed to reset settings', error);
                    throw error;
                }
            },

            initializeNotifications: async () => {
                try {
                    const state = get();
                    if (state.notifications) {
                        await NotificationService.getInstance().subscribeListeners();
                        logger.debug('Notification listeners subscribed');
                    } else {
                        NotificationService.getInstance().unsubscribeListeners();
                        logger.debug('Notification listeners unsubscribed');
                    }
                } catch (error) {
                    logger.error('Failed to initialize notifications', error);
                    throw error;
                }
            },

            clearError: () => {
                set({ error: null });
            },

            updateSettings: async (settings) => {
                try {
                    set({ isLoading: true, error: null });

                    // Validate settings
                    const validatedSettings = settingsSchema.partial().parse(settings);

                    // Update settings
                    set((state) => ({
                        ...state,
                        ...validatedSettings,
                        isLoading: false,
                    }));

                    logger.info('Settings updated', { settings: Object.keys(validatedSettings) });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to update settings';
                    set({ isLoading: false, error: errorMessage });
                    logger.error('Failed to update settings', error);
                    throw error;
                }
            },
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => ({
                setItem,
                getItem,
                removeItem: deleteItemAsync,
            })),
            onRehydrateStorage: (state) => {
                return () => {
                    logger.debug('Settings store rehydrated');
                };
            },
        }
    )
);