import {deleteItemAsync, getItem, setItem} from 'expo-secure-store';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import NotificationService, {NotificationData} from '@/utils/notification-service';
import {useSettingsStore} from './settings-store';
import {logger} from "@/services/logger";
import {Alert} from "react-native";

interface NotificationsState {
    notifications: NotificationData[];
    unreadCount: number;
    isInitialized: boolean;

    // Actions
    initialize: () => Promise<void>;
    addNotification: (notification: NotificationData) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: string) => void;
    clearAll: () => void;
    sendTestNotification: () => Promise<void>;
    scheduleReminder: (title: string, body: string, date: Date) => Promise<void>;
    getPushToken: () => string | null;
}

export const useNotificationsStore = create<NotificationsState>()(
    persist(
        (set, get) => ({
            notifications: [],
            unreadCount: 0,
            isInitialized: false,

            initialize: async () => {
                try {
                    const notificationService = NotificationService.getInstance();
                    const {notifications} = useSettingsStore.getState();

                    if (notifications) {
                        await notificationService.initialize();
                    }

                    // Load existing notifications
                    const notificationsList = notificationService.getNotifications();
                    const unreadCount = notificationService.getUnreadCount();

                    set({
                        notifications: notificationsList,
                        unreadCount,
                        isInitialized: true,
                    });
                } catch (error) {
                    logger.error('Notification store initialize error', error);
                    set({isInitialized: true});
                }
            },

            addNotification: (notification: NotificationData) => {
                const {notifications} = get();
                const updatedNotifications = [notification, ...notifications];
                const unreadCount = updatedNotifications.filter(n => !n.read).length;

                set({
                    notifications: updatedNotifications,
                    unreadCount,
                });
            },

            markAsRead: (id: string) => {
                const {notifications} = get();
                const updatedNotifications = notifications.map(n =>
                    n.id === id ? {...n, read: true} : n
                );
                const unreadCount = updatedNotifications.filter(n => !n.read).length;

                set({
                    notifications: updatedNotifications,
                    unreadCount,
                });

                // Update service
                const notificationService = NotificationService.getInstance();
                notificationService.markAsRead(id);
            },

            markAllAsRead: () => {
                const {notifications} = get();
                const updatedNotifications = notifications.map(n => ({...n, read: true}));

                set({
                    notifications: updatedNotifications,
                    unreadCount: 0,
                });

                // Update service
                const notificationService = NotificationService.getInstance();
                notificationService.markAllAsRead();
            },

            deleteNotification: (id: string) => {
                const {notifications} = get();
                const updatedNotifications = notifications.filter(n => n.id !== id);
                const unreadCount = updatedNotifications.filter(n => !n.read).length;

                set({
                    notifications: updatedNotifications,
                    unreadCount,
                });

                // Update service
                const notificationService = NotificationService.getInstance();
                notificationService.deleteNotification(id);
            },

            clearAll: () => {
                set({
                    notifications: [],
                    unreadCount: 0,
                });

                // Update service
                const notificationService = NotificationService.getInstance();
                notificationService.clearAllNotifications();
            },

            sendTestNotification: async () => {
                try {
                    const notificationService = NotificationService.getInstance();
                    if (!notificationService.isNotificationsEnabled()) {
                        Alert.alert('Notifications are disabled');
                    }
                    await notificationService.sendTestNotification();
                } catch (error) {
                    throw error;
                }
            },

            scheduleReminder: async (title: string, body: string, date: Date) => {
                try {
                    const notificationService = NotificationService.getInstance();
                    await notificationService.scheduleReminder(title, body, date);
                } catch (error) {
                    console.error('Error scheduling reminder:', error);
                }
            },

            getPushToken: () => {
                const notificationService = NotificationService.getInstance();
                return notificationService.getPushToken();
            },
        }),
        {
            name: 'notifications-storage',
            storage: createJSONStorage(() => ({
                getItem,
                setItem,
                removeItem: deleteItemAsync,
            })),
        }
    )
); 