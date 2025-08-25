import {Ionicons} from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import {useNotificationsStore} from '@/store/notifications-store';
import {useTheme} from './ThemeProvider';
import {logger} from "@/services/logger";

interface NotificationsCenterProps {
    visible: boolean;
    onClose: () => void;
}

export const NotificationsCenter: React.FC<NotificationsCenterProps> = ({
                                                                            visible,
                                                                            onClose,
                                                                        }) => {
    const {t} = useTranslation();
    const theme = useTheme();
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        sendTestNotification,
    } = useNotificationsStore();

    const handleMarkAsRead = async (id: string) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        markAsRead(id);
    };

    const handleDeleteNotification = async (id: string) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            t('notifications.deleteTitle'),
            t('notifications.deleteMessage'),
            [
                {text: t('common.cancel'), style: 'cancel'},
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: () => deleteNotification(id),
                },
            ]
        );
    };

    const handleMarkAllAsRead = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        markAllAsRead();
    };

    const handleClearAll = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        Alert.alert(
            t('notifications.clearAllTitle'),
            t('notifications.clearAllMessage'),
            [
                {text: t('common.cancel'), style: 'cancel'},
                {
                    text: t('common.clear'),
                    style: 'destructive',
                    onPress: () => clearAll(),
                },
            ]
        );
    };

    const handleTestNotification = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        try {
            await sendTestNotification();
        } catch (error) {
            logger.error('Handle test notification error', error);
            Alert.alert(
                t('notifications.permissionRequired'),
                t('notifications.permissionMessage'),
                [{text: t('common.ok')}]
            );
        }
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return t('notifications.justNow');
        if (diffInMinutes < 60) return t('notifications.minutesAgo', {count: diffInMinutes});
        if (diffInMinutes < 1440) return t('notifications.hoursAgo', {count: Math.floor(diffInMinutes / 60)});
        return date.toLocaleDateString();
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'message':
                return 'chatbubble-outline';
            case 'system':
                return 'settings-outline';
            case 'reminder':
                return 'alarm-outline';
            case 'update':
                return 'refresh-outline';
            default:
                return 'notifications-outline';
        }
    };

    const renderNotification = ({item}: { item: any }) => (
        <TouchableOpacity
            style={[
                styles.notificationItem,
                {
                    backgroundColor: item.read ? theme.colors.card : theme.colors.primary + '10',
                    borderLeftColor: item.read ? theme.colors.border : theme.colors.primary,
                },
            ]}
            onPress={() => handleMarkAsRead(item.id)}
        >
            <View style={styles.notificationHeader}>
                <View style={styles.notificationIcon}>
                    <Ionicons
                        name={getNotificationIcon(item.type)}
                        size={20}
                        color={theme.colors.primary}
                    />
                </View>
                <View style={styles.notificationContent}>
                    <Text
                        style={[
                            styles.notificationTitle,
                            {
                                color: theme.colors.text,
                                fontWeight: item.read ? '400' : '600',
                            },
                        ]}
                    >
                        {item.title}
                    </Text>
                    <Text
                        style={[
                            styles.notificationBody,
                            {color: theme.colors.text + '80'},
                        ]}
                        numberOfLines={2}
                    >
                        {item.body}
                    </Text>
                    <Text
                        style={[
                            styles.notificationTime,
                            {color: theme.colors.text + '60'},
                        ]}
                    >
                        {formatTime(item.timestamp)}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteNotification(item.id)}
                >
                    <Ionicons name="close" size={16} color={theme.colors.text + '60'}/>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    if (!visible) return null;

    return (
        <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
            {/* Header */}
            <View style={[styles.header, {borderBottomColor: theme.colors.border}]}>
                <View style={styles.headerLeft}>
                    <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
                        {t('notifications.title')}
                    </Text>
                    {unreadCount > 0 && (
                        <View style={[styles.badge, {backgroundColor: theme.colors.primary}]}>
                            <Text style={styles.badgeText}>{unreadCount}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={handleTestNotification}
                    >
                        <Ionicons name="add" size={24} color={theme.colors.primary}/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={handleMarkAllAsRead}
                        disabled={unreadCount === 0}
                    >
                        <Ionicons
                            name="checkmark-done"
                            size={24}
                            color={unreadCount > 0 ? theme.colors.primary : theme.colors.text + '40'}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={handleClearAll}
                        disabled={notifications.length === 0}
                    >
                        <Ionicons
                            name="trash"
                            size={24}
                            color={notifications.length > 0 ? theme.colors.destructive : theme.colors.text + '40'}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerButton} onPress={onClose}>
                        <Ionicons name="close" size={24} color={theme.colors.text}/>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Notifications List */}
            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={(item) => `${item.type}-${item.id}`}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={false}
                        onRefresh={() => {
                            // Refresh notifications
                        }}
                        tintColor={theme.colors.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name="notifications-off"
                            size={64}
                            color={theme.colors.text + '40'}
                        />
                        <Text style={[styles.emptyText, {color: theme.colors.text + '60'}]}>
                            {t('notifications.noNotifications')}
                        </Text>
                        <TouchableOpacity
                            style={[styles.testButton, {backgroundColor: theme.colors.primary}]}
                            onPress={handleTestNotification}
                        >
                            <Text style={[styles.testButtonText, {color: theme.colors.background}]}>
                                {t('notifications.sendTest')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginRight: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 20,
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButton: {
        padding: 8,
        marginLeft: 4,
    },
    list: {
        flex: 1,
    },
    listContent: {
        padding: 16,
    },
    notificationItem: {
        marginBottom: 12,
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    notificationIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        marginBottom: 4,
    },
    notificationBody: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 4,
    },
    notificationTime: {
        fontSize: 12,
    },
    deleteButton: {
        padding: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 64,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 16,
        marginBottom: 24,
    },
    testButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    testButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
}); 