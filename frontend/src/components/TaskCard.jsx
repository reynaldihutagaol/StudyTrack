import React from "react";

/**
 * Memformat deadline ke tampilan lokal Indonesia, contoh: "03 Jul 2026, 23.59".
 */
function formatDeadline(deadline) {
  if (!deadline) return "-";
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return deadline;
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

/**
 * Menghitung dan memformat durasi sisa waktu (milidetik) ke teks bahasa Indonesia yang ramah pengguna.
 */
export function formatDuration(ms) {
  if (ms === null || ms === undefined || isNaN(ms)) {
    return "";
  }
  const absMs = Math.abs(ms);
  const totalMinutes = Math.floor(absMs / (60 * 1000));
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const days = Math.floor(totalHours / 24);
  const remainingHours = totalHours % 24;

  if (days > 0) {
    if (remainingHours > 0) {
      return `${days} hari ${remainingHours} jam`;
    }
    return `${days} hari`;
  }

  if (totalHours > 0) {
    if (remainingMinutes > 0) {
      return `${totalHours} jam ${remainingMinutes} menit`;
    }
    return `${totalHours} jam`;
  }

  return `${Math.max(1, totalMinutes)} menit`;
}

/**
 * Ikon jam SVG untuk badge mendekati deadline.
 */
function ClockIcon({ className = "badge-icon" }) {
  return (
    <svg
      className={className}
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="7" />
      <polyline points="8 4 8 8 11 10" />
    </svg>
  );
}

/**
 * Ikon peringatan SVG untuk badge overdue / terlambat.
 */
function AlertIcon({ className = "badge-icon" }) {
  return (
    <svg
      className={className}
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="7" />
      <line x1="8" y1="4" x2="8" y2="9" />
      <line x1="8" y1="12" x2="8.01" y2="12" />
    </svg>
  );
}

/**
 * Ikon checklist untuk status tugas selesai.
 */
function CheckIcon({ className = "badge-icon" }) {
  return (
    <svg
      className={className}
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 8.5 6.5 12 13 4.5" />
    </svg>
  );
}

/**
 * Komponen TaskCard dengan gaya neo-grotesk v2:
 * - Outline tegas 1.75px, sudut 20px
 * - Blob dekorasi sudut (lime atau lavender) berisi ikon SVG datar buatan sendiri
 * - Hierarki informasi yang rapi dan tegas
 * - Badge semantik (ikon + teks, kontras tinggi)
 * - Tombol aksi pill sekunder yang bersih
 */
export default function TaskCard({ task, onToggleStatus, onDelete }) {
  const isSelesai = task.status === "selesai";
  const category = task.deadline_category || "normal";
  const sisaWaktuFormatted = formatDuration(task.sisa_waktu_ms);

  let urgencyCardClass = "card-normal";
  if (isSelesai) {
    urgencyCardClass = "card-selesai";
  } else if (category === "mendekati") {
    urgencyCardClass = "card-mendekati";
  } else if (category === "overdue") {
    urgencyCardClass = "card-overdue";
  }

  // Pilih warna aksen sudut: mendekati/overdue memakai lime cerah, normal/selesai memakai lavender
  const blobColorClass = category === "mendekati" || category === "overdue" ? "blob-lime" : "blob-lavender";

  // Nama mata kuliah dari respons server (task.mata_kuliah)
  const courseName = task.mata_kuliah || "";

  return (
    <article
      className={`task-card-neo ${urgencyCardClass}`}
      aria-label={`Tugas: ${task.judul}`}
    >
      {/* Bentuk kurva/blob sudut dengan ikon SVG datar buatan sendiri */}
      <div className={`card-corner-blob ${blobColorClass}`} aria-hidden="true">
        <svg
          className="blob-corner-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {category === "overdue" ? (
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          ) : category === "mendekati" ? (
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          ) : isSelesai ? (
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3" />
          ) : (
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
          )}
        </svg>
      </div>

      <div className="card-top-meta">
        {/* Badge status / urgensi */}
        {isSelesai ? (
          <span className="status-badge-pill badge-selesai">
            <CheckIcon />
            <span>Selesai</span>
          </span>
        ) : category === "mendekati" ? (
          <span className="status-badge-pill badge-mendekati">
            <ClockIcon />
            <span>Mendekati • {sisaWaktuFormatted || "Segera"}</span>
          </span>
        ) : category === "overdue" ? (
          <span className="status-badge-pill badge-overdue">
            <AlertIcon />
            <span>Terlambat • {sisaWaktuFormatted || "Lewat"}</span>
          </span>
        ) : (
          <span className="status-badge-pill badge-normal">
            <span className="badge-dot-gray" aria-hidden="true" />
            <span>Belum</span>
          </span>
        )}
      </div>

      {/* Judul & Mata Kuliah */}
      <div className="card-body-section">
        <h3 className={`card-task-title ${isSelesai ? "title-selesai" : ""}`}>
          {task.judul}
        </h3>

        {courseName && (
          <div className="card-course-pill">
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
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            <span>{courseName}</span>
          </div>
        )}

        {task.deskripsi && (
          <p className="card-desc-text">{task.deskripsi}</p>
        )}
      </div>

      {/* Footer: info deadline dan tombol aksi */}
      <div className="card-footer-section">
        <div className="card-deadline-info" title="Tenggat Waktu">
          <svg
            className="deadline-meta-icon"
            width="13"
            height="13"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="2" y="3" width="12" height="11" rx="2" />
            <line x1="2" y1="6" x2="14" y2="6" />
            <line x1="5" y1="1" x2="5" y2="3" />
            <line x1="11" y1="1" x2="11" y2="3" />
          </svg>
          <span className="deadline-time-text">{formatDeadline(task.deadline)}</span>
        </div>

        <div className="card-actions-row">
          <button
            type="button"
            className={`btn-pill-toggle ${isSelesai ? "btn-undo" : "btn-complete"}`}
            onClick={() => onToggleStatus(task)}
            aria-label={isSelesai ? `Tandai ${task.judul} belum selesai` : `Tandai ${task.judul} selesai`}
          >
            {isSelesai ? "Batalkan" : "Tandai Selesai"}
          </button>

          <button
            type="button"
            className="btn-pill-delete"
            onClick={() => onDelete(task.id)}
            aria-label={`Hapus tugas: ${task.judul}`}
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
      </div>
    </article>
  );
}
