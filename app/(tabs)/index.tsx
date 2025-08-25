import { NotificationsCenter } from '@/components/NotificationsCenter';
import { useTheme } from '@/components/ThemeProvider';
import { useAuthStore } from '@/store/auth-store';
import { useNotificationsStore } from '@/store/notifications-store';
import { useSettingsStore } from '@/store/settings-store';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';

// eslint-disable-next-line react/display-name
const HomeScreen = React.memo(() => {
    const { t } = useTranslation();
    const theme = useTheme();
    const { width } = useWindowDimensions();
    const { isVip } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState('');
    const { lockScreen, setLocked } = useSettingsStore();
    const { unreadCount, initialize: initializeNotifications } = useNotificationsStore();
    const [showNotifications, setShowNotifications] = useState(false);

    // Initialize notifications on component mount
    useEffect(() => {
        initializeNotifications();
    }, [initializeNotifications]);

    const quickActions = useMemo(() => [
        { icon: 'settings-outline', title: 'Settings', color: theme.colors.primary, route: 'settings' },
        { icon: 'star-outline', title: 'VIP', color: theme.colors.secondary, vip: true, route: 'vip' },
        { icon: 'notifications-outline', title: 'Notifications', color: '#FF6B6B', route: 'notifications' },
        { icon: 'help-circle-outline', title: 'Help', color: '#4ECDC4', route: 'help' },
    ], [theme.colors.primary, theme.colors.secondary]);

    const stats = useMemo(() => [
        { label: 'Days Active', value: '7', icon: 'calendar-outline', color: theme.colors.primary },
        { label: 'Theme', value: 'Dark', icon: 'moon-outline', color: '#9B59B6' },
        { label: 'Language', value: 'English', icon: 'language-outline', color: '#3498DB' },
    ], [theme.colors.primary]);

    const features = useMemo(() => [
        { icon: 'moon', title: 'Dark Mode', color: '#9B59B6' },
        { icon: 'globe', title: 'Multi-Language', color: '#3498DB' },
        { icon: 'flash', title: 'Performance', color: '#F39C12' },
        { icon: 'brush', title: 'Modern UI', color: '#E74C3C' },
    ], []);

    const cardShadow = Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
        },
        android: {
            elevation: 4,
        },
    });

    return (
        <>
            <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 16 }}>
                {/* Header Section */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 20
                }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>
                            {t('home.title')}
                        </Text>
                        <Text style={{ color: theme.colors.text, opacity: 0.7, fontSize: 16 }}>
                            {t('home.welcomeBack')} 👋
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {/* Lock Button */}
                        {lockScreen && (
                            <TouchableOpacity
                                onPress={() => {
                                    setLocked(true);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                                }}
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 22,
                                    backgroundColor: theme.colors.card,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 12,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 4,
                                    elevation: 3
                                }}
                            >
                                <Ionicons name="lock-closed-outline" size={20} color={theme.colors.text} />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={() => {
                                Haptics.selectionAsync();
                                setShowNotifications(true);
                            }}
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                backgroundColor: theme.colors.card,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: 12,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 3
                            }}
                        >
                            <Ionicons name="notifications-outline" size={20} color={theme.colors.text} />
                            {unreadCount > 0 && (
                                <View style={{
                                    position: 'absolute',
                                    top: -2,
                                    right: -2,
                                    backgroundColor: theme.colors.destructive,
                                    borderRadius: 10,
                                    minWidth: 20,
                                    height: 20,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    paddingHorizontal: 4
                                }}>
                                    <Text style={{
                                        color: 'white',
                                        fontSize: 10,
                                        fontWeight: 'bold'
                                    }}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                Haptics.selectionAsync();
                                // Profile settings coming soon
                            }}
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                backgroundColor: theme.colors.primary,
                                justifyContent: 'center',
                                alignItems: 'center',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 3
                            }}
                        >
                            <Ionicons name="person" size={20} color={theme.colors.background} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={{
                    backgroundColor: theme.colors.searchBackground,
                    borderRadius: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    marginBottom: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 2
                }}>
                    <Ionicons name="search" size={20} color={theme.colors.text} style={{ marginRight: 12 }} />
                    <TextInput
                        placeholder={t('home.searchPlaceholder')}
                        placeholderTextColor={theme.colors.text + '80'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={{
                            flex: 1,
                            color: theme.colors.searchText,
                            fontSize: 16,
                            paddingVertical: 0
                        }}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity
                            onPress={() => setSearchQuery('')}
                            style={{ marginLeft: 8 }}
                        >
                            <Ionicons name="close-circle" size={20} color={theme.colors.text} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Welcome Section */}
                <View style={{
                    backgroundColor: theme.colors.card,
                    borderRadius: 20,
                    padding: 24,
                    marginBottom: 20,
                    ...cardShadow
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <View style={{
                            width: 56,
                            height: 56,
                            borderRadius: 28,
                            backgroundColor: theme.colors.primary,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 16,
                            ...cardShadow
                        }}>
                            <Ionicons name="person" size={28} color={theme.colors.background} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: 'bold', marginBottom: 4 }}>{t('home.welcomeBack')}</Text>
                            <Text style={{ color: theme.colors.text, opacity: 0.7, fontSize: 16 }}>{t('home.readyToExplore')}</Text>
                        </View>
                        {isVip && (
                            <View style={{
                                backgroundColor: '#FFD700',
                                borderRadius: 16,
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                ...cardShadow
                            }}>
                                <Text style={{ color: '#000', fontSize: 12, fontWeight: 'bold' }}>VIP 👑</Text>
                            </View>
                        )}
                    </View>
                    <Text style={{ color: theme.colors.text, fontSize: 16, lineHeight: 24, opacity: 0.9 }}>
                        {t('home.title')} - Your modern React Native starter app with multi-language support, dark mode, and more features.
                    </Text>
                </View>

                {/* Stats Section */}
                <View style={{
                    backgroundColor: theme.colors.card,
                    borderRadius: 20,
                    padding: 24,
                    marginBottom: 20,
                    ...cardShadow
                }}>
                    <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>{t('home.yourStats')}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        {stats.map((stat, index) => (
                            <View key={index} style={{ alignItems: 'center', flex: 1 }}>
                                <View style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 24,
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
                            </View>
                        ))}
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={{
                    backgroundColor: theme.colors.card,
                    borderRadius: 20,
                    padding: 24,
                    marginBottom: 20,
                    ...cardShadow
                }}>
                    <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>{t('home.quickActions')}</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        {quickActions.map((action, index) => (
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
                                    borderWidth: 1,
                                    borderColor: theme.colors.border,
                                    ...cardShadow
                                }}
                            >
                                <View style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 24,
                                    backgroundColor: action.color,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginBottom: 12
                                }}>
                                    <Ionicons name={action.icon as any} size={24} color={theme.colors.background} />
                                </View>
                                <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', textAlign: 'center' }}>{action.title}</Text>
                                {action.vip && !isVip && (
                                    <View style={{
                                        backgroundColor: action.color,
                                        borderRadius: 8,
                                        paddingHorizontal: 8,
                                        paddingVertical: 2,
                                        marginTop: 8
                                    }}>
                                        <Text style={{ color: theme.colors.background, fontSize: 10, fontWeight: 'bold' }}>VIP Only</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Feature Highlight */}
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
                            backgroundColor: '#4ECDC4',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 16
                        }}>
                            <Ionicons name="checkmark-circle" size={24} color={theme.colors.background} />
                        </View>
                        <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: 'bold' }}>{t('home.featuresIncluded')}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        {features.map((feature, index) => (
                            <View key={index} style={{
                                backgroundColor: theme.colors.background,
                                borderRadius: 12,
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                                marginBottom: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                minWidth: (width - 80) / 2,
                                borderWidth: 1,
                                borderColor: theme.colors.border
                            }}>
                                <View style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 16,
                                    backgroundColor: feature.color,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 12
                                }}>
                                    <Ionicons name={feature.icon as any} size={16} color={theme.colors.background} />
                                </View>
                                <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>{feature.title}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Notifications Center Modal */}
            <Modal
                visible={showNotifications}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowNotifications(false)}
            >
                <NotificationsCenter
                    visible={showNotifications}
                    onClose={() => setShowNotifications(false)}
                />
            </Modal>
        </>
    );
});

export default HomeScreen;