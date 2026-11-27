import test from "node:test";
import assert from "node:assert/strict";
import { parseInstrumentationResult } from "./e2e-results.mjs";

const output = (code = 0, count = 1) => `INSTRUMENTATION_STATUS: numtests=${count}\nINSTRUMENTATION_STATUS: test=example\nINSTRUMENTATION_STATUS_CODE: ${code}\nOK (${count} test)\n`;
test("requires at least one completed test", () => {
  assert.equal(parseInstrumentationResult("OK (0 tests)", 0).passed, false);
});
test("accepts a complete successful run", () => {
  assert.equal(parseInstrumentationResult(output(), 0).passed, true);
});
test("rejects failed, skipped, truncated and mismatched results", () => {
  for (const report of [output(-2), output(-4), output(0, 2), output().replace("OK (1 test)", ""), `${output()}\nProcess crashed`]) {
    assert.equal(parseInstrumentationResult(report, 0).passed, false);
  }
  assert.equal(parseInstrumentationResult(output(), 1).passed, false);
  assert.equal(parseInstrumentationResult(output(), 0, new Error("timeout")).passed, false);
});
