import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SatkerForm from './components/SatkerForm';
import KegiatanForm from './components/KegiatanForm';
import MitraTable from './components/MitraTable';
import DocumentPreview from './components/DocumentPreview';
import UploadSurveiModal from './components/UploadSurveiModal';
import {
  Building2,
  Calendar,
  Users,
  FileCheck,
  Plus,
  Copy,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { saveAs } from 'file-saver';

// Default Profil Satker BPS 7301
const DEFAULT_SATKER_PROFILE = {
  satker_kode: '7301',
  satker_nama: 'BPS Kabupaten Kepulauan Selayar',
  satker_kota: 'Benteng',
  nama_kepala: 'Muhammad Nur',
  nip_kepala: '',
  nama_ppk: 'SRI WAHYUNI, S.Si',
  nip_ppk: '198409292009022004',
  jabatan_ppk: 'Ketua Tim Statistik Distribusi BPS Kabupaten Kepulauan Selayar',
};

// Data Mitra Baku VHTS 7301
const DEFAULT_MITRAS_VHTS = [
  {
    id: 'mitra-1',
    nama: 'Andi Syamsul',
    nik: '7301050712880002',
    jabatan: 'Petugas Pendataan Lapangan',
    target: 43,
    realisasi: 43,
    honor: 66000,
  },
  {
    id: 'mitra-2',
    nama: 'Nur Jannah',
    nik: '7301034811760004',
    jabatan: 'Mitra Pendataan',
    target: 25,
    realisasi: 25,
    honor: 66000,
  },
  {
    id: 'mitra-3',
    nama: 'Rahmawati M. Nur',
    nik: '7301074908030002',
    jabatan: 'Mitra Pendataan',
    target: 30,
    realisasi: 30,
    honor: 66000,
  },
  {
    id: 'mitra-4',
    nama: 'Nurwah Daniah',
    nik: '7301086611960001',
    jabatan: 'Mitra (Pendataan dan Pengolahan)',
    target: 20,
    realisasi: 20,
    honor: 66000,
  },
  {
    id: 'mitra-5',
    nama: 'Sudirman',
    nik: '7301011105810001',
    jabatan: 'Mitra Pendataan',
    target: 15,
    realisasi: 15,
    honor: 66000,
  },
];

// Survei Awal Bawaan
const DEFAULT_INITIAL_SURVEYS = [
  {
    id: 'survey-vhts-2026',
    nama_kegiatan: 'Survei Perusahaan/Usaha Penyedia Jasa Akomodasi (VHTS)',
    periode_kegiatan: 'Bulan Juli Tahun 2026',
    lokasi_kegiatan: 'Kepulauan Selayar',
    tgl_mulai: '2026-07-01',
    tgl_selesai: '2026-07-20',
    sk_nomor: '043 TAHUN 2026',
    sk_tanggal: '05 Januari 2026',
    sk_perihal: 'Petugas Survei VHTS Tahun 2026',
    st_nomor: 'B-128/7301/VS.330/2026',
    st_tanggal: '2026-07-01',
    bast_prefix: '67',
    bast_suffix: '7301/VS.330/2026',
    bast_tanggal: '2026-07-20',
    program: 'Program Penyediaan dan Pelayanan Informasi Statistik',
    kegiatan: 'Penyediaan dan Pengembangan Statistik Distribusi',
    output: 'Publikasi / Laporan Statistik Distribusi',
    komponen: 'Dukungan Penyelenggaraan Tugas Teknis Lainnya',
    mak: 'Belanja Honor Output Kegiatan',
    mitras: DEFAULT_MITRAS_VHTS,
  },
];

export default function App() {
  // 1. Profil Satker
  const [satker, setSatker] = useState(() => {
    const saved = localStorage.getItem('males_satker_profile');
    return saved ? JSON.parse(saved) : DEFAULT_SATKER_PROFILE;
  });

  // 2. Daftar Multi-Survei
  const [surveys, setSurveys] = useState(() => {
    const saved = localStorage.getItem('males_surveys');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse saved surveys:', e);
      }
    }
    return DEFAULT_INITIAL_SURVEYS;
  });

  // 3. ID Survei yang Sedang Aktif
  const [activeSurveyId, setActiveSurveyId] = useState(() => {
    const saved = localStorage.getItem('males_active_survey_id');
    return saved || 'survey-vhts-2026';
  });

  // 4. Tab Navigasi Aktif
  const [activeTab, setActiveTab] = useState('mitra'); // 'mitra' | 'kegiatan' | 'satker' | 'preview'

  // 5. Modal Tambah Survei via Excel
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // Pastikan activeSurvey selalu valid
  const activeSurvey = surveys.find((s) => s.id === activeSurveyId) || surveys[0];

  // Simpan Otomatis ke LocalStorage
  useEffect(() => {
    localStorage.setItem('males_satker_profile', JSON.stringify(satker));
  }, [satker]);

  useEffect(() => {
    localStorage.setItem('males_surveys', JSON.stringify(surveys));
  }, [surveys]);

  useEffect(() => {
    localStorage.setItem('males_active_survey_id', activeSurvey.id);
  }, [activeSurvey.id]);

  // Handle Perubahan Form (Bisa Profil Satker atau Data Survei Aktif)
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    // Cek apakah properti milik Satker
    if (name in satker) {
      setSatker((prev) => ({ ...prev, [name]: value }));
    } else {
      // Properti milik Survei Aktif
      setSurveys((prev) =>
        prev.map((s) => (s.id === activeSurvey.id ? { ...s, [name]: value } : s))
      );
    }
  };

  // Handle Perubahan Daftar Mitra di Survei Aktif
  const handleSetMitras = (updatedMitras) => {
    setSurveys((prev) =>
      prev.map((s) => (s.id === activeSurvey.id ? { ...s, mitras: updatedMitras } : s))
    );
  };

  // Gabungan Satker + Survei Aktif untuk di-pass ke komponen
  const combinedFormData = {
    ...satker,
    ...activeSurvey,
  };

  // Manajemen Survei: Tambah Manual
  const handleAddSurveyManual = () => {
    const namaBaru = prompt('Masukkan Nama Kegiatan / Survei Baru:');
    if (!namaBaru || !namaBaru.trim()) return;

    const newId = `survey-${Date.now()}`;
    const newSurvey = {
      ...activeSurvey,
      id: newId,
      nama_kegiatan: namaBaru.trim(),
      periode_kegiatan: 'Bulan Baru Tahun 2026',
      st_nomor: `B-${Math.floor(100 + Math.random() * 900)}/7301/VS.330/2026`,
      bast_prefix: `${Math.floor(70 + Math.random() * 20)}`,
      mitras: [
        {
          id: `mitra-${Date.now()}-1`,
          nama: 'Nama Petugas 1',
          nik: '',
          jabatan: 'Petugas Pendataan Lapangan',
          target: 20,
          realisasi: 20,
          honor: 66000,
        },
      ],
    };

    setSurveys((prev) => [...prev, newSurvey]);
    setActiveSurveyId(newId);
  };

  // Manajemen Survei: Duplikat Survei Aktif
  const handleDuplicateSurvey = () => {
    const newId = `survey-${Date.now()}`;
    const duplicatedSurvey = {
      ...activeSurvey,
      id: newId,
      nama_kegiatan: `${activeSurvey.nama_kegiatan} (Salinan)`,
      mitras: activeSurvey.mitras.map((m) => ({
        ...m,
        id: `mitra-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      })),
    };

    setSurveys((prev) => [...prev, duplicatedSurvey]);
    setActiveSurveyId(newId);
  };

  // Manajemen Survei: Hapus Survei Aktif
  const handleDeleteSurvey = () => {
    if (surveys.length <= 1) {
      alert('Tidak dapat menghapus survei. Minimal harus ada 1 kegiatan survei.');
      return;
    }
    if (confirm(`Yakin ingin menghapus survei "${activeSurvey.nama_kegiatan}"?`)) {
      const remaining = surveys.filter((s) => s.id !== activeSurvey.id);
      setSurveys(remaining);
      setActiveSurveyId(remaining[0].id);
    }
  };

  // Manajemen Survei: Tambah / Timpa dari Excel Upload
  const handleAddSurveysFromExcel = (newSurveysList, mode) => {
    if (!newSurveysList || newSurveysList.length === 0) return;

    if (mode === 'replace_current') {
      const first = newSurveysList[0];
      const updatedCurrent = {
        ...activeSurvey,
        ...first,
        id: activeSurvey.id, // Pertahankan ID saat ini
      };
      const others = newSurveysList.slice(1);
      setSurveys((prev) =>
        prev.map((s) => (s.id === activeSurvey.id ? updatedCurrent : s)).concat(others)
      );
      alert(`Berhasil memperbarui data survei "${updatedCurrent.nama_kegiatan}"!`);
    } else {
      // Add new
      setSurveys((prev) => [...prev, ...newSurveysList]);
      setActiveSurveyId(newSurveysList[0].id);
      alert(
        `Berhasil menambahkan ${newSurveysList.length} survei baru beserta nama-nama mitranya dari Excel!`
      );
    }
  };

  // Reset Semua Data ke Template Awal
  const handleReset = () => {
    if (confirm('Kembalikan semua formulir ke template baku VHTS BPS 7301?')) {
      setSatker(DEFAULT_SATKER_PROFILE);
      setSurveys(DEFAULT_INITIAL_SURVEYS);
      setActiveSurveyId('survey-vhts-2026');
      localStorage.removeItem('males_satker_profile');
      localStorage.removeItem('males_surveys');
      localStorage.removeItem('males_active_survey_id');
    }
  };

  // Export JSON Backup Proyek
  const handleExportJson = () => {
    const projectData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      satker,
      surveys,
      activeSurveyId,
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], {
      type: 'application/json',
    });
    saveAs(blob, `MALES_Semua_Survei_${new Date().toISOString().slice(0, 10)}.json`);
  };

  // Import JSON Backup Proyek
  const handleImportJson = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (json.surveys && Array.isArray(json.surveys)) {
          setSurveys(json.surveys);
          if (json.satker) setSatker(json.satker);
          if (json.activeSurveyId) setActiveSurveyId(json.activeSurveyId);
          alert(`Berhasil memuat ${json.surveys.length} kegiatan survei dari file backup JSON!`);
        } else if (json.formData && json.mitras) {
          // Kompatibilitas file backup v1.0
          const legacySurvey = {
            ...json.formData,
            id: `legacy-${Date.now()}`,
            mitras: json.mitras,
          };
          setSurveys([legacySurvey]);
          setActiveSurveyId(legacySurvey.id);
          alert('Berhasil memuat proyek MALES versi 1.0!');
        } else {
          alert('Format file JSON tidak sesuai struktur proyek MALES.');
        }
      } catch (err) {
        alert('Gagal memuat file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const tabs = [
    { id: 'mitra', label: 'Daftar Mitra', icon: Users, badge: `${activeSurvey.mitras.length} Org` },
    { id: 'kegiatan', label: 'Kegiatan & No. Surat', icon: Calendar },
    { id: 'satker', label: 'Profil Satker & Pejabat', icon: Building2 },
    { id: 'preview', label: 'Live Preview & Cetak', icon: FileCheck, highlight: true },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 font-sans">
      <Header
        onReset={handleReset}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* SURVEI CONTROL BAR (Pilih Survei & Tambah via Excel) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3.5 no-print flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3 flex-1 min-w-[280px]">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Survei Aktif:
              </span>
            </div>

            <div className="flex-1 max-w-md">
              <select
                value={activeSurvey.id}
                onChange={(e) => setActiveSurveyId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-800 bg-sky-50/60 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                {surveys.map((s, idx) => (
                  <option key={s.id} value={s.id}>
                    {idx + 1}. {s.nama_kegiatan} ({s.mitras.length} Petugas)
                  </option>
                ))}
              </select>
            </div>

            <span className="text-[11px] text-slate-500 hidden md:inline">
              Total {surveys.length} Survei Tersimpan
            </span>
          </div>

          {/* Action Buttons Survei */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsExcelModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
              title="Tambah kegiatan survei baru beserta daftar mitranya dengan mengunggah file Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Tambah Survei via Excel</span>
            </button>

            <button
              onClick={handleAddSurveyManual}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-xs font-semibold transition"
              title="Tambah kegiatan survei kosong baru"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Manual</span>
            </button>

            <button
              onClick={handleDuplicateSurvey}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg transition"
              title="Duplikat survei ini beserta seluruh data mitranya"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleDeleteSurvey}
              disabled={surveys.length <= 1}
              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
              title="Hapus survei ini"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Template Fidelity Banner */}
        <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-emerald-50 border border-sky-100 rounded-xl px-4 py-2 flex flex-wrap items-center justify-between text-xs gap-2 no-print">
          <div className="flex items-center space-x-2 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Template Resmi BPS 7301 Aktif:</strong> Dokumen Word (Surat Tugas & BAST) digenerate presisi 100% menggunakan template baku asli, lengkap dengan Kop Dinas & logo resmi.
            </span>
          </div>
          <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded text-sky-700 font-semibold border border-sky-200">
            ST - VHTS.docx • BAST VHTS.docx
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-1.5 no-print">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[150px] flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                } ${tab.highlight && !isActive ? 'text-indigo-600 font-bold bg-indigo-50/50' : ''}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                      isActive ? 'bg-sky-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="transition-all duration-150">
          {activeTab === 'satker' && (
            <SatkerForm formData={combinedFormData} onChange={handleFormChange} />
          )}

          {activeTab === 'kegiatan' && (
            <KegiatanForm formData={combinedFormData} onChange={handleFormChange} />
          )}

          {activeTab === 'mitra' && (
            <MitraTable
              mitras={activeSurvey.mitras}
              setMitras={handleSetMitras}
              onOpenUploadSurvei={() => setIsExcelModalOpen(true)}
            />
          )}

          {activeTab === 'preview' && (
            <DocumentPreview formData={combinedFormData} mitras={activeSurvey.mitras} />
          )}
        </div>
      </main>

      {/* Modal Upload Excel Tambah Survei & Mitra */}
      <UploadSurveiModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onAddSurveys={handleAddSurveysFromExcel}
        currentSurveyName={activeSurvey.nama_kegiatan}
      />

      <footer className="bg-white border-t border-slate-200 py-3.5 text-center text-xs text-slate-500 no-print mt-auto">
        <p>
          <strong>MALES v2.0</strong> — Manajemen Administrasi Lebih Efektif dan Sederhana • BPS Satker 7301
        </p>
      </footer>
    </div>
  );
}
