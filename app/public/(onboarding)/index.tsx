import {ChangePinModal} from '@/components/ChangePinModal';
import {useTheme} from '@/components/ThemeProvider';
import {useAuthStore} from '@/store/auth-store';
import {useSettingsStore} from '@/store/settings-store';
import {BiometricAuthService} from '@/utils/biometric-auth';
import * as Haptics from 'expo-haptics';
import {useRouter} from 'expo-router';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Alert, Button, Image, Platform, Pressable, Text, useWindowDimensions, View,} from 'react-native';
import {logger} from '@/services/logger';

export default function OnboardingScreen() {
    const {t, i18n} = useTranslation();
    const theme = useTheme();
    const {width} = useWindowDimensions();
    const router = useRouter();

    const {completeOnboarding} = useAuthStore();
    const {setThemeMode, themeMode, setLanguage, language, setBiometricAuth} =
        useSettingsStore();

    const [step, setStep] = useState(0);
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);

    const steps = [
        {
            key: 'welcome',
            image: require('@/assets/images/react-logo.png'),
            title: t('onboarding.welcome'),
            desc: t('onboarding.welcomeDesc'),
        },
        {
            key: 'features',
            image: require('@/assets/images/partial-react-logo.png'),
            title: t('onboarding.features'),
            desc: t('onboarding.featuresDesc'),
        },
        {
            key: 'theme',
            image: require('@/assets/images/adaptive-icon.png'),
            title: t('onboarding.customization'),
            desc: t('onboarding.customizationDesc'),
        },
        {
            key: 'security',
            image: require('@/assets/images/adaptive-icon.png'),
            title: 'Security & Privacy',
            desc: 'Enable biometric authentication for secure access to your app',
        },
        {
            key: 'getstarted',
            image: require('@/assets/images/splash-icon.png'),
            title: t('onboarding.ready'),
            desc: t('onboarding.readyDesc'),
        },
    ];

    const isLastStep = step === steps.length - 1;

    useEffect(() => {
        const checkBiometricAvailability = async () => {
            try {
                const isAvailable = await BiometricAuthService.isBiometricAvailable();
                setBiometricAvailable(isAvailable);
            } catch (error) {
                logger.error('Error checking biometric availability', error);
            }
        };

        void checkBiometricAvailability();
    }, []);

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: theme.colors.background,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
            }}
        >
            {/* Progress Indicator */}
            <View style={{flexDirection: 'row', marginBottom: 24}}>
                {steps.map((_, i) => (
                    <View
                        key={i}
                        style={{
                            width: 24,
                            height: 6,
                            borderRadius: 3,
                            marginHorizontal: 4,
                            backgroundColor:
                                i <= step ? theme.colors.primary : theme.colors.border,
                        }}
                    />
                ))}
            </View>

            {/* Image/Icon */}
            <Image
                source={steps[step].image}
                style={{
                    width: width * 0.4,
                    height: width * 0.4,
                    marginBottom: 24,
                    resizeMode: 'contain',
                }}
            />

            {/* Title/Description */}
            <Text
                style={{
                    color: theme.colors.text,
                    fontSize: 28,
                    fontWeight: 'bold',
                    marginBottom: 12,
                    textAlign: 'center',
                }}
            >
                {steps[step].title}
            </Text>
            <Text
                style={{
                    color: theme.colors.text,
                    fontSize: 16,
                    marginBottom: 32,
                    textAlign: 'center',
                }}
            >
                {steps[step].desc}
            </Text>

            {/* Theme & Language (Step 2) */}
            {step === 2 && (
                <View style={{width: '100%', alignItems: 'center', marginBottom: 24}}>
                    <Text
                        style={{
                            color: theme.colors.text,
                            fontWeight: 'bold',
                            marginBottom: 8,
                        }}
                    >
                        {t('settings.appearance.theme')}
                    </Text>

                    <View style={{flexDirection: 'row', marginBottom: 16}}>
                        {['light', 'dark', 'system'].map((mode) => (
                            <Pressable
                                key={mode}
                                onPress={async () => {
                                    setThemeMode(mode as any);
                                    await Haptics.selectionAsync();
                                }}
                                style={{
                                    paddingVertical: 8,
                                    paddingHorizontal: 16,
                                    borderRadius: 8,
                                    backgroundColor:
                                        themeMode === mode
                                            ? theme.colors.primary
                                            : theme.colors.card,
                                    marginHorizontal: 4,
                                    borderWidth: themeMode === mode ? 2 : 1,
                                    borderColor:
                                        themeMode === mode
                                            ? theme.colors.secondary
                                            : theme.colors.border,
                                }}
                            >
                                <Text
                                    style={{
                                        color:
                                            themeMode === mode
                                                ? theme.colors.background
                                                : theme.colors.text,
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {mode === 'light'
                                        ? '☀️ ' + t('settings.theme.light')
                                        : mode === 'dark'
                                            ? '🌙 ' + t('settings.theme.dark')
                                            : '🖥️ ' + t('settings.theme.system')}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    <Text
                        style={{
                            color: theme.colors.text,
                            fontSize: 12,
                            opacity: 0.7,
                            textAlign: 'center',
                            marginBottom: 8,
                        }}
                    >
                        {Platform.OS === 'ios' ? 'iOS Design System' : 'Material Design 3'}
                    </Text>

                    <Text
                        style={{
                            color: theme.colors.text,
                            fontWeight: 'bold',
                            marginBottom: 8,
                        }}
                    >
                        {t('settings.appearance.language')}
                    </Text>

                    <View style={{flexDirection: 'row'}}>
                        <Button
                            title="🇺🇿 O'zbekcha"
                            onPress={async () => {
                                await i18n.changeLanguage('uz');
                                await Haptics.selectionAsync();
                                setLanguage('uz');
                            }}
                            color={language === 'uz' ? theme.colors.primary : undefined}
                        />
                        <View style={{width: 10}}/>
                        <Button
                            title="🇬🇧 English"
                            onPress={async () => {
                                await i18n.changeLanguage('en');
                                await Haptics.selectionAsync();
                                setLanguage('en');
                            }}
                            color={language === 'en' ? theme.colors.primary : undefined}
                        />
                    </View>
                </View>
            )}

            {/* Biometric Auth Setup (Step 3) */}
            {step === 3 && (
                <View style={{width: '100%', alignItems: 'center', marginBottom: 24}}>
                    <View
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 40,
                            backgroundColor: theme.colors.primary,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: 16,
                        }}
                    >
                        <Text style={{fontSize: 40}}>🔐</Text>
                    </View>

                    {biometricAvailable ? (
                        <View style={{alignItems: 'center'}}>
                            <Text
                                style={{
                                    color: theme.colors.text,
                                    fontSize: 16,
                                    marginBottom: 16,
                                    textAlign: 'center',
                                }}
                            >
                                {t('onboarding.enableBiometric')}
                            </Text>
                            <View style={{flexDirection: 'row'}}>
                                <Button
                                    title={t('onboarding.enable')}
                                    onPress={async () => {
                                        try {
                                            const hasPermission =
                                                await BiometricAuthService.requestPermissions();
                                            if (hasPermission) {
                                                await BiometricAuthService.setBiometricEnabled(true);
                                                setBiometricAuth(true);
                                                await Haptics.notificationAsync(
                                                    Haptics.NotificationFeedbackType.Success,
                                                );

                                                Alert.alert(
                                                    t('onboarding.setupPinCode'),
                                                    t('onboarding.setupPinCodeMessage'),
                                                    [
                                                        {text: t('common.skip'), style: 'cancel'},
                                                        {
                                                            text: t('common.continue'),
                                                            onPress: () => setShowPinModal(true),
                                                        },
                                                    ],
                                                );
                                            } else {
                                                Alert.alert(
                                                    t('onboarding.permissionRequired'),
                                                    t('onboarding.enableBiometricInSettings'),
                                                    [{text: t('common.ok')}],
                                                );
                                            }
                                        } catch (error) {
                                            logger.error('Onboarding biometric error', error);
                                            Alert.alert(
                                                t('common.error'),
                                                t('onboarding.biometricConfigFailed'),
                                                [{text: t('common.ok')}],
                                            );
                                        }
                                    }}
                                    color={theme.colors.primary}
                                />
                                <View style={{width: 10}}/>
                                <Button
                                    title={t('onboarding.skip')}
                                    onPress={async () => {
                                        await Haptics.selectionAsync();
                                    }}
                                    color={theme.colors.border}
                                />
                            </View>
                        </View>
                    ) : (
                        <View style={{alignItems: 'center'}}>
                            <Text
                                style={{
                                    color: theme.colors.text,
                                    fontSize: 16,
                                    marginBottom: 16,
                                    textAlign: 'center',
                                }}
                            >
                                {t('onboarding.biometricNotAvailable')}
                            </Text>
                            <Text
                                style={{
                                    color: theme.colors.text,
                                    fontSize: 14,
                                    opacity: 0.7,
                                    textAlign: 'center',
                                }}
                            >
                                {t('onboarding.biometricNotAvailableDesc')}
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* Navigation Buttons */}
            <View style={{flexDirection: 'row', marginTop: 16}}>
                {step < steps.length - 1 && (
                    <Button
                        title={t('common.skip')}
                        onPress={async () => {
                            setStep(steps.length - 1);
                            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        color={theme.colors.border}
                    />
                )}

                {step > 0 && <View style={{width: 10}}/>}

                {isLastStep ? (
                    <Button
                        title={t('common.finish')}
                        onPress={async () => {
                            completeOnboarding();
                            router.replace('/public/(auth)/sign-in');
                            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        }}
                        color={theme.colors.primary}
                    />
                ) : (
                    <Button
                        title={t('common.next')}
                        onPress={async () => {
                            setStep(step + 1);
                            await Haptics.selectionAsync();
                        }}
                        color={theme.colors.primary}
                    />
                )}
            </View>

            <ChangePinModal
                visible={showPinModal}
                onClose={() => setShowPinModal(false)}
            />
        </View>
    );
}
