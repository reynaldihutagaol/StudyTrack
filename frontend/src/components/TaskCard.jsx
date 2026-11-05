import React from "react";

/**
 * Memformat deadline ke tampilan lokal Indonesia, contoh: "03 Jul 2026, 23.59".
 *
 * @param {string} deadline Tanggal dan jam deadline dari API.
 * @returns {string}
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
 * Contoh output: "5 jam 12 menit", "2 hari 3 jam", "45 menit".
 *
 * @param {number} ms Selisih waktu dalam milidetik (positif atau negatif).
 * @returns {string}
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
 * Ikon jam SVG untuk penanda mendekati deadline.
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
 * Ikon peringatan SVG untuk penanda overdue / terlambat.
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
 * Card satu tugas pada halaman Daftar Tugas.
 *
 * Menampilkan judul, mata kuliah, deadline, deskripsi, badge status ("Belum" / "Selesai"),
 * serta badge reminder deadline ("Mendekati deadline" atau "Terlambat") dengan aksen visual
 * border kiri untuk kondisi mendekati dan overdue.
 *
 * @param {object} props
 * @param {object} props.task Data tugas dari API (termasuk `mata_kuliah`, `deadline_category`, `sisa_waktu_ms`).
 * @param {(task: object) => void} props.onToggleStatus Dipanggil saat tombol status ditekan.
 * @param {(id: number) => void} props.onDelete Dipanggil saat tombol hapus ditekan.
 */
export default function TaskCard({ task, onToggleStatus, onDelete }) {
  const category = task.deadline_category || "normal";
  const isMendekati = category === "mendekati";
  const isOverdue = category === "overdue";

  // Kelas aksen garis kiri halus untuk kondisi non-normal
  const accentClass = isMendekati
    ? "accent-mendekati"
    : isOverdue
    ? "accent-overdue"
    : "";

  return (
    <div className={`card task-card ${accentClass}`}>
      <div className="task-content">
        <strong className="task-title">{task.judul}</strong>
        <div className="meta task-course">{task.mata_kuliah}</div>
        <div className="meta task-deadline">Deadline: {formatDeadline(task.deadline)}</div>
        {task.deskripsi && <div className="meta task-description">{task.deskripsi}</div>}
      </div>

      <div className="task-actions-col">
        <div className="task-badges" aria-label="Status tugas dan tenggat waktu">
          {isMendekati && (
            <span className="badge badge-deadline mendekati" role="status">
              <ClockIcon />
              <span>Mendekati deadline · sisa {formatDuration(task.sisa_waktu_ms)}</span>
            </span>
          )}

          {isOverdue && (
            <span className="badge badge-deadline overdue" role="status">
              <AlertIcon />
              <span>Terlambat · {formatDuration(task.sisa_waktu_ms)}</span>
            </span>
          )}

          <span className={`badge ${task.status}`}>
            {task.status === "selesai" ? "Selesai" : "Belum"}
          </span>
        </div>

        <div className="task-buttons">
          <button
            type="button"
            className="btn"
            onClick={() => onToggleStatus(task)}
            aria-label={task.status === "selesai" ? "Tandai tugas belum selesai" : "Tandai tugas selesai"}
          >
            {task.status === "selesai" ? "Tandai Belum" : "Tandai Selesai"}
          </button>
          <button
            type="button"
            className="btn btn-delete"
            onClick={() => onDelete(task.id)}
            aria-label={`Hapus tugas ${task.judul}`}
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
