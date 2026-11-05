import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api.js";
import { useAuth } from "../AuthContext.jsx";

/**
 * Halaman Registrasi:
 * Mengadopsi tata letak kartu otentikasi neo-grotesk yang konsisten.
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
        <span className="card-corner-lime-accent" aria-hidden="true" />

        <div className="auth-brand-badge">
          <span className="brand-dot" aria-hidden="true" />
          <span>StudyTrack</span>
        </div>

        <h1 className="auth-title">Daftar Akun Baru</h1>
        <p className="auth-subtitle">Mulai atur tenggat waktu tugas kuliahmu hari ini.</p>

        <form onSubmit={handleSubmit} className="neo-form">
          <div className="form-group">
            <label htmlFor="reg-name" className="form-label">
              Nama Lengkap
            </label>
            <input
              id="reg-name"
              type="text"
              placeholder="Contoh: Reynaldi Hutagaol"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              className="neo-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email" className="form-label">
              Alamat Email
            </label>
            <input
              id="reg-email"
              type="email"
              placeholder="nama@email.test"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="neo-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password" className="form-label">
              Kata Sandi (minimal 6 karakter)
            </label>
            <input
              id="reg-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="neo-input"
            />
          </div>

          {error && <p className="form-error-alert" role="alert">{error}</p>}

          <button type="submit" className="btn-pill-primary auth-btn-full">
            Buat Akun Sekarang
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
