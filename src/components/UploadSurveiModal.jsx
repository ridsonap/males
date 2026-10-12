import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { parseExcelSurveiDanMitra, generateTemplateSurveiExcel } from '../utils/excelParser';
import { saveAs } from 'file-saver';

export default function UploadSurveiModal({ isOpen, onClose, onAddSurveys, currentSurveyName }) {
  const [dragOver, setDragOver] = useState(false);
  const [parsedSurveys, setParsedSurveys] = useState([]);
  const [expandedSurveyIdx, setExpandedSurveyIdx] = useState(0);
  const [mode, setMode] = useState('add_new'); // 'add_new' | 'replace_current'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Komponen tetap ter-mount saat modal ditutup, jadi reset state agar
  // hasil parsing lama tidak tersimpan ulang (duplikat ID survei)
  const handleClose = () => {
    setParsedSurveys([]);
    setErrorMsg('');
    setExpandedSurveyIdx(0);
    setMode('add_new');
    onClose();
  };

  const handleDownloadTemplate = () => {
    const arrayBuffer = generateTemplateSurveiExcel();
    const blob = new Blob([arrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, 'Template_Survei_Dan_Mitra_MALES.xlsx');
  };

  const processFile = async (file) => {
    if (!file) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const surveys = await parseExcelSurveiDanMitra(file);
      if (surveys.length === 0) {
        setErrorMsg('Tidak ditemukan data survei atau nama mitra yang valid dalam file Excel.');
        setParsedSurveys([]);
      } else {
        setParsedSurveys(surveys);
      }
    } catch (err) {
      setErrorMsg('Gagal memproses file Excel: ' + err.message);
      setParsedSurveys([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleSurveyFieldChange = (idx, field, val) => {
    const updated = [...parsedSurveys];
    updated[idx] = { ...updated[idx], [field]: val };
    setParsedSurveys(updated);
  };

  const handleConfirm = () => {
    if (parsedSurveys.length === 0) return;
    onAddSurveys(parsedSurveys, mode);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/10 rounded-lg">
              <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-base font-bold">Tambah Survei & Mitra via File Excel</h3>
              <p className="text-xs text-emerald-100">
                Impor kegiatan survei baru beserta daftar seluruh petugas mitranya
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-white/20 text-emerald-100 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Petunjuk & Download Template */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-emerald-900 space-y-1 max-w-md">
              <p className="font-bold">Format Excel yang Didukung Otomatis:</p>
              <p className="text-emerald-800">
                • <strong>Format Blok:</strong> Ada judul survei & periode di atas, tabel mitra di bawah.
              </p>
              <p className="text-emerald-800">
                • <strong>Format Tabel:</strong> Ada kolom <em>Nama Survei</em> dan <em>Nama Mitra</em> (bisa multi-survei sekaligus!).
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Template Excel</span>
            </button>
          </div>

          {/* Upload Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
              dragOver
                ? 'border-emerald-500 bg-emerald-50/50'
                : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50'
            }`}
          >
            <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">
              {loading
                ? 'Sedang membaca file Excel...'
                : 'Klik untuk memilih file Excel atau seret (drag & drop) ke sini'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Format: .xlsx, .xls, .csv</p>
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Hasil Parsing Preview */}
          {parsedSurveys.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Ditemukan {parsedSurveys.length} Survei Siap Ditambahkan:
                  </span>
                </div>
                <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                  Total {parsedSurveys.reduce((acc, s) => acc + s.mitras.length, 0)} Petugas
                </span>
              </div>

              {/* Daftar Survei Terdeteksi */}
              <div className="space-y-3">
                {parsedSurveys.map((survey, sIdx) => {
                  const isExpanded = expandedSurveyIdx === sIdx;
                  return (
                    <div
                      key={sIdx}
                      className="border border-slate-200 rounded-xl p-3.5 bg-white shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-500">
                              Nama Survei / Kegiatan:
                            </label>
                            <input
                              type="text"
                              value={survey.nama_kegiatan}
                              onChange={(e) =>
                                handleSurveyFieldChange(sIdx, 'nama_kegiatan', e.target.value)
                              }
                              className="w-full text-xs font-bold px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-500">
                                Periode:
                              </label>
                              <input
                                type="text"
                                value={survey.periode_kegiatan}
                                onChange={(e) =>
                                  handleSurveyFieldChange(sIdx, 'periode_kegiatan', e.target.value)
                                }
                                className="w-full text-xs px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-500">
                                Jumlah Petugas Mitra:
                              </label>
                              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 py-1">
                                <Users className="w-4 h-4 text-emerald-600" />
                                <span>{survey.mitras.length} Petugas</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setExpandedSurveyIdx(isExpanded ? -1 : sIdx)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                          title="Lihat rincian nama mitra"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Expandable Daftar Nama Mitra */}
                      {isExpanded && (
                        <div className="pt-2 border-t border-slate-100">
                          <p className="text-[11px] font-semibold text-slate-600 mb-1.5">
                            Daftar Petugas Terbaca ({survey.mitras.length} Petugas):
                          </p>
                          <div className="max-h-36 overflow-y-auto bg-slate-50 rounded-lg p-2 border border-slate-200 divide-y divide-slate-100 text-[11px]">
                            {survey.mitras.map((m, mIdx) => (
                              <div key={mIdx} className="py-1 flex items-center justify-between gap-2">
                                <span className="font-medium text-slate-800">
                                  {mIdx + 1}. {m.nama}
                                </span>
                                <span className="text-slate-500 text-[10px]">
                                  {m.jabatan} • {m.target} Dok • Rp {m.honor.toLocaleString('id-ID')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Mode Pilihan Simpan */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                <p className="font-semibold text-slate-700">Pilih Cara Menyimpan:</p>
                <div className="space-y-1.5">
                  <label className="flex items-center space-x-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="radio"
                      name="importMode"
                      value="add_new"
                      checked={mode === 'add_new'}
                      onChange={() => setMode('add_new')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>
                      Tambahkan sebagai survei baru ke daftar survei (Dapat berganti survei di menu atas)
                    </span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace_current"
                      checked={mode === 'replace_current'}
                      onChange={() => setMode('replace_current')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>
                      Ganti / Timpa data pada survei yang sedang aktif ("{currentSurveyName}")
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={parsedSurveys.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Simpan & Tambahkan Survei</span>
          </button>
        </div>
      </div>
    </div>
  );
}
