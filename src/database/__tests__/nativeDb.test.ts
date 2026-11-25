import { createTestDatabase } from "../testing/testDatabase";

describe("native database transaction queue", () => {
  it("recovers from failed writes in a burst of 512 transactions", async () => {
    const { db, close } = createTestDatabase();
    try {
      await db.execAsync("CREATE TABLE writes (id INTEGER PRIMARY KEY)");
      const writes = Array.from({ length: 512 }, (_, index) =>
        db.withTransactionAsync(async (transaction) => {
          await transaction.runAsync("INSERT INTO writes VALUES (?)", index);
          if (index % 8 === 0) throw new Error("Simulated write failure");
        })
      );
      const settled = await Promise.allSettled(writes);
      const rows = await db.getAllAsync<{ id: number }>("SELECT id FROM writes ORDER BY id");

      expect(settled.filter(({ status }) => status === "rejected")).toHaveLength(64);
      expect(rows.map(({ id }) => id)).toEqual(
        Array.from({ length: 512 }, (_, index) => index).filter((index) => index % 8 !== 0)
      );
    } finally {
      close();
    }
  });

  it("serializes transactions and outside operations on one connection", async () => {
    const { db, close } = createTestDatabase();

    try {
      await db.execAsync(
        "CREATE TABLE events (position INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)"
      );
      let releaseFirst: () => void = () => undefined;
      let markFirstStarted: () => void = () => undefined;
      const firstGate = new Promise<void>((resolve) => {
        releaseFirst = resolve;
      });
      const firstStarted = new Promise<void>((resolve) => {
        markFirstStarted = resolve;
      });

      const first = db.withTransactionAsync(async (transaction) => {
        await transaction.runAsync(
          "INSERT INTO events (name) VALUES (?)",
          "first-start"
        );
        markFirstStarted();
        await firstGate;
        await transaction.runAsync(
          "INSERT INTO events (name) VALUES (?)",
          "first-end"
        );
      });
      await firstStarted;

      const second = db.withTransactionAsync(async (transaction) => {
        await transaction.runAsync(
          "INSERT INTO events (name) VALUES (?)",
          "second"
        );
      });
      const outside = db.runAsync(
        "INSERT INTO events (name) VALUES (?)",
        "outside"
      );

      releaseFirst();
      await Promise.all([first, second, outside]);

      const rows = await db.getAllAsync<{ name: string }>(
        "SELECT name FROM events ORDER BY position"
      );
      expect(rows.map((row) => row.name)).toEqual([
        "first-start",
        "first-end",
        "second",
        "outside",
      ]);
    } finally {
      close();
    }
  });
});
