# Refine medication form, detail view, and full-screen dose alarm under the Editorial Coral system

## Status

Accepted — complements [ADR 0004](./0004-optional-full-screen-dose-alarms.md), [ADR 0005](./0005-react-native-dose-alarm-screen.md), and [ADR 0016](./0016-editorial-coral-main-tabs-and-cards.md).

## Context

To complete the end-to-end visual and UX unification of Remedin's 12 screens across Phases 1–4, the remaining medication management and alarm screens (`MedicationFormScreen`, `MedicationDetailScreen`, and `DoseAlarmScreen`) needed alignment with the Editorial Coral design language:

1. **Screen 10 (`MedicationFormScreen` & `CareAccordionStepCard`):** Used a single continuous bar instead of segmented progress pills, `12px` input corners, and identical badge colors on both expanded and collapsed accordion steps.
2. **Screen 11 (`MedicationDetailScreen` & `CareDetailHeroCard`):** Displayed the `"Editar"` action as plain text without a visible pill container, and used uncontained section icons (including blue `info`) instead of warm Coral medallions.
3. **Screen 12 (`DoseAlarmScreen`):** Used a generic bell icon header instead of the official `RemedinHorizontalSignature`, and rectangular (`radii.md`) alarm buttons instead of large, high-contrast pill buttons (`radii.pill`, `minHeight: 58px`).

## Decision

1. **Screen 10 — Add / Edit Medication (`MedicationFormScreen.tsx` & `CareAccordionStepCard.tsx`):**
   - Replace the continuous progress bar with a **4-segment pill progress bar** (`Etapa 1 de 4` through `Etapa 4 de 4`).
   - Style `CareAccordionStepCard` with `radii.lg` (`24px`), distinguishing the active expanded step (`borderColor: colors.primary`, `backgroundColor: colors.primary` badge) from collapsed steps (`borderColor: colors.border`, `backgroundColor: colors.primarySoft` badge).
   - Use `radii.md` (`16px`) and `minHeight: 56px` on form inputs while preserving `colors.surface` background in both light and dark modes.

2. **Screen 11 — Medication Detail (`MedicationDetailScreen.tsx` & `CareDetailHeroCard.tsx`):**
   - Style the `"Editar"` action in `CareDetailHeroCard` as an explicit pill button (`surface` background, `colors.border` outline, `Pencil` icon, `minHeight: 44px`).
   - Wrap section icons in `MedicationDetailScreen` (`Horários`, `Observações`, `Histórico recente`) inside `colors.primarySoft` medallions with `radii.lg` (`24px`) Bento cards.

3. **Screen 12 — Full-Screen Dose Alarm (`DoseAlarmScreen.tsx`):**
   - Center `RemedinHorizontalSignature` and the `"Alarme ativo"` pill badge at the top of the alarm screen.
   - Present the dose card with `radii.xl` (`32px`) and large `58px` pill buttons (`radii.pill`) for **"Marcar como tomado"** / **"Encerrar teste"** (`colors.primary` fill) and **"Adiar 5 min"** (`colors.primary` outline).

## Consequences

- All 12 screens of the Remedin app now share a single cohesive Editorial Coral visual language, pill button hierarchy, and accessibility standard (`AtkinsonHyperlegibleNext`, `>= 48px` targets, Light/Dark themes, and reduced-motion support).
