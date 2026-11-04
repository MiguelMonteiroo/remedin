import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ChevronRight, Clock3, Pill, Plus } from "lucide-react-native";
import { AppButton } from "../components/ui/AppButton";
import { AppText } from "../components/ui/AppText";
import { Screen } from "../components/ui/Screen";
import { StatusBadge } from "../components/ui/StatusBadge";
import { MedicationEmptyState } from "../components/MedicationEmptyState";
import { RootStackParamList, RootTabParamList } from "../navigation/types";
import { useAppData } from "../services/appDataProvider";
import { useAppTheme } from "../theme/ThemeProvider";
import { type ThemeColors } from "../theme/theme";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";
import { ptBR } from "../i18n/ptBR";

type Props = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, "Medications">,
  NativeStackScreenProps<RootStackParamList>
>;

export function MedicationsScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const { medications, schedules } = useAppData();

  return (
    <Screen style={{ backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.headerBlock}>
          <AppText variant="caption" weight="bold" style={styles.eyebrow}>
            CUIDADO DIÁRIO
          </AppText>
          <AppText accessibilityRole="header" variant="title" style={styles.title}>
            {ptBR.medications.title}
          </AppText>
          <AppText muted style={[styles.subtitle, { color: colors.textMuted }]}>
            {ptBR.medications.subtitle}
          </AppText>
        </View>

        {medications.length === 0 ? (
          <MedicationEmptyState
            title={ptBR.medications.emptyTitle}
            message={ptBR.medications.emptyMessage}
            actionLabel={ptBR.actions.addMedication}
            onAction={() => navigation.navigate("AddMedication")}
          />
        ) : (
          <>
            <AppButton
              icon={Plus}
              onPress={() => navigation.navigate("AddMedication")}
              style={styles.addButton}
              title={ptBR.actions.addMedication}
            />
            <View style={styles.bentoList}>
              {medications.map((medication) => {
                const schedule = schedules.find(
                  (candidate) => candidate.medicationId === medication.id && candidate.isActive
                );
                const title =
                  medication.dosage && medication.dosage !== "Sem dosagem"
                    ? `${medication.name} (${medication.dosage})`
                    : medication.name;
                return (
                  <Pressable
                    key={medication.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir ${title}`}
                    onPress={() => navigation.navigate("MedicationDetail", { medicationId: medication.id })}
                    style={({ pressed }) => [
                      styles.medicationCard,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.iconMedallion}>
                      <Pill color={colors.primaryDark} size={26} strokeWidth={2.1} />
                    </View>
                    <View style={styles.info}>
                      <AppText
                        variant="subheading"
                        weight="bold"
                        style={{ color: colors.text }}
                      >
                        {title}
                      </AppText>
                      <View style={styles.statusRow}>
                        <StatusBadge status={medication.isPaused ? "paused" : "active"} />
                        <View style={styles.schedulePill}>
                          <Clock3 color={colors.primaryDark} size={13} strokeWidth={2.2} />
                          <AppText
                            variant="caption"
                            weight="semibold"
                            style={styles.scheduleText}
                          >
                            {getScheduleLabel(schedule)}
                          </AppText>
                        </View>
                      </View>
                    </View>
                    <View style={styles.chevronWrap}>
                      <ChevronRight color={colors.primaryDark} size={22} strokeWidth={2.2} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function getScheduleLabel(schedule: ReturnType<typeof useAppData>["schedules"][number] | undefined) {
  if (!schedule) return "Sem horário ativo";
  if (schedule.kind === "intervalHours") return `A cada ${schedule.intervalHours} horas`;
  if (schedule.kind === "weekdays") return `${schedule.times[0] ?? "--:--"} · Dias selecionados`;
  return `${schedule.times[0] ?? "--:--"} · Todos os dias`;
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    content: { paddingBottom: 124 },
    headerBlock: { marginBottom: spacing.lg },
    eyebrow: {
      color: colors.primary,
      letterSpacing: 0.6,
      marginBottom: 4,
    },
    title: { color: colors.primaryDark },
    subtitle: { marginTop: spacing.xs },
    addButton: { marginBottom: spacing.lg, width: "100%" },
    bentoList: { gap: spacing.md },
    medicationCard: {
      alignItems: "center",
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.lg,
      borderWidth: 1,
      flexDirection: "row",
      minHeight: 96,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 8,
      elevation: 1,
    },
    pressed: { opacity: 0.8 },
    iconMedallion: {
      alignItems: "center",
      backgroundColor: colors.primarySoft,
      borderColor: colors.border,
      borderRadius: radii.md,
      borderWidth: 1,
      height: 54,
      justifyContent: "center",
      marginRight: spacing.md,
      width: 54,
    },
    info: { flex: 1, marginRight: spacing.sm },
    statusRow: {
      alignItems: "center",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
      marginTop: spacing.sm,
    },
    schedulePill: {
      alignItems: "center",
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: radii.pill,
      borderWidth: 1,
      flexDirection: "row",
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },
    scheduleText: {
      color: colors.textMuted,
      flexShrink: 1,
    },
    chevronWrap: {
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: radii.pill,
      height: 36,
      justifyContent: "center",
      width: 36,
    },
  });
