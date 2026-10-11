# MALES 📄⚡
### Manajemen Administrasi Lebih Efektif dan Sederhana

Aplikasi web otomatisasi pembuatan berkas administrasi pencairan honor mitra statistik (Surat Tugas, BAST, dan Rekap SPJ Honor). Didesain khusus mengacu pada format standar tata naskah dinas **BPS Satuan Kerja 7301 (Kabupaten Kepulauan Selayar)**.

Aplikasi ini berjalan **100% di peramban web (Client-Side Only)** tanpa backend server, menjamin keamanan data pribadi mitra, dan di-deploy secara otomatis melalui **GitHub Pages**.

---

## 🚀 Fitur Unggulan

1. **Format Dokumen Baku & Presisi (Standar VHTS 7301)**:
   - **Surat Tugas (ST)**: Mendukung penugasan tunggal dan penugasan kolektif lengkap dengan tabel **Lampiran Anggota (1/1)**.
   - **Berita Acara Serah Terima (BAST)**: Penomoran berurut otomatis (`67.1`, `67.2`, dst.) dan konversi otomatis formula terbilang tanggal resmi (*"Pada hari ini senin, tanggal dua puluh bulan juli tahun dua ribu dua puluh enam (20-7-2026), bertempat di Benteng..."*).
   - **Rekapitulasi SPJ Honor**: Perhitungan otomatis volume, tarif honor, dan nominal honor neto/bruto.
2. **Ekspor Word (.docx) & Excel (.xlsx) Native**:
   - File Word hasil generate dapat langsung dibuka, diedit, dan dicetak di Microsoft Word.
   - Mendukung download seluruh BAST mitra sekaligus dalam 1 file Word terkompilasi (*page-break separated*).
   - Ekspor SPJ honor langsung dalam format spreadsheet Excel (`.xlsx`).
3. **Smart Mitra Table & Excel Importer**:
   - Impor data petugas dalam hitungan detik via file Excel/CSV (*drag-and-drop*).
   - Disediakan template Excel yang dapat langsung diunduh pengguna.
   - Aksi cepat: Samakan Realisasi = Target, seragamkan tarif honor semua mitra.
4. **Keamanan & Privasi Maksimal**:
   - Zero-Server Backend: Tidak ada NIK, nama mitra, maupun data keuangan yang dikirim ke server luar.
   - Draft dan profil Satker disimpan di `localStorage` peramban serta dapat diekspor/diimpor dalam format file proyek JSON.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Lucide Icons
- **Word (.docx) Engine**: `docx` (npm)
- **Spreadsheet (.xlsx) Engine**: `xlsx` (SheetJS)
- **Deployment**: GitHub Pages via GitHub Actions CI/CD

---

## 🌐 Akses Web (GitHub Pages)

Aplikasi dapat diakses langsung secara daring melalui:
👉 **`https://ridsonap.github.io/males/`**

*(Catatan: Pastikan fitur GitHub Pages diaktifkan pada pengaturan repositori GitHub dengan source: **GitHub Actions**)*

---

## 💻 Penggunaan Lokal (Development)

```bash
# Clone repositori
git clone git@github.com:ridsonap/males.git
cd males

# Install dependensi
npm install

# Jalankan server lokal
npm run dev

# Build untuk rilis produksi
npm run build
```

---

Dibuat dengan ❤️ untuk efisiensi administrasi BPS.
