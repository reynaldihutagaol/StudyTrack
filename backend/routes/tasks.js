import { Router } from "express";
import { readDB, writeDB } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { processTasks, enrichTask, parseDeadline } from "../utils/deadline.js";

const router = Router();

// Seluruh endpoint tugas membutuhkan login.
router.use(requireAuth);

/**
 * GET /api/tasks
 * Daftar seluruh tugas milik pengguna yang sedang login, lintas semua mata kuliah.
 * Setiap tugas menyertakan `mata_kuliah`, `deadline_category`, dan `sisa_waktu_ms`.
 *
 * Urutan hasil:
 * 1. Grup "mendekati" (sisa < 24 jam) diurutkan berdasarkan `deadline` ASC.
 * 2. Grup "normal" diurutkan berdasarkan `created_at` DESC (perilaku bawaan).
 * 3. Grup "overdue" (sisa <= 0) diurutkan berdasarkan `deadline` DESC (yang baru saja lewat di atas).
 *
 * Parameter simulasi waktu (non-production):
 * Khusus lingkungan non-production (NODE_ENV !== "production"), query `?now=<ISO 8601 dengan zona>`
 * diizinkan untuk mensimulasikan waktu acuan sistem. Ini digunakan untuk pengujian dan demo
 * data seed yang tenggat waktunya telah lampau. Pada lingkungan production, parameter query ini
 * diabaikan sepenuhnya dan waktu server saat ini selalu digunakan.
 *
 * Response : 200 { tasks }
 */
router.get("/", (req, res) => {
  let now = new Date();

  // Simulasi waktu hanya aktif di luar lingkungan production
  if (process.env.NODE_ENV !== "production" && req.query.now) {
    const simulated = parseDeadline(req.query.now);
    if (simulated) {
      now = simulated;
    }
  }

  const db = readDB();
  const userTasks = db.tasks
    .filter((t) => t.user_id === req.user.id)
    .map((t) => {
      const course = db.courses.find((c) => c.id === t.mata_kuliah_id);
      return { ...t, mata_kuliah: course ? course.name : null };
    });

  const tasks = processTasks(userTasks, now);

  res.json({ tasks });
});

/**
 * GET /api/tasks/:id
 * Detail satu tugas milik pengguna yang sedang login beserta klasifikasi deadline.
 *
 * Response : 200 { task } | 404 tidak ditemukan
 */
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const db = readDB();
  const rawTask = db.tasks.find((t) => t.id === id && t.user_id === req.user.id);
  if (!rawTask) {
    return res.status(404).json({ error: "Tugas tidak ditemukan." });
  }

  const course = db.courses.find((c) => c.id === rawTask.mata_kuliah_id);
  const taskWithCourse = { ...rawTask, mata_kuliah: course ? course.name : null };
  const task = enrichTask(taskWithCourse, new Date());

  res.json({ task });
});

/**
 * POST /api/tasks
 * Menambahkan tugas baru dengan status awal "belum".
 *
 * Body     : { mata_kuliah_id, judul, deadline, deskripsi? }
 * Response : 201 { task } | 400 input tidak valid atau mata kuliah bukan milik user
 */
router.post("/", (req, res) => {
  const { mata_kuliah_id, judul, deskripsi, deadline } = req.body;
  if (!mata_kuliah_id || !judul || !deadline) {
    return res.status(400).json({ error: "mata_kuliah_id, judul, dan deadline wajib diisi." });
  }

  const parsedDeadline = parseDeadline(deadline);
  if (!parsedDeadline) {
    return res.status(400).json({ error: "Format deadline tidak valid." });
  }
  // Cegah penambahan tugas dengan batas waktu yang sudah lampau (toleransi 1 menit)
  if (parsedDeadline.getTime() < Date.now() - 60000) {
    return res.status(400).json({ error: "Batas pengumpulan tidak boleh sebelum waktu saat ini." });
  }

  const db = readDB();
  const course = db.courses.find((c) => c.id === Number(mata_kuliah_id) && c.user_id === req.user.id);
  if (!course) {
    return res.status(400).json({ error: "Mata kuliah tidak ditemukan untuk user ini." });
  }

  const newTask = {
    id: db.nextIds.task++,
    user_id: req.user.id,
    mata_kuliah_id: Number(mata_kuliah_id),
    judul,
    deskripsi: deskripsi || "",
    deadline,
    status: "belum",
    created_at: new Date().toISOString()
  };
  db.tasks.push(newTask);
  writeDB(db);

  const taskWithCourse = { ...newTask, mata_kuliah: course.name };
  const task = enrichTask(taskWithCourse, new Date());
  res.status(201).json({ task });
});

/**
 * PUT /api/tasks/:id
 * Memperbarui tugas, termasuk mengubah status. Hanya field yang dikirim yang
 * diubah.
 *
 * Body     : { judul?, deskripsi?, deadline?, status? } (status: "belum" | "selesai")
 * Response : 200 { task } | 400 status tidak valid | 404 tidak ditemukan
 */
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const db = readDB();
  const task = db.tasks.find((t) => t.id === id && t.user_id === req.user.id);
  if (!task) {
    return res.status(404).json({ error: "Tugas tidak ditemukan." });
  }

  const { judul, deskripsi, deadline, status } = req.body;
  if (judul !== undefined) task.judul = judul;
  if (deskripsi !== undefined) task.deskripsi = deskripsi;
  if (deadline !== undefined) {
    const parsedDeadline = parseDeadline(deadline);
    if (!parsedDeadline) {
      return res.status(400).json({ error: "Format deadline tidak valid." });
    }
    if (parsedDeadline.getTime() < Date.now() - 60000) {
      return res.status(400).json({ error: "Batas pengumpulan tidak boleh sebelum waktu saat ini." });
    }
    task.deadline = deadline;
  }
  if (status !== undefined) {
    if (!["belum", "selesai"].includes(status)) {
      return res.status(400).json({ error: "Status hanya boleh 'belum' atau 'selesai'." });
    }
    task.status = status;
  }
  writeDB(db);

  const course = db.courses.find((c) => c.id === task.mata_kuliah_id);
  const taskWithCourse = { ...task, mata_kuliah: course ? course.name : null };
  const enrichedTask = enrichTask(taskWithCourse, new Date());
  res.json({ task: enrichedTask });
});

/**
 * DELETE /api/tasks/:id
 * Menghapus satu tugas.
 *
 * Response : 200 { success: true } | 404 tidak ditemukan
 */
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const db = readDB();
  const task = db.tasks.find((t) => t.id === id && t.user_id === req.user.id);
  if (!task) {
    return res.status(404).json({ error: "Tugas tidak ditemukan." });
  }

  db.tasks = db.tasks.filter((t) => t.id !== id);
  writeDB(db);
  res.json({ success: true });
});

export default router;
