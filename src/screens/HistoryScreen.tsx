import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { BarChart3, CalendarCheck2 } from "lucide-react-native";
import { AppCard } from "../components/ui/AppCard";
import { AppText } from "../components/ui/AppText";
import { EmptyState } from "../components/ui/EmptyState";
import { Screen } from "../components/ui/Screen";
import { SectionHeader } from "../components/ui/SectionHeader";
import { StatusBadge, type BadgeStatus } from "../components/ui/StatusBadge";
import { useAppData } from "../services/appDataProvider";
import {
  buildAdherenceHistory,
  type DailyAdherenceSummary,
  formatHistoryActionDateTime,
  formatHistoryDayLabel,
  getLast7Days,
} from "../utils/stats";
import type { DoseLog } from "../types/domain";
import { useAppTheme } from "../theme/ThemeProvider";
import { type ThemeColors } from "../theme/theme";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";
import { ptBR } from "../i18n/ptBR";

export function HistoryScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const { medications, schedules, doseLogs: logs, loading } = useAppData();
  const now = new Date();
  const dailySummaries = buildAdherenceHistory(getLast7Days(now), medications, schedules, logs, now);
  const recentLogs = logs.slice(0, 10);

  if (loading) {
    return (
      <Screen edges={["top", "left", "right"]} style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText muted style={[styles.loadingText, { color: colors.textMuted }]}>{ptBR.history.loading}</AppText>
      </Screen>
    );
  }

  return (
    <Screen edges={["top", "left", "right"]} style={{ backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.headerBlock}>
          <AppText variant="caption" weight="bold" style={styles.eyebrow}>
            ACOMPANHAMENTO
          </AppText>
          <AppText accessibilityRole="header" variant="title" style={styles.title}>
            {ptBR.history.title}
          </AppText>
          <AppText muted style={[styles.subtitle, { color: colors.textMuted }]}>
            {ptBR.history.subtitle}
          </AppText>
        </View>

        <TodayHistoryCard summary={dailySummaries[0]} />

        <SectionHeader title={ptBR.history.lastSevenDays} meta={ptBR.history.newestFirst} />
        <View style={styles.group}>
          {dailySummaries.map((summary, index) => (
            <DailyHistoryRow key={summary.date} summary={summary} now={now} last={index === dailySummaries.length - 1} />
          ))}
        </View>

        <SectionHeader title={ptBR.history.recentActions} />
        {recentLogs.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title={ptBR.history.emptyTitle}
            message={ptBR.history.emptyMessage}
          />
        ) : (
          <View style={styles.group}>
            {recentLogs.map((log, index) => {
              const medication = medications.find((candidate) => candidate.id === log.medicationId);
              return (
                <View key={log.id} style={[styles.actionRow, index < recentLogs.length - 1 && styles.divider]}>
                  <View style={styles.actionInfo}>
                    <AppText variant="small" weight="semibold" style={styles.actionMedication}>
                      {medication?.name || "Medicamento removido"}
                    </AppText>
                    <AppText variant="caption" muted style={{ color: colors.textMuted }}>{formatHistoryActionDateTime(log.actionAt, now)}</AppText>
                  </View>
                  <StatusBadge status={actionToStatus(log.action)} />
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

function TodayHistoryCard({ summary }: { summary: DailyAdherenceSummary }) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const hasDoses = summary.total > 0;
  return (
    <AppCard style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.heroHeader}>
        <View style={styles.heroIcon}><CalendarCheck2 color={colors.primaryDark} size={26} strokeWidth={2} /></View>
        <View style={styles.heroHeading}>
          <AppText variant="caption" muted style={{ color: colors.textMuted }}>{ptBR.history.todayRecords}</AppText>
          <AppText variant="heading" style={styles.heroTitle}>
            {hasDoses ? `${summary.taken} de ${summary.total} tomadas` : "Nenhuma dose prevista"}
          </AppText>
        </View>
      </View>
      {hasDoses ? (
        <>
          <ProgressBar percentage={summary.percentage || 0} />
          <AppText variant="small" muted style={styles.heroDescription}>{getDaySummaryText(summary)}</AppText>
        </>
      ) : (
        <AppText variant="small" muted style={styles.heroDescription}>{ptBR.history.noDosesToday}</AppText>
      )}
    </AppCard>
  );
}

function DailyHistoryRow({ summary, now, last }: { summary: DailyAdherenceSummary; now: Date; last: boolean }) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const hasDoses = summary.total > 0;
  return (
    <View
      accessible
      accessibilityLabel={hasDoses
        ? `${formatHistoryDayLabel(summary.date, now)}. ${getDaySummaryText(summary)}. ${summary.percentage} por cento de adesão.`
        : `${formatHistoryDayLabel(summary.date, now)}. Sem doses programadas.`}
      style={[styles.dayRow, !last && styles.divider]}
    >
      <View style={styles.dayHeader}>
        <View style={styles.dayText}>
          <AppText variant="small" weight="semibold" style={{ color: colors.text }}>{formatHistoryDayLabel(summary.date, now)}</AppText>
          <AppText variant="caption" muted style={styles.dayDescription}>
            {hasDoses ? getDaySummaryText(summary) : "Sem doses programadas"}
          </AppText>
        </View>
        <View style={[styles.percentagePill, !hasDoses && styles.freeDayPill]}>
          <AppText variant="caption" weight="bold" style={hasDoses ? styles.dayPercentage : styles.freeDayLabel}>
            {hasDoses ? `${summary.percentage}%` : "Dia livre"}
          </AppText>
        </View>
      </View>
      {hasDoses ? <ProgressBar percentage={summary.percentage || 0} compact /> : null}
    </View>
  );
}

function ProgressBar({ percentage, compact = false }: { percentage: number; compact?: boolean }) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const width = `${Math.min(100, Math.max(0, percentage))}%` as `${number}%`;
  return (
    <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: percentage }} style={[styles.progressTrack, compact && styles.progressTrackCompact]}>
      <View style={[styles.progressFill, { width }]} />
    </View>
  );
}

function getDaySummaryText(summary: DailyAdherenceSummary) {
  const parts = [`${summary.taken} de ${summary.total} tomadas`];
  if (summary.pending > 0) parts.push(`${summary.pending} ${summary.pending === 1 ? "pendente" : "pendentes"}`);
  if (summary.snoozed > 0) parts.push(`${summary.snoozed} ${summary.snoozed === 1 ? "adiada" : "adiadas"}`);
  if (summary.skipped > 0) parts.push(`${summary.skipped} ${summary.skipped === 1 ? "pulada" : "puladas"}`);
  if (summary.unrecorded > 0) parts.push(`${summary.unrecorded} ${summary.unrecorded === 1 ? "não registrada" : "não registradas"}`);
  return parts.join(" · ");
}

function actionToStatus(action: DoseLog["action"]): BadgeStatus {
  if (action === "taken") return "taken";
  if (action === "skipped") return "skipped";
  if (action === "snoozed") return "snoozed";
  return "undone";
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: spacing.md },
  content: { paddingBottom: spacing.xl },
  headerBlock: { marginBottom: spacing.lg },
  eyebrow: {
    color: colors.primary,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  title: { color: colors.primaryDark },
  subtitle: { marginTop: spacing.xs },
  heroCard: { borderRadius: radii.lg, marginBottom: spacing.md, padding: spacing.xl },
  heroHeader: { alignItems: "center", flexDirection: "row" },
  heroIcon: { alignItems: "center", backgroundColor: colors.primarySoft, borderColor: colors.border, borderRadius: radii.md, borderWidth: 1, height: 54, justifyContent: "center", marginRight: spacing.md, width: 54 },
  heroHeading: { flex: 1 },
  heroTitle: { color: colors.primaryDark, marginTop: spacing.xs },
  heroDescription: { color: colors.textMuted, marginTop: spacing.md },
  progressTrack: { backgroundColor: colors.surfaceMuted, borderRadius: radii.pill, height: 12, marginTop: spacing.lg, overflow: "hidden" },
  progressTrackCompact: { height: 8, marginTop: spacing.md },
  progressFill: { backgroundColor: colors.primary, borderRadius: radii.pill, height: "100%" },
  group: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg, borderWidth: 1, overflow: "hidden" },
  divider: { borderBottomColor: colors.border, borderBottomWidth: 1 },
  dayRow: { padding: spacing.lg },
  dayHeader: { alignItems: "center", flexDirection: "row" },
  dayText: { flex: 1, marginRight: spacing.md },
  dayDescription: { color: colors.textMuted, marginTop: spacing.xs },
  percentagePill: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  freeDayPill: {
    backgroundColor: colors.successSoft,
  },
  dayPercentage: { color: colors.primaryDark },
  freeDayLabel: { color: colors.success },
  actionRow: { alignItems: "center", flexDirection: "row", minHeight: 78, padding: spacing.lg },
  actionInfo: { flex: 1, marginRight: spacing.md },
  actionMedication: { color: colors.text, marginBottom: spacing.xs },
});
