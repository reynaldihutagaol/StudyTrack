import React, { useEffect, useState } from "react";
import api from "../api.js";
import Navbar from "../components/Navbar.jsx";
import TaskCard from "../components/TaskCard.jsx";

/**
 * Halaman Daftar Tugas: form tambah tugas dan daftar seluruh tugas pengguna
 * lintas mata kuliah, sesuai urutan yang dikirim backend.
 *
 * Menerapkan refetch otomatis saat jendela mendapat fokus dan setiap 60 detik
 * selama tab aktif, serta setelah perubahan status tugas.
 */
export default function Tasks() {
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

    // Refetch saat jendela mendapat fokus kembali
    function handleFocus() {
      loadTasks();
    }

    // Refetch saat tab browser beralih kembali terlihat
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        loadTasks();
      }
    }

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Refetch berkala setiap 60 detik selama tab terlihat
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
      // Refetch setelah status berubah agar urutan dan kategori diperbarui server
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

  return (
    <>
      <Navbar />
      <div className="container">
        <h1>Daftar Tugas</h1>

        <div className="card">
          <h2>Tambah Tugas</h2>
          <form onSubmit={handleSubmit}>
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} required>
              <option value="">-- Pilih Mata Kuliah --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Judul Tugas"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              required
            />
            <textarea
              placeholder="Deskripsi (opsional)"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              rows={2}
            />
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
            {error && <p className="error">{error}</p>}
            <button type="submit">Tambah Tugas</button>
          </form>
        </div>

        {tasks.length === 0 && <p>Belum ada tugas. Tambahkan tugas pertama Anda di atas.</p>}

        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} onToggleStatus={handleToggleStatus} onDelete={handleDelete} />
        ))}
      </div>
    </>
  );
}
