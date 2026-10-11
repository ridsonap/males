// Utilitas Terbilang Bahasa Indonesia untuk Administrasi BPS & MALES

const SATUAN = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];

export function terbilang(n) {
  n = Math.floor(Number(n));
  if (isNaN(n) || n === 0) return 'nol';
  if (n < 0) return 'minus ' + terbilang(Math.abs(n));

  if (n < 12) {
    return SATUAN[n];
  } else if (n < 20) {
    return terbilang(n - 10) + ' belas';
  } else if (n < 100) {
    const sisa = n % 10;
    return terbilang(Math.floor(n / 10)) + ' puluh' + (sisa ? ' ' + SATUAN[sisa] : '');
  } else if (n < 200) {
    return 'seratus' + (n - 100 ? ' ' + terbilang(n - 100) : '');
  } else if (n < 1000) {
    const sisa = n % 100;
    return terbilang(Math.floor(n / 100)) + ' ratus' + (sisa ? ' ' + terbilang(sisa) : '');
  } else if (n < 2000) {
    return 'seribu' + (n - 1000 ? ' ' + terbilang(n - 1000) : '');
  } else if (n < 1000000) {
    const sisa = n % 1000;
    return terbilang(Math.floor(n / 1000)) + ' ribu' + (sisa ? ' ' + terbilang(sisa) : '');
  } else if (n < 1000000000) {
    const sisa = n % 1000000;
    return terbilang(Math.floor(n / 1000000)) + ' juta' + (sisa ? ' ' + terbilang(sisa) : '');
  } else if (n < 1000000000000) {
    const sisa = n % 1000000000;
    return terbilang(Math.floor(n / 1000000000)) + ' miliar' + (sisa ? ' ' + terbilang(sisa) : '');
  }
  return n.toString();
}

export const NAMA_HARI = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
export const NAMA_BULAN = [
  'januari', 'februari', 'maret', 'april', 'mei', 'juni',
  'juli', 'agustus', 'september', 'oktober', 'november', 'desember'
];

export const NAMA_BULAN_CAPITAL = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Mengubah string tanggal YYYY-MM-DD menjadi kalimat pembuka BAST resmi BPS
 * Contoh hasil: "Pada hari ini senin, tanggal dua puluh bulan juli tahun dua ribu dua puluh enam (20-7-2026), bertempat di Benteng, kami yang bertanda tangan dibawah ini:"
 */
export function formatBastTanggalLengkap(dateStr, kota = 'Benteng') {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';

  const dayIndex = d.getDay();
  const dayName = NAMA_HARI[dayIndex];
  const dateNum = d.getDate();
  const monthIndex = d.getMonth();
  const monthName = NAMA_BULAN[monthIndex];
  const yearNum = d.getFullYear();

  const terbilangTgl = terbilang(dateNum);
  const terbilangThn = terbilang(yearNum);

  // Format angka tanggal e.g. 20-7-2026 (sesuai contoh asli VHTS 7301)
  const formatAngka = `${dateNum}-${monthIndex + 1}-${yearNum}`;

  return `Pada hari ini ${dayName}, tanggal ${terbilangTgl} bulan ${monthName} tahun ${terbilangThn} (${formatAngka}), bertempat di ${kota}, kami yang bertanda tangan dibawah ini:`;
}

/**
 * Format tanggal Indonesia biasa: 20 Juli 2026
 */
export function formatTanggalIndo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate()} ${NAMA_BULAN_CAPITAL[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Format angka ke Rupiah (e.g. 528.000)
 */
export function formatRupiah(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return Number(num).toLocaleString('id-ID');
}
