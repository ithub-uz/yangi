import { useTheme } from '@/components/ThemeProvider';
import { useAuthStore } from '@/store/auth-store';
import { useNotificationsStore } from '@/store/notifications-store';
import { useSettingsStore } from '@/store/settings-store';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

const SettingsScreen = () => {
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const {
        themeMode,
        setThemeMode,
        language,
        setLanguage,
        notifications,
        setNotifications,
        hapticFeedback,
        setHapticFeedback,
        autoSave,
        setAutoSave,
        biometricAuth,
        setBiometricAuth,
        lockScreen,
        setLockScreen,
        lockScreenTimeout,
        setLockScreenTimeout,
        pinCode,
        setPinCode,
        resetToDefaults: resetSettings
    } = useSettingsStore();
    const { sendTestNotification } = useNotificationsStore();
    const { isVip, logOut, resetToDefaults: resetAuth } = useAuthStore();

    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
    const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
    const [isTimeoutModalOpen, setIsTimeoutModalOpen] = useState(false);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');

    const themeOptions = useMemo(() => [
        { label: t('settings.theme.light'), value: 'light' },
        { label: t('settings.theme.dark'), value: 'dark' },
        { label: t('settings.theme.system'), value: 'system' },
    ], [t]);

    const languageOptions = useMemo(() => [
        { label: '🇺🇸 ' + t('settings.language.english'), value: 'en' },
        { label: '🇺🇿 ' + t('settings.language.uzbek'), value: 'uz' },
        { label: '🖥️ ' + t('settings.language.system'), value: 'system' },
    ], [t]);

    const timeoutOptions = useMemo(() => [
        { label: t('settings.timeout.immediately'), value: 0 },
        { label: t('settings.timeout.30seconds'), value: 30 },
        { label: t('settings.timeout.1minute'), value: 60 },
        { label: t('settings.timeout.5minutes'), value: 300 },
        { label: t('settings.timeout.15minutes'), value: 900 },
        { label: t('settings.timeout.1hour'), value: 3600 },
    ], [t]);

    // --- Handlers ---
    const handleResetSettings = () => {
        Alert.alert(
            t('settings.reset.title'),
            t('settings.reset.message'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('settings.reset.confirm'),
                    style: 'destructive',
                    onPress: async () => {
                        resetSettings();
                        resetAuth();
                        i18n.changeLanguage('en');
                        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }
                }
            ]
        );
    };

    const handleLogout = () => {
        Alert.alert(
            t('profile.logout'),
            t('profile.logoutConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('profile.logout'),
                    style: 'destructive',
                    onPress: async () => {
                        logOut();
                        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }
                }
            ]
        );
    };

    const handleTestNotification = async () => {
        try {
            await sendTestNotification();
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert(
                t('settings.notifications.testSent'),
                t('settings.notifications.testDescription')
            );
        } catch (error) {
            console.error('Failed to send test notification:', error);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert(
                t('common.error'),
                t('settings.notifications.testFailed')
            );
        }
    };

    const handlePinSetup = () => {
        if (!newPin || newPin.length !== 4) {
            Alert.alert(t('common.error'), t('settings.security.pinLength'));
            return;
        }
        
        if (newPin !== confirmPin) {
            Alert.alert(t('common.error'), t('settings.security.pinMismatch'));
            return;
        }

        setPinCode(newPin);
        setNewPin('');
        setConfirmPin('');
        setIsPinModalOpen(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(t('common.success'), t('settings.security.pinSet'));
    };

    const handlePinRemove = () => {
        Alert.alert(
            t('settings.security.removePinTitle'),
            t('settings.security.removePinMessage'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.remove'),
                    style: 'destructive',
                    onPress: () => {
                        setPinCode('');
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }
                }
            ]
        );
    };

    // --- Renderers ---
    const renderSwitch = (
        label: string,
        value: boolean,
        onValueChange: (value: boolean) => void,
        disabled: boolean = false,
        subtitle?: string
    ) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: theme.colors.card, borderBottomWidth: 0.5, borderBottomColor: theme.colors.border, opacity: disabled ? 0.5 : 1 }}>
            <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.text, fontSize: 17 }}>{label}</Text>
                {subtitle && <Text style={{ color: theme.colors.text, fontSize: 13, opacity: 0.6, marginTop: 2 }}>{subtitle}</Text>}
            </View>
            <Switch value={value} onValueChange={onValueChange} disabled={disabled} />
        </View>
    );

    const renderPicker = (
        label: string,
        value: string | number,
        options: { label: string; value: string | number }[],
        onPress: () => void,
        showValue: boolean = true
    ) => (
        <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: theme.colors.card, borderBottomWidth: 0.5, borderBottomColor: theme.colors.border }}>
            <Text style={{ color: theme.colors.text, fontSize: 17 }}>{label}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {showValue && (
                    <Text style={{ color: theme.colors.text, opacity: 0.6, fontSize: 17, marginRight: 8 }}>
                        {options.find(opt => opt.value === value)?.label}
                    </Text>
                )}
                <Ionicons name="chevron-forward" size={16} color={theme.colors.text} style={{ opacity: 0.3 }} />
            </View>
        </TouchableOpacity>
    );

    const renderActionButton = (
        label: string,
        onPress: () => void,
        icon?: string,
        color?: string
    ) => (
        <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: theme.colors.card, borderBottomWidth: 0.5, borderBottomColor: theme.colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {icon && <Ionicons name={icon as any} size={20} color={color || theme.colors.text} style={{ marginRight: 12 }} />}
                <Text style={{ color: color || theme.colors.text, fontSize: 17 }}>{label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.text} style={{ opacity: 0.3 }} />
        </TouchableOpacity>
    );

    const renderTimeout = () => renderPicker(
        t('settings.security.lockTimeout'),
        lockScreenTimeout,
        timeoutOptions,
        () => setIsTimeoutModalOpen(true)
    );

    const renderPinSetting = () => (
        <TouchableOpacity 
            onPress={pinCode ? handlePinRemove : () => setIsPinModalOpen(true)} 
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: theme.colors.card, borderBottomWidth: 0.5, borderBottomColor: theme.colors.border }}
        >
            <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.text, fontSize: 17 }}>
                    {pinCode ? t('settings.security.changePin') : t('settings.security.setPin')}
                </Text>
                <Text style={{ color: theme.colors.text, fontSize: 13, opacity: 0.6, marginTop: 2 }}>
                    {pinCode ? t('settings.security.pinActive') : t('settings.security.pinInactive')}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons 
                    name={pinCode ? "checkmark-circle" : "ellipse-outline"} 
                    size={20} 
                    color={pinCode ? theme.colors.primary : theme.colors.text} 
                    style={{ opacity: pinCode ? 1 : 0.3, marginRight: 8 }} 
                />
                <Ionicons name="chevron-forward" size={16} color={theme.colors.text} style={{ opacity: 0.3 }} />
            </View>
        </TouchableOpacity>
    );

    // --- Main Render ---
    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <Stack.Screen options={{ title: t('settings.title') }} />
            <ScrollView>
                {/* VIP Badge */}
                {isVip && (
                    <View style={{ marginHorizontal: 16, marginTop: 16, backgroundColor: theme.colors.primary, borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="diamond" size={20} color="white" style={{ marginRight: 8 }} />
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>{t('settings.vipStatus')}</Text>
                    </View>
                )}

                {/* Appearance */}
                <View style={{ marginVertical: 16, backgroundColor: theme.colors.card, borderRadius: 10, marginHorizontal: 16, overflow: 'hidden' }}>
                    {renderPicker(t('settings.appearance.theme'), themeMode, themeOptions, () => setIsThemeModalOpen(true))}
                    {renderPicker(t('settings.appearance.language'), language, languageOptions, () => setIsLanguageModalOpen(true))}
                </View>

                {/* Notifications */}
                <View style={{ marginVertical: 16, backgroundColor: theme.colors.card, borderRadius: 10, marginHorizontal: 16, overflow: 'hidden' }}>
                    {renderSwitch(t('settings.notifications.enable'), notifications, setNotifications)}
                    {renderSwitch(t('settings.notifications.haptic'), hapticFeedback, setHapticFeedback)}
                    {renderActionButton(t('settings.notifications.test'), handleTestNotification, 'notifications', theme.colors.primary)}
                </View>

                {/* General */}
                <View style={{ marginVertical: 16, backgroundColor: theme.colors.card, borderRadius: 10, marginHorizontal: 16, overflow: 'hidden' }}>
                    {renderSwitch(t('settings.general.autoSave'), autoSave, setAutoSave)}
                </View>

                {/* Security */}
                <View style={{ marginVertical: 16, backgroundColor: theme.colors.card, borderRadius: 10, marginHorizontal: 16, overflow: 'hidden' }}>
                    {renderSwitch(t('settings.security.biometricAuth'), biometricAuth, setBiometricAuth)}
                    {renderSwitch(t('settings.security.lockScreen'), lockScreen, setLockScreen)}
                    {renderTimeout()}
                    {renderPinSetting()}
                </View>

                {/* Actions */}
                <View style={{ marginVertical: 16, backgroundColor: theme.colors.card, borderRadius: 10, marginHorizontal: 16, overflow: 'hidden' }}>
                    {renderActionButton(t('settings.reset.title'), handleResetSettings, 'refresh', theme.colors.destructive)}
                    {renderActionButton(t('profile.logout'), handleLogout, 'log-out', theme.colors.destructive)}
                </View>
            </ScrollView>

            {/* Theme Modal */}
            <Modal visible={isThemeModalOpen} transparent animationType="slide" onRequestClose={() => setIsThemeModalOpen(false)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: theme.colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
                        <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>{t('settings.appearance.theme')}</Text>
                        {themeOptions.map((option:any) => (
                            <TouchableOpacity key={option.value} onPress={async () => { 
                                setThemeMode(option.value); 
                                setIsThemeModalOpen(false); 
                                await Haptics.selectionAsync(); 
                            }} style={{ paddingVertical: 12 }}>
                                <Text style={{ color: themeMode === option.value ? theme.colors.primary : theme.colors.text, fontWeight: themeMode === option.value ? 'bold' : 'normal' }}>{option.label}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity onPress={() => setIsThemeModalOpen(false)} style={{ marginTop: 20 }}>
                            <Text style={{ color: theme.colors.text, fontSize: 17 }}>{t('common.cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Language Modal */}
            <Modal visible={isLanguageModalOpen} transparent animationType="slide" onRequestClose={() => setIsLanguageModalOpen(false)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: theme.colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
                        <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>{t('settings.appearance.language')}</Text>
                        {languageOptions.map((option:any) => (
                            <TouchableOpacity key={option.value} onPress={async () => { 
                                setLanguage(option.value); 
                                setIsLanguageModalOpen(false); 
                                await Haptics.selectionAsync(); 
                            }} style={{ paddingVertical: 12 }}>
                                <Text style={{ color: language === option.value ? theme.colors.primary : theme.colors.text, fontWeight: language === option.value ? 'bold' : 'normal' }}>{option.label}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity onPress={() => setIsLanguageModalOpen(false)} style={{ marginTop: 20 }}>
                            <Text style={{ color: theme.colors.text, fontSize: 17 }}>{t('common.cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Timeout Modal */}
            <Modal visible={isTimeoutModalOpen} transparent animationType="slide" onRequestClose={() => setIsTimeoutModalOpen(false)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: theme.colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
                        <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>{t('settings.security.lockTimeout')}</Text>
                        {timeoutOptions.map(option => (
                            <TouchableOpacity key={option.value} onPress={async () => { 
                                setLockScreenTimeout(option.value as number); 
                                setIsTimeoutModalOpen(false); 
                                await Haptics.selectionAsync(); 
                            }} style={{ paddingVertical: 12 }}>
                                <Text style={{ color: lockScreenTimeout === option.value ? theme.colors.primary : theme.colors.text, fontWeight: lockScreenTimeout === option.value ? 'bold' : 'normal' }}>{option.label}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity onPress={() => setIsTimeoutModalOpen(false)} style={{ marginTop: 20 }}>
                            <Text style={{ color: theme.colors.text, fontSize: 17 }}>{t('common.cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* PIN Setup Modal */}
            <Modal visible={isPinModalOpen} transparent animationType="slide" onRequestClose={() => setIsPinModalOpen(false)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 20 }}>
                    <View style={{ backgroundColor: theme.colors.card, borderRadius: 20, padding: 24 }}>
                        <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
                            {t('settings.security.setPinTitle')}
                        </Text>
                        
                        <Text style={{ color: theme.colors.text, fontSize: 16, marginBottom: 10 }}>
                            {t('settings.security.enterPin')}
                        </Text>
                        <TextInput
                            style={{ 
                                borderWidth: 1, 
                                borderColor: theme.colors.border, 
                                borderRadius: 8, 
                                padding: 12, 
                                color: theme.colors.text, 
                                fontSize: 18,
                                textAlign: 'center',
                                letterSpacing: 10,
                                marginBottom: 16
                            }}
                            value={newPin}
                            onChangeText={setNewPin}
                            keyboardType="numeric"
                            maxLength={4}
                            secureTextEntry
                            placeholder="* * * *"
                            placeholderTextColor={theme.colors.text + '50'}
                        />

                        <Text style={{ color: theme.colors.text, fontSize: 16, marginBottom: 10 }}>
                            {t('settings.security.confirmPin')}
                        </Text>
                        <TextInput
                            style={{ 
                                borderWidth: 1, 
                                borderColor: theme.colors.border, 
                                borderRadius: 8, 
                                padding: 12, 
                                color: theme.colors.text, 
                                fontSize: 18,
                                textAlign: 'center',
                                letterSpacing: 10,
                                marginBottom: 24
                            }}
                            value={confirmPin}
                            onChangeText={setConfirmPin}
                            keyboardType="numeric"
                            maxLength={4}
                            secureTextEntry
                            placeholder="* * * *"
                            placeholderTextColor={theme.colors.text + '50'}
                        />

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                            <TouchableOpacity 
                                onPress={() => {
                                    setIsPinModalOpen(false);
                                    setNewPin('');
                                    setConfirmPin('');
                                }} 
                                style={{ flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border }}
                            >
                                <Text style={{ color: theme.colors.text, fontSize: 17, textAlign: 'center' }}>{t('common.cancel')}</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                onPress={handlePinSetup}
                                style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: theme.colors.primary }}
                            >
                                <Text style={{ color: 'white', fontSize: 17, fontWeight: 'bold', textAlign: 'center' }}>{t('common.save')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default SettingsScreen;