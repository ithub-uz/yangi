import * as Device from 'expo-device';
import * as FileSystem from 'expo-file-system';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    data?: any;
    userId?: string;
    sessionId?: string;
    deviceInfo?: {
        brand?: string;
        modelName?: string;
        osVersion?: string;
        appVersion?: string;
    };
    stack?: string;
}

class Logger {
    private logs: LogEntry[] = [];
    private maxLogs = 1000;
    private isRemoteLoggingEnabled = false;
    private remoteEndpoint = '';
    private sessionId = this.generateSessionId();

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private async getDeviceInfo() {
        return {
            brand: Device.brand,
            modelName: Device.modelName,
            osVersion: Device.osVersion,
            appVersion: Device.osBuildId,
        };
    }

    private createLogEntry(
        level: LogLevel,
        message: string,
        data?: any,
        userId?: string
    ): LogEntry {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            data,
            userId,
            sessionId: this.sessionId,
            deviceInfo: Device.isDevice ? {
                brand: Device.brand || undefined,
                modelName: Device.modelName || undefined,
                osVersion: Device.osVersion || undefined,
                appVersion: Device.osBuildId || undefined,
            } : undefined,
            stack: new Error().stack,
        };
    }

    private addLog(entry: LogEntry) {
        this.logs.push(entry);

        // Keep only the last maxLogs entries
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }

        // Console logging in development
        if (__DEV__) {
            const consoleMethod = entry.level === 'error' || entry.level === 'fatal'
                ? 'error'
                : entry.level === 'warn'
                    ? 'warn'
                    : 'log';

            console[consoleMethod](
                `[${entry.level.toUpperCase()}] ${entry.message}`,
                entry.data || ''
            );
        }

        // Remote logging if enabled
        if (this.isRemoteLoggingEnabled) {
            this.sendToRemote(entry);
        }
    }

    private async sendToRemote(entry: LogEntry) {
        try {
            if (!this.remoteEndpoint) return;

            await fetch(this.remoteEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(entry),
            });
        } catch (error) {
            // Don't log remote logging errors to avoid infinite loops
            console.error('Failed to send log to remote:', error);
        }
    }

    // Public methods
    debug(message: string, data?: any, userId?: string) {
        const entry = this.createLogEntry('debug', message, data, userId);
        this.addLog(entry);
    }

    info(message: string, data?: any, userId?: string) {
        const entry = this.createLogEntry('info', message, data, userId);
        this.addLog(entry);
    }

    warn(message: string, data?: any, userId?: string) {
        const entry = this.createLogEntry('warn', message, data, userId);
        this.addLog(entry);
    }

    error(message: string, error?: Error | any, userId?: string) {
        const entry = this.createLogEntry('error', message, error, userId);
        this.addLog(entry);
    }

    fatal(message: string, error?: Error | any, userId?: string) {
        const entry = this.createLogEntry('fatal', message, error, userId);
        this.addLog(entry);
    }

    // Performance logging
    time(label: string) {
        if (__DEV__) {
            console.time(label);
        }
    }

    timeEnd(label: string) {
        if (__DEV__) {
            console.timeEnd(label);
        }
    }

    // Configuration
    enableRemoteLogging(endpoint: string) {
        this.isRemoteLoggingEnabled = true;
        this.remoteEndpoint = endpoint;
    }

    disableRemoteLogging() {
        this.isRemoteLoggingEnabled = false;
        this.remoteEndpoint = '';
    }

    setMaxLogs(max: number) {
        this.maxLogs = max;
    }

    // Export logs
    async exportLogs(): Promise<string> {
        const logFile = `${FileSystem.documentDirectory}app-logs-${Date.now()}.json`;
        const logData = JSON.stringify(this.logs, null, 2);

        await FileSystem.writeAsStringAsync(logFile, logData);
        return logFile;
    }

    getLogs(level?: LogLevel): LogEntry[] {
        if (level) {
            return this.logs.filter(log => log.level === level);
        }
        return [...this.logs];
    }

    clearLogs() {
        this.logs = [];
    }

    // Analytics events
    trackEvent(eventName: string, properties?: Record<string, any>, userId?: string) {
        this.info(`Event: ${eventName}`, properties, userId);
    }

    trackScreen(screenName: string, userId?: string) {
        this.info(`Screen: ${screenName}`, undefined, userId);
    }

    trackError(error: Error, context?: string, userId?: string) {
        this.error(`Error in ${context || 'unknown context'}`, error, userId);
    }
}

export const logger = new Logger(); 