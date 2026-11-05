import React, { useEffect, useRef } from "react";

/**
 * Modal dialog untuk menambahkan tugas baru.
 * Memenuhi standar aksesibilitas:
 * - Mengembalikan fokus ke tombol pemicu saat ditutup
 * - Menangkap tombol Escape untuk menutup modal
 * - Focus trap di dalam modal
 * - Atribut dialog WAI-ARIA (role="dialog", aria-modal="true", aria-labelledby)
 */
export default function TaskModal({
  isOpen,
  onClose,
  triggerRef,
  courses,
  courseId,
  setCourseId,
  judul,
  setJudul,
  deskripsi,
  setDeskripsi,
  deadline,
  setDeadline,
  error,
  onSubmit
}) {
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Fokuskan input pertama saat modal terbuka
    const timer = setTimeout(() => {
      if (firstInputRef.current) {
        firstInputRef.current.focus();
      }
    }, 50);

    // Tangani penutupan dengan tombol Escape
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Tab" && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      // Kembalikan fokus ke trigger saat ditutup
      if (triggerRef?.current) {
        triggerRef.current.focus();
      }
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        className="modal-dialog-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-task-title"
        ref={modalRef}
      >
        <div className="modal-header-row">
          <div className="modal-title-wrap">
            <span className="modal-badge-lime" aria-hidden="true" />
            <h2 id="modal-task-title" className="modal-title-text">
              Tambah Tugas Baru
            </h2>
          </div>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
            aria-label="Tutup form penambahan tugas"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="modal-course-select" className="form-label">
              Mata Kuliah <span className="required-star">*</span>
            </label>
            <select
              id="modal-course-select"
              ref={firstInputRef}
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
              className="neo-input"
            >
              <option value="">-- Pilih Mata Kuliah --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.kode ? `(${c.kode})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="modal-title-input" className="form-label">
              Judul Tugas <span className="required-star">*</span>
            </label>
            <input
              id="modal-title-input"
              type="text"
              placeholder="Contoh: Lab 4: Query Optimization Report"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              required
              className="neo-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="modal-deadline-input" className="form-label">
              Batas Pengumpulan (WIB) <span className="required-star">*</span>
            </label>
            <input
              id="modal-deadline-input"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
              className="neo-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="modal-desc-input" className="form-label">
              Deskripsi atau Catatan Tambahan (opsional)
            </label>
            <textarea
              id="modal-desc-input"
              placeholder="Tuliskan instruksi atau catatan teknis tugas..."
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              rows={3}
              className="neo-input neo-textarea"
            />
          </div>

          {error && (
            <p className="form-error-alert" role="alert">
              {error}
            </p>
          )}

          <div className="modal-actions-row">
            <button
              type="button"
              className="btn-pill-secondary"
              onClick={onClose}
            >
              Batal
            </button>
            <button type="submit" className="btn-pill-primary">
              Simpan Tugas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
