import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Check, Plus, X } from "lucide-react-native";
import { GoogleLogoIcon } from "../brand/RemedinBrand";
import { AppButton } from "../ui/AppButton";
import { AppText } from "../ui/AppText";
import { useAppTheme } from "../../theme/ThemeProvider";
import type { ThemeColors } from "../../theme/theme";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { fontFamilies } from "../../theme/typography";
import type { StoredUserCredential } from "../../types/domain";
import { validateEmail, validateProfileName } from "../../utils/validation";

type Props = {
  visible: boolean;
  savedAccounts: StoredUserCredential[];
  busy?: boolean;
  initialName?: string;
  initialEmail?: string;
  onClose: () => void;
  onSelectAccount: (name: string, email: string) => Promise<void> | void;
};

export function GoogleAccountSheet({
  visible,
  savedAccounts,
  busy = false,
  initialName = "",
  initialEmail = "",
  onClose,
  onSelectAccount,
}: Props) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [addingCustom, setAddingCustom] = useState(savedAccounts.length === 0);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!visible) return;
    setAddingCustom(savedAccounts.length === 0);
    setName(initialName);
    setEmail(initialEmail);
    setError("");
  }, [initialEmail, initialName, savedAccounts.length, visible]);

  async function handleConfirmCustom() {
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
    setError("");
    await onSelectAccount(name.trim(), email.trim().toLowerCase());
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.backdrop}
      >
        <View
          accessibilityViewIsModal
          style={styles.sheet}
        >
          <View style={styles.handleBar} />

          <View style={styles.headerRow}>
            <View style={styles.googleBadge}>
              <GoogleLogoIcon size={24} />
            </View>
            <View style={styles.headerCopy}>
              <AppText
                accessibilityRole="header"
                variant="heading"
                style={styles.title}
              >
                Continuar com o Google
              </AppText>
              <AppText variant="small" muted style={styles.subtitle}>
                Escolha uma conta para personalizar seu cuidado no Remedin.
              </AppText>
            </View>
            <Pressable
              accessibilityLabel="Fechar seleção de conta Google"
              accessibilityRole="button"
              disabled={busy}
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.pressed,
              ]}
            >
              <X color={colors.text} size={22} />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.scrollArea}
          >
            {savedAccounts.length > 0 && !addingCustom ? (
              <View style={styles.accountList}>
                {savedAccounts.map((account) => {
                  const initial =
                    account.name.trim().charAt(0).toUpperCase() || "G";
                  return (
                    <Pressable
                      key={account.email}
                      accessibilityLabel={`Entrar como ${account.name}, ${account.email}`}
                      accessibilityRole="button"
                      disabled={busy}
                      onPress={() => onSelectAccount(account.name, account.email)}
                      style={({ pressed }) => [
                        styles.accountRow,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.avatar}>
                        <AppText weight="bold" style={styles.avatarText}>
                          {initial}
                        </AppText>
                      </View>
                      <View style={styles.accountInfo}>
                        <AppText
                          variant="subheading"
                          weight="semibold"
                          style={styles.accountName}
                        >
                          {account.name}
                        </AppText>
                        <AppText
                          variant="small"
                          muted
                          style={styles.accountEmail}
                        >
                          {account.email}
                        </AppText>
                      </View>
                      <Check color={colors.primary} size={22} />
                    </Pressable>
                  );
                })}

                <Pressable
                  accessibilityLabel="Usar outra conta Google"
                  accessibilityRole="button"
                  disabled={busy}
                  onPress={() => {
                    setAddingCustom(true);
                    setError("");
                  }}
                  style={({ pressed }) => [
                    styles.anotherAccountRow,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.anotherIcon}>
                    <Plus color={colors.primaryDark} size={20} />
                  </View>
                  <AppText
                    variant="small"
                    weight="semibold"
                    style={styles.anotherText}
                  >
                    Usar outra conta Google
                  </AppText>
                </Pressable>
              </View>
            ) : (
              <View style={styles.formBlock}>
                <AppText
                  variant="small"
                  weight="semibold"
                  style={styles.fieldLabel}
                >
                  Como podemos chamar você?
                </AppText>
                <TextInput
                  accessibilityLabel="Nome da conta Google"
                  autoCapitalize="words"
                  autoComplete="name"
                  editable={!busy}
                  onChangeText={(value) => {
                    setName(value);
                    if (error) setError("");
                  }}
                  placeholder="Ex: Maria Helena"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  value={name}
                />

                <AppText
                  variant="small"
                  weight="semibold"
                  style={styles.fieldLabel}
                >
                  E-mail do Google
                </AppText>
                <TextInput
                  accessibilityLabel="E-mail da conta Google"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!busy}
                  keyboardType="email-address"
                  onChangeText={(value) => {
                    setEmail(value);
                    if (error) setError("");
                  }}
                  placeholder="seuemail@gmail.com"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  value={email}
                />

                {error ? (
                  <AppText
                    accessibilityLiveRegion="assertive"
                    accessibilityRole="alert"
                    variant="small"
                    style={styles.errorText}
                  >
                    {error}
                  </AppText>
                ) : null}

                <View style={styles.actions}>
                  <AppButton
                    accessibilityLabel="Confirmar conta Google e continuar"
                    disabled={busy}
                    onPress={handleConfirmCustom}
                    title={
                      busy
                        ? "Entrando..."
                        : name.trim()
                          ? `Continuar como ${name.trim().split(" ")[0]}`
                          : "Continuar com esta conta"
                    }
                  />
                  {savedAccounts.length > 0 ? (
                    <AppButton
                      disabled={busy}
                      onPress={() => {
                        setAddingCustom(false);
                        setError("");
                      }}
                      title="Voltar para contas salvas"
                      variant="ghost"
                    />
                  ) : null}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(16, 26, 36, 0.58)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: radii.xl,
      borderTopRightRadius: radii.xl,
      borderColor: colors.border,
      borderTopWidth: 1,
      maxHeight: "88%",
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      paddingBottom: spacing.xxl,
    },
    handleBar: {
      alignSelf: "center",
      backgroundColor: colors.borderStrong,
      borderRadius: radii.pill,
      height: 5,
      marginBottom: spacing.lg,
      width: 44,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: spacing.lg,
    },
    googleBadge: {
      width: 48,
      height: 48,
      borderRadius: radii.md,
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
    },
    headerCopy: {
      flex: 1,
      marginRight: spacing.sm,
    },
    title: {
      color: colors.text,
    },
    subtitle: {
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
    closeButton: {
      width: 48,
      height: 48,
      borderRadius: radii.pill,
      backgroundColor: colors.surfaceMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    scrollArea: {
      flexGrow: 0,
    },
    accountList: {
      gap: spacing.sm,
    },
    accountRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderColor: colors.borderStrong,
      borderWidth: 1,
      borderRadius: radii.lg,
      minHeight: 72,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: radii.pill,
      backgroundColor: colors.primarySoft,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
    },
    avatarText: {
      color: colors.primaryDark,
      fontSize: 20,
    },
    accountInfo: {
      flex: 1,
      marginRight: spacing.sm,
    },
    accountName: {
      color: colors.text,
    },
    accountEmail: {
      color: colors.textMuted,
      marginTop: 2,
    },
    anotherAccountRow: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: colors.controlBorder,
      minHeight: 56,
      paddingHorizontal: spacing.lg,
      marginTop: spacing.xs,
    },
    anotherIcon: {
      width: 36,
      height: 36,
      borderRadius: radii.pill,
      backgroundColor: colors.primarySoft,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
    },
    anotherText: {
      color: colors.primaryDark,
    },
    formBlock: {
      paddingTop: spacing.xs,
    },
    fieldLabel: {
      color: colors.text,
      marginBottom: spacing.xs,
      marginTop: spacing.md,
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
    errorText: {
      color: colors.danger,
      marginTop: spacing.md,
    },
    actions: {
      gap: spacing.sm,
      marginTop: spacing.xl,
    },
    pressed: {
      opacity: 0.78,
    },
  });
