import { ScrollView, StyleSheet, View } from "react-native";
import { useState, type ReactNode } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ArrowLeft, CalendarDays, CheckCircle2, FileText, Trash2 } from "lucide-react-native";
import { AppCard } from "../components/ui/AppCard";
import { AppText } from "../components/ui/AppText";
import { CareBottomActionBar } from "../components/CareBottomActionBar";
import { CareDetailHeroCard } from "../components/CareDetailHeroCard";
import { IconButton } from "../components/ui/IconButton";
import { Screen } from "../components/ui/Screen";
import { StatusBadge } from "../components/ui/StatusBadge";
import { ConfirmationDialog } from "../components/ui/ConfirmationDialog";
import { RootStackParamList } from "../navigation/types";
import { useAppData } from "../services/appDataProvider";
import { DoseLog } from "../types/domain";
import { useAppTheme } from "../theme/ThemeProvider";
import { type ThemeColors } from "../theme/theme";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";
import { ptBR } from "../i18n/ptBR";
import { formatHistoryActionDateTime } from "../utils/stats";

type Props = NativeStackScreenProps<RootStackParamList, "MedicationDetail">;

export function MedicationDetailScreen({ route, navigation }: Props) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { medicationId } = route.params;
  const { medications, schedules, doseLogs, removeMedication, setMedicationPaused } = useAppData();
  const medication = medications.find((item) => item.id === medicationId);
  const medicationSchedules = schedules.filter((item) => item.medicationId === medicationId);
  const logs = doseLogs
    .filter((log) => log.medicationId === medicationId)
    .sort((left, right) => right.actionAt.localeCompare(left.actionAt))
    .slice(0, 3);

  if (!medication) {
    return (
      <Screen style={[styles.center, { backgroundColor: colors.background }]}>
        <AppText variant="subheading" style={styles.errorText}>{ptBR.details.notFound}</AppText>
      </Screen>
    );
  }

  const firstSchedule = medicationSchedules.find((item) => item.isActive) ?? medicationSchedules[0];
  const paused = medication.isPaused;

  async function confirmDelete() {
    setDeleting(true);
    try {
      await removeMedication(medicationId);
      setDeleteDialogVisible(false);
      navigation.goBack();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Screen style={{ backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <IconButton icon={ArrowLeft} label={ptBR.actions.back} onPress={() => navigation.goBack()} />
          <View style={styles.headerText}>
            <AppText variant="caption" weight="bold" style={styles.eyebrow}>
              DETALHES DO TRATAMENTO
            </AppText>
            <AppText accessibilityRole="header" variant="title" style={styles.title}>
              {ptBR.details.title}
            </AppText>
          </View>
        </View>

        <CareDetailHeroCard
          name={medication.name}
          dosage={medication.dosage}
          paused={paused}
          onEdit={() => navigation.navigate("EditMedication", { medicationId })}
        />

        <InfoCard icon={<CalendarDays color={colors.primaryDark} size={22} strokeWidth={2.2} />} title={ptBR.details.schedule}>
          {firstSchedule ? (
            <>
              <InfoRow label={ptBR.details.frequency} value={scheduleLabel(firstSchedule.kind)} />
              <InfoRow label={ptBR.details.time} value={firstSchedule.times.join(", ")} strong />
              <InfoRow label={ptBR.details.dosage} value={medication.dosage} />
            </>
          ) : <AppText muted style={{ color: colors.textMuted }}>{ptBR.details.noActiveTime}</AppText>}
        </InfoCard>

        <InfoCard icon={<FileText color={colors.primaryDark} size={22} strokeWidth={2.2} />} title={ptBR.details.observations}>
          <AppText style={{ color: colors.text }}>{medication.notes || ptBR.details.noObservations}</AppText>
        </InfoCard>

        <InfoCard icon={<CheckCircle2 color={colors.primaryDark} size={22} strokeWidth={2.2} />} title={ptBR.details.recentHistory}>
          {logs.length === 0 ? (
            <AppText muted style={{ color: colors.textMuted }}>{ptBR.details.noRecentHistory}</AppText>
          ) : logs.map((log, index) => (
            <View key={log.id} style={[styles.logRow, index < logs.length - 1 && styles.logDivider]}>
              <AppText variant="small" style={styles.logDate}>{formatHistoryActionDateTime(log.actionAt)}</AppText>
              <StatusBadge status={actionToStatus(log.action)} />
            </View>
          ))}
        </InfoCard>

        <CareBottomActionBar
          paused={paused}
          onTogglePause={() => setMedicationPaused(medicationId, !paused)}
          onDelete={() => setDeleteDialogVisible(true)}
        />
      </ScrollView>

      <ConfirmationDialog
        busy={deleting}
        confirmAccessibilityLabel={`Confirmar remoção de ${medication.name}`}
        confirmLabel={ptBR.actions.delete}
        description={`Remover ${medication.name} também exclui seus horários e registros deste aparelho.`}
        icon={Trash2}
        onCancel={() => setDeleteDialogVisible(false)}
        onConfirm={confirmDelete}
        title={ptBR.details.removeTitle}
        variant="destructive"
        visible={deleteDialogVisible}
      />
    </Screen>
  );
}

function InfoCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  return (
    <AppCard style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconMedallion}>
          {icon}
        </View>
        <AppText variant="subheading" weight="bold" style={styles.cardTitle}>{title}</AppText>
      </View>
      {children}
    </AppCard>
  );
}

function InfoRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  return (
    <View style={styles.infoRow}>
      <AppText variant="small" muted style={styles.infoLabel}>{label}</AppText>
      <AppText variant={strong ? "subheading" : "small"} weight="semibold" style={[styles.infoValue, strong && styles.strongValue]}>{value}</AppText>
    </View>
  );
}

function scheduleLabel(kind: string) {
  if (kind === "dailyTimes") return "Todos os dias";
  if (kind === "intervalHours") return "Por intervalo";
  return "Dias selecionados";
}

function actionToStatus(action: DoseLog["action"]) {
  if (action === "taken") return "taken";
  if (action === "skipped") return "skipped";
  if (action === "snoozed") return "snoozed";
  return "undone";
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  content: { paddingBottom: spacing.xxl },
  errorText: { color: colors.danger },
  header: { alignItems: "center", flexDirection: "row", marginBottom: spacing.lg },
  headerText: { flex: 1, marginLeft: spacing.md },
  eyebrow: {
    color: colors.primary,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  title: { color: colors.primaryDark },
  card: { borderRadius: radii.lg, marginBottom: spacing.md, padding: spacing.xl },
  cardHeader: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", gap: spacing.md, marginBottom: spacing.md, paddingBottom: spacing.md },
  cardIconMedallion: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  cardTitle: { color: colors.text, flex: 1 },
  infoRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.sm },
  infoLabel: { color: colors.textMuted, flex: 1, marginRight: spacing.md },
  infoValue: { color: colors.text, flexShrink: 1, maxWidth: "62%", textAlign: "right" },
  strongValue: { color: colors.primaryDark },
  logRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", minHeight: 60, paddingVertical: spacing.sm },
  logDivider: { borderBottomColor: colors.border, borderBottomWidth: 1 },
  logDate: { color: colors.text, flex: 1, marginRight: spacing.md },
});
