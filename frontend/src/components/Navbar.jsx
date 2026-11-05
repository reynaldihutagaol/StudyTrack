import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

/**
 * Bilah navigasi atas bergaya floating dark pill.
 * Mengadopsi bahasa visual modern dengan kontras tajam, item aktif berbentuk pill abu gelap,
 * dan chip profil akun di sebelah kanan.
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
    <header className="navbar-container">
      <nav className="navbar-pill" aria-label="Navigasi Utama">
        <Link to="/" className="navbar-brand">
          <span className="brand-dot" aria-hidden="true" />
          <span>StudyTrack</span>
        </Link>

        <div className="navbar-links">
          {user ? (
            <>
              <Link
                to="/tasks"
                className={`nav-pill-item ${isTasks ? "active" : ""}`}
                aria-current={isTasks ? "page" : undefined}
              >
                <svg
                  className="nav-icon"
                  width="15"
                  height="15"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 4.5h10M3 8h10M3 11.5h6" />
                </svg>
                <span>Daftar Tugas</span>
              </Link>

              <Link
                to="/courses"
                className={`nav-pill-item ${isCourses ? "active" : ""}`}
                aria-current={isCourses ? "page" : undefined}
              >
                <svg
                  className="nav-icon"
                  width="15"
                  height="15"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M2 3.5h5a2 2 0 012 2v7.5a1.5 1.5 0 00-1.5-1.5H2z" />
                  <path d="M14 3.5H9a2 2 0 00-2 2v7.5a1.5 1.5 0 011.5-1.5H14z" />
                </svg>
                <span>Mata Kuliah</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`nav-pill-item ${location.pathname === "/login" ? "active" : ""}`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`nav-pill-item ${location.pathname === "/register" ? "active" : ""}`}
              >
                Daftar
              </Link>
            </>
          )}
        </div>

        {user && (
          <div className="navbar-user">
            <div className="user-profile-chip" title={user.email}>
              <span className="user-avatar-badge" aria-hidden="true">
                {user.nama ? user.nama.charAt(0).toUpperCase() : "M"}
              </span>
              <span className="user-name-text">{user.nama}</span>
            </div>
            <button
              type="button"
              className="btn-nav-logout"
              onClick={handleLogout}
              aria-label="Logout dari akun"
            >
              Logout
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
