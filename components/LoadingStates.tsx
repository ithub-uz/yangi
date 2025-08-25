import {Ionicons} from '@expo/vector-icons';
import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';

interface LoadingSpinnerProps {
    size?: 'small' | 'large';
    color?: string;
    text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
                                                                  size = 'large',
                                                                  color = '#007AFF',
                                                                  text
                                                              }) => (
    <View style={styles.spinnerContainer}>
        <ActivityIndicator size={size} color={color}/>
        {text && <Text style={styles.spinnerText}>{text}</Text>}
    </View>
);

interface SkeletonProps {
    width: number | string;
    height: number | string;
    borderRadius?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
                                                      width,
                                                      height,
                                                      borderRadius = 4
                                                  }) => (
    <View
        style={[
            styles.skeleton,
            {width, height, borderRadius}
        ]}
    />
);

interface EmptyStateProps {
    icon?: string;
    title: string;
    message: string;
    action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
                                                          icon = 'document-outline',
                                                          title,
                                                          message,
                                                          action
                                                      }) => (
    <View style={styles.emptyContainer}>
        <Ionicons name={icon as any} size={64} color="#ccc"/>
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyMessage}>{message}</Text>
        {action && <View style={styles.emptyAction}>{action}</View>}
    </View>
);

const styles = StyleSheet.create({
    spinnerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    spinnerText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    skeleton: {
        backgroundColor: '#f0f0f0',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
        color: '#333',
    },
    emptyMessage: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        marginBottom: 24,
    },
    emptyAction: {
        marginTop: 16,
    },
}); 