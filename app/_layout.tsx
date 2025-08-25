import {ErrorBoundary} from "@/components/ErrorBoundary";
import {LockScreen} from "@/components/LockScreen";
import {ThemeProvider} from "@/components/ThemeProvider";
import "@/locales/i18n";
import {logger} from '@/services/logger';
import {useAuthStore} from "@/store/auth-store";
import {useSettingsStore} from "@/store/settings-store";
import {BiometricAuthService} from "@/utils/biometric-auth";
import {Stack} from "expo-router";
import {StatusBar} from "expo-status-bar";
import {changeLanguage} from 'i18next';
import React, {useCallback, useEffect} from "react";
import {AppState, useColorScheme} from 'react-native';

export default function RootLayout() {
    const {isLoggedIn, hasCompletedOnboarding} = useAuthStore();
    const {
        language,
        themeMode,
        lockScreen,
        lockScreenTimeout,
        biometricAuth,
        isLocked,
        setLocked,
        initializeNotifications
    } = useSettingsStore();
    const systemColorScheme = useColorScheme();

    // Language change effect
    useEffect(() => {
        const updateLanguage = async () => {
            try {
                await changeLanguage(language);
                logger.info('Language changed', {language});
            } catch (error) {
                logger.error('Failed to change language', {language, error});
            }
        };

        updateLanguage().catch((error) => {
            logger.error('Language update promise rejected', error);
        });
    }, [language]);

    // Initialize notifications effect
    useEffect(() => {
        if (!isLoggedIn) return;

        const initNotifications = async () => {
            try {
                await initializeNotifications();
                logger.info('Notifications initialized successfully');
            } catch (error) {
                logger.error('Failed to initialize notifications', error);
            }
        };

        initNotifications().catch((error) => {
            logger.error('Notification initialization promise rejected', error);
        });
    }, [isLoggedIn, initializeNotifications]);

    // App state change handler
    const handleAppStateChange = useCallback(async (nextAppState: string) => {
        try {
            logger.debug('App State Changed', {
                nextAppState,
                lockScreen,
                isLoggedIn,
                lockScreenTimeout
            });

            if (nextAppState === 'active' && lockScreen && isLoggedIn) {
                try {
                    const shouldLock = await BiometricAuthService.shouldLockApp(lockScreenTimeout);
                    logger.debug('Lock check result', {shouldLock});

                    if (shouldLock) {
                        logger.info('App locked due to timeout');
                        setLocked(true);
                    } else {
                        // Update last active time when app becomes active
                        await BiometricAuthService.updateLastActiveTime();
                        logger.debug('Last active time updated');
                    }
                } catch (error) {
                    logger.error('Error checking lock status', error);
                }
            } else if (nextAppState === 'background' || nextAppState === 'inactive') {
                // Update last active time when app goes to background
                if (lockScreen && isLoggedIn) {
                    try {
                        await BiometricAuthService.updateLastActiveTime();
                        logger.debug('App backgrounded, last active time updated');
                    } catch (error) {
                        logger.error('Error updating last active time on background', error);
                    }
                }
            }
        } catch (error) {
            logger.error('Unexpected error in app state change handler', error);
        }
    }, [lockScreen, lockScreenTimeout, isLoggedIn, setLocked]);

    // App state change effect
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            // Handle promise properly
            handleAppStateChange(nextAppState).catch((error) => {
                logger.error('App state change handler promise rejected', error);
            });
        });

        return () => {
            subscription?.remove();
        };
    }, [handleAppStateChange]);

    // Biometric permissions check effect
    useEffect(() => {
        if (!isLoggedIn || !biometricAuth) return;

        const checkBiometricPermissions = async () => {
            try {
                const isAvailable = await BiometricAuthService.isBiometricAvailable();
                if (!isAvailable) {
                    logger.warn('Biometric authentication not available');
                } else {
                    logger.info('Biometric authentication available');
                }
            } catch (error) {
                logger.error('Error checking biometric permissions', error);
            }
        };

        checkBiometricPermissions().catch((error) => {
            logger.error('Biometric permissions check promise rejected', error);
        });
    }, [isLoggedIn, biometricAuth]);

    // Unlock handler
    const handleUnlock = useCallback(() => {
        try {
            logger.info('App unlocked');
            setLocked(false);
        } catch (error) {
            logger.error('Error during unlock', error);
        }
    }, [setLocked]);

    // Error boundary handler
    const handleError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
        try {
            logger.error('Root layout error', {
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                },
                componentStack: errorInfo.componentStack,
            });
        } catch (loggingError) {
            // Fallback if logging fails
            console.error('Failed to log root layout error:', loggingError);
            console.error('Original error:', error);
            console.error('Error info:', errorInfo);
        }
    }, []);

    // Status bar style computation
    const statusBarStyle = themeMode === 'dark'
        ? 'light'
        : themeMode === 'light'
            ? 'dark'
            : (systemColorScheme === 'dark' ? 'light' : 'dark');

    return (
        <ErrorBoundary onError={handleError}>
            <ThemeProvider>
                <StatusBar style={statusBarStyle}/>
                <Stack screenOptions={{headerShown: false}}>
                    <Stack.Protected guard={isLoggedIn}>
                        <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
                    </Stack.Protected>
                    <Stack.Protected guard={!isLoggedIn && hasCompletedOnboarding}>
                        <Stack.Screen name="public/(auth)/sign-in"/>
                        <Stack.Screen name="public/(auth)/create-account"/>
                    </Stack.Protected>
                    <Stack.Protected guard={!hasCompletedOnboarding}>
                        <Stack.Screen name="public/(onboarding)" options={{headerShown: false}}/>
                    </Stack.Protected>
                </Stack>

                {/* Lock Screen Overlay */}
                {isLocked && isLoggedIn && (
                    <LockScreen
                        onUnlock={handleUnlock}
                        biometricEnabled={biometricAuth}
                    />
                )}
            </ThemeProvider>
        </ErrorBoundary>
    );
}

