import React, { useEffect, useState } from "react";
import api from "../api.js";
import Navbar from "../components/Navbar.jsx";

/**
 * Halaman Mata Kuliah (v2 Refined):
 * Menampilkan formulir penambahan mata kuliah dan daftar mata kuliah terdaftar
 * dalam bingkai perangkat StudyTrack yang berjarak lega dan proporsional.
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
    <div className="device-canvas">
      <div className="device-frame">
        <Navbar />

        <main className="app-panel">
          <section className="panel-header-section">
            <div className="header-greeting-block">
              <h1 className="greeting-main-heading">Mata Kuliah</h1>
              <p className="greeting-sub-text">
                Kelola daftar mata kuliah aktif semester ini beserta kode dan dosen pengampu.
              </p>
            </div>

            <div className="stat-chips-row" aria-label="Statistik Mata Kuliah">
              <div className="stat-chip stat-chip-slate">
                <div className="stat-chip-corner-blob" aria-hidden="true" />
                <svg
                  className="stat-chip-svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                </svg>
                <div className="stat-chip-content">
                  <span className="stat-chip-number">{courses.length}</span>
                  <span className="stat-chip-name">Total Kuliah</span>
                </div>
              </div>
            </div>
          </section>

          <div className="courses-layout-grid">
            {/* Form Tambah Mata Kuliah dengan Spacing Lega */}
            <section className="course-form-card" aria-label="Form Tambah Mata Kuliah">
              <div className="form-header-row">
                <div className="card-corner-blob blob-lime" aria-hidden="true" />
                <h2 className="section-subtitle-heading">Tambah Mata Kuliah</h2>
              </div>

              <form onSubmit={handleSubmit} className="neo-form course-form-padded">
                <div className="form-group form-group-spaced">
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

                <div className="form-row-grid form-row-grid-spaced">
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

                <div className="course-form-submit-row">
                  <button type="submit" className="btn-pill-primary btn-submit-course">
                    Tambah Mata Kuliah
                  </button>
                </div>
              </form>
            </section>

            {/* Grid Kartu Mata Kuliah */}
            <section className="courses-list-section" aria-label="Daftar Mata Kuliah">
              <div className="task-filter-header-row">
                <h2 className="section-subtitle-heading">Mata Kuliah Terdaftar</h2>
                <span className="task-badge-total">{courses.length} mata kuliah</span>
              </div>

              {courses.length === 0 ? (
                <div className="empty-tasks-box">
                  <p className="empty-box-title">Belum ada mata kuliah yang terdaftar.</p>
                  <p className="empty-box-sub">Gunakan formulir di sebelah kiri untuk menambahkan mata kuliah pertamamu.</p>
                </div>
              ) : (
                <div className="courses-grid-cards">
                  {courses.map((c) => (
                    <article className="course-card-v2" key={c.id}>
                      <div className="card-corner-blob blob-slate" aria-hidden="true">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                          <path d="M6 12v5c3 3 9 3 12 0v-5" />
                        </svg>
                      </div>

                      <div className="course-top-info">
                        <span className="course-code-pill">{c.kode || "KULIAH"}</span>
                        <h3 className="course-name-title">{c.name}</h3>
                      </div>

                      <div className="course-dosen-meta">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span>{c.dosen || "Dosen belum diatur"}</span>
                      </div>

                      <div className="course-footer-row">
                        <button
                          type="button"
                          className="btn-pill-delete"
                          onClick={() => handleDelete(c.id)}
                          aria-label={`Hapus mata kuliah ${c.name}`}
                        >
                          <svg
                            width="13"
                            height="13"
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
                          <span>Hapus</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
