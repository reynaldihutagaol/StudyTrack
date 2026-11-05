/**
 * Modul utilitas untuk klasifikasi tenggat waktu (deadline) dan pengurutan tugas.
 *
 * ASUMSI ZONA WAKTU:
 * Field `deadline` pada input datetime-local disimpan sebagai waktu lokal tanpa offset zona waktu
 * (misal: "2026-07-03T23:59"). Sesuai spesifikasi rancangan aplikasi StudyTrack, setiap waktu tanpa
 * informasi zona waktu secara eksplisit ditafsirkan sebagai Waktu Indonesia Barat (WIB / UTC+07:00),
 * BUKAN menggunakan zona waktu mesin/server lokal tempat Node.js berjalan.
 * Jika string waktu sudah memiliki indikator UTC 'Z' atau offset (contoh: "+07:00" atau "-05:00"),
 * maka waktu akan diparsing sesuai zona waktu tersebut.
 * Field `created_at` pada data seed juga diperlakukan aman dengan aturan yang sama.
 */

export const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/**
 * Menafsirkan string deadline menjadi instance Date yang deterministik.
 *
 * @param {string} str String representasi tanggal dan jam deadline.
 * @returns {Date|null} Instance Date yang valid, atau null jika string kosong/tidak valid.
 */
export function parseDeadline(str) {
  if (!str || typeof str !== "string") {
    return null;
  }
  const trimmed = str.trim();
  if (!trimmed) {
    return null;
  }

  // Cek apakah string sudah memiliki indikator zona waktu UTC (Z) atau offset numerik (+HH:MM / -HH:MM)
  const hasTimezone = /(?:Z|[+-]\d{2}(?::?\d{2})?)$/i.test(trimmed);

  let parseable = trimmed;
  if (!hasTimezone) {
    // Normalisasi jika tanggal dan jam dipisahkan spasi alih-alih karakter 'T'
    const normalized = trimmed.includes("T") ? trimmed : trimmed.replace(" ", "T");
    // Eksplisit tambahkan offset WIB (+07:00)
    parseable = `${normalized}+07:00`;
  }

  const d = new Date(parseable);
  if (isNaN(d.getTime())) {
    return null;
  }
  return d;
}

/**
 * Mengklasifikasikan tugas ke dalam salah satu kategori:
 * - "normal"
 * - "mendekati" (< 24 jam sisa waktu)
 * - "overdue" (sisa waktu <= 0)
 *
 * Aturan berurutan:
 * 1. status === "selesai" -> "normal" (tidak pernah ditandai)
 * 2. deadline tidak valid/kosong -> "normal" dengan console.warn
 * 3. sisa = deadline - now; sisa <= 0 -> "overdue" (tepat 0 dihitung overdue)
 * 4. sisa < 24 jam (strict <, tepat 24 jam TIDAK termasuk) -> "mendekati"
 * 5. selain itu -> "normal"
 *
 * @param {object} task Objek tugas berisi properti { deadline, status }
 * @param {Date} now Instance Date acuan waktu saat ini (wajib parameter)
 * @returns {"normal" | "mendekati" | "overdue"} Kategori deadline
 */
export function classify(task, now) {
  if (!now || !(now instanceof Date) || isNaN(now.getTime())) {
    throw new Error("Parameter 'now' harus berupa instance Date yang valid.");
  }

  // Aturan 1: Tugas yang sudah selesai selalu berkategori "normal"
  if (task?.status === "selesai") {
    return "normal";
  }

  const deadlineDate = parseDeadline(task?.deadline);
  // Tangani deadline tidak valid atau kosong tanpa crash
  if (!deadlineDate) {
    console.warn(`[WARN] Deadline tidak valid atau kosong untuk task id ${task?.id ?? "unknown"}: "${task?.deadline}"`);
    return "normal";
  }

  const sisa = deadlineDate.getTime() - now.getTime();

  // Aturan 2: sisa <= 0 dihitung overdue
  if (sisa <= 0) {
    return "overdue";
  }

  // Aturan 3: sisa < 24 jam (strict less than) dihitung mendekati
  if (sisa < TWENTY_FOUR_HOURS_MS) {
    return "mendekati";
  }

  // Aturan 4: Selain itu normal
  return "normal";
}

/**
 * Mengurutkan array tugas berdasarkan kelompok kategori dan aturan spesifik tiap kelompok:
 * 1. Grup "mendekati" -> urut deadline ASC (yang paling mendesak di atas)
 * 2. Grup "normal" -> urut created_at DESC (perilaku bawaan: terbaru di atas)
 * 3. Grup "overdue" -> urut deadline DESC (yang baru saja lewat di atas)
 *
 * @param {Array<object>} tasks Daftar tugas yang telah diperkaya properti deadline_category
 * @returns {Array<object>} Salinan array tugas yang sudah terurut
 */
export function sortTasks(tasks) {
  const categoryOrder = { mendekati: 1, normal: 2, overdue: 3 };

  return [...tasks].sort((a, b) => {
    const catA = a.deadline_category || "normal";
    const catB = b.deadline_category || "normal";

    const orderA = categoryOrder[catA] ?? 2;
    const orderB = categoryOrder[catB] ?? 2;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    if (catA === "mendekati") {
      const timeA = parseDeadline(a.deadline)?.getTime() ?? Infinity;
      const timeB = parseDeadline(b.deadline)?.getTime() ?? Infinity;
      return timeA - timeB; // ASC
    }

    if (catA === "overdue") {
      const timeA = parseDeadline(a.deadline)?.getTime() ?? -Infinity;
      const timeB = parseDeadline(b.deadline)?.getTime() ?? -Infinity;
      return timeB - timeA; // DESC
    }

    // "normal": urut created_at DESC
    const timeA = parseDeadline(a.created_at)?.getTime() ?? 0;
    const timeB = parseDeadline(b.created_at)?.getTime() ?? 0;
    return timeB - timeA;
  });
}

/**
 * Memperkaya objek tugas dengan field `deadline_category` dan `sisa_waktu_ms`.
 *
 * @param {object} task Objek tugas tunggal
 * @param {Date} now Instance Date acuan
 * @returns {object} Objek tugas dengan field tambahan
 */
export function enrichTask(task, now = new Date()) {
  const category = classify(task, now);
  const deadlineDate = parseDeadline(task.deadline);
  const sisa_waktu_ms = deadlineDate ? deadlineDate.getTime() - now.getTime() : null;

  return {
    ...task,
    deadline_category: category,
    sisa_waktu_ms
  };
}

/**
 * Memperkaya dan mengurutkan seluruh tugas.
 *
 * @param {Array<object>} tasks Daftar tugas
 * @param {Date} now Instance Date acuan
 * @returns {Array<object>} Daftar tugas yang terurut dan lengkap
 */
export function processTasks(tasks, now = new Date()) {
  const enriched = tasks.map((t) => enrichTask(t, now));
  return sortTasks(enriched);
}

