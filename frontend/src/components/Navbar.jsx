import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

/**
 * Navbar perangkat StudyTrack yang terintegrasi di bagian atas frame gelap.
 * Tab aktif memiliki notch indikator yang menghubungkan navigasi ke panel konten putih di bawahnya.
 */
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const isCourses = location.pathname === "/courses";
  const isTasks = location.pathname === "/tasks" || location.pathname === "/";

  return (
    <header className="device-navbar" aria-label="Navigasi Utama">
      {/* Brand logo */}
      <Link to="/" className="device-brand" aria-label="StudyTrack Beranda">
        <img src="/logo.svg" alt="StudyTrack Logo" className="brand-logo-img" />
        <span className="brand-text">StudyTrack</span>
      </Link>

      {/* Navigation tabs */}
      <nav className="device-nav-tabs" aria-label="Halaman Aplikasi">
        {user ? (
          <>
            <Link
              to="/tasks"
              className={`device-tab-item ${isTasks ? "active" : ""}`}
              aria-current={isTasks ? "page" : undefined}
            >
              <svg
                className="tab-icon"
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
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
              </svg>
              <span>Daftar Tugas</span>
              {isTasks && (
                <span className="tab-active-notch" aria-hidden="true">
                  <svg width="20" height="8" viewBox="0 0 20 8" fill="none">
                    <path d="M0 0C6 0 7 8 10 8C13 8 14 0 20 0H0Z" fill="#ffffff" />
                  </svg>
                </span>
              )}
            </Link>

            <Link
              to="/courses"
              className={`device-tab-item ${isCourses ? "active" : ""}`}
              aria-current={isCourses ? "page" : undefined}
            >
              <svg
                className="tab-icon"
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
                <path d="M6 6h10" />
                <path d="M6 10h10" />
              </svg>
              <span>Mata Kuliah</span>
              {isCourses && (
                <span className="tab-active-notch" aria-hidden="true">
                  <svg width="20" height="8" viewBox="0 0 20 8" fill="none">
                    <path d="M0 0C6 0 7 8 10 8C13 8 14 0 20 0H0Z" fill="#ffffff" />
                  </svg>
                </span>
              )}
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className={`device-tab-item ${location.pathname === "/login" ? "active" : ""}`}
            >
              <span>Login</span>
            </Link>
            <Link
              to="/register"
              className={`device-tab-item ${location.pathname === "/register" ? "active" : ""}`}
            >
              <span>Daftar</span>
            </Link>
          </>
        )}
      </nav>

      {/* User profile & actions */}
      {user ? (
        <div className="device-user-area">
          <div className="user-profile-pill" title={user.email}>
            <span className="user-avatar-circle" aria-hidden="true">
              {user.nama ? user.nama.charAt(0).toUpperCase() : "M"}
            </span>
            <div className="user-info-text">
              <span className="user-display-name">{user.nama}</span>
              <span className="user-display-email">{user.email}</span>
            </div>
          </div>
          <button
            type="button"
            className="btn-pill-logout"
            onClick={handleLogout}
            aria-label="Logout dari akun"
          >
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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Keluar</span>
          </button>
        </div>
      ) : (
        <div className="device-user-area" />
      )}
    </header>
  );
}
