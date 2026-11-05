import React, { useEffect, useState } from "react";
import api from "../api.js";
import Navbar from "../components/Navbar.jsx";

/**
 * Halaman Mata Kuliah:
 * Menampilkan form penambahan mata kuliah dan daftar mata kuliah yang telah dibuat.
 * Mengadopsi sistem desain neo-grotesk lembut konsisten dengan StudyTrack.
 */
export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [name, setName] = useState("");
  const [kode, setKode] = useState("");
  const [dosen, setDosen] = useState("");
  const [error, setError] = useState("");

  async function loadCourses() {
    try {
      const res = await api.get("/courses");
      setCourses(res.data.courses);
    } catch (err) {
      console.error("Gagal memuat mata kuliah:", err);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/courses", { name, kode, dosen });
      setName("");
      setKode("");
      setDosen("");
      loadCourses();
    } catch (err) {
      setError(err.response?.data?.error || "Gagal menambahkan mata kuliah.");
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/courses/${id}`);
      loadCourses();
    } catch (err) {
      console.error("Gagal menghapus mata kuliah:", err);
    }
  }

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="main-content-panel">
        <section className="dashboard-hero-section">
          <div className="hero-greeting-block">
            <h1 className="hero-greeting-title">Mata Kuliah</h1>
            <p className="hero-greeting-sub">
              Daftar mata kuliah aktif yang diambil semester ini beserta kode dan dosen pengampu.
            </p>
          </div>
        </section>

        {/* Form Tambah Mata Kuliah */}
        <section className="form-card-neo">
          <div className="form-header-row">
            <span className="form-badge-pill">Form Baru</span>
            <h2 className="form-title">Tambah Mata Kuliah</h2>
          </div>

          <form onSubmit={handleSubmit} className="neo-form">
            <div className="form-row-grid-3">
              <div className="form-group">
                <label htmlFor="course-name" className="form-label">
                  Nama Mata Kuliah <span className="required-star">*</span>
                </label>
                <input
                  id="course-name"
                  type="text"
                  placeholder="Contoh: Database Systems"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="neo-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="course-code" className="form-label">
                  Kode Mata Kuliah
                </label>
                <input
                  id="course-code"
                  type="text"
                  placeholder="Contoh: CS 186"
                  value={kode}
                  onChange={(e) => setKode(e.target.value)}
                  className="neo-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="course-dosen" className="form-label">
                  Dosen Pengampu
                </label>
                <input
                  id="course-dosen"
                  type="text"
                  placeholder="Contoh: Dr. Andi Wijaya"
                  value={dosen}
                  onChange={(e) => setDosen(e.target.value)}
                  className="neo-input"
                />
              </div>
            </div>

            {error && <p className="form-error-alert" role="alert">{error}</p>}

            <div className="form-actions-row">
              <button type="submit" className="btn-pill-primary">
                Tambah Mata Kuliah
              </button>
            </div>
          </form>
        </section>

        {/* Daftar Mata Kuliah */}
        <section className="task-list-section">
          <div className="section-title-row">
            <h2 className="section-heading">Daftar Mata Kuliah Anda</h2>
            <span className="task-count-pill">{courses.length} mata kuliah</span>
          </div>

          {courses.length === 0 ? (
            <div className="empty-state-card">
              <p className="empty-state-title">Belum ada mata kuliah.</p>
              <p className="empty-state-sub">Tambahkan mata kuliah pertamamu melalui form di atas.</p>
            </div>
          ) : (
            <div className="courses-grid">
              {courses.map((c) => (
                <article className="course-card-neo" key={c.id}>
                  <div className="course-header">
                    <span className="card-corner-lime-accent" aria-hidden="true" />
                    <div className="course-title-group">
                      <h3 className="course-title">{c.name}</h3>
                      {c.kode && <span className="course-code-badge">{c.kode}</span>}
                    </div>
                  </div>

                  <div className="course-body">
                    <div className="course-dosen-row">
                      <svg
                        className="meta-icon"
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="8" cy="5" r="3" />
                        <path d="M2.5 13.5a5.5 5.5 0 0111 0" />
                      </svg>
                      <span>{c.dosen || "Dosen belum ditentukan"}</span>
                    </div>
                  </div>

                  <div className="course-footer">
                    <button
                      type="button"
                      className="btn-pill-delete"
                      onClick={() => handleDelete(c.id)}
                      aria-label={`Hapus mata kuliah ${c.name}`}
                    >
                      Hapus
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
