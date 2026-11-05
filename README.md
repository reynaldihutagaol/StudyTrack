# StudyTrack

Aplikasi web manajemen tugas kuliah untuk mahasiswa dengan fitur **Reminder Tugas Mendekati Deadline**. Proyek ini dibangun di atas starter kit panitia Academya Arkavidia 11.0.

## Fitur Reminder Tugas Mendekati Deadline

Fitur ini memberikan visibilitas langsung terhadap tugas yang mendesak atau terlambat tanpa mengubah skema basis data. Seluruh logika klasifikasi dan pengurutan dihitung secara deterministik di backend setiap kali request dilakukan.

### 1. Aturan Klasifikasi Kategori (`deadline_category`)
Setiap tugas diklasifikasikan ke dalam salah satu dari tiga kategori secara berurutan:
1. `status === "selesai"` &rarr; `"normal"` (tugas yang sudah selesai tidak pernah ditandai sebagai mendekati atau terlambat).
2. `sisa_waktu = deadline - now`:
   - `sisa_waktu <= 0` &rarr; `"overdue"` (tepat 0 milidetik dihitung sebagai overdue/terlambat).
   - `0 < sisa_waktu < 24 jam` (strict kurang dari 24 jam; tepat 24 jam tidak termasuk) &rarr; `"mendekati"`.
3. Selain kondisi di atas &rarr; `"normal"`.
4. Jika `deadline` kosong atau tidak valid: ditangani secara aman dengan fallback ke `"normal"` disertai `console.warn` tanpa menyebabkan server crash.

### 2. Aturan Pengurutan Tugas
Daftar tugas pada `GET /api/tasks` dikelompokkan dan diurutkan sebagai berikut:
1. **Grup `mendekati`**: Ditampilkan di paling atas, diurutkan berdasarkan `deadline` **ASC** (tenggat waktu paling mendesak berada di paling atas).
2. **Grup `normal`**: Ditampilkan di tengah, diurutkan berdasarkan `created_at` **DESC** (perilaku bawaan: tugas terbaru dibuat berada di atas).
3. **Grup `overdue`**: Ditampilkan di bagian bawah, diurutkan berdasarkan `deadline` **DESC** (tugas yang baru saja lewat deadline berada di atas tugas yang sudah lama lewat).

### 3. Penanganan Zona Waktu (WIB / UTC+07:00)
- Field `deadline` dari browser input `datetime-local` disimpan sebagai waktu lokal tanpa informasi zona waktu (contoh: `2026-07-03T23:59`).
- Sesuai keputusan desain sistem, waktu tanpa offset/zona waktu **secara eksplisit ditafsirkan sebagai Waktu Indonesia Barat (WIB / UTC+07:00)** melalui utilitas `backend/utils/deadline.js`, bukan menggunakan zona waktu lokal mesin/server tempat Node.js berjalan.
- Jika string deadline sudah memiliki indikator UTC (`Z`) atau offset numerik (misal `+07:00`), nilai tersebut diparsing sesuai zona yang tertera.

### 4. Simulasi Waktu dengan Query Parameter `?now=`
Khusus di luar lingkungan production (`NODE_ENV !== "production"`), endpoint `GET /api/tasks` menerima query parameter:
```
GET /api/tasks?now=2026-07-03T00:00:00%2B07:00
```
- Query ini memungkinkan simulasi waktu acuan `now` untuk keperluan pengujian dan demo data seed (yang tenggat waktunya telah lampau).
- Di lingkungan production (`NODE_ENV === "production"`), parameter ini diabaikan sepenuhnya dan server selalu menggunakan waktu nyata (`new Date()`).

### 5. Tampilan Antarmuka (Frontend)
- **Badge Mendekati**: Menampilkan badge bertema jingga hangat (`#ffedd5` / `#9a3412`) dengan ikon jam SVG dan teks dinamis (contoh: `Mendekati deadline · sisa 5 jam 12 menit`). Aksen garis kiri jingga halus pada card.
- **Badge Terlambat**: Menampilkan badge bertema merah (`#fee2e2` / `#991b1b`) dengan ikon seru SVG dan teks dinamis (contoh: `Terlambat · 2 hari 3 jam`). Aksen garis kiri merah halus pada card.
- Warna badge dirancang kontras tinggi (memenuhi standar aksesibilitas WCAG AA &ge; 4.5:1) dan jelas berbeda dari badge status bawaan (`Belum` = kuning `#fef3c7`, `Selesai` = hijau `#d1fae5`).
- **Refetch Otomatis**: Daftar tugas diperbarui secara otomatis saat jendela browser menerima fokus (`window.onfocus`), saat tab aktif kembali (`visibilitychange`), berkala setiap 60 detik selama tab terbuka, serta segera setelah pengguna mengubah status tugas (belum &harr; selesai).

