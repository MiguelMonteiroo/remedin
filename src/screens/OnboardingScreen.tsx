import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Heart,
  Sparks,
  Lock,
  ShieldAlert,
  CheckCircle,
  Hospital,
} from 'iconoir-react-native';
import { StepProgressIndicator } from '../components/StepProgressIndicator';
import { colors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StepData {
  bg: string;
  title: string;
  highlightText: string;
  subtitle: string;
  badgeLText: string;
  badgeLIcon: React.ReactNode;
  badgeRIcon: React.ReactNode;
  tilt: number;
}

const STEPS: StepData[] = [
  {
    bg: '#101A24', // Navy Deep
    title: 'Seu parceiro de',
    highlightText: 'saúde.',
    subtitle: 'Lembretes pontuais. Sem conta. Sem nuvem.',
    badgeLText: 'Saúde',
    badgeLIcon: <Heart width={18} height={18} color={colors.primary} strokeWidth={2.5} />,
    badgeRIcon: <Sparks width={18} height={18} color="#6ECB98" strokeWidth={2.5} />,
    tilt: -6,
  },
  {
    bg: '#0F6B3A', // Verde Botânico
    title: '100% no seu',
    highlightText: 'aparelho.',
    subtitle: 'Seus dados de saúde não saem do seu bolso.',
    badgeLText: 'Privado',
    badgeLIcon: <Lock width={18} height={18} color={colors.primary} strokeWidth={2.5} />,
    badgeRIcon: <ShieldAlert width={18} height={18} color="#E99A75" strokeWidth={2.5} />,
    tilt: 5,
  },
  {
    bg: '#F8F4EB', // Creme Quente (paleta real da Home)
    title: 'Pronto para',
    highlightText: 'começar?',
    subtitle: 'Cadastre seu primeiro remédio em 30 segundos.',
    badgeLText: 'Pronto',
    badgeLIcon: <CheckCircle width={18} height={18} color="#101A24" strokeWidth={2.5} />,
    badgeRIcon: <Hospital width={18} height={18} color="#60A5FA" strokeWidth={2.5} />,
    tilt: 0,
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const currentData = STEPS[currentStep - 1];

  // Animação de rotação da mascote e transição de opacidade
  const mascotRotation = useRef(new Animated.Value(STEPS[0].tilt)).current;
  const contentFade = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Loop de flutuação suave
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

  // Transição entre steps
  const animateStepTransition = (nextStepNumber: number) => {
    Animated.timing(contentFade, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep(nextStepNumber);
      const targetTilt = STEPS[nextStepNumber - 1].tilt;

      Animated.parallel([
        Animated.spring(mascotRotation, {
          toValue: targetTilt,
          tension: 100,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(contentFade, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleContinue = () => {
    if (currentStep < STEPS.length) {
      animateStepTransition(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      animateStepTransition(currentStep - 1);
    }
  };

  const isLightStep = currentStep === 3;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentData.bg }]}>
      <StatusBar
        barStyle={isLightStep ? 'dark-content' : 'light-content'}
        backgroundColor={currentData.bg}
      />

      {/* 1. Header com Skip */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onComplete}
          style={styles.skipButton}
        >
          <Text style={[styles.skipText, isLightStep && styles.skipTextLight]}>
            Pular
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2. Hero Mascot Protagonista (270px) */}
      <View style={styles.heroSection}>
        <Animated.View
          style={[
            styles.mascotContainer,
            {
              transform: [
                { translateY: floatAnim },
                {
                  rotate: mascotRotation.interpolate({
                    inputRange: [-10, 10],
                    outputRange: ['-10deg', '10deg'],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Badge Esquerda */}
          <Animated.View
            style={[
              styles.badge,
              styles.badgeLeft,
              { opacity: contentFade },
            ]}
          >
            {currentData.badgeLIcon}
            <Text style={styles.badgeText}>{currentData.badgeLText}</Text>
          </Animated.View>

          {/* Badge Direita */}
          <Animated.View
            style={[
              styles.badge,
              styles.badgeRight,
              { opacity: contentFade },
            ]}
          >
            {currentData.badgeRIcon}
          </Animated.View>

          <Image
            source={require('../../assets/mascot-canonical.jpg')}
            style={styles.mascotImage}
            resizeMode="cover"
          />
        </Animated.View>
      </View>

      {/* 3. Bottom Sheet de Conteúdo e Controles */}
      <View style={[styles.bottomSheet, isLightStep && styles.bottomSheetLight]}>
        <Animated.View style={[styles.copyContainer, { opacity: contentFade }]}>
          <Text style={[styles.title, isLightStep && styles.titleLight]}>
            {currentData.title}{' '}
            <Text style={isLightStep ? styles.highlightLight : styles.highlight}>
              {currentData.highlightText}
            </Text>
          </Text>
          <Text style={[styles.subtitle, isLightStep && styles.subtitleLight]}>
            {currentData.subtitle}
          </Text>
        </Animated.View>

        {/* Step Indicator com botões acoplados */}
        <StepProgressIndicator
          currentStep={currentStep}
          totalSteps={STEPS.length}
          onContinue={handleContinue}
          onBack={handleBack}
          onFinish={onComplete}
          finishText="Começar Agora"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    height: 44,
  },
  headerSpacer: {
    width: 50,
  },
  skipButton: {
    padding: 6,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  skipTextLight: {
    color: colors.text,
  },
  heroSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotContainer: {
    width: 260,
    height: 260,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotImage: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
  badge: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  badgeLeft: {
    bottom: -10,
    left: -15,
  },
  badgeRight: {
    top: 10,
    right: -15,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#101A24',
  },
  bottomSheet: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    gap: 20,
  },
  bottomSheetLight: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 8,
  },
  copyContainer: {
    alignItems: 'center',
    minHeight: 90,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 32,
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  titleLight: {
    color: colors.text,
  },
  highlight: {
    color: '#6ECB98',
  },
  highlightLight: {
    color: colors.primary,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  subtitleLight: {
    color: colors.textMuted,
  },
});
