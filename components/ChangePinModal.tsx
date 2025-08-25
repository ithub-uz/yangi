import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSettingsStore } from '../store/settings-store';

interface ChangePinModalProps {
    visible: boolean;
    onClose: () => void;
}

type PinStep = 'current' | 'new' | 'confirm';

export const ChangePinModal: React.FC<ChangePinModalProps> = ({
    visible,
    onClose,
}) => {
    const { t } = useTranslation();
    const { pinCode, setPinCode, hapticFeedback } = useSettingsStore();

    const [currentStep, setCurrentStep] = useState<PinStep>('current');
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');

    const handleNumberPress = (number: string) => {
        if (hapticFeedback) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        switch (currentStep) {
            case 'current':
                if (currentPin.length < 4) {
                    setCurrentPin(prev => prev + number);
                }
                break;
            case 'new':
                if (newPin.length < 4) {
                    setNewPin(prev => prev + number);
                }
                break;
            case 'confirm':
                if (confirmPin.length < 4) {
                    setConfirmPin(prev => prev + number);
                }
                break;
        }
    };

    const handleDelete = () => {
        if (hapticFeedback) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        switch (currentStep) {
            case 'current':
                setCurrentPin(prev => prev.slice(0, -1));
                break;
            case 'new':
                setNewPin(prev => prev.slice(0, -1));
                break;
            case 'confirm':
                setConfirmPin(prev => prev.slice(0, -1));
                break;
        }
    };

    const handleStepComplete = () => {
        switch (currentStep) {
            case 'current':
                if (currentPin === pinCode) {
                    setCurrentStep('new');
                    setCurrentPin('');
                } else {
                    Alert.alert(t('common.error'), t('settings.security.invalidPin'));
                    setCurrentPin('');
                }
                break;
            case 'new':
                if (newPin.length === 4) {
                    setCurrentStep('confirm');
                }
                break;
            case 'confirm':
                if (confirmPin === newPin) {
                    setPinCode(newPin);
                    Alert.alert(t('common.success'), t('settings.security.pinChanged'), [
                        { text: t('common.ok'), onPress: handleClose }
                    ]);
                } else {
                    Alert.alert(t('common.error'), t('settings.security.pinMismatch'));
                    setConfirmPin('');
                }
                break;
        }
    };

    const handleClose = () => {
        setCurrentStep('current');
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        onClose();
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case 'current':
                return t('settings.security.enterCurrentPin');
            case 'new':
                return t('settings.security.enterNewPin');
            case 'confirm':
                return t('settings.security.confirmNewPin');
        }
    };

    const getCurrentPin = () => {
        switch (currentStep) {
            case 'current':
                return currentPin;
            case 'new':
                return newPin;
            case 'confirm':
                return confirmPin;
        }
    };

    const renderPinDots = () => {
        const pin = getCurrentPin();
        return (
            <View style={styles.pinContainer}>
                {[0, 1, 2, 3].map((index) => (
                    <View
                        key={index}
                        style={[
                            styles.pinDot,
                            pin.length > index && styles.pinDotFilled
                        ]}
                    />
                ))}
            </View>
        );
    };

    const renderNumberPad = () => {
        const numbers = [
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['', '0', '']
        ];

        return (
            <View style={styles.numberPad}>
                {numbers.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.numberRow}>
                        {row.map((number, colIndex) => {
                            if (number === '') {
                                return <View key={colIndex} style={styles.emptyButton} />;
                            }

                            return (
                                <TouchableOpacity
                                    key={colIndex}
                                    style={styles.numberButton}
                                    onPress={() => handleNumberPress(number)}
                                >
                                    <Text style={styles.numberText}>{number}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}
                <View style={styles.bottomRow}>
                    <View style={styles.emptyButton} />
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDelete}
                    >
                        <Ionicons name="backspace-outline" size={24} color="#007AFF" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#007AFF" />
                    </TouchableOpacity>
                    <Text style={styles.title}>{t('settings.security.changePinCode')}</Text>
                    <View style={styles.placeholder} />
                </View>

                <View style={styles.content}>
                    <Text style={styles.stepTitle}>{getStepTitle()}</Text>
                    {renderPinDots()}
                    {renderNumberPad()}
                </View>

                {getCurrentPin().length === 4 && (
                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={handleStepComplete}
                    >
                        <Text style={styles.continueButtonText}>{t('common.continue')}</Text>
                    </TouchableOpacity>
                )}
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E7',
    },
    closeButton: {
        padding: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    stepTitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
    },
    pinContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 60,
    },
    pinDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#007AFF',
        marginHorizontal: 10,
    },
    pinDotFilled: {
        backgroundColor: '#007AFF',
    },
    numberPad: {
        width: '100%',
    },
    numberRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    numberButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F2F2F7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    numberText: {
        fontSize: 24,
        fontWeight: '500',
        color: '#000',
    },
    emptyButton: {
        width: 80,
        height: 80,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    deleteButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F2F2F7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    continueButton: {
        backgroundColor: '#007AFF',
        marginHorizontal: 20,
        marginBottom: 40,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
}); 