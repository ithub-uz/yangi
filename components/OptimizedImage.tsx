import {Image as ExpoImage, type ImageContentFit} from 'expo-image';
import React, {useCallback, useMemo, useState} from 'react';
import {ActivityIndicator, Image, ImageStyle, StyleSheet, View} from 'react-native';

interface OptimizedImageProps {
    source: any;
    style?: ImageStyle;
    placeholder?: any;
    resizeMode?: ImageContentFit;
    onLoad?: () => void;
    onError?: (error: any) => void;
    priority?: 'low' | 'normal' | 'high';
    cachePolicy?: 'memory' | 'disk' | 'memory-disk';
}

export const OptimizedImage: React.FC<OptimizedImageProps> = React.memo(({
                                                                             source,
                                                                             style,
                                                                             placeholder,
                                                                             resizeMode = 'cover',
                                                                             onLoad,
                                                                             onError,
                                                                             priority = 'normal',
                                                                             cachePolicy = 'memory-disk',
                                                                         }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = useCallback(() => {
        setIsLoading(false);
        setHasError(false);
        onLoad?.();
    }, [onLoad]);

    const handleError = useCallback((error: any) => {
        setIsLoading(false);
        setHasError(true);
        onError?.(error);
    }, [onError]);

    const imageSource = useMemo(() => {
        if (typeof source === 'string') {
            return {uri: source};
        }
        return source;
    }, [source]);

    if (hasError && placeholder) {
        return (
            <Image
                source={placeholder}
                style={style}
                resizeMode={resizeMode as 'cover' | 'contain' | 'stretch' | 'repeat' | 'center'}
            />
        );
    }

    return (
        <View style={[styles.container, style]}>
            <ExpoImage
                source={imageSource}
                style={[styles.image, style]}
                contentFit={resizeMode}
                onLoad={handleLoad}
                onError={handleError}
                priority={priority}
                cachePolicy={cachePolicy}
            />
            {isLoading && (
                <View style={[styles.loader, style]}>
                    <ActivityIndicator size="small" color="#007AFF"/>
                </View>
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    loader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
});

OptimizedImage.displayName = 'OptimizedImage';