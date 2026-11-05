import React, { useEffect, useState } from "react";
import api from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";
import TaskCard from "../components/TaskCard.jsx";

/**
 * Halaman Daftar Tugas:
 * - Menampilkan sapaan dinamis ("Halo, {nama}!")
 * - Baris chip statistik pastel dengan outline gelap: Aktif, Mendekati Deadline, Terlambat, Selesai
 * - Form tambah tugas dengan gaya kartu modern
 * - Daftar tugas sesuai urutan dan kategori deterministik dari backend
 * - Refetch otomatis saat fokus, tiap 60 detik, dan setelah perubahan status
 */
export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");

  async function loadTasks() {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data.tasks);
    } catch (err) {
      console.error("Gagal merefresh daftar tugas:", err);
    }
  }

  async function loadData() {
    try {
      const [tasksRes, coursesRes] = await Promise.all([api.get("/tasks"), api.get("/courses")]);
      setTasks(tasksRes.data.tasks);
      setCourses(coursesRes.data.courses);
    } catch (err) {
      console.error("Gagal memuat data:", err);
    }
  }

  useEffect(() => {
    loadData();

    function handleFocus() {
      loadTasks();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        loadTasks();
      }
    }

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadTasks();
      }
    }, 60000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!courseId) {
      setError("Pilih mata kuliah terlebih dahulu.");
      return;
    }
    try {
      await api.post("/tasks", { mata_kuliah_id: courseId, judul, deskripsi, deadline });
      setJudul("");
      setDeskripsi("");
      setDeadline("");
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.error || "Gagal menambahkan tugas.");
    }
  }

  async function handleToggleStatus(task) {
    const newStatus = task.status === "selesai" ? "belum" : "selesai";
    try {
      await api.put(`/tasks/${task.id}`, { status: newStatus });
      await loadTasks();
    } catch (err) {
      console.error("Gagal mengubah status tugas:", err);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/tasks/${id}`);
      await loadTasks();
    } catch (err) {
      console.error("Gagal menghapus tugas:", err);
    }
  }

  // Hitungan statistik murni dari array tugas yang telah di-fetch
  const aktifCount = tasks.filter((t) => t.status !== "selesai").length;
  const mendekatiCount = tasks.filter((t) => t.deadline_category === "mendekati").length;
  const overdueCount = tasks.filter((t) => t.deadline_category === "overdue").length;
  const selesaiCount = tasks.filter((t) => t.status === "selesai").length;

  const greeting = user?.nama ? `Halo, ${user.nama}!` : "Halo!";

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="main-content-panel">
        {/* Header & Stat Chips Bar */}
        <section className="dashboard-hero-section">
          <div className="hero-greeting-block">
            <h1 className="hero-greeting-title">{greeting}</h1>
            <p className="hero-greeting-sub">
              Pantau prioritas tenggat waktu dan kelola tugas kuliahmu secara terstruktur.
            </p>
          </div>

          <div className="stat-chips-grid" aria-label="Statistik Tugas">
            <div className="stat-chip stat-chip-active">
              <span className="stat-chip-icon" aria-hidden="true">📋</span>
              <div className="stat-chip-details">
                <span className="stat-chip-count">{aktifCount}</span>
                <span className="stat-chip-label">Tugas Aktif</span>
              </div>
            </div>

            <div className="stat-chip stat-chip-warning">
              <span className="stat-chip-icon" aria-hidden="true">⏰</span>
              <div className="stat-chip-details">
                <span className="stat-chip-count">{mendekatiCount}</span>
                <span className="stat-chip-label">Mendekati Deadline</span>
              </div>
            </div>

            <div className="stat-chip stat-chip-danger">
              <span className="stat-chip-icon" aria-hidden="true">⚠️</span>
              <div className="stat-chip-details">
                <span className="stat-chip-count">{overdueCount}</span>
                <span className="stat-chip-label">Terlambat</span>
              </div>
            </div>

            <div className="stat-chip stat-chip-success">
              <span className="stat-chip-icon" aria-hidden="true">✅</span>
              <div className="stat-chip-details">
                <span className="stat-chip-count">{selesaiCount}</span>
                <span className="stat-chip-label">Selesai</span>
              </div>
            </div>
          </div>
        </section>

        {/* Form Tambah Tugas */}
        <section className="form-card-neo">
          <div className="form-header-row">
            <span className="form-badge-pill">Form Baru</span>
            <h2 className="form-title">Tambah Tugas</h2>
          </div>

          <form onSubmit={handleSubmit} className="neo-form">
            <div className="form-row-grid">
              <div className="form-group">
                <label htmlFor="course-select" className="form-label">
                  Mata Kuliah <span className="required-star">*</span>
                </label>
                <select
                  id="course-select"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  required
                  className="neo-input"
                >
                  <option value="">-- Pilih Mata Kuliah --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.kode ? `(${c.kode})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="deadline-input" className="form-label">
                  Batas Pengumpulan (WIB) <span className="required-star">*</span>
                </label>
                <input
                  id="deadline-input"
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  className="neo-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="title-input" className="form-label">
                Judul Tugas <span className="required-star">*</span>
              </label>
              <input
                id="title-input"
                type="text"
                placeholder="Contoh: Lab 4: Query Optimization Report"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                required
                className="neo-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="desc-input" className="form-label">
                Deskripsi atau Catatan Tambahan (opsional)
              </label>
              <textarea
                id="desc-input"
                placeholder="Tuliskan catatan teknis atau instruksi khusus tugas..."
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                rows={2}
                className="neo-input neo-textarea"
              />
            </div>

            {error && <p className="form-error-alert" role="alert">{error}</p>}

            <div className="form-actions-row">
              <button type="submit" className="btn-pill-primary">
                Tambah Tugas
              </button>
            </div>
          </form>
        </section>

        {/* Daftar Tugas Header & List */}
        <section className="task-list-section">
          <div className="section-title-row">
            <h2 className="section-heading">Daftar Seluruh Tugas</h2>
            <span className="task-count-pill">{tasks.length} total tugas</span>
          </div>

          {tasks.length === 0 ? (
            <div className="empty-state-card">
              <p className="empty-state-title">Belum ada tugas kuliah.</p>
              <p className="empty-state-sub">Gunakan form di atas untuk menambahkan tugas pertamamu.</p>
            </div>
          ) : (
            <div className="task-cards-stack">
              {tasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
