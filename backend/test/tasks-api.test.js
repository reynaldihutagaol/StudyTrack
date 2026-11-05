import test, { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import express from "express";
import authRoutes from "../routes/auth.js";
import taskRoutes from "../routes/tasks.js";
import courseRoutes from "../routes/courses.js";
import { resetDB } from "../db.js";

describe("Tasks API Integration", () => {
  let server;
  let baseUrl;
  let demoToken;
  let user2Token;
  let testTempDir;
  let testDbFile;

  before(async () => {
    // Isolasi berkas database: gunakan berkas sementara terisolasi, bukan backend/db.json asli
    testTempDir = fs.mkdtempSync(path.join(os.tmpdir(), "studytrack-test-"));
    testDbFile = path.join(testTempDir, "test-db.json");
    process.env.DB_FILE = testDbFile;

    resetDB();
    const app = express();
    app.use(express.json());
    app.use("/api/auth", authRoutes);
    app.use("/api/courses", courseRoutes);
    app.use("/api/tasks", taskRoutes);

    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });

    // Login demo user
    const resDemo = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "demo@studytrack.test", password: "demo1234" })
    });
    const demoData = await resDemo.json();
    demoToken = demoData.token;

    // Register second user
    const resUser2 = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama: "User Dua", email: "user2@studytrack.test", password: "password123" })
    });
    const user2Data = await resUser2.json();
    user2Token = user2Data.token;
  });

  after(() => {
    if (server) {
      server.close();
    }
    // Hapus berkas database sementara dan bersihkan env var
    if (testTempDir && fs.existsSync(testTempDir)) {
      fs.rmSync(testTempDir, { recursive: true, force: true });
    }
    delete process.env.DB_FILE;
  });

  it("GET /api/tasks dengan ?now mengembalikan urutan dan kategori sesuai spesifikasi", async () => {
    // 2026-07-03T00:00:00+07:00
    const res = await fetch(`${baseUrl}/api/tasks?now=2026-07-03T00:00:00%2B07:00`, {
      headers: { Authorization: `Bearer ${demoToken}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.tasks));
    assert.strictEqual(body.tasks.length, 3);

    // Urutan: ID 1 (mendekati), ID 3 (normal), ID 2 (overdue)
    assert.strictEqual(body.tasks[0].id, 1);
    assert.strictEqual(body.tasks[0].deadline_category, "mendekati");
    assert.ok(typeof body.tasks[0].sisa_waktu_ms === "number");
    assert.ok(body.tasks[0].sisa_waktu_ms > 0);

    assert.strictEqual(body.tasks[1].id, 3);
    assert.strictEqual(body.tasks[1].deadline_category, "normal");

    assert.strictEqual(body.tasks[2].id, 2);
    assert.strictEqual(body.tasks[2].deadline_category, "overdue");
    assert.ok(body.tasks[2].sisa_waktu_ms < 0);
  });

  it("GET /api/tasks/:id mengembalikan detail dengan kategori dan sisa waktu", async () => {
    const res = await fetch(`${baseUrl}/api/tasks/1`, {
      headers: { Authorization: `Bearer ${demoToken}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.task);
    assert.strictEqual(body.task.id, 1);
    assert.ok("deadline_category" in body.task);
    assert.ok("sisa_waktu_ms" in body.task);
    assert.strictEqual(body.task.mata_kuliah, "Database Systems");
  });

  it("isolasi user: user 2 tidak dapat melihat tugas milik user demo", async () => {
    const res = await fetch(`${baseUrl}/api/tasks`, {
      headers: { Authorization: `Bearer ${user2Token}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.deepStrictEqual(body.tasks, []);

    // Akses tugas demo oleh user 2 harus 404
    const resSingle = await fetch(`${baseUrl}/api/tasks/1`, {
      headers: { Authorization: `Bearer ${user2Token}` }
    });
    assert.strictEqual(resSingle.status, 404);
  });

  it("POST dan PUT mengembalikan bentuk konsisten dengan deadline_category dan sisa_waktu_ms", async () => {
    // Buat mata kuliah untuk user 2
    const resCourse = await fetch(`${baseUrl}/api/courses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${user2Token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: "Algoritma", kode: "IF101", dosen: "Pak Dosen" })
    });
    const courseData = await resCourse.json();

    // Buat tugas untuk user 2 bertenggat 10 jam lagi
    const futureDate = new Date(Date.now() + 10 * 3600 * 1000);
    const resPost = await fetch(`${baseUrl}/api/tasks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${user2Token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mata_kuliah_id: courseData.course.id,
        judul: "Tugas Baru",
        deadline: futureDate.toISOString()
      })
    });
    assert.strictEqual(resPost.status, 201);
    const postBody = await resPost.json();
    assert.ok(postBody.task);
    assert.strictEqual(postBody.task.deadline_category, "mendekati");
    assert.strictEqual(postBody.task.mata_kuliah, "Algoritma");

    // Update status menjadi selesai
    const resPut = await fetch(`${baseUrl}/api/tasks/${postBody.task.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${user2Token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: "selesai" })
    });
    assert.strictEqual(resPut.status, 200);
    const putBody = await resPut.json();
    assert.strictEqual(putBody.task.status, "selesai");
    assert.strictEqual(putBody.task.deadline_category, "normal");
  });

  it("mengabaikan query ?now saat NODE_ENV=production", async () => {
    const prevEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try {
      const res = await fetch(`${baseUrl}/api/tasks?now=2026-07-03T00:00:00%2B07:00`, {
        headers: { Authorization: `Bearer ${demoToken}` }
      });
      const body = await res.json();
      // Di production dengan waktu sistem nyata (sekarang tahun 2026 Nov), semua seed (Juli 2026) sudah overdue
      // Jadi ID 1 tidak menjadi 'mendekati' karena ?now diabaikan
      assert.strictEqual(res.status, 200);
      assert.notStrictEqual(body.tasks[0].deadline_category, "mendekati");
    } finally {
      process.env.NODE_ENV = prevEnv;
    }
  });
});
