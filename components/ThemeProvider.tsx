import { useSettingsStore } from '@/store/settings-store';
import React, { createContext, ReactNode, useContext } from 'react';
import { Platform, useColorScheme } from 'react-native';

type Theme = {
    isDark: boolean;
    colors: {
        background: string;
        text: string;
        primary: string;
        secondary: string;
        border: string;
        card: string;
        searchBackground: string;
        searchText: string;
        destructive: string;
        success: string;
        warning: string;
    };
};

// iOS Colors
const iosLightColors = {
    background: '#F2F2F7',
    text: '#000000',
    primary: '#007AFF',
    secondary: '#5856D6',
    border: '#C6C6C8',
    card: '#FFFFFF',
    searchBackground: '#E5E5EA',
    searchText: '#000000',
    destructive: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
};

const iosDarkColors = {
    background: '#000000',
    text: '#FFFFFF',
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    border: '#38383A',
    card: '#1C1C1E',
    searchBackground: '#1C1C1E',
    searchText: '#FFFFFF',
    destructive: '#FF453A',
    success: '#30D158',
    warning: '#FF9F0A',
};

// Android Colors (Material Design 3)
const androidLightColors = {
    background: '#FAFAFA',
    text: '#1C1B1F',
    primary: '#6750A4',
    secondary: '#625B71',
    border: '#CAC4D0',
    card: '#FFFFFF',
    searchBackground: '#F3F2F3',
    searchText: '#1C1B1F',
    destructive: '#BA1A1A',
    success: '#006C4C',
    warning: '#B95000',
};

const androidDarkColors = {
    background: '#141218',
    text: '#E6E1E5',
    primary: '#D0BCFF',
    secondary: '#CCC2DC',
    border: '#49454F',
    card: '#1D1B20',
    searchBackground: '#1D1B20',
    searchText: '#E6E1E5',
    destructive: '#FFB4AB',
    success: '#4FC08D',
    warning: '#FFB77C',
};

const getPlatformColors = (isDark: boolean) => {
    if (Platform.OS === 'ios') {
        return isDark ? iosDarkColors : iosLightColors;
    } else {
        return isDark ? androidDarkColors : androidLightColors;
    }
};

const ThemeContext = createContext<Theme>({
    isDark: false,
    colors: getPlatformColors(false)
});

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

type ThemeProviderProps = {
    children: ReactNode;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const { themeMode } = useSettingsStore();
    const systemColorScheme = useColorScheme();

    let isDark = false;
    if (themeMode === 'dark') isDark = true;
    else if (themeMode === 'light') isDark = false;
    else if (themeMode === 'system') isDark = systemColorScheme === 'dark';

    const colors = getPlatformColors(isDark);
    const theme: Theme = {
        isDark,
        colors
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
}; 