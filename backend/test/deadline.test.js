import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseDeadline,
  classify,
  sortTasks,
  enrichTask,
  processTasks,
  TWENTY_FOUR_HOURS_MS
} from "../utils/deadline.js";

describe("Deadline Utility", () => {
  const simulatedNow = new Date("2026-07-03T00:00:00+07:00");

  describe("parseDeadline & Timezone WIB (+07:00)", () => {
    it("menafsirkan deadline tanpa zona sebagai WIB (+07:00) secara deterministik", () => {
      // 2026-07-03T23:59:00 WIB = 2026-07-03T16:59:00.000Z
      const parsed = parseDeadline("2026-07-03T23:59:00");
      assert.ok(parsed instanceof Date);
      assert.strictEqual(parsed.toISOString(), "2026-07-03T16:59:00.000Z");

      // Format input datetime-local (tanpa detik)
      const parsedWithoutSec = parseDeadline("2026-07-03T23:59");
      assert.strictEqual(parsedWithoutSec.toISOString(), "2026-07-03T16:59:00.000Z");
    });

    it("mempertahankan zona jika string sudah memiliki offset atau UTC (Z)", () => {
      const parsedUTC = parseDeadline("2026-07-03T16:59:00.000Z");
      assert.strictEqual(parsedUTC.toISOString(), "2026-07-03T16:59:00.000Z");

      const parsedOffset = parseDeadline("2026-07-03T18:59:00+09:00");
      assert.strictEqual(parsedOffset.toISOString(), "2026-07-03T09:59:00.000Z");
    });

    it("mengembalikan null untuk deadline kosong atau tidak valid tanpa crash", () => {
      assert.strictEqual(parseDeadline(null), null);
      assert.strictEqual(parseDeadline(undefined), null);
      assert.strictEqual(parseDeadline(""), null);
      assert.strictEqual(parseDeadline("   "), null);
      assert.strictEqual(parseDeadline("tanggal-ngawur"), null);
    });
  });

  describe("classify", () => {
    it("mengklasifikasikan data seed dengan tepat pada now = 2026-07-03T00:00+07:00", () => {
      const seedTask1 = {
        id: 1,
        judul: "Lab 4: Query Optimization Report",
        deadline: "2026-07-03T23:59:00",
        status: "belum"
      };
      const seedTask2 = {
        id: 2,
        judul: "Project 3: BSTMap Implementation",
        deadline: "2026-07-02T10:00:00",
        status: "belum"
      };
      const seedTask3 = {
        id: 3,
        judul: "Sprint 2: Backend API Integration",
        deadline: "2026-07-06T23:59:00",
        status: "belum"
      };

      assert.strictEqual(classify(seedTask1, simulatedNow), "mendekati");
      assert.strictEqual(classify(seedTask2, simulatedNow), "overdue");
      assert.strictEqual(classify(seedTask3, simulatedNow), "normal");
    });

    it("kasus negatif: status 'selesai' selalu menghasilkan kategori 'normal'", () => {
      const finishedTaskNear = {
        id: 10,
        deadline: "2026-07-03T02:00:00", // sisa 2 jam
        status: "selesai"
      };
      const finishedTaskOverdue = {
        id: 11,
        deadline: "2026-07-01T10:00:00", // sudah lewat 2 hari
        status: "selesai"
      };

      assert.strictEqual(classify(finishedTaskNear, simulatedNow), "normal");
      assert.strictEqual(classify(finishedTaskOverdue, simulatedNow), "normal");
    });

    it("kasus edge: batas presisi sisa waktu", () => {
      // 1. Tepat 24 jam sisa waktu -> "normal" (karena aturan strict sisa < 24 jam)
      const exact24Hours = new Date(simulatedNow.getTime() + TWENTY_FOUR_HOURS_MS);
      const task24Hours = {
        id: 20,
        deadline: exact24Hours.toISOString(),
        status: "belum"
      };
      assert.strictEqual(classify(task24Hours, simulatedNow), "normal");

      // 2. Sisa 23 jam 59 menit 59 detik -> "mendekati"
      const task23h59m59s = {
        id: 21,
        deadline: new Date(simulatedNow.getTime() + TWENTY_FOUR_HOURS_MS - 1000).toISOString(),
        status: "belum"
      };
      assert.strictEqual(classify(task23h59m59s, simulatedNow), "mendekati");

      // 3. Tepat 0 milidetik sisa waktu -> "overdue" (sisa <= 0)
      const taskExactZero = {
        id: 22,
        deadline: simulatedNow.toISOString(),
        status: "belum"
      };
      assert.strictEqual(classify(taskExactZero, simulatedNow), "overdue");
    });

    it("kasus edge: deadline kosong atau tidak valid tetap menghasilkan 'normal' tanpa error", () => {
      const taskNullDeadline = { id: 30, deadline: null, status: "belum" };
      const taskEmptyDeadline = { id: 31, deadline: "", status: "belum" };
      const taskInvalidDeadline = { id: 32, deadline: "bukan-tanggal", status: "belum" };

      assert.strictEqual(classify(taskNullDeadline, simulatedNow), "normal");
      assert.strictEqual(classify(taskEmptyDeadline, simulatedNow), "normal");
      assert.strictEqual(classify(taskInvalidDeadline, simulatedNow), "normal");
    });
  });

  describe("sortTasks & processTasks", () => {
    it("mengurutkan data seed menjadi: ID 1 (mendekati), ID 3 (normal), ID 2 (overdue)", () => {
      const seedTasks = [
        {
          id: 1,
          judul: "Lab 4: Query Optimization Report",
          deadline: "2026-07-03T23:59:00",
          status: "belum",
          created_at: "2026-06-15T09:00:00"
        },
        {
          id: 2,
          judul: "Project 3: BSTMap Implementation",
          deadline: "2026-07-02T10:00:00",
          status: "belum",
          created_at: "2026-06-16T14:00:00"
        },
        {
          id: 3,
          judul: "Sprint 2: Backend API Integration",
          deadline: "2026-07-06T23:59:00",
          status: "belum",
          created_at: "2026-06-17T11:00:00"
        }
      ];

      const processed = processTasks(seedTasks, simulatedNow);
      assert.deepStrictEqual(
        processed.map((t) => t.id),
        [1, 3, 2]
      );
      assert.strictEqual(processed[0].deadline_category, "mendekati");
      assert.strictEqual(processed[1].deadline_category, "normal");
      assert.strictEqual(processed[2].deadline_category, "overdue");
    });

    it("mengurutkan di dalam masing-masing grup sesuai aturan spesifik", () => {
      const testTasks = [
        // 2 tugas mendekati: harus urut deadline ASC (yang paling cepat tenggatnya paling atas)
        { id: 101, deadline: "2026-07-03T18:00:00", status: "belum", created_at: "2026-07-01T10:00:00" },
        { id: 102, deadline: "2026-07-03T12:00:00", status: "belum", created_at: "2026-07-01T09:00:00" },

        // 2 tugas normal: harus urut created_at DESC (yang terbaru dibuat di atas)
        { id: 201, deadline: "2026-07-10T10:00:00", status: "belum", created_at: "2026-07-01T08:00:00" },
        { id: 202, deadline: "2026-07-15T10:00:00", status: "belum", created_at: "2026-07-01T11:00:00" },

        // 2 tugas overdue: harus urut deadline DESC (yang baru saja lewat di atas)
        { id: 301, deadline: "2026-07-01T10:00:00", status: "belum", created_at: "2026-06-25T10:00:00" }, // lewat 38 jam
        { id: 302, deadline: "2026-07-02T22:00:00", status: "belum", created_at: "2026-06-25T10:00:00" }  // lewat 2 jam
      ];

      const processed = processTasks(testTasks, simulatedNow);
      const ids = processed.map((t) => t.id);

      // Grup mendekati: ID 102 (12:00) sebelum ID 101 (18:00)
      assert.strictEqual(ids[0], 102);
      assert.strictEqual(ids[1], 101);

      // Grup normal: ID 202 (created 11:00) sebelum ID 201 (created 08:00)
      assert.strictEqual(ids[2], 202);
      assert.strictEqual(ids[3], 201);

      // Grup overdue: ID 302 (deadline 2 Jul 22:00) sebelum ID 301 (deadline 1 Jul 10:00)
      assert.strictEqual(ids[4], 302);
      assert.strictEqual(ids[5], 301);
    });

    it("menghitung sisa_waktu_ms dengan benar (positif untuk masa depan, negatif untuk overdue)", () => {
      const task = { id: 1, deadline: "2026-07-03T02:00:00", status: "belum" };
      const enriched = enrichTask(task, simulatedNow);
      // 2 jam = 2 * 3600 * 1000 = 7,200,000 ms
      assert.strictEqual(enriched.sisa_waktu_ms, 7200000);
      assert.strictEqual(enriched.deadline_category, "mendekati");

      const overdueTask = { id: 2, deadline: "2026-07-02T23:00:00", status: "belum" };
      const enrichedOverdue = enrichTask(overdueTask, simulatedNow);
      // Lewat 1 jam = -3,600,000 ms
      assert.strictEqual(enrichedOverdue.sisa_waktu_ms, -3600000);
      assert.strictEqual(enrichedOverdue.deadline_category, "overdue");
    });
  });
});