---

## Prasyarat
- Node.js &ge; 20.19 atau &ge; 22.12
- npm

---

## Cara Menjalankan

### 1. Menjalankan Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
Backend berjalan di `http://localhost:4000`.

### 2. Menjalankan Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend berjalan di `http://localhost:5173`.

### 3. Akun Demo
| Email | Password |
| --- | --- |
| `demo@studytrack.test` | `demo1234` |

Untuk mereset database kembali ke seed awal:
```bash
curl -X POST http://localhost:4000/api/dev/reset
```

### 4. Data Demo dengan Deadline Relatif
Untuk menguji dan mendemokan aplikasi dengan tugas-tugas bertenggat waktu relatif terhadap waktu saat ini (WIB):
```bash
cd backend
npm run seed:demo
```
Script ini menambahkan 5 tugas ke akun demo:
- ~3 jam lagi (mendekati deadline, < 24 jam)
- ~20 jam lagi (mendekati deadline, < 24 jam)
- ~2 hari lagi (normal, > 24 jam)
- ~6 hari lagi (normal, > 24 jam)
- ~1 hari lalu (overdue, <= 0)

Script ini bersifat idempotent (dapat dijalankan berulang kali tanpa menduplikasi data) dan hanya dapat dijalankan di luar lingkungan production.

---

## Menjalankan Pengujian (Testing)

Unit test dan integration test menggunakan test runner bawaan `node:test`:

```bash
cd backend
npm test
```

Untuk menguji determinisme zona waktu (WIB independen terhadap zona waktu server):
```bash
# Menjalankan dengan zona waktu UTC
TZ=UTC npm test

# Menjalankan dengan zona waktu lokal Jakarta
TZ=Asia/Jakarta npm test
```

---

## Asumsi Desain

1. **Format Durasi Sisa Waktu**:
   - Jika sisa waktu &ge; 24 jam (pada kondisi overdue): diformat menjadi `X hari Y jam` (atau `X hari` jika jam bernilai 0).
   - Jika sisa waktu &ge; 1 jam: diformat menjadi `X jam Y menit` (atau `X jam` jika menit bernilai 0).
   - Jika sisa waktu < 1 jam: diformat menjadi `X menit`.
2. **Nilai `sisa_waktu_ms` pada Tugas Selesai**:
   - Meskipun tugas berstatus `selesai` selalu memiliki `deadline_category = "normal"`, nilai `sisa_waktu_ms` tetap dihitung dan disertakan jika string deadline valid, agar konsisten dengan struktur data respon.
3. **Penyimpanan Runtime**:
   - Berkas database `backend/db.json` adalah data runtime yang diabaikan oleh Git (`.gitignore`), sedangkan data seed awal didefinisikan secara deklaratif di `backend/db.js`.

---

## Keterbatasan yang Diketahui

1. **Asumsi Zona Waktu WIB**: Input waktu dari browser menggunakan elemen `<input type="datetime-local">` yang menghasilkan string waktu lokal tanpa informasi zona waktu atau offset. Oleh karena itu, seluruh nilai deadline tanpa penanda zona diasumsikan dan ditafsirkan secara eksplisit sebagai Waktu Indonesia Barat (WIB / UTC+07:00).
2. **Penyimpanan Berbasis Berkas JSON**: Penyimpanan data aplikasi saat ini menggunakan berkas flat JSON lokal (`backend/db.json`), sehingga belum mendukung konkurensi tinggi, transaksi ACID multi-tabel, atau replikasi basis data terdistribusi.
3. **Penyegaran Data Periodik (Bukan Realtime)**: Pembaruan antarmuka pengguna mengandalkan refetch periodik tiap 60 detik dan event fokus jendela (`window.onfocus` / `visibilitychange`), bukan protokol realtime persisten dua arah seperti WebSocket atau Server-Sent Events (SSE).
