import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { borderRadius, colors, shadows, spacing, typography } from '../../design/tokens';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    icon?: string;
    iconPosition?: 'left' | 'right';
    style?: ViewStyle;
    textStyle?: TextStyle;
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon,
    iconPosition = 'left',
    style,
    textStyle,
    fullWidth = false,
}) => {
    const buttonStyle = [
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
    ];

    const textStyleCombined = [
        styles.text,
        styles[`${variant}Text`],
        styles[`${size}Text`],
        disabled && styles.disabledText,
        textStyle,
    ];

    const renderIcon = () => {
        if (!icon || loading) return null;

        const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;
        const iconColor = variant === 'outline' || variant === 'ghost'
            ? colors.primary[600]
            : colors.neutral[50];

        return (
            <Ionicons
                name={icon as any}
                size={iconSize}
                color={disabled ? colors.neutral[400] : iconColor}
                style={iconPosition === 'right' ? styles.iconRight : styles.iconLeft}
            />
        );
    };

    return (
        <TouchableOpacity
            style={buttonStyle}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={variant === 'outline' || variant === 'ghost'
                        ? colors.primary[600]
                        : colors.neutral[50]
                    }
                />
            ) : (
                <>
                    {iconPosition === 'left' && renderIcon()}
                    <Text style={textStyleCombined}>{title}</Text>
                    {iconPosition === 'right' && renderIcon()}
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },

    // Variants
    primary: {
        backgroundColor: colors.primary[600],
    },
    secondary: {
        backgroundColor: colors.secondary[600],
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary[600],
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    danger: {
        backgroundColor: colors.error[500],
    },

    // Sizes
    sm: {
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[2],
        minHeight: 36,
    },
    md: {
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
        minHeight: 44,
    },
    lg: {
        paddingHorizontal: spacing[6],
        paddingVertical: spacing[4],
        minHeight: 52,
    },

    // States
    disabled: {
        opacity: 0.5,
    },
    fullWidth: {
        width: '100%',
    },

    // Text styles
    text: {
        fontFamily: typography.fontFamily.medium,
        fontWeight: typography.fontWeight.medium,
        textAlign: 'center',
    },
    primaryText: {
        color: colors.neutral[50],
    },
    secondaryText: {
        color: colors.neutral[50],
    },
    outlineText: {
        color: colors.primary[600],
    },
    ghostText: {
        color: colors.primary[600],
    },
    dangerText: {
        color: colors.neutral[50],
    },
    smText: {
        fontSize: typography.fontSize.sm,
    },
    mdText: {
        fontSize: typography.fontSize.base,
    },
    lgText: {
        fontSize: typography.fontSize.lg,
    },
    disabledText: {
        color: colors.neutral[400],
    },

    // Icon styles
    iconLeft: {
        marginRight: spacing[2],
    },
    iconRight: {
        marginLeft: spacing[2],
    },
}); 