import type { ReminderPermissionState } from "../../types/domain";

export const ONBOARDING_PERMISSION_STEPS = [
  "notifications",
  "lockScreenDetails",
  "doNotDisturb",
  "exact",
  "fullScreen",
  "battery",
] as const;

export const ESSENTIAL_ONBOARDING_PERMISSION_STEPS = [
  "notifications",
  "lockScreenDetails",
  "exact",
  "fullScreen",
] as const;

export const OPTIONAL_ONBOARDING_PERMISSION_STEPS = [
  "doNotDisturb",
  "battery",
] as const;

export type OnboardingPermissionStep =
  (typeof ONBOARDING_PERMISSION_STEPS)[number];

export type EssentialOnboardingPermissionStep =
  (typeof ESSENTIAL_ONBOARDING_PERMISSION_STEPS)[number];

export type OptionalOnboardingPermissionStep =
  (typeof OPTIONAL_ONBOARDING_PERMISSION_STEPS)[number];

export type NotificationOnboardingAction =
  | "request"
  | "settings"
  | "continue";

export function getNotificationOnboardingAction(
  state: ReminderPermissionState["notifications"],
  requestAttempted: boolean
): NotificationOnboardingAction {
  if (state === "granted") return "continue";
  if (state === "denied" && requestAttempted) return "settings";
  return "request";
}
