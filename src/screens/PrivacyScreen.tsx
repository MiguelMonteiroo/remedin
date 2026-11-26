import { useState } from "react";
import { Linking, ScrollView, StyleSheet, View } from "react-native";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "../components/ui/Screen";
import { AppText } from "../components/ui/AppText";
import { AppButton } from "../components/ui/AppButton";
import { IconButton } from "../components/ui/IconButton";
import { useAppTheme } from "../theme/ThemeProvider";
import { spacing } from "../theme/spacing";
import { radii } from "../theme/radii";
import type { RootStackParamList } from "../navigation/types";
import { ptBR } from "../i18n/ptBR";
import privacy from "../legal/privacy.json";

type Props = NativeStackScreenProps<RootStackParamList, "Privacy">;

export function PrivacyScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [linkError, setLinkError] = useState(false);

  async function contactSupport() {
    try {
      await Linking.openURL(`mailto:${privacy.contactEmail}`);
    } catch {
      setLinkError(true);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <IconButton icon={ArrowLeft} label={ptBR.actions.back} onPress={() => navigation.goBack()} />
        <AppText accessibilityRole="header" variant="title" style={styles.heading}>{privacy.title}</AppText>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.notice, { backgroundColor: colors.primarySoft }]}>
          <ShieldCheck color={colors.primaryDark} size={28} />
          <AppText accessibilityRole="header" variant="heading">{privacy.medicalTitle}</AppText>
          <AppText>{privacy.medicalDisclaimer}</AppText>
          <AppText>{privacy.alarmNotice}</AppText>
        </View>
        <AppText variant="caption" muted>{ptBR.privacy.updatedAt} {privacy.updatedAt}</AppText>
        {privacy.sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <AppText accessibilityRole="header" variant="subheading" weight="bold">{section.title}</AppText>
            <AppText>{section.body}</AppText>
          </View>
        ))}
        <View style={styles.section}>
          <AppText accessibilityRole="header" variant="subheading" weight="bold">{ptBR.privacy.contact}</AppText>
          <AppText>{privacy.controller}</AppText>
          <AppText selectable>{privacy.contactEmail}</AppText>
          <AppButton icon={Mail} title={ptBR.privacy.sendEmail} onPress={contactSupport} variant="secondary" />
          {linkError ? <AppText accessibilityRole="alert">{ptBR.privacy.emailError}</AppText> : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg },
  heading: { flex: 1 },
  content: { gap: spacing.lg, paddingBottom: spacing.xxl },
  notice: { borderRadius: radii.lg, gap: spacing.md, padding: spacing.lg },
  section: { gap: spacing.sm },
});
