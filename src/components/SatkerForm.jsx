import React from 'react';
import { Building2, UserCheck, Shield } from 'lucide-react';

export default function SatkerForm({ formData, onChange }) {
  return (
    <div className="space-y-6">
      {/* Profil Satuan Kerja */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100 mb-4">
          <Building2 className="w-5 h-5 text-sky-600" />
          <h2 className="text-base font-semibold text-slate-800">
            Identitas Satuan Kerja (Satker)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Kode Satker
            </label>
            <input
              type="text"
              name="satker_kode"
              value={formData.satker_kode}
              onChange={onChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono"
              placeholder="7301"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nama Satker BPS
            </label>
            <input
              type="text"
              name="satker_nama"
              value={formData.satker_nama}
              onChange={onChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="BPS Kabupaten Kepulauan Selayar"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Ibukota / Tempat TTD
            </label>
            <input
              type="text"
              name="satker_kota"
              value={formData.satker_kota}
              onChange={onChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Benteng"
            />
          </div>
        </div>
      </div>

      {/* Kepala BPS (Penandatangan Surat Tugas) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100 mb-4">
          <Shield className="w-5 h-5 text-sky-600" />
          <h2 className="text-base font-semibold text-slate-800">
            Kepala Satker (Pemberi Surat Tugas)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nama Kepala Satker (dengan Gelar)
            </label>
            <input
              type="text"
              name="nama_kepala"
              value={formData.nama_kepala}
              onChange={onChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Muhammad Nur"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              NIP Kepala Satker (Opsional)
            </label>
            <input
              type="text"
              name="nip_kepala"
              value={formData.nip_kepala}
              onChange={onChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono"
              placeholder="19750101..."
            />
          </div>
        </div>
      </div>

      {/* PIHAK PERTAMA BAST (PPK / Ketua Tim) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100 mb-4">
          <UserCheck className="w-5 h-5 text-sky-600" />
          <h2 className="text-base font-semibold text-slate-800">
            PIHAK PERTAMA BAST (PPK / Ketua Tim Pemeriksa)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nama Pejabat / Ketua Tim
            </label>
            <input
              type="text"
              name="nama_ppk"
              value={formData.nama_ppk}
              onChange={onChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-medium"
              placeholder="SRI WAHYUNI, S.Si"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              NIP
            </label>
            <input
              type="text"
              name="nip_ppk"
              value={formData.nip_ppk}
              onChange={onChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono"
              placeholder="198409292009022004"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Jabatan
            </label>
            <input
              type="text"
              name="jabatan_ppk"
              value={formData.jabatan_ppk}
              onChange={onChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Ketua Tim Statistik Distribusi BPS Kabupaten Kepulauan Selayar"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
