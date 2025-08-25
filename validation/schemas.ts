import {z} from 'zod';

// User validation schemas
export const userSchema = z.object({
    id: z.uuid(),
    name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
    email: z.email('Invalid email address'),
    isVip: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const createUserSchema = userSchema.omit({id: true, createdAt: true, updatedAt: true});
export const updateUserSchema = userSchema.partial().omit({id: true, createdAt: true, updatedAt: true});

// Authentication schemas
export const signInSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    rememberMe: z.boolean().optional(),
});

export const signUpSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
    email: z.email('Invalid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
    email: z.email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

// Settings schemas
export const settingsSchema = z.object({
    themeMode: z.enum(['light', 'dark', 'system']),
    language: z.enum(['en', 'uz', 'system']),
    notifications: z.boolean(),
    hapticFeedback: z.boolean(),
    autoSave: z.boolean(),
    biometricAuth: z.boolean(),
    lockScreen: z.boolean(),
    lockScreenTimeout: z.number().min(0).max(3600), // 0 to 1 hour in seconds
    pinCode: z.string().length(4, 'PIN code must be exactly 4 digits').regex(/^\d{4}$/, 'PIN code must contain only digits'),
});

export const updateSettingsSchema = settingsSchema.partial();

// PIN code schemas
export const pinCodeSchema = z.object({
    pinCode: z.string().length(4, 'PIN code must be exactly 4 digits').regex(/^\d{4}$/, 'PIN code must contain only digits'),
});

export const changePinCodeSchema = z.object({
    currentPin: z.string().length(4, 'Current PIN must be exactly 4 digits').regex(/^\d{4}$/, 'Current PIN must contain only digits'),
    newPin: z.string().length(4, 'New PIN must be exactly 4 digits').regex(/^\d{4}$/, 'New PIN must contain only digits'),
    confirmPin: z.string().length(4, 'Confirm PIN must be exactly 4 digits').regex(/^\d{4}$/, 'Confirm PIN must contain only digits'),
}).refine(data => data.newPin === data.confirmPin, {
    message: "PIN codes don't match",
    path: ["confirmPin"],
});

// Notification schemas
export const notificationSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
    body: z.string().min(1, 'Body is required').max(500, 'Body must be less than 500 characters'),
    type: z.enum(['message', 'system', 'reminder', 'update']),
    isRead: z.boolean(),
    createdAt: z.date(),
    data: z.any(),
});

export const createNotificationSchema = notificationSchema.omit({id: true, isRead: true, createdAt: true});

// Form field schemas
export const emailSchema = z.email('Invalid email address');
export const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number');

export const phoneSchema = z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

export const urlSchema = z.string().url('Invalid URL format');

// Search and filter schemas
export const searchSchema = z.object({
    query: z.string().min(1, 'Search query is required').max(100, 'Search query too long'),
    filters: z.any(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const paginationSchema = z.object({
    page: z.number().min(1, 'Page must be at least 1'),
    limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100'),
});

// API response schemas
export const apiResponseSchema = z.object({
    success: z.boolean(),
    data: z.any().optional(),
    error: z.string().optional(),
    message: z.string().optional(),
});

export const paginatedResponseSchema = apiResponseSchema.extend({
    pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number(),
    }),
});

// Error schemas
export const errorSchema = z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
    timestamp: z.date(),
});

// Type exports
export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type SignIn = z.infer<typeof signInSchema>;
export type SignUp = z.infer<typeof signUpSchema>;
export type ForgotPassword = z.infer<typeof forgotPasswordSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
export type Settings = z.infer<typeof settingsSchema>;
export type UpdateSettings = z.infer<typeof updateSettingsSchema>;
export type PinCode = z.infer<typeof pinCodeSchema>;
export type ChangePinCode = z.infer<typeof changePinCodeSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type CreateNotification = z.infer<typeof createNotificationSchema>;
export type Search = z.infer<typeof searchSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;
export type PaginatedResponse = z.infer<typeof paginatedResponseSchema>;
export type AppError = z.infer<typeof errorSchema>; 