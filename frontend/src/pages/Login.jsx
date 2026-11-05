import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api.js";
import { useAuth } from "../AuthContext.jsx";

/**
 * Halaman Login:
 * Tampilan kartu otentikasi di tengah canvas lavender lembut dengan estetika neo-grotesk.
 */
export default function Login() {
  const [email, setEmail] = useState("demo@studytrack.test");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token, res.data.user);
      navigate("/tasks");
    } catch (err) {
      setError(err.response?.data?.error || "Gagal login.");
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

        <h1 className="auth-title">Masuk ke Akun</h1>
        <p className="auth-subtitle">Kelola tugas kuliah dan jadwal tenggat waktumu.</p>

        <form onSubmit={handleSubmit} className="neo-form">
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              Alamat Email
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="nama@email.test"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="neo-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              Kata Sandi
            </label>
            <input
              id="login-password"
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
            Masuk Sekarang
          </button>
        </form>

        <div className="auth-footer-links">
          <p className="auth-switch-text">
            Belum punya akun? <Link to="/register" className="auth-link-bold">Daftar di sini</Link>
          </p>
          <div className="demo-credentials-pill">
            <span className="demo-chip-label">Akun Demo</span>
            <span className="demo-chip-val">demo@studytrack.test / demo1234</span>
          </div>
        </div>
      </div>
    </div>
  );
}
