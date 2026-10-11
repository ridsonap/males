import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SatkerForm from './components/SatkerForm';
import KegiatanForm from './components/KegiatanForm';
import MitraTable from './components/MitraTable';
import DocumentPreview from './components/DocumentPreview';
import { Building2, Calendar, Users, FileCheck } from 'lucide-react';
import { saveAs } from 'file-saver';

// Nilai Default Berdasarkan Dokumen Riil VHTS BPS 7301
const DEFAULT_FORM_DATA = {
  satker_kode: '7301',
  satker_nama: 'BPS Kabupaten Kepulauan Selayar',
  satker_kota: 'Benteng',
  nama_kepala: 'Muhammad Nur',
  nip_kepala: '',
  nama_ppk: 'SRI WAHYUNI, S.Si',
  nip_ppk: '198409292009022004',
  jabatan_ppk: 'Ketua Tim Statistik Distribusi BPS Kabupaten Kepulauan Selayar',
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
};

// Data Mitra Baku VHTS 7301
const DEFAULT_MITRAS = [
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

export default function App() {
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('males_form_data');
    return saved ? JSON.parse(saved) : DEFAULT_FORM_DATA;
  });

  const [mitras, setMitras] = useState(() => {
    const saved = localStorage.getItem('males_mitras');
    return saved ? JSON.parse(saved) : DEFAULT_MITRAS;
  });

  const [activeTab, setActiveTab] = useState('mitra'); // 'satker' | 'kegiatan' | 'mitra' | 'preview'

  // Simpan Otomatis ke LocalStorage
  useEffect(() => {
    localStorage.setItem('males_form_data', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem('males_mitras', JSON.stringify(mitras));
  }, [mitras]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    if (confirm('Kembalikan semua formulir ke template baku VHTS BPS 7301?')) {
      setFormData(DEFAULT_FORM_DATA);
      setMitras(DEFAULT_MITRAS);
      localStorage.removeItem('males_form_data');
      localStorage.removeItem('males_mitras');
    }
  };

  const handleExportJson = () => {
    const projectData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      formData,
      mitras,
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], {
      type: 'application/json',
    });
    saveAs(blob, `MALES_Proyek_${formData.nama_kegiatan.replace(/\s+/g, '_')}.json`);
  };

  const handleImportJson = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (json.formData && json.mitras) {
          setFormData(json.formData);
          setMitras(json.mitras);
          alert('Proyek berhasil dimuat!');
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
    { id: 'mitra', label: 'Daftar Mitra', icon: Users, badge: `${mitras.length} Org` },
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
            <SatkerForm formData={formData} onChange={handleFormChange} />
          )}

          {activeTab === 'kegiatan' && (
            <KegiatanForm formData={formData} onChange={handleFormChange} />
          )}

          {activeTab === 'mitra' && (
            <MitraTable mitras={mitras} setMitras={setMitras} />
          )}

          {activeTab === 'preview' && (
            <DocumentPreview formData={formData} mitras={mitras} />
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 no-print">
        <p>
          <strong>MALES</strong> — Manajemen Administrasi Lebih Efektif dan Sederhana • Dibuat khusus untuk Satker BPS 7301
        </p>
      </footer>
    </div>
  );
}
