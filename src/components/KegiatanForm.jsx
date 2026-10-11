import React from 'react';
import { Calendar, FileCode, Landmark, Clock } from 'lucide-react';
import { formatBastTanggalLengkap } from '../utils/terbilang';

export default function KegiatanForm({ formData, onChange }) {
  const bastPreview = formatBastTanggalLengkap(formData.bast_tanggal, formData.satker_kota);

  return (
    <div className="space-y-6">
      {/* Detail Survei / Kegiatan */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100 mb-4">
          <Calendar className="w-5 h-5 text-sky-600" />
          <h2 className="text-base font-semibold text-slate-800">
            Detail Kegiatan Survei & Waktu Pelaksanaan
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nama Kegiatan / Survei
            </label>
            <input
              type="text"
              name="nama_kegiatan"
              value={formData.nama_kegiatan}
              onChange={onChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-medium"
              placeholder="Survei Perusahaan/Usaha Penyedia Jasa Akomodasi (VHTS)"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Periode Kegiatan
            </label>
            <input
              type="text"
              name="periode_kegiatan"
              value={formData.periode_kegiatan}
              onChange={onChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Bulan Juli Tahun 2026"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Lokasi Penyelenggaraan
            </label>
            <input
              type="text"
              name="lokasi_kegiatan"
              value={formData.lokasi_kegiatan}
              onChange={onChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Kepulauan Selayar"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Tanggal Mulai Tugas
            </label>
            <input
              type="date"
              name="tgl_mulai"
              value={formData.tgl_mulai}
              onChange={onChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Tanggal Selesai Tugas
            </label>
            <input
              type="date"
              name="tgl_selesai"
              value={formData.tgl_selesai}
              onChange={onChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Dasar SK Penugasan */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100 mb-4">
          <Clock className="w-5 h-5 text-sky-600" />
          <h2 className="text-base font-semibold text-slate-800">
            Dasar SK Honor Mitra (Konsideran Mengingat)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nomor SK
            </label>
            <input
              type="text"
              name="sk_nomor"
              value={formData.sk_nomor}
              onChange={onChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="043 TAHUN 2026"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Tanggal SK
            </label>
            <input
              type="text"
              name="sk_tanggal"
              value={formData.sk_tanggal}
              onChange={onChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="05 Januari 2026"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Perihal SK
            </label>
            <input
              type="text"
              name="sk_perihal"
              value={formData.sk_perihal}
              onChange={onChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Petugas Survei VHTS Tahun 2026"
            />
          </div>
        </div>
      </div>

      {/* Penomoran Surat Tugas & BAST */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100 mb-4">
          <FileCode className="w-5 h-5 text-sky-600" />
          <h2 className="text-base font-semibold text-slate-800">
            Penomoran Surat Tugas & BAST
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Surat Tugas */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-800">
              Surat Tugas (ST)
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nomor Surat Tugas Lengkap
              </label>
              <input
                type="text"
                name="st_nomor"
                value={formData.st_nomor}
                onChange={onChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono"
                placeholder="B-128/7301/VS.330/2026"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Tanggal Terbit Surat Tugas
              </label>
              <input
                type="date"
                name="st_tanggal"
                value={formData.st_tanggal}
                onChange={onChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>

          {/* BAST */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-800">
              Berita Acara Serah Terima (BAST)
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Prefix Nomor BAST
                </label>
                <input
                  type="text"
                  name="bast_prefix"
                  value={formData.bast_prefix}
                  onChange={onChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono"
                  placeholder="67"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Suffix Kode & Tahun
                </label>
                <input
                  type="text"
                  name="bast_suffix"
                  value={formData.bast_suffix}
                  onChange={onChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono"
                  placeholder="7301/VS.330/2026"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Tanggal BAST (Menentukan Terbilang)
              </label>
              <input
                type="date"
                name="bast_tanggal"
                value={formData.bast_tanggal}
                onChange={onChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Live Preview Terbilang BAST */}
        <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs font-semibold text-amber-900 mb-1">
            ⚡ Hasil Rumus Otomatis Terbilang BAST:
          </p>
          <p className="text-xs text-amber-800 italic">
            "{bastPreview}"
          </p>
        </div>
      </div>

      {/* Rincian MAK SPJ (Opsional / Pelengkap) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100 mb-4">
          <Landmark className="w-5 h-5 text-sky-600" />
          <h2 className="text-base font-semibold text-slate-800">
            Akun Anggaran (MAK) Rekapitulasi SPJ Honor
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Program
            </label>
            <input
              type="text"
              name="program"
              value={formData.program}
              onChange={onChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Kegiatan
            </label>
            <input
              type="text"
              name="kegiatan"
              value={formData.kegiatan}
              onChange={onChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Rincian Output
            </label>
            <input
              type="text"
              name="output"
              value={formData.output}
              onChange={onChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Mata Anggaran (MAK)
            </label>
            <input
              type="text"
              name="mak"
              value={formData.mak}
              onChange={onChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
