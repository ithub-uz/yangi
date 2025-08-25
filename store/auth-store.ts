import { logger } from "@/services/logger";
import { SecurityUtils, sanitizeEmail } from "@/utils/security";
import { type SignIn } from "@/validation/schemas";
import { deleteItemAsync, getItem, setItem } from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface User {
    id: string;
    name: string;
    email: string;
    isVip: boolean;
    createdAt: Date;
    updatedAt: Date;
}

type UserState = {
    user: User | null;
    isLoggedIn: boolean;
    shouldCreateAccount: boolean;
    hasCompletedOnboarding: boolean;
    isVip: boolean;
    _hasHydrated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    logIn: () => void;
    logOut: () => void;
    completeOnboarding: () => void;
    resetOnboarding: () => void;
    logInAsVip: () => void;
    signIn: (credentials: SignIn) => Promise<void>;
    signUp: (userData: { name: string; email: string; password: string }) => Promise<void>;
    setHasHydrated: (value: boolean) => void;
    resetToDefaults: () => void;
    clearError: () => void;
    setUser: (user: User) => void;
};

export const useAuthStore = create(
    persist<UserState>(
        (set, get) => ({
            user: null,
            isLoggedIn: false,
            shouldCreateAccount: false,
            hasCompletedOnboarding: false,
            isVip: false,
            _hasHydrated: false,
            isLoading: false,
            error: null,

            logIn: () => {
                set((state) => ({
                    ...state,
                    isLoggedIn: true,
                    error: null,
                }));
            },

            logInAsVip: () => {
                set((state) => ({
                    ...state,
                    isVip: true,
                    isLoggedIn: true,
                    error: null,
                }));
            },

            signIn: async (credentials: SignIn) => {
                try {
                    set({ isLoading: true, error: null });

                    // Validate input
                    const sanitizedEmail = sanitizeEmail(credentials.email);

                    // Rate limiting
                    if (!SecurityUtils.checkRateLimit('sign_in_attempts', 5, 300000)) {
                        throw new Error('Too many sign in attempts. Please try again later.');
                    }

                    // Demo authentication logic with validation
                    if (sanitizedEmail === 'vip@example.com' && credentials.password === 'vip123') {
                        const user: User = {
                            id: 'vip-user-1',
                            name: 'VIP User',
                            email: sanitizedEmail,
                            isVip: true,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        };

                        set((state) => ({
                            ...state,
                            user,
                            isVip: true,
                            isLoggedIn: true,
                            isLoading: false,
                            error: null,
                        }));
                    } else if (sanitizedEmail && credentials.password) {
                        const user: User = {
                            id: `user-${Date.now()}`,
                            name: sanitizedEmail.split('@')[0],
                            email: sanitizedEmail,
                            isVip: false,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        };

                        set((state) => ({
                            ...state,
                            user,
                            isLoggedIn: true,
                            isLoading: false,
                            error: null,
                        }));
                    } else {
                        throw new Error('Invalid credentials');
                    }

                    // Store session token
                    const sessionToken = SecurityUtils.generateSessionToken();
                    await SecurityUtils.storeSessionToken(sessionToken);

                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
                    set({ isLoading: false, error: errorMessage });
                    throw error;
                }
            },

            signUp: async (userData: { name: string; email: string; password: string }) => {
                try {
                    set({ isLoading: true, error: null });

                    // Validate password strength
                    const passwordStrength = SecurityUtils.validatePasswordStrength(userData.password);
                    if (!passwordStrength.isValid) {
                        throw new Error(`Password is too weak: ${passwordStrength.feedback.join(', ')}`);
                    }

                    // Sanitize inputs
                    const sanitizedEmail = sanitizeEmail(userData.email);
                    const sanitizedName = SecurityUtils.sanitizeInput(userData.name);

                    // Hash password
                    const { hash: passwordHash } = await SecurityUtils.hashPassword(userData.password);

                    // Create user
                    const user: User = {
                        id: `user-${Date.now()}`,
                        name: sanitizedName,
                        email: sanitizedEmail,
                        isVip: false,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    };

                    set((state) => ({
                        ...state,
                        user,
                        isLoggedIn: true,
                        isLoading: false,
                        error: null,
                    }));

                    // Store session token
                    const sessionToken = SecurityUtils.generateSessionToken();
                    await SecurityUtils.storeSessionToken(sessionToken);

                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
                    set({ isLoading: false, error: errorMessage });
                    throw error;
                }
            },

            logOut: async () => {
                try {
                    // Clear session data
                    await deleteItemAsync('auth_token');
                    set((state) => ({
                        ...state,
                        user: null,
                        isLoggedIn: false,
                        isVip: false,
                        isLoading: false,
                        error: null,
                    }));

                } catch (error) {
                }
            },

            completeOnboarding: () => {
                set((state) => ({
                    ...state,
                    hasCompletedOnboarding: true,
                }));
            },

            resetOnboarding: () => {
                set((state) => ({
                    ...state,
                    hasCompletedOnboarding: false,
                }));
            },

            setHasHydrated: (value: boolean) => {
                set((state) => ({
                    ...state,
                    _hasHydrated: value,
                }));
            },

            resetToDefaults: async () => {
                try {
                    // Clear all secure data
                    await SecurityUtils.clearSessionToken();
                    await SecurityUtils.clearBiometricKey();
                    await SecurityUtils.clearPinCode();

                    set({
                        user: null,
                        isLoggedIn: false,
                        shouldCreateAccount: false,
                        hasCompletedOnboarding: false,
                        isVip: false,
                        _hasHydrated: false,
                        isLoading: false,
                        error: null,
                    });

                } catch (error) {
                }
            },

            clearError: () => {
                set({ error: null });
            },

            setUser: (user: User) => {
                set((state) => ({
                    ...state,
                    user,
                }));
            },
        }),
        {
            name: "auth-store",
            storage: createJSONStorage(() => ({
                setItem,
                getItem,
                removeItem: deleteItemAsync,
            })),
            onRehydrateStorage: (state) => {
                return () => {
                    state.setHasHydrated(true);
                    logger.debug('Auth store rehydrated');
                };
            },
        },
    ),
); 