import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Check } from 'iconoir-react-native';
import { colors } from '../theme/colors';

interface StepProgressIndicatorProps {
  currentStep: number;
  totalSteps?: number;
  onContinue: () => void;
  onBack: () => void;
  onFinish?: () => void;
  continueText?: string;
  finishText?: string;
  backText?: string;
}

export const StepProgressIndicator: React.FC<StepProgressIndicatorProps> = ({
  currentStep,
  totalSteps = 3,
  onContinue,
  onBack,
  onFinish,
  continueText = 'Continuar',
  finishText = 'Concluir',
  backText = 'Voltar',
}) => {
  // Animated values
  const pillWidth = useRef(new Animated.Value(24)).current;
  const backBtnWidth = useRef(new Animated.Value(0)).current;
  const backBtnOpacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Pill track animation (Step 1: 24, Step 2: 52, Step 3: 80)
    const targetPillWidth = currentStep === 1 ? 24 : currentStep === 2 ? 52 : 80;
    
    Animated.spring(pillWidth, {
      toValue: targetPillWidth,
      tension: 100,
      friction: 8,
      useNativeDriver: false,
    }).start();

    // 2. Back button expansion animation
    const showBack = currentStep > 1;
    Animated.parallel([
      Animated.spring(backBtnWidth, {
        toValue: showBack ? 90 : 0,
        tension: 120,
        friction: 8,
        useNativeDriver: false,
      }),
      Animated.timing(backBtnOpacity, {
        toValue: showBack ? 1 : 0,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: false,
      }),
    ]).start();

    // 3. Check icon pop on step 3
    if (currentStep === totalSteps) {
      Animated.spring(checkScale, {
        toValue: 1,
        tension: 150,
        friction: 5,
        useNativeDriver: true,
      }).start();
    } else {
      checkScale.setValue(0);
    }
  }, [currentStep, totalSteps, pillWidth, backBtnWidth, backBtnOpacity, checkScale]);

  const handleNext = () => {
    if (currentStep === totalSteps) {
      onFinish?.();
    } else {
      onContinue();
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Dynamic Top Progress Indicator */}
      <View style={styles.trackContainer}>
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((dot) => (
          <View
            key={dot}
            style={[
              styles.dotBg,
              dot <= currentStep && styles.dotBgPassed,
            ]}
          />
        ))}

        {/* Spring Animated Pill Overlay */}
        <Animated.View
          style={[
            styles.activePillOverlay,
            { width: pillWidth },
          ]}
        />
      </View>

      {/* 2. Dynamic Morphing Buttons */}
      <View style={styles.buttonRow}>
        {/* Animated Back Button */}
        <Animated.View
          style={[
            styles.backButtonWrapper,
            {
              width: backBtnWidth,
              opacity: backBtnOpacity,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.btnBack}
            onPress={onBack}
          >
            <Text style={styles.btnBackText}>{backText}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Continue / Finish Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.btnContinue,
            currentStep === totalSteps && styles.btnFinish,
          ]}
          onPress={handleNext}
        >
          {currentStep === totalSteps && (
            <Animated.View style={{ transform: [{ scale: checkScale }] }}>
              <Check width={18} height={18} color="#FFFFFF" strokeWidth={2.5} />
            </Animated.View>
          )}
          <Text style={styles.btnContinueText}>
            {currentStep === totalSteps ? finishText : continueText}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    gap: 24,
  },
  trackContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  dotBg: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
    zIndex: 2,
  },
  dotBgPassed: {
    backgroundColor: '#FFFFFF',
  },
  activePillOverlay: {
    position: 'absolute',
    left: 2,
    top: '50%',
    transform: [{ translateY: -8 }],
    height: 16,
    backgroundColor: colors.primary, // #0F6B3A
    borderRadius: 8,
    zIndex: 1,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  backButtonWrapper: {
    overflow: 'hidden',
    height: 56,
  },
  btnBack: {
    flex: 1,
    height: 56,
    backgroundColor: '#E2E8F0',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnBackText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  btnContinue: {
    flex: 1,
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  btnFinish: {
    backgroundColor: colors.text, // #101A24
    shadowColor: '#000000',
  },
  btnContinueText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
