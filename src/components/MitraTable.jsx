import React, { useRef } from 'react';
import { Users, Plus, Trash2, Upload, FileSpreadsheet, CheckCheck, RefreshCw } from 'lucide-react';
import { formatRupiah } from '../utils/terbilang';
import { parseExcelMitra, generateTemplateExcel } from '../utils/excelParser';
import { saveAs } from 'file-saver';

export default function MitraTable({ mitras, setMitras }) {
  const fileInputRef = useRef(null);

  const handleAddMitra = () => {
    const newMitra = {
      id: `mitra-${Date.now()}`,
      nama: '',
      nik: '',
      jabatan: 'Petugas Pendataan Lapangan',
      target: 10,
      realisasi: 10,
      honor: 66000,
      npwp: '',
    };
    setMitras([...mitras, newMitra]);
  };

  const handleRemoveMitra = (index) => {
    if (mitras.length === 1) {
      alert('Minimal harus terdapat 1 orang mitra.');
      return;
    }
    const updated = mitras.filter((_, i) => i !== index);
    setMitras(updated);
  };

  const handleChangeMitra = (index, field, value) => {
    const updated = [...mitras];
    updated[index] = { ...updated[index], [field]: value };
    setMitras(updated);
  };

  const handleSyncRealisasiWithTarget = () => {
    const updated = mitras.map((m) => ({ ...m, realisasi: m.target }));
    setMitras(updated);
  };

  const handleApplySameHonor = () => {
    if (mitras.length === 0) return;
    const baseHonor = mitras[0].honor || 66000;
    const updated = mitras.map((m) => ({ ...m, honor: baseHonor }));
    setMitras(updated);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await parseExcelMitra(file);
      if (imported.length > 0) {
        setMitras(imported);
        alert(`Berhasil mengimpor ${imported.length} data mitra dari Excel!`);
      } else {
        alert('File Excel kosong atau format kolom tidak sesuai.');
      }
    } catch (err) {
      alert('Gagal membaca file Excel: ' + err.message);
    }
    e.target.value = '';
  };

  const handleDownloadTemplate = () => {
    const arrayBuffer = generateTemplateExcel();
    const blob = new Blob([arrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, 'Template_Import_Mitra_MALES.xlsx');
  };

  // Kalkulasi Summary
  const totalDokumen = mitras.reduce((acc, m) => acc + (Number(m.realisasi) || 0), 0);
  const totalHonor = mitras.reduce(
    (acc, m) => acc + (Number(m.realisasi) || 0) * (Number(m.honor) || 0),
    0
  );

  return (
    <div className="space-y-4">
      {/* Action Bar & Summary Cards */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-sky-600" />
            <h2 className="text-base font-semibold text-slate-800">
              Daftar Petugas & Beban Kerja Mitra
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAddMitra}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Baris</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <Upload className="w-4 h-4" />
              <span>Import Excel</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-300 transition"
              title="Unduh contoh file format Excel untuk import"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Template Excel</span>
            </button>
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div className="bg-sky-50 p-3 rounded-lg border border-sky-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-sky-700 font-medium">Jumlah Mitra</p>
              <p className="text-lg font-bold text-sky-900">{mitras.length} Petugas</p>
            </div>
            <Users className="w-6 h-6 text-sky-400" />
          </div>

          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-700 font-medium">Total Realisasi Dokumen</p>
              <p className="text-lg font-bold text-emerald-900">{totalDokumen} Sampel</p>
            </div>
            <CheckCheck className="w-6 h-6 text-emerald-400" />
          </div>

          <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-indigo-700 font-medium">Total Bruto Honor</p>
              <p className="text-lg font-bold text-indigo-900">Rp {formatRupiah(totalHonor)}</p>
            </div>
            <RefreshCw className="w-6 h-6 text-indigo-400" />
          </div>
        </div>

        {/* Quick Batch Actions */}
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium self-center">Aksi Cepat:</span>
          <button
            onClick={handleSyncRealisasiWithTarget}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 transition"
          >
            ✓ Samakan Realisasi = Target
          </button>
          <button
            onClick={handleApplySameHonor}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 transition"
          >
            ✓ Seragamkan Tarif Honor Mitra #1
          </button>
        </div>
      </div>

      {/* Tabel Data Mitra */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3 w-10 text-center">No</th>
                <th className="p-3 min-w-[160px]">Nama Lengkap Mitra</th>
                <th className="p-3 min-w-[150px]">NIP / NIK Mitra</th>
                <th className="p-3 min-w-[160px]">Jabatan / Penugasan</th>
                <th className="p-3 w-24 text-center">Target (Dok)</th>
                <th className="p-3 w-24 text-center">Realisasi (Dok)</th>
                <th className="p-3 min-w-[130px]">Honor Satuan (Rp)</th>
                <th className="p-3 min-w-[130px]">Subtotal (Rp)</th>
                <th className="p-3 w-12 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {mitras.map((mitra, index) => {
                const subtotal = (Number(mitra.realisasi) || 0) * (Number(mitra.honor) || 0);

                return (
                  <tr key={mitra.id || index} className="hover:bg-slate-50 transition">
                    <td className="p-2.5 text-center font-bold text-slate-600">
                      {index + 1}
                    </td>

                    <td className="p-2">
                      <input
                        type="text"
                        value={mitra.nama}
                        onChange={(e) => handleChangeMitra(index, 'nama', e.target.value)}
                        placeholder="Nama Mitra"
                        className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-sky-500 font-medium"
                      />
                    </td>

                    <td className="p-2">
                      <input
                        type="text"
                        value={mitra.nik}
                        onChange={(e) => handleChangeMitra(index, 'nik', e.target.value)}
                        placeholder="73010..."
                        className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-sky-500 font-mono"
                      />
                    </td>

                    <td className="p-2">
                      <input
                        type="text"
                        value={mitra.jabatan}
                        onChange={(e) => handleChangeMitra(index, 'jabatan', e.target.value)}
                        placeholder="Petugas Pendataan Lapangan"
                        className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-sky-500"
                      />
                    </td>

                    <td className="p-2 text-center">
                      <input
                        type="number"
                        min="0"
                        value={mitra.target}
                        onChange={(e) => handleChangeMitra(index, 'target', e.target.value)}
                        className="w-20 px-2 py-1.5 border border-slate-200 rounded text-center focus:ring-1 focus:ring-sky-500 font-semibold"
                      />
                    </td>

                    <td className="p-2 text-center">
                      <input
                        type="number"
                        min="0"
                        value={mitra.realisasi}
                        onChange={(e) => handleChangeMitra(index, 'realisasi', e.target.value)}
                        className="w-20 px-2 py-1.5 border border-slate-200 rounded text-center focus:ring-1 focus:ring-sky-500 font-semibold text-emerald-700 bg-emerald-50/40"
                      />
                    </td>

                    <td className="p-2">
                      <input
                        type="number"
                        min="0"
                        value={mitra.honor}
                        onChange={(e) => handleChangeMitra(index, 'honor', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-sky-500 text-right font-mono"
                      />
                    </td>

                    <td className="p-2 text-right font-mono font-semibold text-slate-800">
                      {formatRupiah(subtotal)}
                    </td>

                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleRemoveMitra(index)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition"
                        title="Hapus baris mitra"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
