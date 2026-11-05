import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api.js";
import { useAuth } from "../AuthContext.jsx";

/**
 * Halaman Registrasi (v2):
 * Konsisten dengan estetika neo-grotesk StudyTrack, dengan aksen blob lime dan form rapi.
 */
export default function Register() {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/register", { nama, email, password });
      login(res.data.token, res.data.user);
      navigate("/tasks");
    } catch (err) {
      setError(err.response?.data?.error || "Gagal mendaftar.");
    }
  }

  return (
    <div className="auth-canvas-container">
      <div className="auth-card-neo">
        {/* Blob dekorasi sudut */}
        <div className="card-corner-blob blob-lime" aria-hidden="true">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#18181b"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
        </div>

        <div className="auth-brand-badge">
          <img src="/logo.svg" alt="StudyTrack Logo" className="brand-logo-img-auth" />
          <span className="brand-text">StudyTrack</span>
        </div>

        <h1 className="auth-title">Buat Akun Baru</h1>
        <p className="auth-subtitle">Mulai catat dan pantau tugas kuliahmu dengan mudah.</p>

        <form onSubmit={handleSubmit} className="neo-form">
          <div className="form-group">
            <label htmlFor="register-nama" className="form-label">
              Nama Lengkap
            </label>
            <input
              id="register-nama"
              type="text"
              placeholder="Contoh: Reynaldi Hutagaol"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              className="neo-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-email" className="form-label">
              Alamat Email
            </label>
            <input
              id="register-email"
              type="email"
              placeholder="nama@email.test"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="neo-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-password" className="form-label">
              Kata Sandi
            </label>
            <input
              id="register-password"
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="neo-input"
            />
          </div>

          {error && <p className="form-error-alert" role="alert">{error}</p>}

          <button type="submit" className="btn-pill-primary auth-btn-full">
            Daftar Sekarang
          </button>
        </form>

        <div className="auth-footer-links">
          <p className="auth-switch-text">
            Sudah punya akun? <Link to="/login" className="auth-link-bold">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
