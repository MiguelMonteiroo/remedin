export function parseInstrumentationResult(report, exitCode, error) {
  const results = [];
  let currentTest;
  for (const line of report.split(/\r?\n/)) {
    if (line.startsWith("INSTRUMENTATION_STATUS: test=")) currentTest = line.split("test=")[1];
    const code = line.match(/^INSTRUMENTATION_STATUS_CODE: (-?\d+)/)?.[1];
    if (currentTest && ["0", "-1", "-2", "-3", "-4"].includes(code)) {
      results.push({ test: currentTest, status: code === "0" ? "passed" : ["-1", "-2"].includes(code) ? "failed" : "skipped" });
    }
  }
  const completed = Number(report.match(/OK \((\d+) tests?\)/)?.[1] || 0);
  const expected = Number(report.match(/INSTRUMENTATION_STATUS: numtests=(\d+)/)?.[1] || 0);
  const skipped = results.filter((result) => result.status === "skipped").length;
  return {
    results, skipped,
    passed: !error && exitCode === 0 && completed > 0 && completed === expected
      && results.length === completed && results.every((result) => result.status === "passed")
      && !/FAILURES!!!|INSTRUMENTATION_FAILED|Process crashed/.test(report),
  };
}
