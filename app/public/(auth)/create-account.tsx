import { useTheme } from '@/components/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CreateAccountScreen() {
    const { t } = useTranslation();
    const theme = useTheme();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        setLoading(true);
        setError('');
        if (!name || !email || !password || !confirm) {
            setError(t('auth.fillAllFields'));
            setLoading(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }
        if (password !== confirm) {
            setError(t('auth.passwordsDontMatch'));
            setLoading(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }
        setTimeout(() => {
            setLoading(false);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            // Demo: registerdan so‘ng login sahifasiga yo‘naltirish
        }, 800);
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <View style={{ width: '100%', maxWidth: 400, backgroundColor: theme.colors.card, borderRadius: 16, padding: 24, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 2 }}>
                <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>{t('auth.createAccount')}</Text>
                {error ? <Text style={{ color: 'red', marginBottom: 12, textAlign: 'center' }}>{error}</Text> : null}
                <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: theme.colors.text, marginBottom: 4 }}>{t('auth.name')}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 12 }}>
                        <Ionicons name="person-outline" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder={t('auth.namePlaceholder')}
                            placeholderTextColor={theme.colors.border}
                            style={{ flex: 1, color: theme.colors.text, height: 44 }}
                            autoCapitalize="words"
                            returnKeyType="next"
                        />
                    </View>
                </View>
                <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: theme.colors.text, marginBottom: 4 }}>{t('auth.email')}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 12 }}>
                        <Ionicons name="mail-outline" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder={t('auth.emailPlaceholder')}
                            placeholderTextColor={theme.colors.border}
                            style={{ flex: 1, color: theme.colors.text, height: 44 }}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            textContentType="emailAddress"
                            returnKeyType="next"
                        />
                    </View>
                </View>
                <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: theme.colors.text, marginBottom: 4 }}>{t('auth.password')}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 12 }}>
                        <Ionicons name="lock-closed-outline" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder={t('auth.passwordPlaceholder')}
                            placeholderTextColor={theme.colors.border}
                            style={{ flex: 1, color: theme.colors.text, height: 44 }}
                            secureTextEntry={!showPassword}
                            textContentType="newPassword"
                            returnKeyType="next"
                        />
                        <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
                            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.colors.border} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ marginBottom: 24 }}>
                    <Text style={{ color: theme.colors.text, marginBottom: 4 }}>{t('auth.confirmPassword')}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 12 }}>
                        <Ionicons name="lock-closed-outline" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                        <TextInput
                            value={confirm}
                            onChangeText={setConfirm}
                            placeholder={t('auth.passwordPlaceholder')}
                            placeholderTextColor={theme.colors.border}
                            style={{ flex: 1, color: theme.colors.text, height: 44 }}
                            secureTextEntry={!showConfirm}
                            textContentType="newPassword"
                            returnKeyType="done"
                        />
                        <TouchableOpacity onPress={() => setShowConfirm(v => !v)}>
                            <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.colors.border} />
                        </TouchableOpacity>
                    </View>
                </View>
                <Button
                    title={loading ? t('common.loading') : t('auth.createAccount')}
                    onPress={handleRegister}
                    color={theme.colors.primary}
                    disabled={loading}
                />
                <View style={{ height: 12 }} />
                <Link asChild push href="/public/(auth)/sign-in">
                    <Button
                        title={t('auth.signIn')}
                        color={theme.colors.secondary}
                    />
                </Link>
            </View>
        </View>
    )
}