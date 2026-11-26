import {
  ESSENTIAL_ONBOARDING_PERMISSION_STEPS,
  getNotificationOnboardingAction,
  ONBOARDING_PERMISSION_STEPS,
  OPTIONAL_ONBOARDING_PERMISSION_STEPS,
} from "../permissionOnboarding";

describe("permission onboarding", () => {
  it("presents every user-configurable Android capability in dependency order", () => {
    expect(ONBOARDING_PERMISSION_STEPS).toEqual([
      "notifications",
      "lockScreenDetails",
      "doNotDisturb",
      "exact",
      "fullScreen",
      "battery",
    ]);
  });

  it("includes the privacy choice in first-run setup before exact alarms", () => {
    expect(ESSENTIAL_ONBOARDING_PERMISSION_STEPS).toEqual([
      "notifications",
      "lockScreenDetails",
      "exact",
      "fullScreen",
    ]);
    expect(OPTIONAL_ONBOARDING_PERMISSION_STEPS).toEqual([
      "doNotDisturb",
      "battery",
    ]);
  });

  it("requests the runtime permission when it has not been decided", () => {
    expect(getNotificationOnboardingAction("blocked", false)).toBe("request");
  });

  it("continues immediately when notifications are already allowed", () => {
    expect(getNotificationOnboardingAction("granted", false)).toBe("continue");
  });

  it("still requests on a fresh install reported as denied", () => {
    expect(getNotificationOnboardingAction("denied", false)).toBe("request");
  });

  it("opens app settings after a request was denied", () => {
    expect(getNotificationOnboardingAction("denied", true)).toBe("settings");
  });
});
