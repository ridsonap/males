import React from 'react';
import { FileText, Download, RotateCcw, UploadCloud, ShieldCheck } from 'lucide-react';

export default function Header({ onReset, onExportJson, onImportJson }) {
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJson(file);
      e.target.value = '';
    }
  };

  return (
    <header className="bg-gradient-to-r from-sky-800 via-sky-700 to-cyan-700 text-white shadow-md border-b border-sky-900 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-white/10 backdrop-blur rounded-xl shadow-inner border border-white/20">
            <FileText className="w-7 h-7 text-sky-200" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black tracking-tight text-white font-mono">MALES</h1>
              <span className="bg-amber-400 text-slate-900 text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                v1.0 • BPS 7301
              </span>
            </div>
            <p className="text-xs sm:text-sm text-sky-100 font-medium">
              Manajemen Administrasi Lebih Efektif dan Sederhana
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 rounded-lg text-sky-100 border border-white/10">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>100% Client-Side (Privasi Aman)</span>
          </div>

          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-900/60 hover:bg-sky-900 text-white rounded-lg transition border border-white/10 font-medium">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Buka Proyek</span>
            <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
          </label>

          <button
            onClick={onExportJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-900/60 hover:bg-sky-900 text-white rounded-lg transition border border-white/10 font-medium"
            title="Simpan backup proyek ke file JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Simpan Proyek</span>
          </button>

          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg transition font-medium"
            title="Reset form ke template bawaan VHTS 7301"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
}
