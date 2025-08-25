import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import {logger} from '@/services/logger';

// Encryption utilities
export class SecurityUtils {
    private static readonly ENCRYPTION_KEY = 'app_encryption_key';
    private static readonly SALT_LENGTH = 32;
    private static readonly ITERATIONS = 100000;
    // Rate limiting utilities
    private static rateLimitMap = new Map<string, { count: number; resetTime: number }>();

    // Generate a secure random string
    static generateSecureRandom(length: number = 32): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Hash a string using SHA-256
    static async hashString(input: string): Promise<string> {
        try {
            const digest = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                input
            );
            return digest;
        } catch (error) {
            logger.error('Failed to hash string', error);
            throw new Error('Failed to hash string');
        }
    }

    // Hash password with salt
    static async hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
        try {
            const generatedSalt = salt || this.generateSecureRandom(this.SALT_LENGTH);
            const combined = password + generatedSalt;
            const hash = await this.hashString(combined);

            return {hash, salt: generatedSalt};
        } catch (error) {
            logger.error('Failed to hash password', error);
            throw new Error('Failed to hash password');
        }
    }

    // Verify password
    static async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
        try {
            const {hash: computedHash} = await this.hashPassword(password, salt);
            return computedHash === hash;
        } catch (error) {
            logger.error('Failed to verify password', error);
            return false;
        }
    }

    // Secure storage utilities
    static async secureStore(key: string, value: string): Promise<void> {
        try {
            await SecureStore.setItemAsync(key, value);
            logger.debug('Data stored securely', {value, key});
        } catch (error) {
            logger.error('Failed to store data securely', error);
            throw new Error('Failed to store data securely');
        }
    }

    static async secureRetrieve(key: string): Promise<string | null> {
        try {
            const value = await SecureStore.getItemAsync(key);
            logger.debug('Data retrieved securely', {key, hasValue: !!value});
            return value;
        } catch (error) {
            logger.error('Failed to retrieve data securely', error, key);
            throw new Error('Failed to retrieve data securely');
        }
    }

    static async secureDelete(key: string): Promise<void> {
        try {
            await SecureStore.deleteItemAsync(key);


            logger.debug('Data deleted securely', {key});
        } catch (error) {
            logger.error('Failed to delete data securely', error, key);
            throw new Error('Failed to delete data securely');
        }
    }

    // Input sanitization
    static sanitizeInput(input: string): string {
        return input
            .trim()
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, ''); // Remove event handlers
    }

    static sanitizeEmail(email: string): string {
        return email.toLowerCase().trim();
    }

    static sanitizePhone(phone: string): string {
        return phone.replace(/[^\d+]/g, ''); // Keep only digits and +
    }

    // PIN code validation
    static validatePinCode(pin: string): boolean {
        return /^\d{4}$/.test(pin);
    }

    // Password strength validation
    static validatePasswordStrength(password: string): {
        isValid: boolean;
        score: number;
        feedback: string[];
    } {
        const feedback: string[] = [];
        let score = 0;

        // Length check
        if (password.length >= 8) {
            score += 1;
        } else {
            feedback.push('Password must be at least 8 characters long');
        }

        // Uppercase check
        if (/[A-Z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Password must contain at least one uppercase letter');
        }

        // Lowercase check
        if (/[a-z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Password must contain at least one lowercase letter');
        }

        // Number check
        if (/\d/.test(password)) {
            score += 1;
        } else {
            feedback.push('Password must contain at least one number');
        }

        // Special character check
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Password should contain at least one special character');
        }

        return {
            isValid: score >= 4,
            score,
            feedback,
        };
    }

    static checkRateLimit(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
        const now = Date.now();
        const record = this.rateLimitMap.get(key);

        if (!record || now > record.resetTime) {
            this.rateLimitMap.set(key, {count: 1, resetTime: now + windowMs});
            return true;
        }

        if (record.count >= maxAttempts) {
            return false;
        }

        record.count++;
        return true;
    }

    static resetRateLimit(key: string): void {
        this.rateLimitMap.delete(key);
    }

    // Session management
    static generateSessionToken(): string {
        return this.generateSecureRandom(64);
    }

    static async storeSessionToken(token: string): Promise<void> {
        await this.secureStore('session_token', token);
    }

    static async getSessionToken(): Promise<string | null> {
        return await this.secureRetrieve('session_token');
    }

    static async clearSessionToken(): Promise<void> {
        await this.secureDelete('session_token');
    }

    // Biometric key management
    static async storeBiometricKey(key: string): Promise<void> {
        await this.secureStore('biometric_key', key);
    }

    static async getBiometricKey(): Promise<string | null> {
        return await this.secureRetrieve('biometric_key');
    }

    static async clearBiometricKey(): Promise<void> {
        await this.secureDelete('biometric_key');
    }

    // PIN code management
    static async storePinCode(pin: string): Promise<void> {
        const hashedPin = await this.hashString(pin);
        await this.secureStore('pin_code_hash', hashedPin);
    }

    static async verifyPinCode(pin: string): Promise<boolean> {
        try {
            const storedHash = await this.secureRetrieve('pin_code_hash');
            if (!storedHash) return false;

            const inputHash = await this.hashString(pin);
            return storedHash === inputHash;
        } catch (error) {
            logger.error('Failed to verify PIN code', error);
            return false;
        }
    }

    static async clearPinCode(): Promise<void> {
        await this.secureDelete('pin_code_hash');
    }
}

// Export individual functions for convenience
export const {
    generateSecureRandom,
    hashString,
    hashPassword,
    verifyPassword,
    secureStore,
    secureRetrieve,
    secureDelete,
    sanitizeInput,
    sanitizeEmail,
    sanitizePhone,
    validatePinCode,
    validatePasswordStrength,
    checkRateLimit,
    resetRateLimit,
    generateSessionToken,
    storeSessionToken,
    getSessionToken,
    clearSessionToken,
    storeBiometricKey,
    getBiometricKey,
    clearBiometricKey,
    storePinCode,
    verifyPinCode,
    clearPinCode,
} = SecurityUtils; 