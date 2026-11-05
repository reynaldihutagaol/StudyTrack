import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api.js";
import { useAuth } from "../AuthContext.jsx";

/**
 * Halaman Login (v2):
 * Tampilan kartu otentikasi neo-grotesk terpusat di kanvas lavender dengan aksen blob lime dan outline tegas.
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
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
        </div>

        <div className="auth-brand-badge">
          <span className="brand-dot-lime" aria-hidden="true" />
          <span className="brand-text">StudyTrack</span>
        </div>

        <h1 className="auth-title">Masuk ke Akun</h1>
        <p className="auth-subtitle">Kelola tugas kuliah dan jadwal tenggat waktumu dengan rapi.</p>

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
