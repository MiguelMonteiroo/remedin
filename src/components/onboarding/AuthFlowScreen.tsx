import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react-native";
import {
  GoogleLogoIcon,
  RemedinCapsuleSymbol,
  RemedinHorizontalSignature,
} from "../brand/RemedinBrand";
import { GoogleAccountSheet } from "./GoogleAccountSheet";
import { AppText } from "../ui/AppText";
import { useAppData } from "../../services/appDataProvider";
import { useAppTheme } from "../../theme/ThemeProvider";
import { motionDurations, motionEasings } from "../../theme/motion";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import type { ThemeColors } from "../../theme/theme";
import { fontFamilies } from "../../theme/typography";
import { useReducedMotion } from "../../utils/useReducedMotion";
import {
  validateEmail,
  validatePassword,
  validateProfileName,
} from "../../utils/validation";

export type AuthMode = "welcome" | "signUp" | "signIn";

const CORAL_HEADER_BG = "#A44945";
const CORAL_HEADER_FG = "#FFFFFF";

export function AuthFlowScreen({
  initialMode = "welcome",
}: {
  initialMode?: AuthMode;
}) {
  const { name: themeName, colors } = useAppTheme();
  const styles = createStyles(colors);
  const reduceMotion = useReducedMotion();
  const {
    savedAccounts,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    resetAccountPassword,
  } = useAppData();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [statusNotice, setStatusNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleSheetVisible, setGoogleSheetVisible] = useState(false);

  const stageOpacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const stageTranslateY = useRef(
    new Animated.Value(reduceMotion ? 0 : 12)
  ).current;

  useEffect(() => {
    if (reduceMotion) {
      stageOpacity.setValue(1);
      stageTranslateY.setValue(0);
      return;
    }

    stageOpacity.setValue(0);
    stageTranslateY.setValue(12);
    Animated.parallel([
      Animated.timing(stageOpacity, {
        toValue: 1,
        duration: motionDurations.normal,
        easing: motionEasings.enter,
        useNativeDriver: true,
      }),
      Animated.timing(stageTranslateY, {
        toValue: 0,
        duration: motionDurations.normal,
        easing: motionEasings.enter,
        useNativeDriver: true,
      }),
    ]).start();
  }, [mode, reduceMotion, stageOpacity, stageTranslateY]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (mode !== "welcome") {
          switchMode("welcome");
          return true;
        }
        return false;
      }
    );
    return () => subscription.remove();
  }, [mode]);

  function switchMode(nextMode: AuthMode) {
    setError("");
    setStatusNotice("");
    setResettingPassword(false);
    setShowPassword(false);
    setMode(nextMode);
  }

  async function handleSignUpSubmit() {
    if (busy) return;
    const nameError = validateProfileName(name);
    if (nameError) {
      setError(nameError);
      return;
    }
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setBusy(true);
    setError("");
    try {
      await signUpWithEmail(name, email, password);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível criar sua conta agora."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleSignInSubmit() {
    if (busy) return;
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setBusy(true);
    setError("");
    setStatusNotice("");
    try {
      if (resettingPassword) {
        await resetAccountPassword(email, password);
        setResettingPassword(false);
        setStatusNotice("Sua nova senha foi salva. Agora você já pode entrar.");
        return;
      }
      await signInWithEmail(email, password);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível entrar na sua conta."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleSelect(selectedName: string, selectedEmail: string) {
    setBusy(true);
    setError("");
    try {
      await signInWithGoogle(selectedName, selectedEmail);
      setGoogleSheetVisible(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível continuar com o Google."
      );
    } finally {
      setBusy(false);
    }
  }

  if (mode === "welcome") {
    const signatureColor = themeName === "dark" ? "#FFFFFF" : colors.primary;
    const symbolColor = themeName === "dark" ? colors.primary : "#A44945";

    return (
      <SafeAreaView
        style={[styles.welcomeScreen, { backgroundColor: colors.background }]}
      >
        <StatusBar
          barStyle={themeName === "dark" ? "light-content" : "dark-content"}
          backgroundColor={colors.background}
        />

        <Animated.View
          style={[
            styles.welcomeContainer,
            {
              opacity: stageOpacity,
              transform: [{ translateY: stageTranslateY }],
            },
          ]}
        >
          {/* 1. Topo com Assinatura Oficial */}
          <View style={styles.welcomeHeader}>
            <RemedinHorizontalSignature
              color={signatureColor}
              fontSize={26}
              symbolSize={34}
            />
          </View>

          {/* 2. Palco Central Minimalista Editorial */}
          <View style={styles.editorialStage}>
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={styles.outerRing}
            >
              <View style={styles.innerPedestal}>
                <RemedinCapsuleSymbol color={symbolColor} size={92} />
              </View>
            </View>

            <AppText
              accessibilityRole="header"
              variant="display"
              style={styles.welcomeTitle}
            >
              Seu cuidado no tempo certo.
            </AppText>
            <AppText muted style={styles.welcomeSubtitle}>
              Organize seus medicamentos e receba alarmes confiáveis todos os dias.
            </AppText>
          </View>

          {/* 3. Base com 3 Pílulas de Pesos Visuais Diferentes (Q6-B) */}
          <View style={styles.welcomeActions}>
            <Pressable
              accessibilityLabel="Continuar com o Google"
              accessibilityRole="button"
              disabled={busy}
              onPress={() => setGoogleSheetVisible(true)}
              style={({ pressed }) => [
                styles.pillButton,
                styles.googlePillButton,
                pressed && styles.pressed,
              ]}
            >
              <GoogleLogoIcon size={22} />
              <AppText weight="bold" style={styles.googlePillText}>
                Continuar com o Google
              </AppText>
            </Pressable>

            <Pressable
              accessibilityLabel="Criar uma conta"
              accessibilityRole="button"
              disabled={busy}
              onPress={() => switchMode("signUp")}
              style={({ pressed }) => [
                styles.pillButton,
                styles.primaryPillButton,
                pressed && styles.pressed,
              ]}
            >
              <AppText weight="bold" style={styles.primaryPillText}>
                Criar uma conta
              </AppText>
            </Pressable>

            <Pressable
              accessibilityLabel="Entrar com minha conta"
              accessibilityRole="button"
              disabled={busy}
              onPress={() => switchMode("signIn")}
              style={({ pressed }) => [
                styles.pillButton,
                styles.outlinePillButton,
                pressed && styles.pressed,
              ]}
            >
              <AppText weight="bold" style={styles.outlinePillText}>
                Entrar com minha conta
              </AppText>
            </Pressable>

            <View style={styles.trustFootnote}>
              <ShieldCheck color={colors.primaryMuted} size={18} />
              <AppText variant="caption" muted style={styles.trustText}>
                Alarmes funcionam mesmo sem internet.
              </AppText>
            </View>
          </View>
        </Animated.View>

        <GoogleAccountSheet
          busy={busy}
          initialEmail={email}
          initialName={name}
          onClose={() => setGoogleSheetVisible(false)}
          onSelectAccount={handleGoogleSelect}
          savedAccounts={savedAccounts}
          visible={googleSheetVisible}
        />
      </SafeAreaView>
    );
  }

  const isSignUp = mode === "signUp";

  return (
    <View style={styles.authScreen}>
      <StatusBar barStyle="light-content" backgroundColor={CORAL_HEADER_BG} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardArea}
      >
        {/* 1. Cabeçalho Coral com Formas Curvas da Cápsula (Q4-A) */}
        <SafeAreaView edges={["top"]} style={styles.coralHeader}>
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={styles.decorativeOrbLeft}
          />
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={styles.decorativeOrbRight}
          />

          <View style={styles.coralTopBar}>
            <Pressable
              accessibilityLabel="Voltar para opções de entrada"
              accessibilityRole="button"
              disabled={busy}
              onPress={() => switchMode("welcome")}
              style={({ pressed }) => [
                styles.backCircleButton,
                pressed && styles.pressed,
              ]}
            >
              <ArrowLeft color={CORAL_HEADER_FG} size={22} />
            </Pressable>

            <RemedinHorizontalSignature
              color={CORAL_HEADER_FG}
              fontSize={22}
              symbolSize={28}
            />

            <View style={styles.topBarSpacer} />
          </View>

          <View style={styles.coralHeroCopy}>
            <AppText
              accessibilityRole="header"
              variant="title"
              style={styles.coralHeaderTitle}
            >
              {isSignUp
                ? "Criar sua conta"
                : resettingPassword
                  ? "Redefinir sua senha"
                  : "Entrar na sua conta"}
            </AppText>
            <AppText variant="small" style={styles.coralHeaderSubtitle}>
              {isSignUp
                ? "Personalize sua rotina de cuidados no Remedin."
                : resettingPassword
                  ? "Informe seu e-mail e escolha uma nova senha de acesso."
                  : "Acesse seus medicamentos e lembretes salvos."}
            </AppText>
          </View>
        </SafeAreaView>

        {/* 2. Folha Inferior Arredondada com Campos Amplos (Q4-A) */}
        <Animated.View
          style={[
            styles.roundedSheet,
            {
              opacity: stageOpacity,
              transform: [{ translateY: stageTranslateY }],
            },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.sheetScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Botão Google no topo da folha */}
            <Pressable
              accessibilityLabel="Continuar com o Google"
              accessibilityRole="button"
              disabled={busy}
              onPress={() => setGoogleSheetVisible(true)}
              style={({ pressed }) => [
                styles.sheetGoogleButton,
                pressed && styles.pressed,
              ]}
            >
              <GoogleLogoIcon size={22} />
              <AppText weight="bold" style={styles.sheetGoogleText}>
                Continuar com o Google
              </AppText>
            </Pressable>

            {/* Divisor "ou" */}
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={styles.dividerRow}
            >
              <View style={styles.dividerLine} />
              <AppText variant="caption" muted style={styles.dividerLabel}>
                ou continue com e-mail
              </AppText>
              <View style={styles.dividerLine} />
            </View>

            {/* Campo Nome (apenas em Criar Conta) */}
            {isSignUp ? (
              <View style={styles.fieldGroup}>
                <AppText
                  variant="small"
                  weight="semibold"
                  style={styles.inputLabel}
                >
                  Como podemos chamar você?
                </AppText>
                <TextInput
                  accessibilityLabel="Como podemos chamar você"
                  autoCapitalize="words"
                  autoComplete="name"
                  editable={!busy}
                  onChangeText={(value) => {
                    setName(value);
                    if (error) setError("");
                  }}
                  placeholder="Digite seu nome"
                  placeholderTextColor={colors.textMuted}
                  returnKeyType="next"
                  style={styles.input}
                  value={name}
                />
              </View>
            ) : null}

            {/* Campo E-mail */}
            <View style={styles.fieldGroup}>
              <AppText
                variant="small"
                weight="semibold"
                style={styles.inputLabel}
              >
                Seu e-mail
              </AppText>
              <TextInput
                accessibilityLabel="Seu e-mail"
                autoCapitalize="none"
                autoComplete="email"
                editable={!busy}
                keyboardType="email-address"
                onChangeText={(value) => {
                  setEmail(value);
                  if (error) setError("");
                }}
                placeholder="nome@email.com"
                placeholderTextColor={colors.textMuted}
                returnKeyType="next"
                style={styles.input}
                value={email}
              />
            </View>

            {/* Campo Senha com botão grande de mostrar/ocultar */}
            <View style={styles.fieldGroup}>
              <AppText
                variant="small"
                weight="semibold"
                style={styles.inputLabel}
              >
                {isSignUp
                  ? "Crie uma senha"
                  : resettingPassword
                    ? "Nova senha (mínimo 6 caracteres)"
                    : "Sua senha"}
              </AppText>
              <View style={styles.passwordContainer}>
                <TextInput
                  accessibilityLabel={
                    isSignUp
                      ? "Crie uma senha"
                      : resettingPassword
                        ? "Nova senha"
                        : "Sua senha"
                  }
                  autoCapitalize="none"
                  editable={!busy}
                  onChangeText={(value) => {
                    setPassword(value);
                    if (error) setError("");
                  }}
                  placeholder="Mínimo de 6 caracteres"
                  placeholderTextColor={colors.textMuted}
                  returnKeyType="done"
                  secureTextEntry={!showPassword}
                  style={styles.passwordInput}
                  value={password}
                />
                <Pressable
                  accessibilityLabel={
                    showPassword ? "Ocultar senha" : "Mostrar senha"
                  }
                  accessibilityRole="button"
                  onPress={() => setShowPassword((current) => !current)}
                  style={({ pressed }) => [
                    styles.eyeButton,
                    pressed && styles.pressed,
                  ]}
                >
                  {showPassword ? (
                    <EyeOff color={colors.text} size={22} />
                  ) : (
                    <Eye color={colors.text} size={22} />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Atalho Esqueci minha senha em Entrar */}
            {!isSignUp ? (
              <View style={styles.forgotRow}>
                <Pressable
                  accessibilityLabel={
                    resettingPassword
                      ? "Cancelar redefinição de senha"
                      : "Esqueci minha senha"
                  }
                  accessibilityRole="button"
                  disabled={busy}
                  onPress={() => {
                    setResettingPassword((current) => !current);
                    setError("");
                    setStatusNotice("");
                  }}
                  style={({ pressed }) => [
                    styles.forgotButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <AppText
                    variant="small"
                    weight="semibold"
                    style={styles.forgotText}
                  >
                    {resettingPassword
                      ? "Voltar para login normal"
                      : "Esqueci minha senha"}
                  </AppText>
                </Pressable>
              </View>
            ) : null}

            {/* Mensagens de erro ou confirmação */}
            {error ? (
              <AppText
                accessibilityLiveRegion="assertive"
                accessibilityRole="alert"
                variant="small"
                style={styles.errorBanner}
              >
                {error}
              </AppText>
            ) : null}

            {statusNotice ? (
              <AppText
                accessibilityLiveRegion="polite"
                variant="small"
                style={styles.noticeBanner}
              >
                {statusNotice}
              </AppText>
            ) : null}

            {/* Botão Principal em Pílula */}
            <Pressable
              accessibilityLabel={
                isSignUp
                  ? "Criar conta"
                  : resettingPassword
                    ? "Salvar nova senha"
                    : "Entrar"
              }
              accessibilityRole="button"
              disabled={busy}
              onPress={isSignUp ? handleSignUpSubmit : handleSignInSubmit}
              style={({ pressed }) => [
                styles.pillButton,
                styles.primaryPillButton,
                styles.submitPillButton,
                pressed && styles.pressed,
              ]}
            >
              <AppText weight="bold" style={styles.primaryPillText}>
                {busy
                  ? "Aguarde..."
                  : isSignUp
                    ? "Criar conta"
                    : resettingPassword
                      ? "Salvar nova senha"
                      : "Entrar"}
              </AppText>
            </Pressable>

            {/* Link de alternância entre Criar Conta e Entrar */}
            <Pressable
              accessibilityLabel={
                isSignUp
                  ? "Já tem uma conta? Entrar"
                  : "Ainda não tem conta? Criar conta"
              }
              accessibilityRole="button"
              disabled={busy}
              onPress={() => switchMode(isSignUp ? "signIn" : "signUp")}
              style={({ pressed }) => [
                styles.switchModeRow,
                pressed && styles.pressed,
              ]}
            >
              <AppText variant="small" muted style={styles.switchModeMuted}>
                {isSignUp ? "Já tem uma conta? " : "Ainda não tem conta? "}
              </AppText>
              <AppText
                variant="small"
                weight="bold"
                style={styles.switchModeAction}
              >
                {isSignUp ? "Entrar" : "Criar conta"}
              </AppText>
            </Pressable>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>

      <GoogleAccountSheet
        busy={busy}
        initialEmail={email}
        initialName={name}
        onClose={() => setGoogleSheetVisible(false)}
        onSelectAccount={handleGoogleSelect}
        savedAccounts={savedAccounts}
        visible={googleSheetVisible}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    welcomeScreen: {
      flex: 1,
    },
    welcomeContainer: {
      flex: 1,
      justifyContent: "space-between",
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xl,
    },
    welcomeHeader: {
      alignItems: "center",
      paddingTop: spacing.xs,
    },
    editorialStage: {
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.sm,
    },
    outerRing: {
      width: 196,
      height: 196,
      borderRadius: 98,
      borderWidth: 1,
      borderColor: colors.primaryBorder,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.xl,
    },
    innerPedestal: {
      width: 156,
      height: 156,
      borderRadius: 78,
      backgroundColor: colors.primarySoft,
      alignItems: "center",
      justifyContent: "center",
    },
    welcomeTitle: {
      color: colors.text,
      textAlign: "center",
      marginBottom: spacing.sm,
    },
    welcomeSubtitle: {
      color: colors.textMuted,
      textAlign: "center",
      maxWidth: 320,
    },
    welcomeActions: {
      gap: spacing.md,
    },
    pillButton: {
      minHeight: 56,
      borderRadius: radii.pill,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.xl,
      gap: spacing.md,
    },
    googlePillButton: {
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.borderStrong,
    },
    googlePillText: {
      color: colors.text,
    },
    primaryPillButton: {
      backgroundColor: colors.primary,
    },
    primaryPillText: {
      color: colors.onPrimary,
    },
    outlinePillButton: {
      backgroundColor: "transparent",
      borderWidth: 1.5,
      borderColor: colors.controlBorder,
    },
    outlinePillText: {
      color: colors.primaryDark,
    },
    trustFootnote: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    trustText: {
      color: colors.textMuted,
    },
    authScreen: {
      flex: 1,
      backgroundColor: CORAL_HEADER_BG,
    },
    keyboardArea: {
      flex: 1,
    },
    coralHeader: {
      backgroundColor: CORAL_HEADER_BG,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xl,
      overflow: "hidden",
      position: "relative",
    },
    decorativeOrbLeft: {
      position: "absolute",
      bottom: -48,
      left: -36,
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: "rgba(255, 225, 220, 0.14)",
    },
    decorativeOrbRight: {
      position: "absolute",
      top: -28,
      right: -36,
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: "rgba(111, 52, 53, 0.35)",
    },
    coralTopBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.lg,
    },
    backCircleButton: {
      width: 48,
      height: 48,
      borderRadius: radii.pill,
      backgroundColor: "rgba(255, 255, 255, 0.16)",
      alignItems: "center",
      justifyContent: "center",
    },
    topBarSpacer: {
      width: 48,
    },
    coralHeroCopy: {
      alignItems: "center",
      paddingHorizontal: spacing.sm,
    },
    coralHeaderTitle: {
      color: CORAL_HEADER_FG,
      textAlign: "center",
    },
    coralHeaderSubtitle: {
      color: CORAL_HEADER_FG,
      textAlign: "center",
      marginTop: spacing.xs,
    },
    roundedSheet: {
      flex: 1,
      backgroundColor: colors.surface,
      borderTopLeftRadius: radii.xl,
      borderTopRightRadius: radii.xl,
      overflow: "hidden",
    },
    sheetScrollContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
      paddingBottom: spacing.xxl,
    },
    sheetGoogleButton: {
      minHeight: 54,
      borderRadius: radii.pill,
      backgroundColor: colors.background,
      borderWidth: 1.5,
      borderColor: colors.borderStrong,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    sheetGoogleText: {
      color: colors.text,
    },
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: spacing.lg,
      gap: spacing.md,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerLabel: {
      color: colors.textMuted,
    },
    fieldGroup: {
      marginBottom: spacing.md,
    },
    inputLabel: {
      color: colors.text,
      marginBottom: spacing.xs,
    },
    input: {
      backgroundColor: colors.background,
      borderColor: colors.controlBorder,
      borderRadius: radii.md,
      borderWidth: 1,
      color: colors.text,
      fontFamily: fontFamilies.regular,
      fontSize: 18,
      minHeight: 54,
      paddingHorizontal: spacing.lg,
    },
    passwordContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderColor: colors.controlBorder,
      borderRadius: radii.md,
      borderWidth: 1,
      minHeight: 54,
      paddingLeft: spacing.lg,
      paddingRight: spacing.xs,
    },
    passwordInput: {
      flex: 1,
      color: colors.text,
      fontFamily: fontFamilies.regular,
      fontSize: 18,
      minHeight: 52,
    },
    eyeButton: {
      width: 48,
      height: 48,
      borderRadius: radii.pill,
      alignItems: "center",
      justifyContent: "center",
    },
    forgotRow: {
      alignItems: "flex-end",
      marginBottom: spacing.sm,
    },
    forgotButton: {
      minHeight: 44,
      justifyContent: "center",
      paddingHorizontal: spacing.xs,
    },
    forgotText: {
      color: colors.primaryDark,
    },
    errorBanner: {
      backgroundColor: colors.dangerSoft,
      borderColor: colors.dangerBorder,
      borderWidth: 1,
      borderRadius: radii.md,
      color: colors.danger,
      marginTop: spacing.xs,
      marginBottom: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    noticeBanner: {
      backgroundColor: colors.successSoft,
      borderColor: colors.successBorder,
      borderWidth: 1,
      borderRadius: radii.md,
      color: colors.success,
      marginTop: spacing.xs,
      marginBottom: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    submitPillButton: {
      marginTop: spacing.md,
    },
    switchModeRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 48,
      marginTop: spacing.lg,
    },
    switchModeMuted: {
      color: colors.textMuted,
    },
    switchModeAction: {
      color: colors.primaryDark,
      textDecorationLine: "underline",
    },
    pressed: {
      opacity: 0.78,
    },
  });
