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
 * Ikon jam SVG untuk badge reminder mendekati deadline.
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
 * Ikon kalender kecil SVG untuk metadata deadline.
 */
function CalendarIcon({ className = "meta-icon" }) {
  return (
    <svg
      className={className}
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="3" width="12" height="11" rx="2" />
      <line x1="2" y1="6" x2="14" y2="6" />
      <line x1="5" y1="1.5" x2="5" y2="3.5" />
      <line x1="11" y1="1.5" x2="11" y2="3.5" />
    </svg>
  );
}

/**
 * Ikon tempat sampah SVG untuk aksi hapus yang tenang.
 */
function TrashIcon({ className = "btn-icon" }) {
  return (
    <svg
      className={className}
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 4 13 4" />
      <path d="M5 4V2.5a1 1 0 011-1h4a1 1 0 011 1V4" />
      <path d="M4 4l1 10a1.5 1.5 0 001.5 1.5h5a1.5 1.5 0 001.5-1.5L12 4" />
    </svg>
  );
}

/**
 * Ikon centang SVG untuk status selesai.
 */
function CheckIcon({ className = "badge-icon" }) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 8.5 6.5 12 13 4.5" />
    </svg>
  );
}

/**
 * Card satu tugas pada halaman Daftar Tugas.
 *
 * Menampilkan:
 * 1. Hierarki informasi jelas: Judul > Mata Kuliah > Waktu Deadline > Deskripsi
 * 2. Badge reminder waktu yang tegas (Mendekati deadline jingga / Terlambat merah)
 * 3. Badge status tugas netral yang tidak membingungkan warna urgensi
 * 4. Aksi tombol yang tenang dan proporsional (toggle status outline + hapus ghost)
 *
 * @param {object} props
 * @param {object} props.task Data tugas dari API.
 * @param {(task: object) => void} props.onToggleStatus Dipanggil saat tombol status ditekan.
 * @param {(id: number) => void} props.onDelete Dipanggil saat tombol hapus ditekan.
 */
export default function TaskCard({ task, onToggleStatus, onDelete }) {
  const category = task.deadline_category || "normal";
  const isMendekati = category === "mendekati";
  const isOverdue = category === "overdue";
  const isSelesai = task.status === "selesai";

  // Kelas aksen kondisi kartu
  const cardConditionClass = isSelesai
    ? "card-selesai"
    : isMendekati
    ? "accent-mendekati"
    : isOverdue
    ? "accent-overdue"
    : "card-normal";

  return (
    <article className={`card task-card ${cardConditionClass}`}>
      <div className="task-content">
        <header className="task-header">
          <strong className="task-title">{task.judul}</strong>
          {task.mata_kuliah && (
            <span className="task-course-pill">{task.mata_kuliah}</span>
          )}
        </header>

        <div className="task-deadline-row">
          <CalendarIcon />
          <span>Tenggat: {formatDeadline(task.deadline)}</span>
        </div>

        {task.deskripsi && (
          <p className="task-description">{task.deskripsi}</p>
        )}
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

          <span className={`badge badge-status ${isSelesai ? "selesai" : "belum"}`}>
            {isSelesai ? (
              <>
                <CheckIcon />
                <span>Selesai</span>
              </>
            ) : (
              <>
                <span className="status-dot belum" aria-hidden="true" />
                <span>Belum</span>
              </>
            )}
          </span>
        </div>

        <div className="task-buttons">
          <button
            type="button"
            className={`btn-action ${isSelesai ? "btn-action-undo" : "btn-action-complete"}`}
            onClick={() => onToggleStatus(task)}
            aria-label={isSelesai ? "Tandai tugas belum selesai" : "Tandai tugas selesai"}
          >
            {isSelesai ? "Tandai Belum" : "Tandai Selesai"}
          </button>
          <button
            type="button"
            className="btn-delete-ghost"
            onClick={() => onDelete(task.id)}
            aria-label={`Hapus tugas ${task.judul}`}
          >
            <TrashIcon />
            <span>Hapus</span>
          </button>
        </div>
      </div>
    </article>
  );
}
