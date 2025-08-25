import { useTheme } from '@/components/ThemeProvider';
import { useAuthStore } from '@/store/auth-store';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

const VipScreen = React.memo(() => {
    const { t } = useTranslation();
    const theme = useTheme();
    const { width } = useWindowDimensions();
    const { isVip } = useAuthStore();

    const vipFeatures = useMemo(() => [
        { icon: 'star', title: 'Premium Support', desc: '24/7 priority customer support', color: '#FFD700' },
        { icon: 'flash', title: 'Exclusive Content', desc: 'Access to premium features and content', color: '#FF6B6B' },
        { icon: 'shield-checkmark', title: 'Ad-Free Experience', desc: 'Enjoy without any advertisements', color: '#4ECDC4' },
        { icon: 'gift', title: 'Early Access', desc: 'Get new features before everyone else', color: '#9B59B6' },
    ], []);

    const vipStats = useMemo(() => [
        { label: 'VIP Since', value: 'Today', icon: 'calendar', color: '#FFD700' },
        { label: 'Premium Level', value: 'Gold', icon: 'trophy', color: '#FFA500' },
        { label: 'Exclusive Features', value: '4', icon: 'diamond', color: '#B9F2FF' },
    ], []);

    const cardShadow = Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
        },
        android: {
            elevation: 8,
        },
    });

    if (!isVip) {
        return (
            <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 16, justifyContent: 'center', minHeight: '100%' }}>
                {/* VIP Upgrade Card */}
                <View style={{
                    backgroundColor: theme.colors.card,
                    borderRadius: 24,
                    padding: 32,
                    marginBottom: 16,
                    ...cardShadow
                }}>
                    <View style={{ alignItems: 'center', marginBottom: 32 }}>
                        <View style={{
                            width: 100,
                            height: 100,
                            borderRadius: 50,
                            backgroundColor: '#FFD700',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: 20,
                            ...cardShadow
                        }}>
                            <Ionicons name="diamond" size={50} color="#000" />
                        </View>
                        <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>Upgrade to VIP</Text>
                        <Text style={{ color: theme.colors.text, opacity: 0.7, textAlign: 'center', fontSize: 16, lineHeight: 24 }}>
                            Unlock exclusive features and premium content with our VIP membership
                        </Text>
                    </View>

                    {/* Features Preview */}
                    <View style={{ marginBottom: 32 }}>
                        {vipFeatures.map((feature, index) => (
                            <View key={index} style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: 16,
                                backgroundColor: theme.colors.background,
                                borderRadius: 12,
                                padding: 16,
                                borderWidth: 1,
                                borderColor: theme.colors.border
                            }}>
                                <View style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: feature.color,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 16
                                }}>
                                    <Ionicons name={feature.icon as any} size={20} color={theme.colors.background} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>{feature.title}</Text>
                                    <Text style={{ color: theme.colors.text, opacity: 0.7, fontSize: 14 }}>{feature.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Upgrade Button */}
                    <TouchableOpacity
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)}
                        style={{
                            backgroundColor: '#FFD700',
                            borderRadius: 16,
                            paddingVertical: 18,
                            alignItems: 'center',
                            marginBottom: 16,
                            ...cardShadow
                        }}
                    >
                        <Text style={{ color: '#000', fontSize: 18, fontWeight: 'bold' }}>Upgrade Now</Text>
                    </TouchableOpacity>
                    <Text style={{ color: theme.colors.text, opacity: 0.5, fontSize: 12, textAlign: 'center' }}>
                        * Demo version - no actual payment required
                    </Text>
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 16 }}>
            {/* VIP Header */}
            <View style={{
                backgroundColor: '#FFD700',
                borderRadius: 24,
                padding: 28,
                marginBottom: 20,
                ...cardShadow
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    <View style={{
                        width: 72,
                        height: 72,
                        borderRadius: 36,
                        backgroundColor: '#000',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 20,
                        ...cardShadow
                    }}>
                        <Ionicons name="diamond" size={36} color="#FFD700" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: '#000', fontSize: 28, fontWeight: 'bold', marginBottom: 6 }}>VIP Member</Text>
                        <Text style={{ color: '#000', opacity: 0.8, fontSize: 16 }}>Premium Access Active</Text>
                    </View>
                </View>
                <Text style={{ color: '#000', fontSize: 16, lineHeight: 24, opacity: 0.9 }}>
                    {t('vip.title')} - Welcome to the exclusive VIP experience! Enjoy all premium features and content.
                </Text>
            </View>

            {/* VIP Stats */}
            <View style={{
                backgroundColor: theme.colors.card,
                borderRadius: 20,
                padding: 24,
                marginBottom: 20,
                ...cardShadow
            }}>
                <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Your VIP Stats</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {vipStats.map((stat, index) => (
                        <TouchableOpacity key={index} style={{ alignItems: 'center', flex: 1 }} onPress={() => Haptics.selectionAsync()}>
                            <View style={{
                                width: 56,
                                height: 56,
                                borderRadius: 28,
                                backgroundColor: stat.color,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: 12,
                                ...cardShadow
                            }}>
                                <Ionicons name={stat.icon as any} size={24} color={theme.colors.background} />
                            </View>
                            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>{stat.value}</Text>
                            <Text style={{ color: theme.colors.text, opacity: 0.7, fontSize: 12, textAlign: 'center' }}>{stat.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* VIP Features */}
            <View style={{
                backgroundColor: theme.colors.card,
                borderRadius: 20,
                padding: 24,
                marginBottom: 20,
                ...cardShadow
            }}>
                <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Your VIP Features</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {vipFeatures.map((feature, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => Haptics.selectionAsync()}
                            style={{
                                width: Math.min((width - 80) / 2, 160),
                                backgroundColor: theme.colors.background,
                                borderRadius: 16,
                                padding: 20,
                                marginBottom: 16,
                                alignItems: 'center',
                                borderWidth: 2,
                                borderColor: feature.color,
                                ...cardShadow
                            }}
                        >
                            <View style={{
                                width: 48,
                                height: 48,
                                borderRadius: 24,
                                backgroundColor: feature.color,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: 12
                            }}>
                                <Ionicons name={feature.icon as any} size={24} color={theme.colors.background} />
                            </View>
                            <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', textAlign: 'center', marginBottom: 4 }}>{feature.title}</Text>
                            <Text style={{ color: theme.colors.text, opacity: 0.7, fontSize: 10, textAlign: 'center' }}>{feature.desc}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Exclusive Content */}
            <View style={{
                backgroundColor: theme.colors.card,
                borderRadius: 20,
                padding: 24,
                marginBottom: 20,
                ...cardShadow
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    <View style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: '#FFD700',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 16
                    }}>
                        <Ionicons name="diamond" size={24} color="#000" />
                    </View>
                    <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: 'bold' }}>Exclusive Content</Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {[
                        { title: 'Premium Tools', icon: 'hammer', color: '#FF6B6B' },
                        { title: 'Advanced Analytics', icon: 'analytics', color: '#4ECDC4' },
                        { title: 'Custom Themes', icon: 'color-palette', color: '#9B59B6' },
                        { title: 'Priority Notifications', icon: 'notifications', color: '#F39C12' }
                    ].map((content, index) => (
                        <View key={index} style={{
                            backgroundColor: content.color,
                            borderRadius: 12,
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            marginBottom: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            minWidth: (width - 80) / 2,
                            ...cardShadow
                        }}>
                            <Ionicons name={content.icon as any} size={16} color={theme.colors.background} style={{ marginRight: 8 }} />
                            <Text style={{ color: theme.colors.background, fontSize: 12, fontWeight: '600' }}>{content.title}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    )
});

VipScreen.displayName = 'VipScreen';

export default VipScreen;