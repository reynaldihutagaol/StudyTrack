---
name: StudyTrack Design System
description: Sistem desain modern, segar, dan berstruktur untuk aplikasi manajemen tugas mahasiswa StudyTrack
colors:
  page-bg: "#ede9fe"
  panel-bg: "#ffffff"
  text-primary: "#18181b"
  text-secondary: "#64748b"
  text-muted: "#94a3b8"
  outline-dark: "#18181b"
  outline-subtle: "#e2e8f0"
  accent-lime: "#bef264"
  accent-lime-tint: "#f7fee7"
  stat-active: "#f3e8ff"
  stat-warning: "#fef3c7"
  stat-danger: "#fee2e2"
  stat-success: "#dcfce7"
  urgent-mendekati-bg: "#ffedd5"
  urgent-mendekati-fg: "#9a3412"
  urgent-mendekati-border: "#ea580c"
  urgent-overdue-bg: "#fee2e2"
  urgent-overdue-fg: "#991b1b"
  urgent-overdue-border: "#dc2626"
  status-selesai-bg: "#dcfce7"
  status-selesai-fg: "#166534"
  status-belum-bg: "#f1f5f9"
  status-belum-fg: "#475569"
  nav-bg: "#18181b"
  nav-active: "#27272a"
typography:
  fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif"
  display:
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  h1:
    fontSize: "1.65rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  h2:
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontSize: "0.925rem"
    fontWeight: 400
    lineHeight: 1.5
  meta:
    fontSize: "0.825rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "8px"
  md: "12px"
  lg: "20px"
  xl: "28px"
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
    padding: "10px 14px"
  task-card:
    backgroundColor: "{colors.panel-bg}"
    rounded: "{rounded.lg}"
    padding: "20px 22px"
---

# StudyTrack Design System

## Overview
StudyTrack adalah aplikasi manajemen tugas kuliah yang memadukan kejelasan fungsional dan estetika modern berorientasi mahasiswa. Desain ini mengadopsi palet latar lavender lembut, kontainer utama melengkung dengan outline gelap tegas, kartu dengan aksen sudut dekoratif segar (lime), bilah navigasi berbentuk kapsul gelap (dark pill navbar), serta chip statistik pastel yang ringkas dan scannable.

## Colors
- **Latar & Kanvas**: Latar luar lavender sangat lembut (`#ede9fe`), panel utama putih bersih (`#ffffff`) yang kontras dan nyaman di mata.
- **Outline & Border**: Outline gelap tegas (`#18181b`, ~1.75px) yang membingkai kartu, chip, dan panel aplikasi, memberi struktur grafis yang tajam.
- **Aksen Dekoratif**: Lime cerah (`#bef264` / `#f7fee7`) digunakan khusus sebagai aksen dekoratif visual sudut kartu, tidak digunakan untuk kode status urgensi.
- **Semantik Status & Urgensi**:
  - *Mendekati Deadline*: Oranye hangat (`#ffedd5` latar, `#9a3412` teks, border aksen kiri `#ea580c`).
  - *Overdue / Terlambat*: Merah tegas (`#fee2e2` latar, `#991b1b` teks, border aksen kiri `#dc2626`).
  - *Status Selesai*: Hijau daun lembut (`#dcfce7` latar, `#166534` teks).
  - *Status Belum*: Slate netral (`#f1f5f9` latar, `#475569` teks).

## Typography
- **Font Utama**: *Plus Jakarta Sans*, sans-serif geometris modern dengan bobot tegas untuk judul (700/800) dan keterbacaan tinggi pada teks sekunder (400/500).
- **Hirarki Tipografi**:
  - *Hero Greeting / Title*: 1.75rem - 2rem, bobot 800, tracking -0.03em.
  - *Section Header*: 1.25rem, bobot 700, tracking -0.02em.
  - *Task Title*: 1.1rem, bobot 700, warna `#18181b`.
  - *Metadata & Label*: 0.825rem, tabular numbers untuk jam dan tanggal.

## Layout
- **Struktur Shell**: Latar lavender dengan kontainer panel utama di tengah ber-radius `28px` yang menampung seluruh konten dan navigasi.
- **Rhythm Spasial**: Menggunakan grid ritmis berbasis 8px/16px/24px/32px dengan pembagian zona jelas: Navigasi &rarr; Header & Stat Chips &rarr; Form Aksi &rarr; Daftar Kartu.
- **Responsif**: Di layar ponsel (< 600px), kartu beralih ke tata letak vertikal, chip statistik ditata dalam grid 2x2, dan padding kontainer disesuaikan tanpa horizontal overflow.

## Elevation & Depth
- Bukan menggunakan drop shadow blur yang berat, sistem mengadopsi sentuhan neo-grotesk terukur: outline gelap tegas dipadukan dengan bayangan terarah halus `2px 2px 0px #18181b` atau soft lavender ambient shadow `0 12px 32px -8px rgba(109, 40, 217, 0.08)`.

## Shapes
- **Corner Radius**:
  - Panel utama: `28px`
  - Kartu & Kontainer Form: `20px` - `24px`
  - Stat Chips & Form Input: `12px` - `14px`
  - Navigasi & Tombol Aksi: `9999px` (Full Pill)

## Components
1. **Floating Dark Pill Navbar**: Navigasi kapsul gelap `#18181b` melayang dengan tab aktif abu gelap `#27272a`, ikon SVG, dan chip status pengguna di kanan.
2. **Stat Chips Bar**: Baris chip statistik di bagian atas halaman dengan outline gelap 1.5px dan warna pastel fungsional (Aktif, Mendekati, Terlambat, Selesai).
3. **TaskCard**: Kartu putih dengan outline 1.75px, radius 20px, aksen sudut dekoratif lime, garis indikator urgensi kiri (oranye/merah), informasi metadata bertingkat, dan tombol aksi kapsul outline yang proporsional.
4. **Form Controls**: Input field dan select ber-radius 12px dengan border gelap tegas dan focus ring berkontras tinggi.
5. **Pill Buttons**: Tombol utama pill hitam pekat, tombol sekunder pill outline berlatar putih, dan tombol destruktif ghost dengan highlight merah lembut.

## Do's and Don'ts
- **DO**: Pertahankan kontras warna di atas 4.5:1 (WCAG AA).
- **DO**: Selalu sertakan ikon SVG berdampingan dengan teks status urgensi agar tidak hanya bergantung pada warna.
- **DO**: Pastikan elemen interaktif memiliki `:focus-visible` outline yang jelas.
- **DON'T**: Jangan menggunakan aksen lime dekoratif untuk mengindikasikan status tugas atau deadline.
- **DON'T**: Jangan mengubah format atau logika API server saat menghitung statistik; hitung secara murni dari array tugas yang telah di-fetch.
