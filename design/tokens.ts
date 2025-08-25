// Color tokens
export const colors = {
    // Primary colors
    primary: {
        50: '#E3F2FD',
        100: '#BBDEFB',
        200: '#90CAF9',
        300: '#64B5F6',
        400: '#42A5F5',
        500: '#2196F3',
        600: '#1E88E5',
        700: '#1976D2',
        800: '#1565C0',
        900: '#0D47A1',
    },

    // Secondary colors
    secondary: {
        50: '#F3E5F5',
        100: '#E1BEE7',
        200: '#CE93D8',
        300: '#BA68C8',
        400: '#AB47BC',
        500: '#9C27B0',
        600: '#8E24AA',
        700: '#7B1FA2',
        800: '#6A1B9A',
        900: '#4A148C',
    },

    // Neutral colors
    neutral: {
        50: '#FAFAFA',
        100: '#F5F5F5',
        200: '#EEEEEE',
        300: '#E0E0E0',
        400: '#BDBDBD',
        500: '#9E9E9E',
        600: '#757575',
        700: '#616161',
        800: '#424242',
        900: '#212121',
    },

    // Semantic colors
    success: {
        50: '#E8F5E8',
        100: '#C8E6C9',
        500: '#4CAF50',
        600: '#43A047',
        700: '#388E3C',
    },

    warning: {
        50: '#FFF8E1',
        100: '#FFECB3',
        500: '#FF9800',
        600: '#FB8C00',
        700: '#F57C00',
    },

    error: {
        50: '#FFEBEE',
        100: '#FFCDD2',
        500: '#F44336',
        600: '#E53935',
        700: '#D32F2F',
    },

    info: {
        50: '#E1F5FE',
        100: '#B3E5FC',
        500: '#2196F3',
        600: '#1E88E5',
        700: '#1976D2',
    },
} as const;

// Typography tokens
export const typography = {
    fontFamily: {
        regular: 'System',
        medium: 'System',
        bold: 'System',
        mono: 'SpaceMono-Regular',
    },

    fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
        '5xl': 48,
    },

    fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },

    lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
    },
} as const;

// Spacing tokens
export const spacing = {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
    32: 128,
} as const;

// Border radius tokens
export const borderRadius = {
    none: 0,
    sm: 2,
    base: 4,
    md: 6,
    lg: 8,
    xl: 12,
    '2xl': 16,
    '3xl': 24,
    full: 9999,
} as const;

// Shadow tokens
export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    base: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
} as const;

// Animation tokens
export const animation = {
    duration: {
        fast: 150,
        normal: 250,
        slow: 350,
    },
    easing: {
        ease: 'ease',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out',
    },
} as const;

// Z-index tokens
export const zIndex = {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
} as const; 