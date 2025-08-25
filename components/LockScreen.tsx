import {useTheme} from '@/components/ThemeProvider';
import {useSettingsStore} from '@/store/settings-store';
import {BiometricAuthService} from '@/utils/biometric-auth';
import {Ionicons} from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Animated, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {logger} from "@/services/logger";

interface LockScreenProps {
    onUnlock: () => void;
    biometricEnabled: boolean;
}

export const LockScreen: React.FC<LockScreenProps> = ({onUnlock, biometricEnabled}) => {
    const theme = useTheme();
    const {t} = useTranslation();
    const {pinCode} = useSettingsStore();
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [biometricType, setBiometricType] = useState<string>('');
    const [showPinInput, setShowPinInput] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [pinError, setPinError] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const spinValue = useRef(new Animated.Value(0)).current;

    // Async function for biometric check
    const checkBiometricAvailability = useCallback(async () => {
        try {
            const isAvailable = await BiometricAuthService.isBiometricAvailable();
            setBiometricAvailable(isAvailable);

            if (isAvailable) {
                const types = await BiometricAuthService.getAvailableBiometricNames();
                setBiometricType(types[0] || 'Biometric');
            }
        } catch (error) {
            console.error('Error checking biometric availability:', error);
        }
    }, []);

    // Async function for biometric auth
    const handleBiometricAuth = useCallback(async () => {
        if (!biometricEnabled || !biometricAvailable) {
            setShowPinInput(true);
            return;
        }

        setIsAuthenticating(true);

        try {
            const result = await BiometricAuthService.authenticate(
                `Unlock with ${biometricType}`
            );

            if (result.success) {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onUnlock();
            } else {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                setShowPinInput(true);
            }
        } catch (error) {
            logger.error('Handle biometric function error on LockScreen page', error);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setShowPinInput(true);
        } finally {
            setIsAuthenticating(false);
        }
    }, [biometricEnabled, biometricAvailable, biometricType, onUnlock]);

    useEffect(() => {
        // Call async function properly
        const initializeBiometric = async () => {
            await checkBiometricAvailability();

            // Auto-trigger biometric if available
            if (biometricEnabled) {
                timeoutRef.current = setTimeout(() => {
                    // Handle promise properly
                    handleBiometricAuth().catch((error) => {
                        logger.error('Auto biometric auth failed:', error);
                    });
                }, 500);
            } else {
                setShowPinInput(true);
            }
        };

        initializeBiometric().catch((error) => {
            logger.error('Failed to initialize biometric:', error);
        });

        // Cleanup function
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [biometricEnabled, checkBiometricAvailability, handleBiometricAuth]);

    // Spinning animation effect
    useEffect(() => {
        if (isAuthenticating) {
            const spinAnimation = Animated.loop(
                Animated.timing(spinValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                })
            );
            spinAnimation.start();

            return () => {
                spinAnimation.stop();
                spinValue.setValue(0);
            };
        } else {
            spinValue.setValue(0);
        }
    }, [isAuthenticating, spinValue]);

    const handlePinInput = (digit: string) => {
        if (pinInput.length < 4) {
            const newPin = pinInput + digit;
            setPinInput(newPin);

            if (newPin.length === 4) {
                checkPinCode(newPin);
            }
        }
    };

    const handlePinDelete = () => {
        setPinInput(prev => prev.slice(0, -1));
        setPinError(false);
    };

    const checkPinCode = async (inputPin: string) => {
        try {
            if (inputPin === pinCode) {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onUnlock();
            } else {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                setPinError(true);
                setPinInput('');
                setTimeout(() => setPinError(false), 1000);
            }
        } catch (error) {
            logger.error('PIN check haptic feedback failed:', error);
            // Continue with unlock logic even if haptics fail
            if (inputPin === pinCode) {
                onUnlock();
            } else {
                setPinError(true);
                setPinInput('');
                setTimeout(() => setPinError(false), 1000);
            }
        }
    };

    const getLockIcon = () => {
        if (biometricEnabled && biometricAvailable && !showPinInput) {
            switch (biometricType) {
                case 'Face ID':
                    return 'scan-outline';
                case 'Touch ID':
                    return 'finger-print-outline';
                default:
                    return 'finger-print-outline';
            }
        }
        return 'lock-closed-outline';
    };

    const getLockText = () => {
        if (biometricEnabled && biometricAvailable && !showPinInput) {
            return t('lockScreen.biometricSubtitle');
        }
        return t('lockScreen.subtitle');
    };

    const renderPinDots = () => {
        return (
            <View style={styles.pinDotsContainer}>
                {[0, 1, 2, 3].map((index) => (
                    <View
                        key={index}
                        style={[
                            styles.pinDot,
                            {
                                backgroundColor: index < pinInput.length
                                    ? theme.colors.primary
                                    : theme.colors.border,
                                borderColor: pinError ? theme.colors.destructive : theme.colors.border
                            }
                        ]}
                    />
                ))}
            </View>
        );
    };

    const renderPinPad = () => {
        const digits = [
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['biometric', '0', 'delete']
        ];

        const handlePinPadPress = (digit: string) => {
            if (digit === 'biometric') {
                if (biometricEnabled && biometricAvailable) {
                    // Handle promise properly
                    handleBiometricAuth().catch((error) => {
                        logger.error('PIN pad biometric auth failed:', error);
                    });
                }
            } else if (digit === 'delete') {
                handlePinDelete();
            } else if (digit) {
                handlePinInput(digit);
            }
        };

        return (
            <View style={styles.pinPadContainer}>
                {digits.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.pinRow}>
                        {row.map((digit, colIndex) => (
                            <TouchableOpacity
                                key={colIndex}
                                style={[
                                    styles.pinButton,
                                    {backgroundColor: theme.colors.card},
                                    digit === 'biometric' && !biometricEnabled && {opacity: 0.3}
                                ]}
                                onPress={() => handlePinPadPress(digit)}
                                disabled={!digit && digit !== 'biometric' && digit !== 'delete'}
                            >
                                {digit === 'biometric' ? (
                                    biometricEnabled && biometricAvailable ? (
                                        <Ionicons
                                            name={getLockIcon()}
                                            size={24}
                                            color={theme.colors.primary}
                                        />
                                    ) : (
                                        <Ionicons
                                            name="lock-closed-outline"
                                            size={24}
                                            color={theme.colors.text}
                                            style={{opacity: 0.3}}
                                        />
                                    )
                                ) : digit === 'delete' ? (
                                    <Ionicons
                                        name="backspace-outline"
                                        size={24}
                                        color={theme.colors.text}
                                    />
                                ) : digit ? (
                                    <Text style={[styles.pinDigit, {color: theme.colors.text}]}>
                                        {digit}
                                    </Text>
                                ) : null}
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </View>
        );
    };

    return (
        <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
            <View style={styles.content}>
                {/* Lock Icon */}
                <View style={[
                    styles.iconContainer,
                    {backgroundColor: theme.colors.card}
                ]}>
                    <Ionicons
                        name={getLockIcon()}
                        size={80}
                        color={theme.colors.primary}
                    />
                </View>

                {/* Title */}
                <Text style={[styles.title, {color: theme.colors.text}]}>
                    {t('lockScreen.title')}
                </Text>

                {/* Subtitle */}
                <Text style={[styles.subtitle, {color: theme.colors.text, opacity: 0.7}]}>
                    {getLockText()}
                </Text>

                {/* PIN Dots */}
                {showPinInput && renderPinDots()}

                {/* Biometric Button */}
                {biometricEnabled && biometricAvailable && !showPinInput && (
                    <TouchableOpacity
                        style={[
                            styles.biometricButton,
                            {backgroundColor: theme.colors.primary},
                            isAuthenticating && styles.buttonDisabled
                        ]}
                        onPress={() => {
                            // Handle promise properly
                            handleBiometricAuth().catch((error) => {
                                logger.error('Manual biometric auth failed:', error);
                            });
                        }}
                        disabled={isAuthenticating}
                        activeOpacity={0.8}
                    >
                        {isAuthenticating ? (
                            <Animated.View style={[
                                styles.loadingContainer,
                                {
                                    transform: [{
                                        rotate: spinValue.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0deg', '360deg']
                                        })
                                    }]
                                }
                            ]}>
                                <Ionicons
                                    name="refresh"
                                    size={24}
                                    color={theme.colors.background}
                                />
                            </Animated.View>
                        ) : (
                            <>
                                <Ionicons
                                    name={getLockIcon()}
                                    size={24}
                                    color={theme.colors.background}
                                />
                                <Text style={[styles.buttonText, {color: theme.colors.background}]}>
                                    {biometricType} bilan ochish
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}

                {/* PIN Pad */}
                {showPinInput && renderPinPad()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 40,
        width: '100%',
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    pinDotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 40,
        gap: 16,
    },
    pinDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
    },
    pinPadContainer: {
        width: '100%',
        maxWidth: 280,
        marginBottom: 24,
    },
    pinRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    pinButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    pinDigit: {
        fontSize: 24,
        fontWeight: '600',
    },
    biometricButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});