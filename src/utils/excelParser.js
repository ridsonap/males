import * as XLSX from 'xlsx';

// Angka dari sel Excel; sel kosong/tidak valid -> fallback, tetapi 0 tetap 0
function toNumberOr(value, fallback) {
  if (value === '' || value === null || value === undefined) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Membaca file Excel/CSV yang diunggah pengguna untuk mengimpor daftar mitra ke survei aktif
 */
export function parseExcelMitra(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          resolve([]);
          return;
        }

        const normalizedMitras = rawJson.map((row, idx) => {
          const keys = Object.keys(row);
          const findVal = (keywords, fallback = '') => {
            for (const key of keys) {
              const lowerKey = key.toLowerCase().trim();
              if (keywords.some((kw) => lowerKey.includes(kw))) {
                return row[key];
              }
            }
            return fallback;
          };

          const nama = findVal(['nama', 'name', 'petugas'], `Mitra ${idx + 1}`);
          const nik = String(findVal(['nik', 'nip', 'id', 'ktp'], ''));
          const jabatan = findVal(['jabatan', 'tugas', 'peran'], 'Petugas Pendataan Lapangan');
          const target = Number(findVal(['target', 'vol', 'volume', 'beban', 'sampel'], 10)) || 10;
          const realisasi = toNumberOr(findVal(['realisasi', 'selesai', 'capaian'], ''), target);
          const honor = Number(findVal(['honor', 'tarif', 'satuan', 'harga'], 66000)) || 66000;

          return {
            id: `mitra-${Date.now()}-${idx}`,
            nama: String(nama).trim(),
            nik: nik.trim(),
            jabatan: String(jabatan).trim(),
            target,
            realisasi,
            honor,
            npwp: '',
          };
        });

        resolve(normalizedMitras);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parser Cerdas untuk Menambahkan Survei beserta Nama-Nama Mitranya via File Excel
 * Mendukung 3 format sekaligus:
 * 1. Format Tabel dengan Kolom 'Survei' / 'Kegiatan' (Multi-Survei dalam 1 tabel)
 * 2. Format Blok Metadata di Atas + Tabel Mitra di Bawah
 * 3. Format Multi-Sheet (1 Sheet = 1 Survei)
 */
export function parseExcelSurveiDanMitra(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const fileNameWithoutExt = file.name ? file.name.replace(/\.[^/.]+$/, '') : 'Survei_Baru';

        const surveys = [];

        for (const sheetName of workbook.SheetNames) {
          // Skip sheet petunjuk
          if (sheetName.toLowerCase().includes('panduan') || sheetName.toLowerCase().includes('petunjuk')) {
            continue;
          }

          const ws = workbook.Sheets[sheetName];
          const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
          if (!aoa || aoa.length === 0) continue;

          // 1. Ekstrak Metadata (jika ada pada baris 0 s.d 8)
          let meta = {
            nama_kegiatan: '',
            periode_kegiatan: '',
            st_nomor: '',
            st_tanggal: '',
            bast_prefix: '',
            bast_suffix: '',
            bast_tanggal: '',
            sk_nomor: '',
            sk_tanggal: '',
            sk_perihal: '',
          };

          let tableHeaderRowIndex = -1;

          for (let r = 0; r < Math.min(aoa.length, 12); r++) {
            const row = aoa[r] || [];
            const rowText = row.map((c) => String(c).toLowerCase().trim()).join(' ');

            // Deteksi baris header tabel
            const hasNama = rowText.includes('nama') || rowText.includes('petugas');
            const hasMitraCol =
              rowText.includes('nik') ||
              rowText.includes('nip') ||
              rowText.includes('jabatan') ||
              rowText.includes('target') ||
              rowText.includes('dokumen') ||
              rowText.includes('honor');

            if (hasNama && hasMitraCol) {
              tableHeaderRowIndex = r;
              break;
            }

            // Ekstrak pasangan Key - Value
            for (let c = 0; c < row.length; c++) {
              const keyCell = String(row[c] || '').toLowerCase().trim();
              const valCell =
                c + 1 < row.length ? String(row[c + 1] || '').replace(/^[:\s]+/, '').trim() : '';

              if (!valCell) continue;

              if ((keyCell.includes('kegiatan') || keyCell.includes('survei')) && !meta.nama_kegiatan) {
                meta.nama_kegiatan = valCell;
              } else if (keyCell.includes('periode') && !meta.periode_kegiatan) {
                meta.periode_kegiatan = valCell;
              } else if ((keyCell.includes('st') || keyCell.includes('tugas')) && keyCell.includes('no') && !meta.st_nomor) {
                meta.st_nomor = valCell;
              } else if (keyCell.includes('bast') && keyCell.includes('prefix') && !meta.bast_prefix) {
                meta.bast_prefix = valCell;
              } else if (keyCell.includes('bast') && keyCell.includes('no') && !meta.bast_prefix) {
                meta.bast_prefix = valCell;
              } else if (keyCell.includes('sk') && keyCell.includes('no') && !meta.sk_nomor) {
                meta.sk_nomor = valCell;
              }
            }
          }

          if (tableHeaderRowIndex === -1) {
            tableHeaderRowIndex = 0;
          }

          const headerRow = aoa[tableHeaderRowIndex] || [];
          const headers = headerRow.map((h) => String(h).trim().toLowerCase());

          // Cari kolom-kolom
          const surveyColIdx = headers.findIndex(
            (h) => h.includes('survei') || h.includes('kegiatan')
          );
          const namaColIdx = headers.findIndex(
            (h, idx) =>
              idx !== surveyColIdx &&
              (h.includes('nama mitra') || h.includes('nama petugas') || h === 'nama' || h.includes('petugas'))
          );
          const nikColIdx = headers.findIndex(
            (h) => h.includes('nik') || h.includes('nip') || h.includes('ktp') || h.includes('id')
          );
          const jabatanColIdx = headers.findIndex(
            (h) => h.includes('jabatan') || h.includes('peran') || h.includes('tugas')
          );
          const targetColIdx = headers.findIndex(
            (h) => h.includes('target') || h.includes('beban') || h.includes('vol') || h.includes('sampel')
          );
          const realisasiColIdx = headers.findIndex(
            (h) => h.includes('realisasi') || h.includes('selesai') || h.includes('capaian')
          );
          const honorColIdx = headers.findIndex(
            (h) => h.includes('honor') || h.includes('tarif') || h.includes('satuan') || h.includes('biaya')
          );

          const rowsData = aoa.slice(tableHeaderRowIndex + 1);

          // FORMAT A: Ada Kolom Nama Survei di dalam tabel (Multi-Survei tabular)
          if (surveyColIdx !== -1 && namaColIdx !== -1 && surveyColIdx !== namaColIdx) {
            const surveyGroups = {};
            rowsData.forEach((row) => {
              const surveyName = String(row[surveyColIdx] || '').trim();
              const nama = String(row[namaColIdx] || '').trim();
              if (!surveyName || !nama) return;

              if (!surveyGroups[surveyName]) {
                surveyGroups[surveyName] = [];
              }

              const target = Number(targetColIdx !== -1 ? row[targetColIdx] : 10) || 10;
              const realisasi = toNumberOr(realisasiColIdx !== -1 ? row[realisasiColIdx] : '', target);
              const honor = Number(honorColIdx !== -1 ? row[honorColIdx] : 66000) || 66000;

              surveyGroups[surveyName].push({
                id: `mitra-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                nama,
                nik: String(nikColIdx !== -1 ? row[nikColIdx] : '').trim(),
                jabatan: String(jabatanColIdx !== -1 ? row[jabatanColIdx] : 'Petugas Pendataan Lapangan').trim() || 'Petugas Pendataan Lapangan',
                target,
                realisasi,
                honor,
                npwp: '',
              });
            });

            Object.entries(surveyGroups).forEach(([sName, mitrasList]) => {
              if (mitrasList.length > 0) {
                surveys.push({
                  id: `survey-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                  nama_kegiatan: sName,
                  periode_kegiatan: meta.periode_kegiatan || 'Bulan Pelaksanaan Tahun 2026',
                  lokasi_kegiatan: 'Kepulauan Selayar',
                  tgl_mulai: '2026-07-01',
                  tgl_selesai: '2026-07-20',
                  sk_nomor: meta.sk_nomor || '043 TAHUN 2026',
                  sk_tanggal: meta.sk_tanggal || '05 Januari 2026',
                  sk_perihal: meta.sk_perihal || `Petugas ${sName}`,
                  st_nomor: meta.st_nomor || 'B-128/7301/VS.330/2026',
                  st_tanggal: '2026-07-01',
                  bast_prefix: meta.bast_prefix || '67',
                  bast_suffix: '7301/VS.330/2026',
                  bast_tanggal: '2026-07-20',
                  program: 'Program Penyediaan dan Pelayanan Informasi Statistik',
                  kegiatan: 'Penyediaan dan Pengembangan Statistik',
                  output: 'Publikasi / Laporan Statistik',
                  komponen: 'Dukungan Penyelenggaraan Tugas Teknis Lainnya',
                  mak: 'Belanja Honor Output Kegiatan',
                  mitras: mitrasList,
                });
              }
            });
          } else if (namaColIdx !== -1) {
            // FORMAT B & C: 1 Survei per Sheet atau file tabel daftar mitra
            const mitrasList = [];
            rowsData.forEach((row) => {
              const nama = String(row[namaColIdx] || '').trim();
              if (!nama || nama.toLowerCase().startsWith('jumlah') || nama.toLowerCase().startsWith('total')) return;

              const target = Number(targetColIdx !== -1 ? row[targetColIdx] : 10) || 10;
              const realisasi = toNumberOr(realisasiColIdx !== -1 ? row[realisasiColIdx] : '', target);
              const honor = Number(honorColIdx !== -1 ? row[honorColIdx] : 66000) || 66000;

              mitrasList.push({
                id: `mitra-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                nama,
                nik: String(nikColIdx !== -1 ? row[nikColIdx] : '').trim(),
                jabatan: String(jabatanColIdx !== -1 ? row[jabatanColIdx] : 'Petugas Pendataan Lapangan').trim() || 'Petugas Pendataan Lapangan',
                target,
                realisasi,
                honor,
                npwp: '',
              });
            });

            if (mitrasList.length > 0) {
              const surveyName =
                meta.nama_kegiatan ||
                (sheetName !== 'Sheet1' && sheetName !== 'Template Mitra' ? sheetName : fileNameWithoutExt);

              surveys.push({
                id: `survey-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                nama_kegiatan: surveyName,
                periode_kegiatan: meta.periode_kegiatan || 'Bulan Pelaksanaan Tahun 2026',
                lokasi_kegiatan: 'Kepulauan Selayar',
                tgl_mulai: '2026-07-01',
                tgl_selesai: '2026-07-20',
                sk_nomor: meta.sk_nomor || '043 TAHUN 2026',
                sk_tanggal: '05 Januari 2026',
                sk_perihal: `Petugas ${surveyName}`,
                st_nomor: meta.st_nomor || 'B-128/7301/VS.330/2026',
                st_tanggal: '2026-07-01',
                bast_prefix: meta.bast_prefix || '67',
                bast_suffix: '7301/VS.330/2026',
                bast_tanggal: '2026-07-20',
                program: 'Program Penyediaan dan Pelayanan Informasi Statistik',
                kegiatan: 'Penyediaan dan Pengembangan Statistik',
                output: 'Publikasi / Laporan Statistik',
                komponen: 'Dukungan Penyelenggaraan Tugas Teknis Lainnya',
                mak: 'Belanja Honor Output Kegiatan',
                mitras: mitrasList,
              });
            }
          }
        }

        resolve(surveys);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Generate Template Excel Resmi untuk Menambahkan Survei beserta Mitranya
 */
export function generateTemplateSurveiExcel() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Format Blok Survei (Paling Direkomendasikan untuk 1 Survei Lengkap)
  const sheetBlokData = [
    ['PENGATURAN SURVEI / KEGIATAN'],
    ['Nama Kegiatan / Survei', 'Survei Sosial Ekonomi Nasional (Susenas)'],
    ['Periode Kegiatan', 'Bulan Maret Tahun 2026'],
    ['Nomor Surat Tugas', 'B-210/7301/VS.330/2026'],
    ['Prefix Nomor BAST', '75'],
    ['Nomor SK Honor', '045 TAHUN 2026'],
    [],
    ['DAFTAR PETUGAS / MITRA SURVEI'],
    [
      'No',
      'Nama Mitra',
      'NIK / ID Mitra',
      'Jabatan / Penugasan',
      'Target Dokumen',
      'Realisasi Dokumen',
      'Honor per Satuan (Rp)',
    ],
    [1, 'Andi Baso', '7301050101900001', 'Petugas Pendataan Lapangan', 35, 35, 66000],
    [2, 'Siti Nurhaliza', '7301050202920002', 'Petugas Pendataan Lapangan', 25, 25, 66000],
    [3, 'Muhammad Fadil', '7301050303880003', 'Pengawas / Pemeriksa', 60, 60, 85000],
  ];
  const wsBlok = XLSX.utils.aoa_to_sheet(sheetBlokData);
  wsBlok['!cols'] = [
    { wch: 6 },
    { wch: 28 },
    { wch: 22 },
    { wch: 28 },
    { wch: 16 },
    { wch: 18 },
    { wch: 22 },
  ];
  XLSX.utils.book_append_sheet(wb, wsBlok, 'Contoh_Format_Blok');

  // Sheet 2: Format Multi-Survei Tabular (Dalam 1 Tabel Gabungan)
  const sheetMultiData = [
    [
      'Nama Kegiatan / Survei',
      'Nama Mitra',
      'NIK / ID Mitra',
      'Jabatan / Penugasan',
      'Target Dokumen',
      'Realisasi Dokumen',
      'Honor per Satuan (Rp)',
    ],
    ['Survei Sakernas', 'Sudirman Pratama', '7301011105810001', 'Pencacah Lapangan (PCL)', 20, 20, 66000],
    ['Survei Sakernas', 'Nurwah Daniah', '7301086611960001', 'Pencacah Lapangan (PCL)', 20, 20, 66000],
    ['Survei SHPB', 'Andi Syamsul', '7301050712880002', 'Petugas Pendataan', 15, 15, 60000],
    ['Survei SHPB', 'Nur Jannah', '7301034811760004', 'Petugas Pendataan', 15, 15, 60000],
  ];
  const wsMulti = XLSX.utils.aoa_to_sheet(sheetMultiData);
  wsMulti['!cols'] = [
    { wch: 25 },
    { wch: 24 },
    { wch: 20 },
    { wch: 25 },
    { wch: 15 },
    { wch: 18 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, wsMulti, 'Format_Tabel_Multi_Survei');

  // Sheet 3: Panduan Pengisian
  const sheetPanduanData = [
    ['PANDUAN PENGISIAN EXCEL TAMBAH SURVEI & MITRA (MALES BPS 7301)'],
    [],
    ['1. Ada dua format yang didukung otomatis:'],
    ['   a. Format Blok (Lihat Sheet Contoh_Format_Blok): Ada identitas nama survei, periode, no ST di bagian atas, lalu tabel mitra di bawahnya.'],
    ['   b. Format Kolom (Lihat Sheet Format_Tabel_Multi_Survei): Baris-baris mitra yang dilengkapi kolom "Nama Kegiatan / Survei". Bisa langsung impor banyak survei sekaligus!'],
    ['2. Data tersimpan 100% aman di peramban web pengguna tanpa server backend.'],
    ['3. Dokumen Word Surat Tugas dan BAST yang digenerate dijamin 100% sama persis dengan standar naskah dinas BPS Satker 7301.'],
  ];
  const wsPanduan = XLSX.utils.aoa_to_sheet(sheetPanduanData);
  wsPanduan['!cols'] = [{ wch: 100 }];
  XLSX.utils.book_append_sheet(wb, wsPanduan, 'Panduan_Format');

  return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
}

/**
 * Generate Template Excel Kosong untuk diunduh pengguna (Sederhana Daftar Mitra)
 */
export function generateTemplateExcel() {
  const templateData = [
    {
      No: 1,
      'Nama Mitra': 'Andi Syamsul',
      'NIK / ID Mitra': '7301050712880002',
      Jabatan: 'Petugas Pendataan Lapangan',
      'Target Dokumen': 43,
      'Realisasi Dokumen': 43,
      'Honor per Satuan (Rp)': 66000,
    },
    {
      No: 2,
      'Nama Mitra': 'Nur Jannah',
      'NIK / ID Mitra': '7301034811760004',
      Jabatan: 'Petugas Pendataan Lapangan',
      'Target Dokumen': 25,
      'Realisasi Dokumen': 25,
      'Honor per Satuan (Rp)': 66000,
    },
    {
      No: 3,
      'Nama Mitra': 'Rahmawati M. Nur',
      'NIK / ID Mitra': '7301074908030002',
      Jabatan: 'Petugas Pendataan Lapangan',
      'Target Dokumen': 30,
      'Realisasi Dokumen': 30,
      'Honor per Satuan (Rp)': 66000,
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template Mitra');
  return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
}

/**
 * Generate File Excel SPJ Rincian Honor Petugas (Format Persis SPJ VHTS 7301)
 */
export function generateSpjExcel(data) {
  const {
    nama_kegiatan = 'Survei VHTS',
    periode_kegiatan = 'Bulan Juni Tahun 2026',
    sk_nomor = '043 TAHUN 2026',
    sk_tanggal = '05 Januari 2026',
    program = 'Program Penyediaan dan Pelayanan Informasi Statistik',
    kegiatan = 'Penyediaan dan Pengembangan Statistik Distribusi',
    output = 'Publikasi / Laporan Statistik Distribusi',
    komponen = 'Dukungan Penyelenggaraan Tugas Teknis Lainnya',
    mak = 'Belanja Honor Output Kegiatan',
    mitra_list = [],
  } = data;

  const rows = [
    [`Daftar Rincian Honor Petugas ${nama_kegiatan} ${periode_kegiatan}`],
    ['Program', '', `: ${program}`],
    ['Kegiatan', '', `: ${kegiatan}`],
    ['Rincian Output', '', `: ${output}`],
    ['Komponen', '', `: ${komponen}`],
    ['Mata Anggaran', '', `: ${mak}`],
    ['No. SK', '', `: ${sk_nomor} Tanggal ${sk_tanggal}`],
    [], // Blank line
    [
      'No',
      'Nama',
      'Tugas',
      'Vol (Dokumen)',
      'Harga Satuan (Rp)',
      'Biaya (Rp)',
      'PPh 21 (Rp)',
      'Jumlah Diterima (Rp)',
      'Tanda Tangan',
    ],
    ['(1)', '(2)', '(3)', '(4)', '(5)', '(6)', '(7)', '(8)', '(9)'],
  ];

  let totalVol = 0;
  let totalBiaya = 0;
  let totalPph = 0;
  let totalNetto = 0;

  mitra_list.forEach((mitra, idx) => {
    const vol = Number(mitra.realisasi) || 0;
    const harga = Number(mitra.honor || 0);
    const bruto = vol * harga;
    const pph = 0;
    const netto = bruto - pph;

    totalVol += vol;
    totalBiaya += bruto;
    totalPph += pph;
    totalNetto += netto;

    rows.push([
      idx + 1,
      mitra.nama,
      mitra.jabatan || 'PCL',
      vol,
      harga,
      bruto,
      pph,
      netto,
      `${idx + 1}. ............`,
    ]);
  });

  // Baris Total
  rows.push([
    'JUMLAH',
    '',
    '',
    totalVol,
    '',
    totalBiaya,
    totalPph,
    totalNetto,
    '',
  ]);

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Set column widths
  ws['!cols'] = [
    { wch: 6 },
    { wch: 28 },
    { wch: 18 },
    { wch: 14 },
    { wch: 18 },
    { wch: 18 },
    { wch: 14 },
    { wch: 20 },
    { wch: 20 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rincian Honor');
  return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
}
