import { createDoseOperationRunner, finishCommittedDoseAction } from "../doseOperation";

describe("dose operations", () => {
  it("deduplicates simultaneous commands for the same dose and permits a later retry", async () => {
    const run = createDoseOperationRunner();
    let release!: () => void;
    const command = jest.fn(() => new Promise<void>((resolve) => { release = resolve; }));
    const first = run("dose", command);
    expect(run("dose", command)).toBe(first);
    await Promise.resolve();
    expect(command).toHaveBeenCalledTimes(1);
    release();
    await first;
    await run("dose", async () => {});
  });

  it("refreshes committed logs before cancelling reminders and queues recovery on failure", async () => {
    const refresh = jest.fn().mockResolvedValue(undefined);
    const cancel = jest.fn(async () => {
      expect(refresh).toHaveBeenCalledTimes(1);
      throw new Error("native failure");
    });
    const recover = jest.fn();
    await expect(finishCommittedDoseAction(refresh, cancel, recover)).rejects.toThrow("Dose registrada");
    expect(recover).toHaveBeenCalledTimes(1);
  });

  it("releases the lock when persistence fails", async () => {
    const run = createDoseOperationRunner();
    await expect(run("dose", async () => { throw new Error("storage"); })).rejects.toThrow("storage");
    const retry = jest.fn().mockResolvedValue(undefined);
    await run("dose", retry);
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
