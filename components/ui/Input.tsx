import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import { borderRadius, colors, shadows, spacing, typography } from '../../design/tokens';

interface InputProps extends Omit<TextInputProps, 'style'> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: string;
    rightIcon?: string;
    onRightIconPress?: () => void;
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
    variant?: 'outlined' | 'filled';
    size?: 'sm' | 'md' | 'lg';
}

export const Input = forwardRef<TextInput, InputProps>(({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    onRightIconPress,
    containerStyle,
    inputStyle,
    variant = 'outlined',
    size = 'md',
    ...props
}, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const containerStyleCombined = [
        styles.container,
        styles[variant],
        styles[size],
        isFocused && styles.focused,
        error && styles.error,
        containerStyle,
    ];

    const inputStyleCombined = [
        styles.input,
        styles[`${variant}Input`],
        styles[`${size}Input`],
        inputStyle,
    ];

    const renderIcon = (iconName: string, position: 'left' | 'right') => {
        const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;
        const iconColor = error
            ? colors.error[500]
            : isFocused
                ? colors.primary[600]
                : colors.neutral[500];

        return (
            <Ionicons
                name={iconName as any}
                size={iconSize}
                color={iconColor}
                style={position === 'left' ? styles.leftIcon : styles.rightIcon}
            />
        );
    };

    return (
        <View style={styles.wrapper}>
            {label && (
                <Text style={[
                    styles.label,
                    error && styles.errorLabel,
                    isFocused && styles.focusedLabel,
                ]}>
                    {label}
                </Text>
            )}

            <View style={containerStyleCombined}>
                {leftIcon && renderIcon(leftIcon, 'left')}

                <TextInput
                    ref={ref}
                    style={inputStyleCombined}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholderTextColor={colors.neutral[400]}
                    {...props}
                />

                {rightIcon && (
                    <View style={styles.rightIconContainer}>
                        {renderIcon(rightIcon, 'right')}
                    </View>
                )}
            </View>

            {(error || helperText) && (
                <Text style={[
                    styles.helperText,
                    error && styles.errorText,
                ]}>
                    {error || helperText}
                </Text>
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: spacing[3],
    },

    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },

    // Variants
    outlined: {
        backgroundColor: colors.neutral[50],
        borderWidth: 1,
        borderColor: colors.neutral[300],
    },
    filled: {
        backgroundColor: colors.neutral[100],
        borderWidth: 0,
    },

    // Sizes
    sm: {
        paddingHorizontal: spacing[3],
        minHeight: 40,
    },
    md: {
        paddingHorizontal: spacing[4],
        minHeight: 48,
    },
    lg: {
        paddingHorizontal: spacing[5],
        minHeight: 56,
    },

    // States
    focused: {
        borderColor: colors.primary[600],
        ...shadows.base,
    },
    error: {
        borderColor: colors.error[500],
    },

    // Input styles
    input: {
        flex: 1,
        fontFamily: typography.fontFamily.regular,
        color: colors.neutral[900],
    },
    outlinedInput: {
        backgroundColor: 'transparent',
    },
    filledInput: {
        backgroundColor: 'transparent',
    },
    smInput: {
        fontSize: typography.fontSize.sm,
    },
    mdInput: {
        fontSize: typography.fontSize.base,
    },
    lgInput: {
        fontSize: typography.fontSize.lg,
    },

    // Label styles
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.neutral[700],
        marginBottom: spacing[1],
    },
    focusedLabel: {
        color: colors.primary[600],
    },
    errorLabel: {
        color: colors.error[500],
    },

    // Helper text styles
    helperText: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral[500],
        marginTop: spacing[1],
    },
    errorText: {
        color: colors.error[500],
    },

    // Icon styles
    leftIcon: {
        marginRight: spacing[2],
    },
    rightIcon: {
        marginLeft: spacing[2],
    },
    rightIconContainer: {
        marginLeft: spacing[2],
    },
});

Input.displayName = 'Input'; 