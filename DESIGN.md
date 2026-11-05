---
name: StudyTrack Design System
description: Sistem desain modern neo-grotesk berbingkai perangkat dengan layout 2-kolom, hero card, tilted card, dan modal dialog untuk StudyTrack
colors:
  page-bg: "#ede9fe"
  frame-bg: "#111827"
  panel-bg: "#ffffff"
  text-primary: "#18181b"
  text-secondary: "#52525b"
  text-muted: "#71717a"
  outline-dark: "#18181b"
  outline-subtle: "#e4e4e7"
  accent-lime: "#bef264"
  accent-lavender: "#ede9fe"
  stat-active: "#f5f3ff"
  stat-warning: "#fef3c7"
  stat-danger: "#fee2e2"
  stat-success: "#dcfce7"
  urgent-mendekati-bg: "#fff7ed"
  urgent-mendekati-fg: "#9a3412"
  urgent-mendekati-border: "#ea580c"
  urgent-overdue-bg: "#fef2f2"
  urgent-overdue-fg: "#991b1b"
  urgent-overdue-border: "#dc2626"
  status-selesai-bg: "#f0fdf4"
  status-selesai-fg: "#166534"
  status-selesai-border: "#16a34a"
  nav-bg: "#1f2937"
  nav-active: "#111827"
typography:
  fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif"
  display:
    fontSize: "2.35rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  h1:
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  h2:
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontSize: "0.925rem"
    fontWeight: 400
    lineHeight: 1.5
  meta:
    fontSize: "0.825rem"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  sm: "8px"
  md: "14px"
  lg: "20px"
  xl: "28px"
  frame: "36px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.outline-dark}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    padding: "10px 22px"
  button-secondary:
    backgroundColor: "#ffffff"
    textColor: "{colors.outline-dark}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
  stat-chip:
    rounded: "{rounded.md}"
    padding: "10px 18px"
  task-card:
    backgroundColor: "{colors.panel-bg}"
    rounded: "{rounded.lg}"
    padding: "20px 20px"
---

# StudyTrack Design System (v2)

## 1. Overview
StudyTrack mengadopsi sistem visual neo-grotesk berstruktur perangkat modern (~80% kemiripan visual terhadap referensi estetika tablet application frame). Aplikasi dikemas dalam bingkai luar gelap (`#111827`) dengan sudut melengkung `36px`, navbar terintegrasi dengan active tab notch yang menyatu ke panel putih di bawahnya, header sapaan besar dengan 4 chip statistik pastel ber-outline, tata letak dua kolom (62% / 38%), hero card "Prioritas Utama", 2-kolom grid tugas dengan corner blob melengkung, sidebar ringkasan per mata kuliah dengan progress bar, tilted overlay card (3 derajat), CTA gradien ungu, serta modal dialog tambah tugas yang aksesibel.

## 2. Colors & Tokens
- **Latar Kanvas Luar**: Lavender sangat lembut (`#ede9fe`), memberikan kenyamanan visual dan kontras terhadap bingkai.
- **Bingkai Perangkat (Device Frame)**: Gelap pekat (`#111827`), sudut `36px`, memberi impresi casing tablet/perangkat modern.
- **Panel Utama (App Panel)**: Putih bersih (`#ffffff`) dengan outline gelap tegas `1.75px solid #18181b` dan sudut `28px`.
- **Aksen Dekoratif**:
  - Lime (`#bef264`): Digunakan pada dot logo, blob ilustrasi 2D hero card, tombol cutout bell, dan aksen sudut tugas mendesak.
  - Lavender pastel (`#ede9fe`), Amber pastel (`#fef3c7`), Merah pastel (`#fee2e2`), Hijau pastel (`#dcfce7`) untuk chip statistik dan corner blob.
- **Semantik Urgensi & Status**:
  - *Mendekati Deadline*: Latar `#fff7ed`, teks `#9a3412`, border `#ea580c`.
  - *Overdue / Terlambat*: Latar `#fef2f2`, teks `#991b1b`, border `#dc2626`.
  - *Status Selesai*: Latar `#f0fdf4`, teks `#166534`, border `#16a34a`.
  - *Status Belum*: Latar `#f4f4f5`, teks `#52525b`, border netral.

## 3. Typography
Menggunakan font lokal `@fontsource/plus-jakarta-sans`:
- **Heading / Sapaan Utama**: Bobot `800` (Extra Bold) dengan letter-spacing `-0.03em`.
- **Sub-heading & Judul Tugas**: Bobot `800` atau `700`, proporsi teks padat dan terbaca sekilas.
- **Body & Deskripsi**: Bobot `400` / `500`, teks terpotong rapi dengan ellipsis jika melebihi 2 baris (`-webkit-line-clamp: 2`).
- **Tag & Label**: Huruf kapital tebal berukuran `0.725rem - 0.775rem`, letter-spacing `0.05em`.

## 4. Layout Architecture
- **Desktop (>= 1024px)**:
  - Grid dua kolom proporsional (62% / 38%).
  - Kolom Kiri:
    1. Hero Card "Prioritas Utama": Menampilkan tugas paling mendesak (item pertama berkategori mendekati atau normal), blob lime besar dengan SVG icon akademis, tag mata kuliah dan sisa waktu, track bar urgensi, tombol pill "Tandai Selesai", tombol bulat sekunder, dan dual cutout controls di sudut kanan atas.
    2. Baris Filter Pills: Tab "Semua", "Mendekati", "Normal", "Terlambat", "Selesai" yang hanya menyaring data tanpa mengurutkan ulang.
    3. Grid 2-Kolom Kartu Tugas: Tiap kartu ber-outline tegas, dengan blob melengkung di sudut kanan atas dan badge semantik lengkap.
  - Kolom Kanan:
    1. Sidebar Summary Card: Batang progres (selesai/total per mata kuliah) dihitung dinamis dari data tugas.
    2. Tilted Overlay Card: Kartu putih berotasi `3deg` menimpa sebagian ringkasan, menampilkan 3 deadline terdekat dengan ikon lightning SVG dan tombol navigasi `Lihat semua tugas`.
    3. CTA Gradient Card: Gradien ungu (`#4f46e5` ke `#7c3aed`), tombol pill putih yang memicu pembukaan form dalam modal dialog.
- **Mobile (< 600px)**:
  - Satu kolom responsif dengan urutan vertikal: Sapaan -> 4 Chip (grid 2 kolom) -> Hero Card -> Filter (scroll horizontal) -> Kartu Tugas (1 kolom) -> Ringkasan Mata Kuliah -> CTA.
  - Rotasi tilted card otomatis dinonaktifkan (`transform: none`).
  - Active notch dinonaktifkan agar tidak mengambang saat tab bertumpuk.
  - Zero horizontal page overflow.

## 5. Modal Dialog Tambah Tugas (Accessibility)
Form tambah tugas tidak lagi menguasai halaman utama, melainkan ditempatkan di dalam modal dialog yang memenuhi standar WCAG dan WAI-ARIA:
- Focus trap di dalam dialog saat aktif.
- Tombol `Escape` langsung menutup modal.
- Mengembalikan fokus keyboard secara otomatis ke tombol pemicu saat ditutup.
- Atribut `role="dialog"`, `aria-modal="true"`, dan `aria-labelledby`.

## 6. Iconography & Decoration
- Seluruh ikon menggunakan authored inline SVG datar dengan stroke `2px - 2.5px` konsisten, tanpa emoji, dan tanpa ilustrasi 3D.
- Bentuk kurva dan blob dibuat dengan path SVG sederhana dan CSS border-radius asimetris.
- Elemen dekoratif diberi atribut `aria-hidden="true"`.
