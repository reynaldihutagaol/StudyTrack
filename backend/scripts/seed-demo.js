/**
 * Script untuk menambahkan tugas demo dengan tenggat waktu relatif terhadap waktu sekarang (WIB).
 *
 * Tugas yang ditambahkan:
 * 1. ~3 jam lagi (mendekati deadline)
 * 2. ~20 jam lagi (mendekati deadline)
 * 3. ~2 hari lagi (normal)
 * 4. ~6 hari lagi (normal)
 * 5. ~1 hari lalu (overdue)
 *
 * Script ini bersifat idempotent: tugas demo relatif sebelumnya yang memiliki penanda
 * `[seed:demo]` akan dibersihkan terlebih dahulu sebelum tugas baru ditambahkan.
 * Hanya dapat dijalankan di lingkungan non-production.
 */
import { readDB, writeDB } from "../db.js";

const DEMO_MARKER = "[seed:demo]";

if (process.env.NODE_ENV === "production") {
  console.error("Error: Script seed:demo hanya dapat dijalankan pada lingkungan non-production.");
  process.exit(1);
}

/**
 * Mengubah objek Date menjadi format string tanggal lokal WIB tanpa zona (YYYY-MM-DDTHH:mm:ss).
 *
 * @param {Date} date Objek Date acuan
 * @returns {string} String waktu format lokal WIB
 */
function toWIBString(date) {
  // Hitung representasi waktu dalam UTC+7 (WIB)
  const wibTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return wibTime.toISOString().slice(0, 19);
}

function runSeedDemo() {
  const db = readDB();
  const demoUserId = 1;

  // Hapus tugas demo relatif yang pernah dibuat sebelumnya agar idempotent
  db.tasks = db.tasks.filter(
    (t) => !(t.user_id === demoUserId && t.deskripsi && t.deskripsi.includes(DEMO_MARKER))
  );

  const now = new Date();
  const threeHoursLater = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const twentyHoursLater = new Date(now.getTime() + 20 * 60 * 60 * 1000);
  const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const sixDaysLater = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

  const relativeTasks = [
    {
      user_id: demoUserId,
      mata_kuliah_id: 1, // Database Systems
      judul: "Lab 5: B+ Tree Indexing Benchmark",
      deskripsi: `Eksperimen performa B+ Tree index pada dataset besar. ${DEMO_MARKER}`,
      deadline: toWIBString(threeHoursLater),
      status: "belum",
      created_at: now.toISOString()
    },
    {
      user_id: demoUserId,
      mata_kuliah_id: 2, // Data Structures
      judul: "Tugas 4: Red-Black Tree Balancing",
      deskripsi: `Implementasi rotasi dan balancing pohon Red-Black. ${DEMO_MARKER}`,
      deadline: toWIBString(twentyHoursLater),
      status: "belum",
      created_at: now.toISOString()
    },
    {
      user_id: demoUserId,
      mata_kuliah_id: 3, // Software Engineering
      judul: "Sprint 3: CI/CD Pipeline & Integration Tests",
      deskripsi: `Konfigurasi workflow automated testing dan linting. ${DEMO_MARKER}`,
      deadline: toWIBString(twoDaysLater),
      status: "belum",
      created_at: now.toISOString()
    },
    {
      user_id: demoUserId,
      mata_kuliah_id: 3, // Software Engineering
      judul: "Tugas Besar: Final Architecture Review",
      deskripsi: `Laporan arsitektur microservices dan dokumentasi API. ${DEMO_MARKER}`,
      deadline: toWIBString(sixDaysLater),
      status: "belum",
      created_at: now.toISOString()
    },
    {
      user_id: demoUserId,
      mata_kuliah_id: 1, // Database Systems
      judul: "Kuis Singkat: Query Plan Cost Estimation",
      deskripsi: `Analisis perbandingan biaya Nested Loop Join vs Hash Join. ${DEMO_MARKER}`,
      deadline: toWIBString(oneDayAgo),
      status: "belum",
      created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  for (const t of relativeTasks) {
    db.tasks.push({
      id: db.nextIds.task++,
      ...t
    });
  }

  writeDB(db);
  console.log(`Berhasil menambahkan ${relativeTasks.length} tugas demo dengan deadline relatif (WIB).`);
}

runSeedDemo();
