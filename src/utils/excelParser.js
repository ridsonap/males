import * as XLSX from 'xlsx';

/**
 * Membaca file Excel/CSV yang diunggah pengguna dan mengembalikan array data mitra
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
          const realisasi = Number(findVal(['realisasi', 'selesai', 'capaian'], target)) || target;
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
 * Generate Template Excel Kosong untuk diunduh pengguna
 */
export function generateTemplateExcel() {
  const templateData = [
    {
      'No': 1,
      'Nama Mitra': 'Andi Syamsul',
      'NIK / ID Mitra': '7301050712880002',
      'Jabatan': 'Petugas Pendataan Lapangan',
      'Target Dokumen': 43,
      'Realisasi Dokumen': 43,
      'Honor per Satuan (Rp)': 66000,
    },
    {
      'No': 2,
      'Nama Mitra': 'Nur Jannah',
      'NIK / ID Mitra': '7301034811760004',
      'Jabatan': 'Petugas Pendataan Lapangan',
      'Target Dokumen': 25,
      'Realisasi Dokumen': 25,
      'Honor per Satuan (Rp)': 66000,
    },
    {
      'No': 3,
      'Nama Mitra': 'Rahmawati M. Nur',
      'NIK / ID Mitra': '7301074908030002',
      'Jabatan': 'Petugas Pendataan Lapangan',
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
    const vol = Number(mitra.realisasi || mitra.target || 0);
    const harga = Number(mitra.honor || 0);
    const bruto = vol * harga;
    // PPh 21 default 0% atau 5% jika ada
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
