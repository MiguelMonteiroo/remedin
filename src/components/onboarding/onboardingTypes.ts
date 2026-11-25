import type { EssentialOnboardingPermissionStep } from "../../services/reminders/permissionOnboarding";

export type OnboardingStep =
  | "welcome"
  | "profile"
  | "guide"
  | EssentialOnboardingPermissionStep
  | "ready";

export type OnboardingSetupStep = Exclude<OnboardingStep, "welcome" | "guide">;
