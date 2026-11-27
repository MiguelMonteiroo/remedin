import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { parseInstrumentationResult } from "./lib/e2e-results.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const serial = process.env.ANDROID_SERIAL;
if (!serial || !/^emulator-\d+$/.test(serial)) {
  throw new Error("Set ANDROID_SERIAL to an emulator serial. Physical devices are deliberately rejected.");
}
const option = (name, fallback) => {
  const value = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return value ? value.slice(name.length + 3) : fallback;
};
const scale = option("font", "1.0");
if (!["1.0", "1.3", "1.5"].includes(scale)) throw new Error("Font must be 1.0, 1.3 or 1.5");
const testClass = option("class", "com.remedin.e2e.RemedinFlowsTest");
const longAlarms = process.argv.includes("--long-alarms");
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const output = path.join(root, "e2e/artifacts", `${stamp}-${serial}-font${scale}`);
mkdirSync(output, { recursive: true });
const adb = (...args) => spawnSync("adb", ["-s", serial, ...args], { encoding: "utf8", timeout: 1200000, maxBuffer: 32 * 1024 * 1024 });
const checked = (...args) => {
  const result = adb(...args);
  if (result.error || result.status !== 0) throw new Error(result.error?.message || result.stderr || result.stdout);
  return result.stdout;
};
const oldScale = checked("shell", "settings", "get", "system", "font_scale").trim();
const metadata = {
  serial, scale, testClass, longAlarms,
  commit: spawnSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).stdout.trim(),
  dirty: Boolean(spawnSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" }).stdout.trim()),
  apkSha256: createHash("sha256").update(readFileSync(path.join(root, "android/app/build/outputs/apk/e2e/app-e2e.apk"))).digest("hex"),
  driverSha256: createHash("sha256").update(readFileSync(path.join(root, "android/e2e/build/outputs/apk/androidTest/debug/e2e-debug-androidTest.apk"))).digest("hex"),
  api: checked("shell", "getprop", "ro.build.version.sdk").trim(),
  model: checked("shell", "getprop", "ro.product.model").trim(),
  fingerprint: checked("shell", "getprop", "ro.build.fingerprint").trim(),
  pageSize: checked("shell", "getconf", "PAGE_SIZE").trim(),
  size: checked("shell", "wm", "size").trim(),
  density: checked("shell", "wm", "density").trim(),
  timezone: checked("shell", "getprop", "persist.sys.timezone").trim(),
  deviceTime: checked("shell", "date").trim(),
  clockOffsetSeconds: Math.round(Number(checked("shell", "date", "+%s").trim()) - Date.now() / 1000),
};
writeFileSync(path.join(output, "device.json"), JSON.stringify(metadata, null, 2));
try {
  for (const apk of ["app/build/outputs/apk/e2e/app-e2e.apk", "e2e/build/outputs/apk/debug/e2e-debug.apk",
    "e2e/build/outputs/apk/androidTest/debug/e2e-debug-androidTest.apk"]) {
    checked("install", "-r", path.join(root, "android", apk));
  }
  checked("shell", "settings", "put", "system", "font_scale", scale);
  // Clear only the dedicated driver's evidence, never the production application.
  checked("shell", "pm", "clear", "com.remedin.e2e.driver");
  const result = adb("shell", "am", "instrument", "-w", "-r", "-e", "class", testClass,
    ...(longAlarms ? [] : ["-e", "notAnnotation", "com.remedin.e2e.LongAlarmTest"]),
    "com.remedin.e2e.driver.test/androidx.test.runner.AndroidJUnitRunner");
  const report = `${result.stdout || ""}\n${result.stderr || ""}`;
  writeFileSync(path.join(output, "instrumentation.txt"), report);
  console.log(report);
  Object.assign(metadata, parseInstrumentationResult(report, result.status, result.error));
  if (!metadata.passed) process.exitCode = 1;
} catch (error) {
  metadata.passed = false;
  metadata.error = error.message;
  process.exitCode = 1;
} finally {
  metadata.cleanupErrors = [];
  try {
    for (const [file, args] of [
      ["logcat.txt", ["logcat", "-d", "-t", "12000"]],
      ["notifications.txt", ["shell", "dumpsys", "notification", "--noredact"]],
      ["alarms.txt", ["shell", "dumpsys", "alarm"]],
    ]) writeFileSync(path.join(output, file), checked(...args));
    checked("pull", "/sdcard/Android/data/com.remedin.e2e.driver/files/e2e", output);
  } catch (error) {
    metadata.cleanupErrors.push(`Evidence: ${error.message}`);
  } finally {
    // Cleanup only: force-stop is never used as an alarm-delivery scenario.
    for (const args of [
      ["shell", "am", "force-stop", "com.remedin.e2e"],
      oldScale === "null" ? ["shell", "settings", "delete", "system", "font_scale"]
        : ["shell", "settings", "put", "system", "font_scale", oldScale],
    ]) {
      try { checked(...args); } catch (error) { metadata.cleanupErrors.push(error.message); }
    }
  }
  if (metadata.cleanupErrors.length > 0) { metadata.passed = false; process.exitCode = 1; }
  writeFileSync(path.join(output, "device.json"), JSON.stringify(metadata, null, 2));
  console.log(`Evidence: ${output}`);
}
