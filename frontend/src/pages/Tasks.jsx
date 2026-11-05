import React, { useEffect, useState } from "react";
import api from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";
import TaskCard, { formatDuration } from "../components/TaskCard.jsx";

/**
 * Format deadline tanggal ramah pembaca
 */
function formatDeadlineShort(deadline) {
  if (!deadline) return "-";
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return deadline;
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

/**
 * Halaman Utama Daftar Tugas:
 * - Latar kanvas hitam / dark sesuai estetika perangkat modern
 * - Header sapaan besar & chip statistik ber-outline
 * - Input tambah tugas dimuat langsung di bagian atas kolom kanan agar langsung dapat diakses
 * - Hero Card "Prioritas Utama" di kolom kiri atas
 * - Tab filter pill & grid 2 kolom kartu tugas
 * - Seluruh ikon adalah pure SVG (zero emoticon/emoji)
 */
export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);

  // Form input tambah tugas langsung
  const [courseId, setCourseId] = useState("");
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [deadline, setDeadline] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State filter tab (Semua, Mendekati, Normal, Terlambat, Selesai)
  const [activeFilter, setActiveFilter] = useState("Semua");

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

  async function handleCreateTask(e) {
    e.preventDefault();
    setFormError("");
    if (!courseId) {
      setFormError("Pilih mata kuliah terlebih dahulu.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post("/tasks", { mata_kuliah_id: courseId, judul, deskripsi, deadline });
      setJudul("");
      setDeskripsi("");
      setDeadline("");
      await loadTasks();
    } catch (err) {
      setFormError(err.response?.data?.error || "Gagal menambahkan tugas.");
    } finally {
      setIsSubmitting(false);
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

  // Hitungan statistik dari data yang telah di-fetch (tanpa klasifikasi ulang)
  const aktifCount = tasks.filter((t) => t.status !== "selesai").length;
  const mendekatiCount = tasks.filter((t) => t.deadline_category === "mendekati").length;
  const overdueCount = tasks.filter((t) => t.deadline_category === "overdue").length;
  const selesaiCount = tasks.filter((t) => t.status === "selesai").length;

  const greeting = user?.nama ? `Halo, ${user.nama}!` : "Halo!";

  // 1. Hero task: item pertama berkategori mendekati; bila tidak ada, item pertama normal; bila tidak ada, null
  const heroTask =
    tasks.find((t) => t.deadline_category === "mendekati" && t.status !== "selesai") ||
    tasks.find((t) => t.deadline_category === "normal" && t.status !== "selesai") ||
    (tasks.length > 0 ? tasks[0] : null);

  // 2. Filter data murni dari server berdasarkan status / deadline_category (tanpa urut ulang)
  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === "Mendekati") return t.deadline_category === "mendekati" && t.status !== "selesai";
    if (activeFilter === "Normal") return t.deadline_category === "normal" && t.status !== "selesai";
    if (activeFilter === "Terlambat") return t.deadline_category === "overdue" && t.status !== "selesai";
    if (activeFilter === "Selesai") return t.status === "selesai";
    return true; // "Semua"
  });

  // 3. Ringkasan per mata kuliah (dihitung dari data fetched)
  const courseSummaries = courses.map((c) => {
    const courseTasks = tasks.filter((t) => t.mata_kuliah_id === c.id);
    const total = courseTasks.length;
    const selesai = courseTasks.filter((t) => t.status === "selesai").length;
    const percent = total > 0 ? Math.round((selesai / total) * 100) : 0;
    return { ...c, total, selesai, percent };
  });

  // 4. Tiga deadline terdekat berikutnya untuk tilted card
  const upcomingDeadlines = tasks
    .filter((t) => t.status !== "selesai" && t.deadline_category !== "overdue")
    .slice(0, 3);

  return (
    <div className="device-canvas">
      <div className="device-frame">
        <Navbar />

        <main className="app-panel">
          {/* Header Panel: Sapaan besar di kiri & 4 chip statistik berbaris di kanan */}
          <section className="panel-header-section">
            <div className="header-greeting-block">
              <h1 className="greeting-main-heading">{greeting}</h1>
              <p className="greeting-sub-text">
                Kamu memiliki <strong className="highlight-text">{aktifCount} tugas aktif</strong> yang perlu diselesaikan. Pantau jadwal dengan rapi.
              </p>
            </div>

            <div className="stat-chips-row" aria-label="Ringkasan Statistik Tugas">
              <div className="stat-chip stat-chip-slate">
                <div className="stat-chip-corner-blob" aria-hidden="true" />
                <svg className="stat-chip-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
                <div className="stat-chip-content">
                  <span className="stat-chip-number">{aktifCount}</span>
                  <span className="stat-chip-name">Tugas Aktif</span>
                </div>
              </div>

              <div className="stat-chip stat-chip-amber">
                <div className="stat-chip-corner-blob" aria-hidden="true" />
                <svg className="stat-chip-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <div className="stat-chip-content">
                  <span className="stat-chip-number">{mendekatiCount}</span>
                  <span className="stat-chip-name">Mendekati</span>
                </div>
              </div>

              <div className="stat-chip stat-chip-red">
                <div className="stat-chip-corner-blob" aria-hidden="true" />
                <svg className="stat-chip-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div className="stat-chip-content">
                  <span className="stat-chip-number">{overdueCount}</span>
                  <span className="stat-chip-name">Terlambat</span>
                </div>
              </div>

              <div className="stat-chip stat-chip-green">
                <div className="stat-chip-corner-blob" aria-hidden="true" />
                <svg className="stat-chip-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <div className="stat-chip-content">
                  <span className="stat-chip-number">{selesaiCount}</span>
                  <span className="stat-chip-name">Selesai</span>
                </div>
              </div>
            </div>
          </section>

          {/* Grid Dua Kolom (Sekitar 62% Kiri / 38% Kanan) */}
          <div className="dashboard-grid-layout">
            {/* ================= KOLOM KIRI ================= */}
            <div className="dashboard-column-left">
              {/* a. Hero Card "Prioritas Utama" */}
              <section className="hero-priority-section" aria-label="Prioritas Utama">
                <h2 className="section-subtitle-heading">Prioritas Utama</h2>

                {heroTask ? (
                  <div className="hero-task-card">
                    {/* Bentuk blob lime besar di sisi kiri dengan ikon SVG datar buatan sendiri */}
                    <div className="hero-blob-artwork" aria-hidden="true">
                      <svg
                        className="hero-blob-svg"
                        viewBox="0 0 120 120"
                        fill="none"
                      >
                        <path
                          d="M25 15C55 5 95 15 105 45C115 75 95 105 65 112C35 118 10 98 6 68C2 38 10 20 25 15Z"
                          fill="#bef264"
                        />
                      </svg>
                      <svg
                        className="hero-center-icon"
                        width="36"
                        height="36"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#18181b"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                      </svg>
                    </div>

                    {/* Informasi Konten Hero Task */}
                    <div className="hero-content-body">
                      <div className="hero-meta-row">
                        <span className="hero-category-label">
                          PRIORITAS UTAMA
                        </span>
                        {heroTask.deadline_category === "mendekati" && (
                          <span className="hero-urgent-pill">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span>Segera Kumpulkan</span>
                          </span>
                        )}
                      </div>

                      <h3 className="hero-task-title">{heroTask.judul}</h3>

                      <div className="hero-info-tags">
                        {heroTask.mata_kuliah && (
                          <span className="hero-course-tag">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                            </svg>
                            <span>{heroTask.mata_kuliah}</span>
                          </span>
                        )}
                        <span className="hero-deadline-tag">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <span>{formatDeadlineShort(heroTask.deadline)}</span>
                        </span>
                        {heroTask.sisa_waktu_ms && (
                          <span className="hero-remaining-tag">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span>{formatDuration(heroTask.sisa_waktu_ms)}</span>
                          </span>
                        )}
                      </div>

                      {/* Baris Progres Urgensi */}
                      <div className="hero-urgency-track-bar" aria-hidden="true">
                        <div
                          className={`hero-urgency-fill ${heroTask.deadline_category === "mendekati" ? "fill-urgent" : "fill-normal"}`}
                          style={{ width: heroTask.deadline_category === "mendekati" ? "85%" : "40%" }}
                        />
                      </div>

                      <div className="hero-actions-row">
                        <button
                          type="button"
                          className="btn-pill-hero-primary"
                          onClick={() => handleToggleStatus(heroTask)}
                        >
                          {heroTask.status === "selesai" ? "Batalkan Selesai" : "Tandai Selesai"}
                        </button>
                        <button
                          type="button"
                          className="btn-circle-hero-secondary"
                          onClick={() => handleDelete(heroTask.id)}
                          aria-label={`Hapus tugas ${heroTask.judul}`}
                          title="Hapus tugas ini"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Dual Cutout Controls di pojok kanan atas Hero (seperti referensi) */}
                    <div className="hero-top-cutout-controls" aria-hidden="true">
                      <span className="cutout-control-btn cutout-bell">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                      </span>
                      <span className="cutout-control-btn cutout-dots">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="19" cy="12" r="1" />
                          <circle cx="5" cy="12" r="1" />
                        </svg>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="hero-empty-state">
                    <p className="hero-empty-title">Tidak ada tugas prioritas mendesak.</p>
                    <p className="hero-empty-sub">Semua tugasmu berjalan lancar atau belum ada tugas yang ditambahkan.</p>
                  </div>
                )}
              </section>

              {/* b. Header Daftar Tugas & Filter Tabs */}
              <section className="task-list-container" aria-label="Semua Tugas">
                <div className="task-filter-header-row">
                  <div className="title-with-count">
                    <h2 className="section-subtitle-heading">Daftar Tugas</h2>
                    <span className="task-badge-total">{filteredTasks.length} tugas</span>
                  </div>

                  <div className="filter-pills-bar" role="tablist" aria-label="Filter kategori tugas">
                    {["Semua", "Mendekati", "Normal", "Terlambat", "Selesai"].map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        role="tab"
                        aria-selected={activeFilter === filter}
                        className={`filter-pill-btn ${activeFilter === filter ? "active" : ""}`}
                        onClick={() => setActiveFilter(filter)}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* c. Grid 2-Kolom Kartu Tugas */}
                {filteredTasks.length === 0 ? (
                  <div className="empty-tasks-box">
                    <p className="empty-box-title">Tidak ada tugas untuk filter "{activeFilter}".</p>
                    <p className="empty-box-sub">Gunakan formulir tambah tugas di sebelah kanan untuk menambahkan tugas baru.</p>
                  </div>
                ) : (
                  <div className="task-cards-grid-2col">
                    {filteredTasks.map((t) => (
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
            </div>

            {/* ================= KOLOM KANAN ================= */}
            <aside className="dashboard-column-right" aria-label="Formulir Input dan Informasi Pendukung">
              {/* 1. INPUT TAMBAH TUGAS LANGSUNG DI ATAS (Sesuai Permintaan User) */}
              <section className="task-add-card-top" aria-label="Tambah Tugas Baru">
                <div className="add-card-header">
                  <div className="add-card-title-group">
                    <span className="brand-dot-lime" aria-hidden="true" />
                    <h3 className="add-card-heading">Tambah Tugas Baru</h3>
                  </div>
                </div>

                <form onSubmit={handleCreateTask} className="neo-form add-task-direct-form">
                  <div className="form-group form-group-compact">
                    <label htmlFor="top-task-course" className="form-label">
                      Mata Kuliah <span className="required-star">*</span>
                    </label>
                    <select
                      id="top-task-course"
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

                  <div className="form-group form-group-compact">
                    <label htmlFor="top-task-title" className="form-label">
                      Judul Tugas <span className="required-star">*</span>
                    </label>
                    <input
                      id="top-task-title"
                      type="text"
                      placeholder="Contoh: Lab 5: B+ Tree Indexing"
                      value={judul}
                      onChange={(e) => setJudul(e.target.value)}
                      required
                      className="neo-input"
                    />
                  </div>

                  <div className="form-group form-group-compact">
                    <label htmlFor="top-task-deadline" className="form-label">
                      Batas Pengumpulan (WIB) <span className="required-star">*</span>
                    </label>
                    <input
                      id="top-task-deadline"
                      type="datetime-local"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      required
                      className="neo-input"
                    />
                  </div>

                  <div className="form-group form-group-compact">
                    <label htmlFor="top-task-desc" className="form-label">
                      Catatan / Deskripsi (opsional)
                    </label>
                    <textarea
                      id="top-task-desc"
                      placeholder="Catatan pengerjaan atau referensi..."
                      value={deskripsi}
                      onChange={(e) => setDeskripsi(e.target.value)}
                      rows={2}
                      className="neo-input neo-textarea"
                    />
                  </div>

                  {formError && (
                    <p className="form-error-alert" role="alert">
                      {formError}
                    </p>
                  )}

                  <div className="add-task-submit-row">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-pill-primary btn-submit-task-full"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      <span>{isSubmitting ? "Menyimpan..." : "Simpan Tugas"}</span>
                    </button>
                  </div>
                </form>
              </section>

              {/* 2. Kartu Putih Tilted 3 Derajat (Overlay Card) */}
              <div className="tilted-overlay-card" aria-label="Deadline Terdekat Berikutnya">
                <div className="tilted-card-header">
                  <div className="tilted-header-left">
                    <span className="tilted-card-tag">JADWAL TERDEKAT</span>
                    <h3 className="tilted-card-title">Deadline Terdekat</h3>
                  </div>
                  <span className="tilted-schedule-badge" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </span>
                </div>

                {upcomingDeadlines.length === 0 ? (
                  <p className="tilted-empty-text">Tidak ada jadwal tenggat waktu terdekat berikutnya.</p>
                ) : (
                  <div className="tilted-deadlines-stack">
                    {upcomingDeadlines.map((t) => (
                      <div key={t.id} className="tilted-deadline-item">
                        <div className="tilted-item-left">
                          <span className="tilted-item-title">{t.judul}</span>
                          <span className="tilted-item-course">{t.mata_kuliah || "Kuliah"}</span>
                        </div>
                        <div className="tilted-item-right">
                          <span className="tilted-item-date">{formatDeadlineShort(t.deadline)}</span>
                          {t.sisa_waktu_ms && (
                            <span className="tilted-item-time">{formatDuration(t.sisa_waktu_ms)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Panel "Ringkasan per Mata Kuliah" */}
              <div className="sidebar-summary-card">
                <div className="summary-card-header">
                  <h3 className="summary-card-title">Ringkasan per Mata Kuliah</h3>
                  <span className="summary-course-count">{courses.length} matkul</span>
                </div>

                <div className="course-progress-list">
                  {courseSummaries.length === 0 ? (
                    <p className="empty-summary-text">Belum ada mata kuliah yang terdaftar.</p>
                  ) : (
                    courseSummaries.map((c) => (
                      <div key={c.id} className="course-progress-item">
                        <div className="course-progress-info">
                          <span className="course-progress-name">{c.name}</span>
                          <span className="course-progress-stats">
                            {c.selesai}/{c.total} selesai ({c.percent}%)
                          </span>
                        </div>
                        <div
                          className="progress-bar-track"
                          role="progressbar"
                          aria-valuenow={c.percent}
                          aria-valuemin="0"
                          aria-valuemax="100"
                          aria-label={`Progres ${c.name}`}
                        >
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${c.percent}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
