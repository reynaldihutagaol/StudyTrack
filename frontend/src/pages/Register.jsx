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
        <div className="auth-brand-header">
          <img src="/logo.svg" alt="StudyTrack Logo" className="brand-logo-img-auth" />
          <span className="auth-brand-text">StudyTrack</span>
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
              placeholder="nama@studytrack.test"
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
