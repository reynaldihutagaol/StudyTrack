---
name: StudyTrack Design System
description: Sistem desain modern neo-grotesk berbingkai perangkat gelap dengan latar kanvas hitam, layout 2-kolom, form input tugas di atas, tilted card, dan ikon SVG murni
colors:
  page-bg: "#000000"
  frame-bg: "#000000"
  panel-bg: "#ffffff"
  text-primary: "#18181b"
  text-secondary: "#52525b"
  text-muted: "#71717a"
  outline-dark: "#18181b"
  outline-subtle: "#e4e4e7"
  accent-lime: "#bef264"
  accent-slate: "#f1f5f9"
  stat-active: "#f1f5f9"
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
  nav-bg: "#121214"
  nav-active: "#ffffff"
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

# StudyTrack Design System (v2 Refined)

## 1. Overview
StudyTrack mengadopsi sistem visual neo-grotesk berstruktur perangkat modern. Latar belakang utama UI aplikasi dan bingkai perangkat adalah hitam pekat (`#000000`) dengan sudut melengkung `36px` dan lebar lapang hingga `1520px`. Di dalam bingkai, panel konten utama tampil putih bersih (`#ffffff`) dengan outline gelap tegas `1.75px solid #18181b`, padding luas `36px 44px`, dan sudut `28px`.

## 2. Colors & Tokens
- **Latar Kanvas & Bingkai Perangkat**: Hitam pekat murni (`#000000`), menciptakan kontras tajam tanpa gradasi atau rona kebiruan.
- **Header & Navbar**: Latar navbar hitam pekat (`#000000`), logo sticker "StudyTrack" di kiri atas yang tajam dan dinamis, tab navigasi pill hitam arang (`#121214`), tab aktif berbentuk rounded pill putih kontras tinggi (`#ffffff`) dengan teks dan ikon hitam pekat (`#000000`), dan pill profil pengguna `#121214`.
- **Panel Utama (App Panel)**: Putih bersih (`#ffffff`) dengan outline gelap tegas `1.75px solid #18181b`, padding lapang `36px 44px` agar tata letak kartu tugas memiliki ruang lega.
- **Aksen Dekoratif**:
  - Lime (`#bef264`): Digunakan pada brand dot logo, blob ilustrasi 2D hero card, dan pill prioritas.
  - Slate pastel (`#f1f5f9`), Amber pastel (`#fef3c7`), Merah pastel (`#fee2e2`), Hijau pastel (`#dcfce7`) untuk chip statistik.
- **Semantik Urgensi & Status**:
  - *Mendekati Deadline*: Latar `#fff7ed`, teks `#9a3412`, border `#ea580c`. Format penulisan waktu ringkas dan rapi menggunakan separator bullet: `Mendekati • {sisaWaktu}` dengan `white-space: nowrap` agar tidak terpotong atau berantakan ke baris baru.
  - *Overdue / Terlambat*: Latar `#fef2f2`, teks `#991b1b`, border `#dc2626`. Format: `Terlambat • {sisaWaktu}`.
  - *Status Selesai*: Latar `#f0fdf4`, teks `#166534`, border `#16a34a`.
  - *Status Belum*: Latar `#f4f4f5`, teks `#52525b`, border netral.

## 3. Typography & Spacing
- Menggunakan font mandiri `@fontsource/plus-jakarta-sans`.
- **Halaman Mata Kuliah**: Jarak antara input `Kode Mata Kuliah` / `Dosen Pengampu` dan tombol `Tambah Mata Kuliah` diberikan margin yang lega (`margin-top: 18px` dan `gap: 16px`) sehingga tidak saling berdempetan.
- **Form Input Tambah Tugas**: Dimuat langsung di bagian atas kolom kanan halaman Daftar Tugas sebagai aksi prioritas utama yang langsung dapat diisi tanpa modal popup.

## 4. Iconography & Anti-Emoticon Policy
- **100% Pure Inline SVG**: Seluruh ikon di aplikasi merupakan SVG murni buatan sendiri dengan konsistensi stroke `2px` - `2.5px`, ujung membulat (*round caps & joins*).
- **Zero Emoticon/Emoji**: Tidak ada emotikon teks atau Unicode emoji di elemen navigasi, badge, tombol, chip, maupun teks informatif.
