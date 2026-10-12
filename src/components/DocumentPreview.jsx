import React, { useState } from 'react';
import {
  Download,
  Printer,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { formatBastTanggalLengkap, formatTanggalIndo, formatRupiah } from '../utils/terbilang';
import { generateSuratTugasDocx, generateBastDocx } from '../utils/docxGenerator';
import { generateSpjExcel } from '../utils/excelParser';
import { saveAs } from 'file-saver';

export default function DocumentPreview({ formData, mitras }) {
  const [activeDoc, setActiveDoc] = useState('st'); // 'st' | 'bast' | 'spj'
  const [rawSelectedMitraIdx, setSelectedMitraIdx] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // Index bisa di luar jangkauan setelah berganti survei dengan jumlah mitra lebih sedikit
  const selectedMitraIdx = rawSelectedMitraIdx < mitras.length ? rawSelectedMitraIdx : 0;
  const activeMitra = mitras[selectedMitraIdx] || {};
  const isKolektif = mitras.length > 1;

  // Handle Unduh Surat Tugas (.docx)
  const handleDownloadST = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateSuratTugasDocx({ ...formData, mitra_list: mitras });
      saveAs(blob, `Surat_Tugas_${formData.nama_kegiatan.replace(/\s+/g, '_')}.docx`);
    } catch (err) {
      alert('Gagal membuat Surat Tugas Word: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Unduh ST Khusus Single Mitra (.docx)
  const handleDownloadSingleST = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateSuratTugasDocx({
        ...formData,
        mitra_list: [activeMitra],
      });
      const namaClean = (activeMitra.nama || 'Mitra').replace(/\s+/g, '_');
      saveAs(blob, `Surat_Tugas_${namaClean}_${formData.nama_kegiatan.replace(/\s+/g, '_')}.docx`);
    } catch (err) {
      alert('Gagal membuat Surat Tugas Word: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Unduh All BAST (.docx)
  const handleDownloadAllBast = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateBastDocx({ ...formData, mitra_list: mitras });
      saveAs(blob, `ALL_BAST_${formData.nama_kegiatan.replace(/\s+/g, '_')}.docx`);
    } catch (err) {
      alert('Gagal membuat file BAST Word: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Unduh Single BAST (.docx)
  const handleDownloadSingleBast = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateBastDocx({ ...formData, mitra_list: mitras }, selectedMitraIdx);
      const namaClean = (activeMitra.nama || 'Mitra').replace(/\s+/g, '_');
      saveAs(blob, `BAST_${namaClean}_${formData.nama_kegiatan.replace(/\s+/g, '_')}.docx`);
    } catch (err) {
      alert('Gagal membuat file BAST Word: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Unduh SPJ Excel (.xlsx)
  const handleDownloadSpj = () => {
    try {
      const arrayBuffer = generateSpjExcel({ ...formData, mitra_list: mitras });
      const blob = new Blob([arrayBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, `SPJ_Honor_${formData.nama_kegiatan.replace(/\s+/g, '_')}.xlsx`);
    } catch (err) {
      alert('Gagal membuat file SPJ Excel: ' + err.message);
    }
  };

  // Cetak Dokumen Browser
  const handlePrint = () => {
    window.print();
  };

  const nomorBastAktif = `${formData.bast_prefix}.${selectedMitraIdx + 1}/${formData.bast_suffix}`;
  const bastTerbilangAktif = formatBastTanggalLengkap(formData.bast_tanggal, formData.satker_kota);

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 no-print space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Sub-Tabs Nav */}
          <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setActiveDoc('st')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
                activeDoc === 'st'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Surat Tugas</span>
            </button>

            <button
              onClick={() => setActiveDoc('bast')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
                activeDoc === 'bast'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>BAST ({mitras.length} Mitra)</span>
            </button>

            <button
              onClick={() => setActiveDoc('spj')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
                activeDoc === 'spj'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Rekap SPJ Honor</span>
            </button>
          </div>

          {/* Download Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadST}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
              title="Unduh Surat Tugas dalam format Word (.docx) berbasis template asli BPS 7301"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh ST (.docx)</span>
            </button>

            <button
              onClick={handleDownloadAllBast}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
              title="Unduh seluruh BAST mitra dalam 1 file Word (.docx) berbasis template asli BPS 7301"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh All BAST (.docx)</span>
            </button>

            <button
              onClick={handleDownloadSpj}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
              title="Unduh Rincian SPJ Honor dalam format Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh SPJ (.xlsx)</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-sm transition"
              title="Cetak langsung dokumen ke printer atau simpan PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
          </div>
        </div>

        {/* Mitra Selector jika sedang melihat BAST atau ST Kolektif */}
        <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">Pilih Mitra:</span>
            <select
              value={selectedMitraIdx}
              onChange={(e) => setSelectedMitraIdx(Number(e.target.value))}
              className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded font-medium text-slate-800 focus:ring-1 focus:ring-sky-500"
            >
              {mitras.map((m, idx) => (
                <option key={idx} value={idx}>
                  #{idx + 1} - {m.nama || 'Mitra ' + (idx + 1)} ({m.realisasi} Sampel)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-3">
            {activeDoc === 'st' && isKolektif && (
              <button
                onClick={handleDownloadSingleST}
                disabled={isGenerating}
                className="text-xs text-sky-700 hover:text-sky-900 font-semibold underline"
              >
                Unduh Khusus ST #{selectedMitraIdx + 1} ({activeMitra.nama}) (.docx)
              </button>
            )}

            {activeDoc === 'bast' && (
              <button
                onClick={handleDownloadSingleBast}
                disabled={isGenerating}
                className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold underline"
              >
                Unduh Khusus BAST #{selectedMitraIdx + 1} ({activeMitra.nama}) (.docx)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PAPER CANVAS SIMULATION */}
      <div className="flex justify-center p-2 sm:p-6 bg-slate-200/60 rounded-2xl overflow-x-auto">
        <div className="bg-white text-slate-900 shadow-xl border border-slate-300 w-full max-w-[800px] min-h-[1050px] p-8 sm:p-14 font-sans text-sm leading-relaxed transition">
          {/* 1. PREVIEW SURAT TUGAS */}
          {activeDoc === 'st' && (
            <div className="space-y-4">
              <div className="text-center space-y-1 pb-2">
                <div className="w-11 h-11 bg-sky-700 text-white rounded-lg mx-auto flex items-center justify-center font-bold text-xs tracking-tight mb-2 shadow-sm">
                  BPS
                </div>
                <h2 className="text-base font-bold font-serif tracking-wider">BADAN PUSAT STATISTIK</h2>
                <h3 className="text-base font-bold font-serif tracking-wide">SURAT TUGAS</h3>
                <p className="text-xs text-slate-700">Nomor : {formData.st_nomor}</p>
              </div>

              <div className="pt-4 space-y-3 text-xs leading-normal">
                <div className="grid grid-cols-12 gap-1">
                  <div className="col-span-3 font-semibold">Menimbang</div>
                  <div className="col-span-1 text-center">:</div>
                  <div className="col-span-8 space-y-1 text-justify">
                    <p>
                      a. bahwa dengan adanya kegiatan Pendataan {formData.nama_kegiatan} {formData.periode_kegiatan} di Lingkungan {formData.satker_nama}, maka diperlukan keikutsertaan pegawai/mitra Badan Pusat Statistik (BPS);
                    </p>
                    <p>
                      b. bahwa berdasarkan pertimbangan sebagaimana dimaksud pada huruf a, perlu menugaskan mitra BPS sebagai {activeMitra.jabatan || 'Petugas Pendataan Lapangan'};
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-1">
                  <div className="col-span-3 font-semibold">Mengingat</div>
                  <div className="col-span-1 text-center">:</div>
                  <div className="col-span-8 text-justify">
                    Surat Kepala Badan Pusat Statistik {formData.satker_nama} Nomor {formData.sk_nomor} tanggal {formData.sk_tanggal} perihal {formData.sk_perihal}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-1 pt-1">
                  <div className="col-span-3 font-bold">Memberi Tugas</div>
                  <div className="col-span-1 text-center font-bold">:</div>
                  <div className="col-span-8 font-bold">
                    {isKolektif ? 'Terlampir' : (activeMitra.nama || 'Nama Mitra')}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-1">
                  <div className="col-span-3 font-semibold">Untuk</div>
                  <div className="col-span-1 text-center">:</div>
                  <div className="col-span-8 text-justify">
                    Pendataan {formData.nama_kegiatan} {formData.periode_kegiatan} di Lingkungan {formData.satker_nama} pada tanggal {formatTanggalIndo(formData.tgl_mulai)} s.d {formatTanggalIndo(formData.tgl_selesai)}. yang diselenggarakan di {formData.lokasi_kegiatan}
                  </div>
                </div>
              </div>

              {/* Tanda Tangan Kepala BPS */}
              <div className="pt-10 flex justify-end">
                <div className="w-64 text-xs space-y-1">
                  <p>{formData.satker_kota}, {formatTanggalIndo(formData.st_tanggal)}</p>
                  <p>Kepala Badan Pusat Statistik</p>
                  <p className="pb-16">{formData.satker_nama.replace('BPS ', '')}</p>
                  <p className="font-bold underline">{formData.nama_kepala}</p>
                  {formData.nip_kepala && <p>NIP. {formData.nip_kepala}</p>}
                </div>
              </div>

              {/* LAMPIRAN ANGGOTA JIKA KOLEKTIF */}
              {isKolektif && (
                <div className="pt-12 mt-12 border-t-2 border-dashed border-slate-300 page-break">
                  <h4 className="text-center font-bold text-xs uppercase mb-4">
                    LAMPIRAN ANGGOTA (1/1)
                  </h4>
                  <table className="w-full text-xs border border-slate-400 border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-400">
                        <th className="border border-slate-400 p-2 w-10 text-center">No</th>
                        <th className="border border-slate-400 p-2 text-left">NIP / NIK Mitra</th>
                        <th className="border border-slate-400 p-2 text-left">Nama</th>
                        <th className="border border-slate-400 p-2 text-left">Jabatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mitras.map((m, idx) => (
                        <tr key={idx} className="border-b border-slate-400">
                          <td className="border border-slate-400 p-2 text-center">{idx + 1}</td>
                          <td className="border border-slate-400 p-2 font-mono">{m.nik || '-'}</td>
                          <td className="border border-slate-400 p-2 font-medium">{m.nama || '-'}</td>
                          <td className="border border-slate-400 p-2">{m.jabatan || 'Mitra Pendataan'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 2. PREVIEW BAST */}
          {activeDoc === 'bast' && (
            <div className="space-y-4">
              {/* Kop Dinas BPS dengan Alamat Resmi */}
              <div className="border-b-2 border-slate-900 pb-3 mb-4 flex items-center justify-between gap-4">
                <div className="w-12 h-12 bg-sky-700 text-white rounded-lg flex items-center justify-center font-bold text-xs tracking-tight shadow-sm flex-shrink-0">
                  BPS
                </div>
                <div className="flex-1 text-center font-serif">
                  <h2 className="text-sm font-bold tracking-wider uppercase">BADAN PUSAT STATISTIK</h2>
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    {formData.satker_nama.replace(/^BPS\s+/i, '')}
                  </h3>
                  <p className="text-[10px] text-slate-600">
                    Jl. RE Martadinata No. 05, Kode Pos 92812 Telp. (0414)21037
                  </p>
                  <p className="text-[10px] text-slate-600">
                    Homepage: http://selayarkab.bps.go.id • E-mail: bps7301@bps.go.id
                  </p>
                </div>
              </div>

              <div className="text-center space-y-0.5">
                <h2 className="text-sm sm:text-base font-bold tracking-wide uppercase">
                  BERITA ACARA SERAH TERIMA PEKERJAAN
                </h2>
                <h3 className="text-sm font-bold tracking-wide uppercase">
                  {formData.nama_kegiatan}
                </h3>
                <h3 className="text-sm font-bold tracking-wide uppercase">
                  {formData.periode_kegiatan}
                </h3>
                <p className="text-xs font-bold pt-1">
                  NOMOR: {nomorBastAktif}
                </p>
              </div>

              <div className="pt-3 text-xs leading-relaxed text-justify">
                <p>{bastTerbilangAktif}</p>
              </div>

              {/* Tabel Para Pihak */}
              <div className="pt-2 text-xs space-y-3">
                <div className="flex gap-2">
                  <span className="font-semibold w-4">1.</span>
                  <div className="w-16">
                    <p>Nama</p>
                    <p>NIP</p>
                    <p>Jabatan</p>
                  </div>
                  <div className="w-3 text-center">
                    <p>:</p>
                    <p>:</p>
                    <p>:</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{formData.nama_ppk}</p>
                    <p>{formData.nip_ppk || '-'}</p>
                    <p>{formData.jabatan_ppk}</p>
                    <p className="text-justify pt-1">
                      bertindak untuk dan atas nama {formData.satker_nama}, selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong>.dan
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="font-semibold w-4">2.</span>
                  <div className="w-16">
                    <p>Nama</p>
                    <p>Jabatan</p>
                  </div>
                  <div className="w-3 text-center">
                    <p>:</p>
                    <p>:</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold uppercase">{activeMitra.nama || 'NAMA MITRA'}</p>
                    <p>{activeMitra.jabatan || 'Petugas Pendataan Lapangan'}</p>
                    <p className="text-justify pt-1">
                      bertindak untuk dan atas namanya sendiri, selanjutnya disebut sebagai <strong>PIHAK KEDUA</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Klausul Pernyataan */}
              <div className="pt-3 text-xs space-y-2 leading-relaxed text-justify">
                <p>
                  Dengan ini menyatakan bahwa PIHAK KEDUA telah menyelesaikan dan menyerahkan dengan baik hasil pekerjaan Pendataan {formData.nama_kegiatan} {formData.periode_kegiatan} kepada PIHAK PERTAMA dengan rincian:
                </p>
                <div className="pl-4 font-bold space-y-0.5">
                  <p>TARGET DOKUMEN: {activeMitra.target || 0} SAMPEL</p>
                  <p>REALISASI DOKUMEN: {activeMitra.realisasi || 0} SAMPEL</p>
                </div>
                <p className="pt-2">
                  Demikian Berita Acara Serah Terima Hasil Pekerjaan ini dibuat untuk dapat dipergunakan sebagaimana semestinya.
                </p>
              </div>

              {/* Tanda Tangan Sejajar */}
              <div className="pt-10 grid grid-cols-2 text-xs text-center">
                <div className="space-y-1">
                  <p className="font-bold">PIHAK KEDUA,</p>
                  <div className="h-20" />
                  <p className="font-bold underline">{activeMitra.nama || 'Mitra Statistik'}</p>
                </div>

                <div className="space-y-1">
                  <p className="font-bold">PIHAK PERTAMA,</p>
                  <div className="h-20" />
                  <p className="font-bold underline">{formData.nama_ppk}</p>
                  {formData.nip_ppk && <p>NIP. {formData.nip_ppk}</p>}
                </div>
              </div>
            </div>
          )}

          {/* 3. PREVIEW SPJ */}
          {activeDoc === 'spj' && (
            <div className="space-y-4">
              <div className="border-b pb-3 space-y-1 text-xs">
                <h2 className="text-sm font-bold uppercase">
                  Daftar Rincian Honor Petugas {formData.nama_kegiatan}
                </h2>
                <div className="grid grid-cols-12 gap-1 text-slate-700 pt-2">
                  <div className="col-span-3 font-semibold">Program</div>
                  <div className="col-span-9">: {formData.program}</div>
                  <div className="col-span-3 font-semibold">Kegiatan</div>
                  <div className="col-span-9">: {formData.kegiatan}</div>
                  <div className="col-span-3 font-semibold">Rincian Output</div>
                  <div className="col-span-9">: {formData.output}</div>
                  <div className="col-span-3 font-semibold">Komponen</div>
                  <div className="col-span-9">: {formData.komponen}</div>
                  <div className="col-span-3 font-semibold">Mata Anggaran</div>
                  <div className="col-span-9">: {formData.mak}</div>
                  <div className="col-span-3 font-semibold">No. SK</div>
                  <div className="col-span-9">: {formData.sk_nomor} Tanggal {formData.sk_tanggal}</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border border-slate-300 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-300">
                      <th className="border border-slate-300 p-1.5 text-center">No</th>
                      <th className="border border-slate-300 p-1.5 text-left">Nama</th>
                      <th className="border border-slate-300 p-1.5 text-left">Tugas</th>
                      <th className="border border-slate-300 p-1.5 text-center">Vol (Dok)</th>
                      <th className="border border-slate-300 p-1.5 text-right">Harga Satuan</th>
                      <th className="border border-slate-300 p-1.5 text-right">Biaya (Rp)</th>
                      <th className="border border-slate-300 p-1.5 text-right">PPh 21</th>
                      <th className="border border-slate-300 p-1.5 text-right">Diterima (Rp)</th>
                      <th className="border border-slate-300 p-1.5 text-center">TTD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mitras.map((m, idx) => {
                      const vol = Number(m.realisasi) || 0;
                      const harga = Number(m.honor || 0);
                      const bruto = vol * harga;
                      const pph = 0;
                      const netto = bruto - pph;

                      return (
                        <tr key={idx} className="border-b border-slate-200">
                          <td className="border border-slate-300 p-1.5 text-center">{idx + 1}</td>
                          <td className="border border-slate-300 p-1.5 font-medium">{m.nama}</td>
                          <td className="border border-slate-300 p-1.5">{m.jabatan || 'PCL'}</td>
                          <td className="border border-slate-300 p-1.5 text-center">{vol}</td>
                          <td className="border border-slate-300 p-1.5 text-right font-mono">{formatRupiah(harga)}</td>
                          <td className="border border-slate-300 p-1.5 text-right font-mono">{formatRupiah(bruto)}</td>
                          <td className="border border-slate-300 p-1.5 text-right font-mono">{formatRupiah(pph)}</td>
                          <td className="border border-slate-300 p-1.5 text-right font-mono font-bold text-slate-900">{formatRupiah(netto)}</td>
                          <td className="border border-slate-300 p-1.5 text-center text-slate-400 text-[10px]">{idx + 1}. .........</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
