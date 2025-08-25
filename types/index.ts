// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'en' | 'uz' | 'system';

// Notification types
export type NotificationType = 'message' | 'system' | 'reminder' | 'update';

// User types
export interface User {
    id: string;
    name: string;
    email: string;
    isVip: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Settings types
export interface AppSettings {
    themeMode: ThemeMode;
    language: Language;
    notifications: boolean;
    hapticFeedback: boolean;
    autoSave: boolean;
    biometricAuth: boolean;
    lockScreen: boolean;
    lockScreenTimeout: number;
    pinCode: string;
}

// Navigation types
export type RootStackParamList = {
    '(tabs)': undefined;
    'public/(auth)/sign-in': undefined;
    'public/(auth)/create-account': undefined;
    'public/(onboarding)': undefined;
};

export type TabParamList = {
    index: undefined;
    settings: undefined;
    vip: undefined;
};

// API types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Form types
export interface FormField {
    value: string;
    error?: string;
    isValid: boolean;
    isTouched: boolean;
}

export interface FormState {
    [key: string]: FormField;
}

// Performance types
export interface PerformanceMetrics {
    renderCount: number;
    renderTime: number;
    memoryUsage?: number;
}

// Error types
export interface AppError {
    code: string;
    message: string;
    details?: any;
    timestamp: Date;
}

// Validation types
export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
}

export interface ValidationSchema {
    [key: string]: ValidationRule;
} 