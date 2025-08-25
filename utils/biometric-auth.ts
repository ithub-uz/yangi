import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export interface BiometricAuthResult {
    success: boolean;
    error?: string;
    biometricType?: LocalAuthentication.AuthenticationType[];
}

export class BiometricAuthService {
    private static readonly BIOMETRIC_ENABLED_KEY = 'biometric_auth_enabled';
    private static readonly LAST_ACTIVE_TIME_KEY = 'last_active_time';

    /**
     * Check if biometric authentication is available on the device
     */
    static async isBiometricAvailable(): Promise<boolean> {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            return hasHardware && isEnrolled;
        } catch (error) {
            console.error('Error checking biometric availability:', error);
            return false;
        }
    }

    /**
     * Check if biometric authentication is properly configured (not just passcode)
     */
    static async isBiometricProperlyConfigured(): Promise<boolean> {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
            
            // Check if device has biometric hardware AND biometric is enrolled (not just passcode)
            const hasBiometricTypes = supportedTypes.some(type => 
                type === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION ||
                type === LocalAuthentication.AuthenticationType.FINGERPRINT ||
                type === LocalAuthentication.AuthenticationType.IRIS
            );
            
            return hasHardware && isEnrolled && hasBiometricTypes;
        } catch (error) {
            console.error('Error checking biometric configuration:', error);
            return false;
        }
    }

    /**
     * Get detailed biometric status
     */
    static async getBiometricStatus(): Promise<{
        hasHardware: boolean;
        isEnrolled: boolean;
        supportedTypes: LocalAuthentication.AuthenticationType[];
        isProperlyConfigured: boolean;
        isUsingPasscode: boolean;
    }> {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
            const isProperlyConfigured = await this.isBiometricProperlyConfigured();
            
            // Check if only passcode is available (no biometric types)
            const hasBiometricTypes = supportedTypes.some(type => 
                type === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION ||
                type === LocalAuthentication.AuthenticationType.FINGERPRINT ||
                type === LocalAuthentication.AuthenticationType.IRIS
            );
            
            return {
                hasHardware,
                isEnrolled,
                supportedTypes,
                isProperlyConfigured,
                isUsingPasscode: isEnrolled && !hasBiometricTypes
            };
        } catch (error) {
            console.error('Error getting biometric status:', error);
            return {
                hasHardware: false,
                isEnrolled: false,
                supportedTypes: [],
                isProperlyConfigured: false,
                isUsingPasscode: false
            };
        }
    }

    /**
     * Get available biometric types
     */
    static async getBiometricTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
        try {
            return await LocalAuthentication.supportedAuthenticationTypesAsync();
        } catch (error) {
            console.error('Error getting biometric types:', error);
            return [];
        }
    }

    /**
     * Authenticate using biometrics
     */
    static async authenticate(promptMessage?: string): Promise<BiometricAuthResult> {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: promptMessage || 'Authenticate to continue',
                fallbackLabel: 'Use passcode',
                cancelLabel: 'Cancel',
                disableDeviceFallback: false,
            });

            if (result.success) {
                // Update last active time
                await this.updateLastActiveTime();
            }

            return {
                success: result.success,
                error: result.success ? undefined : 'Authentication failed',
                biometricType: result.success ? (result as any).authenticationType : undefined,
            };
        } catch (error) {
            console.error('Biometric authentication error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Authentication failed',
            };
        }
    }

    /**
     * Check if biometric auth is enabled in app settings
     */
    static async isBiometricEnabled(): Promise<boolean> {
        try {
            const enabled = await SecureStore.getItemAsync(this.BIOMETRIC_ENABLED_KEY);
            return enabled === 'true';
        } catch (error) {
            console.error('Error checking biometric enabled status:', error);
            return false;
        }
    }

        /**
     * Enable or disable biometric authentication
     */
    static async setBiometricEnabled(enabled: boolean): Promise<void> {
        try {
            if (enabled) {
                // Verify biometric is available before enabling
                const isAvailable = await this.isBiometricAvailable();
                if (!isAvailable) {
                    throw new Error('Biometric authentication is not available on this device');
                }
                
                // Test authentication before enabling
                const authResult = await this.authenticate('Verify your identity to enable biometric authentication');
                if (!authResult.success) {
                    throw new Error('Biometric verification failed');
                }
            }

            await SecureStore.setItemAsync(this.BIOMETRIC_ENABLED_KEY, enabled.toString());
        } catch (error) {
            console.error('Error setting biometric enabled:', error);
            throw error;
        }
    }

    /**
     * Request biometric permissions
     */
    static async requestPermissions(): Promise<boolean> {
        try {
            // Check if biometric is available
            const isAvailable = await this.isBiometricAvailable();
            if (!isAvailable) {
                return false;
            }

            // Try to authenticate to trigger permission request
            const result = await this.authenticate('Please authenticate to enable biometric features');
            return result.success;
        } catch (error) {
            console.error('Error requesting biometric permissions:', error);
            return false;
        }
    }

    /**
     * Update last active time (when app becomes active)
     */
    static async updateLastActiveTime(): Promise<void> {
        try {
            const timestamp = Date.now().toString();
            await SecureStore.setItemAsync(this.LAST_ACTIVE_TIME_KEY, timestamp);
        } catch (error) {
            console.error('Error updating last active time:', error);
        }
    }

    /**
     * Get last active time
     */
    static async getLastActiveTime(): Promise<number> {
        try {
            const timestamp = await SecureStore.getItemAsync(this.LAST_ACTIVE_TIME_KEY);
            return timestamp ? parseInt(timestamp, 10) : 0;
        } catch (error) {
            console.error('Error getting last active time:', error);
            return 0;
        }
    }

    /**
     * Check if app should be locked based on timeout
     */
    static async shouldLockApp(timeoutSeconds: number): Promise<boolean> {
        try {
            const lastActiveTime = await this.getLastActiveTime();
            const currentTime = Date.now();
            const timeDiff = (currentTime - lastActiveTime) / 1000; // Convert to seconds

            return timeDiff >= timeoutSeconds;
        } catch (error) {
            console.error('Error checking if app should be locked:', error);
            return false;
        }
    }

    /**
     * Get biometric type name for display
     */
    static getBiometricTypeName(type: LocalAuthentication.AuthenticationType): string {
        switch (type) {
            case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
                return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
            case LocalAuthentication.AuthenticationType.FINGERPRINT:
                return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
            case LocalAuthentication.AuthenticationType.IRIS:
                return 'Iris';
            default:
                return 'Biometric';
        }
    }

    /**
     * Get all available biometric type names
     */
    static async getAvailableBiometricNames(): Promise<string[]> {
        try {
            const types = await this.getBiometricTypes();
            return types.map(type => this.getBiometricTypeName(type));
        } catch (error) {
            console.error('Error getting biometric names:', error);
            return [];
        }
    }
} 