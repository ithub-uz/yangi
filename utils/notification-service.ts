import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import {Alert} from "react-native";

// Notification handler configuration
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export interface NotificationData {
    id: string;
    title: string;
    body: string;
    data?: any;
    timestamp: number;
    read: boolean;
    type: 'message' | 'system' | 'reminder' | 'update';
    sender?: string;
    actionUrl?: string;
}

type ListenerSubscription = { remove: () => void };

class NotificationService {
    private static instance: NotificationService;
    private expoPushToken: string | null = null;
    private notifications: NotificationData[] = [];
    private listeners: ListenerSubscription[] = [];

    static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    // Request notification permissions
    async requestPermissions(): Promise<boolean> {
        const {status: existingStatus} = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const {status} = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        return finalStatus === 'granted';
    }

    // Initialize notifications (with listeners)
    async initialize(): Promise<void> {
        const granted = await this.requestPermissions();
        if (!granted) {
            return;
        }
        // Get push token
        if (Device.isDevice) {
            const token = await Notifications.getExpoPushTokenAsync({
                projectId: Constants.expoConfig?.extra?.eas?.projectId,
            });
            this.expoPushToken = token.data;
        }
        this.subscribeListeners();
    }

    // Subscribe notification listeners
    subscribeListeners(): void {
        this.unsubscribeListeners();
        this.listeners = [
            Notifications.addNotificationReceivedListener((notification) => {
                this.handleNotificationReceived(notification);
            }),
            Notifications.addNotificationResponseReceivedListener((response) => {
                this.handleNotificationResponse(response);
            })
        ];
    }

    // Unsubscribe notification listeners
    unsubscribeListeners(): void {
        this.listeners.forEach(l => l.remove());
        this.listeners = [];
    }

    // Send local notification
    async sendLocalNotification(
        title: string,
        body: string,
        data?: any,
        trigger?: Notifications.NotificationTriggerInput
    ): Promise<string> {
        if (!this.isNotificationsEnabled()) {
            Alert.alert('Notifications are disabled');
        }
        const identifier = await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
                sound: true,
            },
            trigger: trigger || null,
        });
        // Add to local notifications list
        const notificationData: NotificationData = {
            id: `${identifier}-${Date.now().toString()}`,
            title,
            body,
            data,
            timestamp: Date.now(),
            read: false,
            type: data?.type || 'message',
            sender: data?.sender,
            actionUrl: data?.actionUrl,
        };
        this.notifications.unshift(notificationData);
        this.saveNotifications();
        return identifier;
    }

    // Get all notifications
    getNotifications(): NotificationData[] {
        return [...this.notifications];
    }

    // Get unread notifications count
    getUnreadCount(): number {
        return this.notifications.filter(n => !n.read).length;
    }

    // Mark notification as read
    markAsRead(notificationId: string): void {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
        }
    }

    // Mark all notifications as read
    markAllAsRead(): void {
        this.notifications.forEach(n => n.read = true);
        this.saveNotifications();
    }

    // Delete notification
    deleteNotification(notificationId: string): void {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.saveNotifications();
    }

    // Clear all notifications
    clearAllNotifications(): void {
        this.notifications = [];
        this.saveNotifications();
    }

    // Get push token for backend
    getPushToken(): string | null {
        return this.expoPushToken;
    }

    // Check if notifications are enabled
    isNotificationsEnabled(): boolean {
        return this.listeners.length > 0;
    }

    // Send test notification
    async sendTestNotification(): Promise<void> {
        if (!this.isNotificationsEnabled()) {
            throw new Error('Notifications are disabled');
        }
        await this.sendLocalNotification(
            'Test Notification',
            'This is a test notification from your app!',
            {type: 'test'}
        );
    }

    // Schedule reminder notification
    async scheduleReminder(
        title: string,
        body: string,
        date: Date,
        data?: any
    ): Promise<string> {
        return await this.sendLocalNotification(
            title,
            body,
            {...data, type: 'reminder'},
            // { type: 'date', date }
        );
    }

    // Cancel scheduled notification
    async cancelNotification(notificationId: string): Promise<void> {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        // Remove from local list
        this.deleteNotification(notificationId);
    }

    // Cancel all scheduled notifications
    async cancelAllNotifications(): Promise<void> {
        await Notifications.cancelAllScheduledNotificationsAsync();
        this.clearAllNotifications();
    }

    // Handle incoming notification
    private handleNotificationReceived(notification: Notifications.Notification): void {
        const notificationData: NotificationData = {
            id: notification.request.identifier,
            title: notification.request.content.title || '',
            body: notification.request.content.body || '',
            data: notification.request.content.data,
            timestamp: Date.now(),
            read: false,
            type: (notification.request.content.data && typeof notification.request.content.data.type === 'string') ? notification.request.content.data.type as NotificationData['type'] : 'message',
            sender: typeof notification.request.content.data?.sender === 'string' ? notification.request.content.data.sender : undefined,
            actionUrl: typeof notification.request.content.data?.actionUrl === 'string' ? notification.request.content.data.actionUrl : undefined,
        };
        this.notifications.unshift(notificationData);
        this.saveNotifications();
    }

    // Handle notification tap
    private handleNotificationResponse(response: Notifications.NotificationResponse): void {
        const notificationId = response.notification.request.identifier;
        this.markAsRead(notificationId);
        // Handle deep linking or navigation
        const data = response.notification.request.content.data;
        if (data?.actionUrl) {
            // Navigate to specific screen
        }
    }

    // Save notifications to storage
    private saveNotifications(): void {
        // TODO: Implement persistent storage (AsyncStorage or similar)
        // For now, keep in memory
    }

    // Load notifications from storage
    private loadNotifications(): void {
        // TODO: Load from persistent storage
    }
}

export default NotificationService; 