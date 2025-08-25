import { useTheme } from '@/components/ThemeProvider';
import { useAuthStore } from '@/store/auth-store';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabsLayout() {
    const { isVip } = useAuthStore();
    const theme = useTheme();
    return (
        <Tabs
            screenOptions={{
                headerStyle: { backgroundColor: theme.colors.card },
                headerTintColor: theme.colors.text,
                headerTitleStyle: { color: theme.colors.text },
                tabBarStyle: { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.text,
            }}
        >
            <Tabs.Screen name="index" />
            <Tabs.Protected guard={isVip}>
                <Tabs.Screen name="vip" />
            </Tabs.Protected>
            <Tabs.Screen name="settings" />
        </Tabs>
    )
}
