# Unify main tabs and care cards under the Editorial Coral design system

## Status

Accepted — complements [ADR 0001](./0001-ui-navigation-tabs.md), [ADR 0002](./0002-design-system-theme.md), [ADR 0014](./0014-local-first-auth-and-splash-flow.md), and [ADR 0015](./0015-streamlined-onboarding-and-permission-flow.md).

## Context

After completing Phase 1 (Splash & Auth) and Phase 2 (Quick Guide & Permission Onboarding) with the Editorial Coral identity (`#A44945`, `#FAF7F6` light / `#291C1C` dark, pill buttons, and `AtkinsonHyperlegibleNext`), the four main tabs (`HomeScreen`, `MedicationsScreen`, `HistoryScreen`, `SettingsScreen`) and `FloatingTabBar` still had legacy visual and interaction gaps:

1. **Legacy pastel tokens in Home cards:** `DailyProgressSummary` and `CareDoseActionCard` still referenced legacy tokens (`bentoSun`, `bentoMenta`, `bentoSky`, `navyDeep`) that clashed with the warm Coral/Terracotta palette.
2. **Hidden Snooze and Skip actions on Home:** `HomeScreen` passed `onSnooze` and `onSkip` to `CareDoseActionCard`, but the component only rendered the `"Tomar"` button.
3. **Grouped flat lists in Medications:** `MedicationsScreen` rendered all medications inside a single bordered box with divider lines instead of independent editorial Bento cards.
4. **Floating tab bar overlap and contrast:** `FloatingTabBar` used `position: "absolute"` at the bottom while tab screens used `paddingBottom: 32`, causing the floating bar to cover the bottom content on scroll. Inactive and active tab labels also shared the same text color (`colors.text`).

## Decision

1. **Screen 06 (`HomeScreen`) & `CareHeader`:**
   - Display `RemedinHorizontalSignature` above the time-of-day greeting (`Bom dia, [Nome]`).
   - Make the user initials medallion in `CareHeader` an accessible button (`onAvatarPress`) that navigates directly to the **Profile (`SettingsScreen`)** tab.
   - Replace legacy `bentoSun`/`bentoMenta`/`navyDeep` colors in `DailyProgressSummary` and `CareDoseActionCard` with `colors.primarySoft` (`#F9EAE8` light / `#4F2D2B` dark) and `colors.primaryDark`.
   - Render `onSnooze` (`"Adiar X min"`) and `onSkip` (`"Pular"`) secondary pill buttons inside `CareDoseActionCard` whenever those handlers are provided, alongside the primary `"Tomar"` pill button.

2. **Screen 07 (`MedicationsScreen`) & Screen 08 (`HistoryScreen`):**
   - Render each medication in `MedicationsScreen` as an independent editorial Bento card (`surface`, `borderColor: colors.border`, `borderRadius: radii.lg = 24`) with a full-width or prominent pill CTA (`"+ Adicionar medicamento"`).
   - Refine `HistoryScreen` cards with `radii.lg` rounded surfaces, pill progress tracks, and clear visual hierarchy between Today's summary, the 7-day breakdown, and recent actions.

3. **Screen 09 (`SettingsScreen`) & `FloatingTabBar` (`AppNavigator.tsx`):**
   - Style `FloatingTabBar` with a subtle `colors.border` outline, `colors.primarySoft` active pill background, `colors.primaryDark` active icon/label, and `colors.textMuted` inactive icon/label.
   - Increase scroll container bottom padding (`paddingBottom: 124`) across all 4 main tabs so content never hides behind `FloatingTabBar`.
   - Use `radii.pill` on `AppButton` for consistent pill-shaped actions across all screens.

## Consequences

- All 4 main tabs share a cohesive Editorial Coral aesthetic in both Light and Dark themes.
- Users can take, snooze, or skip pending doses directly from the Home screen card.
- Scrolling to the bottom of any tab leaves generous breathing room above the floating navigation bar.
