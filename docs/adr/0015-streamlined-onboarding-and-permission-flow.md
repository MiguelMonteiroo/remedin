# Streamline first-run guide and Android permission onboarding

## Status

Accepted — updates the onboarding flow from [ADR 0007](./0007-first-run-onboarding.md) and complements [ADR 0014](./0014-local-first-auth-and-splash-flow.md).

## Context

Following the introduction of the Coral brand identity and authentication screens in Phase 1 (ADR 0014), the post-login first-run onboarding (`FirstRunOnboarding.tsx`) had two UX issues for Remedin's adult and older-adult audience:

1. **Visual discontinuity:** The guide and permission screens still used flat divider rows and rectangular buttons (`radii.md`) instead of the Coral header + rounded bottom sheet (`radii.xl = 32px`), editorial cards, and pill buttons (`radii.pill`, `minHeight: 56px`) established in Phase 1.
2. **Permission fatigue and skip friction:** Presenting 6 sequential permission screens (`notifications`, `lockScreenDetails`, `doNotDisturb`, `exact`, `fullScreen`, `battery`) created excessive friction before the user could reach the Home screen. Moreover, confirming "Continuar sem lembretes" on step 1 still routed the user through the remaining 5 permission screens.

## Decision

1. **Screen 04 — Quick Guide (`guide` step):**
   - Uses a hybrid **Coral Header (`#A44945`) + Rounded Bottom Sheet (`radii.xl = 32px`, `surface`)** composition.
   - Displays the inverse horizontal signature (`remedin`), a personalized greeting (`"Olá, [Nome]!"`), and 3 editorial Bento cards inside the sheet (*Organize sua rotina*, *Cuide das doses de hoje*, *Acompanhe seu histórico*).
   - Provides a primary Coral pill CTA (**"Configurar meus lembretes"**) and a secondary action to skip reminder setup (with confirmation).

2. **Screen 05 — Essential 3-Step Permission Flow (`notifications` -> `exact` -> `fullScreen`) + Completion Card (`ready`):**
   - Uses the **Minimalist Editorial** layout (`background` `#FAF7F6` light / `#291C1C` dark) with a `48x48px` back button (`← Voltar`) and a 3-segment pill progress bar (`Passo 1 de 3` to `Passo 3 de 3`).
   - **Step 1 (`notifications`):** Requests local notification permission and enables `showLockScreenDetails: true` by default so medication details are visible on the lock screen without an extra onboarding screen (configurable anytime in Profile).
   - **Step 2 (`exact`):** Requests exact alarm scheduling (`SCHEDULE_EXACT_ALARM` / `USE_EXACT_ALARM`) to prevent Android delivery delays for pre-alerts and dose alarms.
   - **Step 3 (`fullScreen`):** Requests full-screen alarm presentation (`USE_FULL_SCREEN_INTENT`) with a visual preview card of a dose alarm.
   - **Completion & Optional Hardening (`ready` step):** Shows a summary of active reminder protections with a primary Coral pill CTA (**"Ir para o aplicativo"**) and two optional one-tap cards for advanced device hardening: **Alarmes no Não Perturbe (`doNotDisturb`)** and **Bateria sem restrições (`battery`)**.

3. **Immediate Exit When Skipping Basic Notifications:**
   - If the user taps *"Agora não"* on Step 1 (`notifications`) and confirms *"Continuar sem lembretes"*, `FirstRunOnboarding` records `notificationsEnabled: false` and immediately completes onboarding (`finishOnboarding()`), taking the user directly to **Screen 06 (Home)** without asking dependent alarm permissions.

## Consequences

- First-run onboarding is reduced from 6 mandatory permission screens to 3 essential steps plus an optional hardening summary.
- Visual language (Coral header, rounded sheet, editorial cards, pill buttons, `AtkinsonHyperlegibleNext`, reduced-motion support) is cohesive from Screen 01 through Screen 05.
- Skipping notifications immediately opens the main app, while all 6 Android capabilities remain individually configurable in **Profile (`SettingsScreen.tsx`)**.
