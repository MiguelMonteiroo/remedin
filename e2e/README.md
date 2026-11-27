# E2E Android

See the [validation record](../docs/product/e2e-validation-2026-11-26.md) for
executed configurations, fixes and remaining real-device gaps.

UI Automator drives a bundled, release-like APK (`com.remedin.e2e`) from an
independent driver (`com.remedin.e2e.driver`). It can kill or clear the application
under test without killing the test runner. Neither package replaces `com.remedin`.
There are no database fixtures or mocked medication/reminder services.

## Prepare

Install a JDK and Android SDK. To download the official API 33, 34 and 36 images:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup-e2e-emulators.ps1
```

This needs network access, accepted SDK licenses and several GB of disk space.
The setup uses tools 19.0 because the newer SDK CLI changes package argument
handling. Downloads are checked against the official archive checksum. Created
AVDs are exclusively for testing; rerunning setup recreates those AVDs.

Build **and wait for success** before running (no Metro needed):

```powershell
cd android
.\gradlew.bat -Pe2e -PreactNativeArchitectures=x86_64 :app:assembleE2e :e2e:assembleDebug :e2e:assembleDebugAndroidTest
cd ..
```

The E2E variant/module exist only with `-Pe2e`. Production builds and their
application ID remain unchanged. The E2E APK is debug-signed, not for distribution.

## Run

Start one AVD, get its serial with `adb devices`, then:

```powershell
$env:ANDROID_SERIAL = "emulator-5560"
npm.cmd run e2e
npm.cmd run e2e -- --font=1.5 --class=com.remedin.e2e.RemedinFlowsTest#wheelCyclesAndDoesNotChangeOnSave
npm.cmd run e2e -- --long-alarms --class=com.remedin.e2e.RemedinFlowsTest#coldStartDoseAlarmCoversSecureLockscreen
```

The runner deliberately rejects physical-device serials. It restores font scale
and stops the **test** app after collecting evidence, preventing pending test
alarms from ringing later. `force-stop` is cleanup only, never an alarm-delivery
scenario. Tests clear only `com.remedin.e2e` between scenarios. Never point these
tests at a real user's application ID.

Evidence lives in ignored `e2e/artifacts/`: instrumentation results, screenshots,
UI hierarchy, logcat, notification/alarm inventory and device metadata. Logs can
include other applications' notifications; do not commit or publish raw evidence.
`device.json` records API, resolution, density, timezone, page size, device time,
clock offset, commit, dirty state and APK/driver hashes. Rebuild after changing
app code or tests; do not mix old APKs and new source when interpreting results.

## Matrix

| Profile | API | Resolution / density | Effective size |
| --- | --- | --- | --- |
| Compact | 33 | 720x1600 / 320 | 360x800 dp |
| Standard | 34 | 1080x2400 / 440 | about 393x873 dp |
| Large | 36 | 1080x2400 / 420 | about 411x914 dp |
| Existing 16 KB emulator | verify at runtime | record actual values | record actual values |

Use font scales 1.0, 1.3 and 1.5. Repeat critical cases three times. A Google
system image using a manufacturer's device dimensions is **not** Samsung/One UI
or Xiaomi/HyperOS validation.

The following runs the prepared AVDs sequentially and closes only those it
started. Build first, ensure ports 5560/5562/5564 are free, then run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/run-e2e-matrix.ps1 -Existing16KSerial emulator-5554
```

`-Repetitions 3` repeats each configuration; `-Scales 1.0` limits a quick run.
Use `-Apis 34` to rerun only the standard Android 14 profile. Prefer sequential
AVDs; running several at once can exhaust host RAM and invalidate timing results.
Physical-device ARM libraries are not exercised by the x86_64 matrix.

## Boundaries

The suite covers onboarding resume/skip, CRUD, schedule kinds, pause/resume,
wheel accessibility actions, dose actions, snooze persistence, repeated creation,
historical boundaries, profile/privacy contacts, independent immediate pre-alerts,
and the native test alarm on a sleeping emulator. Assertions target actual UI
state; React Native's adjustable accessibility action can return false even after
dispatch, so the wheel test verifies the selected value instead.

The notification runtime prompt is answered through the Android UI. Exact-alarm
and full-screen special access are granted with `appops` in the driver. These
cases do not certify the system-settings redirects or every optional permission
page; those still require manual QA.

Manual evidence is still required for audible playback, vibration perception,
TalkBack usability, OEM restrictions, PIN/biometric locks on real devices, Doze/DND variants,
reboot, permission revocation, timezone changes and real reminders after 48 hours.
The short test-alarm scenario alone does not prove cold-start delivery. The
separate `--long-alarms` case schedules an actual medication through the form,
kills its background process, verifies presentation over a secure lockscreen,
unlocks and records the dose. It temporarily sets PIN `2468` on an unsecured
emulator and clears it in `finally`; an existing PIN is never changed. This case
is excluded from quick runs. If the driver itself crashes, recover the dedicated
emulator with `adb -s SERIAL shell locksettings clear --old 2468`.

The extended intake case explicitly opts in to showing lockscreen details. With
details hidden, the existing alarm UI offers snooze and directs intake to the
main application; it does not automatically reveal the private payload on unlock.
These tests preserve that privacy rule rather than silently changing it.

References: [UI Automator](https://developer.android.com/training/testing/other-components/ui-automator-legacy),
[SDK Manager](https://developer.android.com/tools/sdkmanager).
