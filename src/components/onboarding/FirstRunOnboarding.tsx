import { useCallback, useRef, useState } from "react";
import { Animated } from "react-native";
import { useAppData } from "../../services/appDataProvider";
import { motionDurations, motionEasings } from "../../theme/motion";
import type { ProfileAvatar } from "../../types/domain";
import { useReducedMotion } from "../../utils/useReducedMotion";
import { validateProfileName } from "../../utils/validation";
import { OnboardingGuide } from "./OnboardingGuide";
import { OnboardingSetupScreen } from "./OnboardingSetupScreen";
import { OnboardingWelcome } from "./OnboardingWelcome";
import type { OnboardingStep } from "./onboardingTypes";
import { useOnboardingPermissions } from "./useOnboardingPermissions";

export type { OnboardingStep } from "./onboardingTypes";

export function FirstRunOnboarding({
  initialStep,
  onPreviewFinish,
}: {
  initialStep?: OnboardingStep;
  onPreviewFinish?: () => void;
} = {}) {
  const reduceMotion = useReducedMotion();
  const {
    completeOnboarding,
    settings,
    updateProfile,
  } = useAppData();

  const initialName = settings.userName.trim();
  const [step, setStep] = useState<OnboardingStep>(
    initialStep ?? (initialName ? "guide" : "welcome")
  );
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState<ProfileAvatar | undefined>(settings.profileAvatar);
  const [nameError, setNameError] = useState("");
  const [confirmSkipVisible, setConfirmSkipVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateToStep = useCallback((nextStep: OnboardingStep) => {
    if (reduceMotion) {
      setStep(nextStep);
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
      return;
    }
    fadeAnim.setValue(0);
    slideAnim.setValue(10);
    setStep(nextStep);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: motionDurations.normal,
        easing: motionEasings.enter,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: motionDurations.normal,
        easing: motionEasings.enter,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, reduceMotion, slideAnim]);

  const {
    transitionToStep,
    permissionMessage,
    dndConfigured,
    batteryConfigured,
    requestBasicNotifications,
    requestExactAlarms,
    requestFullScreenAlarm,
    requestDoNotDisturbAccess,
    requestBatteryAccess,
    disableNotifications,
    skipFullScreen,
  } = useOnboardingPermissions(step, animateToStep, setBusy);

  async function finishOnboarding() {
    if (onPreviewFinish) {
      onPreviewFinish();
      return;
    }
    setBusy(true);
    try {
      await completeOnboarding(name.trim());
    } finally {
      setBusy(false);
    }
  }

  async function continueFromProfile() {
    const error = validateProfileName(name);
    if (error) {
      setNameError(error);
      return;
    }
    setNameError("");
    setBusy(true);
    try {
      if (!onPreviewFinish) await updateProfile(name, avatar);
      transitionToStep("guide");
    } catch {
      setNameError("Não foi possível salvar seu perfil. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  async function skipBasicNotifications() {
    setConfirmSkipVisible(false);
    if (onPreviewFinish) {
      onPreviewFinish();
      return;
    }
    setBusy(true);
    try {
      await disableNotifications();
      await finishOnboarding();
    } finally {
      setBusy(false);
    }
  }

  function handleBack() {
    if (busy) return;
    if (step === "profile") transitionToStep("welcome");
    else if (step === "notifications") transitionToStep("guide");
    else if (step === "exact") transitionToStep("notifications");
    else if (step === "fullScreen") transitionToStep("exact");
    else if (step === "ready") transitionToStep("fullScreen");
  }

  function handlePrimaryAction() {
    if (busy) return;
    if (step === "profile") continueFromProfile();
    else if (step === "notifications") requestBasicNotifications();
    else if (step === "exact") requestExactAlarms();
    else if (step === "fullScreen") requestFullScreenAlarm();
    else finishOnboarding();
  }

  function handleSkip() {
    if (step === "notifications") setConfirmSkipVisible(true);
    else if (step === "exact") transitionToStep("fullScreen");
    else if (step === "fullScreen") skipFullScreen();
  }

  if (step === "welcome") {
    return <OnboardingWelcome onContinue={() => transitionToStep("profile")} />;
  }

  if (step === "guide") {
    return (
      <OnboardingGuide
        busy={busy}
        confirmSkipVisible={confirmSkipVisible}
        fadeAnim={fadeAnim}
        name={name}
        onCancelSkip={() => setConfirmSkipVisible(false)}
        onConfirmSkip={skipBasicNotifications}
        onContinue={() => transitionToStep("notifications")}
        onRequestSkip={() => setConfirmSkipVisible(true)}
        slideAnim={slideAnim}
      />
    );
  }

  return (
    <OnboardingSetupScreen
      avatar={avatar}
      batteryConfigured={batteryConfigured}
      busy={busy}
      confirmSkipVisible={confirmSkipVisible}
      dndConfigured={dndConfigured}
      fadeAnim={fadeAnim}
      name={name}
      nameError={nameError}
      onAvatarChange={setAvatar}
      onBack={handleBack}
      onCancelSkip={() => setConfirmSkipVisible(false)}
      onConfigureBattery={requestBatteryAccess}
      onConfigureDnd={requestDoNotDisturbAccess}
      onConfirmSkip={skipBasicNotifications}
      onContinue={handlePrimaryAction}
      onNameChange={(value) => {
        setName(value);
        if (nameError) setNameError("");
      }}
      onSkip={handleSkip}
      permissionMessage={permissionMessage}
      slideAnim={slideAnim}
      step={step}
    />
  );
}
