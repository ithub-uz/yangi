import {Button, Input} from '@/components/ui';
import {borderRadius, colors, shadows, spacing} from '@/design/tokens';
import {logger} from '@/services/logger';
import {useAuthStore} from '@/store/auth-store';
import {useSettingsStore} from '@/store/settings-store';
import {Ionicons} from '@expo/vector-icons';
import {zodResolver} from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import {router} from 'expo-router';
import React, {useEffect, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {Alert, Platform, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {z} from 'zod';

// Zod validation schema
const signInSchema = z.object({
    email: z
        .email()
        .min(1),
    password: z
        .string()
        .min(1)
        .min(6),
    rememberMe: z.boolean().default(false)
}).required();

type SignInFormData = z.infer<typeof signInSchema>;

const SignInScreen = React.memo(() => {
    const {t} = useTranslation();
    const {signIn, isLoading: authLoading, error: authError, clearError} = useAuthStore();
    const {hapticFeedback} = useSettingsStore();

    const [showPassword, setShowPassword] = useState(false);

    // React Hook Form setup
    const {
        control,
        handleSubmit,
        formState: {errors, isValid},
        reset,
    } = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false
        },
        mode: 'onChange'
    });

    useEffect(() => {
        if (authError) clearError();
    }, [authError, clearError]);
    const onSubmit = async (data: SignInFormData) => {

        reset();
        logger.info('User signed in successfully');

        if (hapticFeedback) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        try {
            await signIn({email: data.email, password: data.password, rememberMe: data.rememberMe});
            if (hapticFeedback) {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            logger.info('User signed in successfully');
        } catch (error) {
            logger.error('Sign in failed', {error});
            if (hapticFeedback) {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
        }
    };

    const handleSignInAsVip = async () => {
        if (hapticFeedback) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }

        try {
            await signIn({email: 'vip@example.com', password: 'vip123', rememberMe: false});

            if (hapticFeedback) {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (error) {
            logger.error('VIP sign in failed', {error});
            if (hapticFeedback) {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
        }
    };

    const handleForgotPassword = () => {
        logger.debug('Forgot password navigation');
        // TODO: Implement forgot password flow
        Alert.alert(t('common.comingSoon'), t('auth.forgotPasswordComingSoon'));
    };

    const handleCreateAccount = () => {
        logger.debug('Create account navigation');
        router.push('/public/(auth)/create-account');
    };

    const cardShadow = Platform.select({
        ios: shadows.lg,
        android: {
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
    });

    return (
        <ScrollView
            style={{flex: 1, backgroundColor: colors.neutral[50]}}
            contentContainerStyle={{
                flexGrow: 1,
                justifyContent: 'center',
                padding: spacing[6]
            }}
        >
            <View style={{
                backgroundColor: colors.neutral[50],
                borderRadius: borderRadius['3xl'],
                padding: spacing[8],
                ...cardShadow
            }}>
                {/* Header */}
                <View style={{alignItems: 'center', marginBottom: spacing[8]}}>
                    <View style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        backgroundColor: colors.primary[600],
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: spacing[5],
                        ...cardShadow
                    }}>
                        <Ionicons name="person" size={40} color={colors.neutral[50]}/>
                    </View>
                    <Text style={{
                        fontSize: 28,
                        fontWeight: 'bold',
                        color: colors.neutral[900],
                        marginBottom: spacing[2]
                    }}>
                        {t('auth.signIn')}
                    </Text>
                    <Text style={{
                        fontSize: 16,
                        color: colors.neutral[600],
                        textAlign: 'center'
                    }}>
                        {t('auth.welcomeBack')}
                    </Text>
                </View>

                {/* Form */}
                <View style={{marginBottom: spacing[6]}}>
                    <Controller
                        control={control}
                        name="email"
                        render={({field: {onChange, onBlur, value}}) => (
                            <Input
                                label={t('auth.email')}
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.email?.message}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                leftIcon="mail"
                                placeholder={t('auth.emailPlaceholder')}
                                // Disabled state is handled by the Input component internally
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="password"
                        render={({field: {onChange, onBlur, value}}) => (
                            <Input
                                label={t('auth.password')}
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.password?.message}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                                leftIcon="lock-closed"
                                rightIcon={showPassword ? 'eye-off' : 'eye'}
                                onRightIconPress={async () => {
                                    setShowPassword(!showPassword);
                                    if (hapticFeedback) await Haptics.selectionAsync();
                                }}
                                placeholder={t('auth.passwordPlaceholder')}
                                // Disabled state is handled by the Input component internally
                            />
                        )}
                    />

                    <TouchableOpacity
                        onPress={handleForgotPassword}
                        style={{alignSelf: 'flex-end', marginTop: spacing[3]}}
                    >
                        <Text style={{
                            color: colors.primary[600],
                            fontSize: 14,
                            fontWeight: '500'
                        }}>
                            {t('auth.forgotPassword')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Error Display */}
                {authError && (
                    <View style={{
                        backgroundColor: colors.error[50],
                        padding: spacing[3],
                        borderRadius: borderRadius.lg,
                        marginBottom: spacing[4],
                        borderWidth: 1,
                        borderColor: colors.error[500],
                        // Error color is handled by the error prop
                    }}>
                        <Text style={{
                            color: colors.error[700],
                            fontSize: 14
                        }}>
                            {authError}
                        </Text>
                    </View>
                )}

                {/* Buttons */}
                <View style={{gap: spacing[3]}}>
                    <Button
                        title={authLoading ? t('auth.signingIn') : t('auth.signIn')}
                        onPress={handleSubmit(onSubmit)}
                        loading={authLoading}
                        disabled={!isValid || authLoading}
                        icon="log-in"
                        fullWidth
                    />

                    <Button
                        title={`${t('auth.signInAsVip')} 👑`}
                        onPress={handleSignInAsVip}
                        loading={authLoading}
                        disabled={authLoading}
                        variant="secondary"
                        icon="star"
                        fullWidth
                    />
                </View>

                {/* Sign Up Link */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginTop: spacing[6]
                }}>
                    <Text style={{
                        color: colors.neutral[600],
                        fontSize: 14
                    }}>
                        {t('auth.dontHaveAccount')}{' '}
                    </Text>
                    <TouchableOpacity onPress={handleCreateAccount}>
                        <Text style={{
                            color: colors.primary[600],
                            fontSize: 14,
                            fontWeight: '600'
                        }}>
                            {t('auth.createAccount')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
});

SignInScreen.displayName = 'SignInScreen';

export default SignInScreen;