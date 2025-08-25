import React, { useEffect, useState } from 'react';
import { InteractionManager, View, ViewStyle } from 'react-native';

interface LazyViewProps {
    children: React.ReactNode;
    style?: ViewStyle;
    delay?: number;
    placeholder?: React.ReactNode;
    onLoad?: () => void;
}

export const LazyView: React.FC<LazyViewProps> = React.memo(({
    children,
    style,
    delay = 0,
    placeholder,
    onLoad,
}) => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            InteractionManager.runAfterInteractions(() => {
                setIsLoaded(true);
                onLoad?.();
            });
        }, delay);

        return () => clearTimeout(timer);
    }, [delay, onLoad]);

    if (!isLoaded) {
        return (
            <View style={style}>
                {placeholder}
            </View>
        );
    }

    return (
        <View style={style}>
            {children}
        </View>
    );
});

LazyView.displayName = 'LazyView'; 