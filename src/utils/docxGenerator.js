import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  PageBreak,
} from 'docx';
import { formatBastTanggalLengkap, formatTanggalIndo } from './terbilang';

// Helper Border None
const NO_BORDER = {
  top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
};

// Helper Border Single
const THIN_BORDER = {
  top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
};

/**
 * Generate File Word (.docx) Surat Tugas
 */
export async function generateSuratTugasDocx(data) {
  const {
    satker_nama = 'BPS Kabupaten Kepulauan Selayar',
    satker_kota = 'Benteng',
    nama_kepala = 'Muhammad Nur',
    nip_kepala = '',
    st_nomor = 'B-128/7301/VS.330/2026',
    st_tanggal = '2026-07-01',
    nama_kegiatan = 'Survei VHTS',
    periode_kegiatan = 'Bulan Juli Tahun 2026',
    tgl_mulai = '2026-07-01',
    tgl_selesai = '2026-07-20',
    lokasi_kegiatan = 'Kepulauan Selayar',
    sk_nomor = '043 TAHUN 2026',
    sk_tanggal = '05 Januari 2026',
    sk_perihal = 'Petugas Survei VHTS Tahun 2026',
    mitra_list = [],
  } = data;

  const isKolektif = mitra_list.length > 1;
  const penerimaTugas = isKolektif ? 'Terlampir' : (mitra_list[0]?.nama || 'Nama Mitra');
  const peranUtama = mitra_list[0]?.jabatan || 'Petugas Pendataan Lapangan';

  const children = [
    // Header Kop
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'BADAN PUSAT STATISTIK', bold: true, size: 24, font: 'Arial' }),
      ],
      spacing: { after: 120 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'SURAT TUGAS', bold: true, size: 24, font: 'Arial' }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: `Nomor : ${st_nomor}`, size: 22, font: 'Arial' }),
      ],
      spacing: { after: 240 },
    }),

    // Tabel Konten Surat Tugas
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        // Menimbang
        new TableRow({
          children: [
            new TableCell({
              width: { size: 22, type: WidthType.PERCENTAGE },
              borders: NO_BORDER,
              children: [new Paragraph({ children: [new TextRun({ text: 'Menimbang', font: 'Arial', size: 22 })] })],
            }),
            new TableCell({
              width: { size: 3, type: WidthType.PERCENTAGE },
              borders: NO_BORDER,
              children: [new Paragraph({ children: [new TextRun({ text: ':', font: 'Arial', size: 22 })] })],
            }),
            new TableCell({
              width: { size: 75, type: WidthType.PERCENTAGE },
              borders: NO_BORDER,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `a. bahwa dengan adanya kegiatan Pendataan ${nama_kegiatan} ${periode_kegiatan} di Lingkungan ${satker_nama}, maka diperlukan keikutsertaan pegawai/mitra Badan Pusat Statistik (BPS);`,
                      font: 'Arial',
                      size: 22,
                    }),
                  ],
                  spacing: { after: 60 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `b. bahwa berdasarkan pertimbangan sebagaimana dimaksud pada huruf a, perlu menugaskan mitra BPS sebagai ${peranUtama};`,
                      font: 'Arial',
                      size: 22,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),

        // Mengingat
        new TableRow({
          children: [
            new TableCell({
              width: { size: 22, type: WidthType.PERCENTAGE },
              borders: NO_BORDER,
              children: [new Paragraph({ children: [new TextRun({ text: 'Mengingat', font: 'Arial', size: 22 })] })],
            }),
            new TableCell({
              width: { size: 3, type: WidthType.PERCENTAGE },
              borders: NO_BORDER,
              children: [new Paragraph({ children: [new TextRun({ text: ':', font: 'Arial', size: 22 })] })],
            }),
            new TableCell({
              width: { size: 75, type: WidthType.PERCENTAGE },
              borders: NO_BORDER,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Surat Kepala Badan Pusat Statistik ${satker_nama} Nomor ${sk_nomor} tanggal ${sk_tanggal} perihal ${sk_perihal}`,
                      font: 'Arial',
                      size: 22,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),

        // Memberi Tugas
        new TableRow({
          children: [
            new TableCell({
              width: { size: 22, type: WidthType.PERCENTAGE },
              borders: NO_BORDER,
              children: [new Paragraph({ children: [new TextRun({ text: 'Memberi Tugas', font: 'Arial', size: 22 })] })],
            }),
            new TableCell({
              width: { size: 3, type: WidthType.PERCENTAGE },
              borders: NO_BORDER,
              children: [new Paragraph({ children: [new TextRun({ text: ':', font: 'Arial', size: 22 })] })],
            }),
            new TableCell({
              width: { size: 75, type: WidthType.PERCENTAGE },
              borders: NO_BORDER,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: penerimaTugas, bold: true, font: 'Arial', size: 22 }),
                  ],
                }),
              ],
            }),
          ],
        }),

        // Untuk
        new TableRow({
          children: [
            new TableCell({
              width: { size: 22, type: WidthType.PERCENTAGE },
              borders: NO_BORDER,
              children: [new Paragraph({ children: [new TextRun({ text: 'Untuk', font: 'Arial', size: 22 })] })],
            }),
            new TableCell({
              width: { size: 3, type: WidthType.PERCENTAGE },
              borders: NO_BORDER,
              children: [new Paragraph({ children: [new TextRun({ text: ':', font: 'Arial', size: 22 })] })],
            }),
            new TableCell({
              width: { size: 75, type: WidthType.PERCENTAGE },
              borders: NO_BORDER,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Pendataan ${nama_kegiatan} ${periode_kegiatan} di Lingkungan ${satker_nama} pada tanggal ${formatTanggalIndo(tgl_mulai)} s.d ${formatTanggalIndo(tgl_selesai)}. yang diselenggarakan di ${lokasi_kegiatan}`,
                      font: 'Arial',
                      size: 22,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),

    new Paragraph({ spacing: { after: 360 } }),

    // Kolom Tanda Tangan Kepala BPS
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 55, type: WidthType.PERCENTAGE },
              borders: NO_BORDER,
              children: [new Paragraph({})],
            }),
            new TableCell({
              width: { size: 45, type: WidthType.PERCENTAGE },
              borders: NO_BORDER,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: `${satker_kota}, ${formatTanggalIndo(st_tanggal)}`, font: 'Arial', size: 22 }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Kepala Badan Pusat Statistik', font: 'Arial', size: 22 }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: satker_nama.replace('BPS ', ''), font: 'Arial', size: 22 }),
                  ],
                  spacing: { after: 700 }, // Ruang tanda tangan
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: nama_kepala, bold: true, underline: {}, font: 'Arial', size: 22 }),
                  ],
                }),
                ...(nip_kepala
                  ? [
                      new Paragraph({
                        children: [new TextRun({ text: `NIP. ${nip_kepala}`, font: 'Arial', size: 22 })],
                      }),
                    ]
                  : []),
              ],
            }),
          ],
        }),
      ],
    }),
  ];

  // Tambahkan Lampiran Anggota jika Kolektif
  if (isKolektif) {
    children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: 'LAMPIRAN ANGGOTA (1/1)', bold: true, font: 'Arial', size: 22 }),
        ],
        spacing: { after: 180 },
      })
    );

    const tableRows = [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 8, type: WidthType.PERCENTAGE },
            borders: THIN_BORDER,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'No', bold: true, font: 'Arial', size: 20 })] })],
          }),
          new TableCell({
            width: { size: 28, type: WidthType.PERCENTAGE },
            borders: THIN_BORDER,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'NIP / NIK Mitra', bold: true, font: 'Arial', size: 20 })] })],
          }),
          new TableCell({
            width: { size: 36, type: WidthType.PERCENTAGE },
            borders: THIN_BORDER,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Nama', bold: true, font: 'Arial', size: 20 })] })],
          }),
          new TableCell({
            width: { size: 28, type: WidthType.PERCENTAGE },
            borders: THIN_BORDER,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Jabatan', bold: true, font: 'Arial', size: 20 })] })],
          }),
        ],
      }),
    ];

    mitra_list.forEach((mitra, index) => {
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              borders: THIN_BORDER,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(index + 1), font: 'Arial', size: 20 })] })],
            }),
            new TableCell({
              borders: THIN_BORDER,
              children: [new Paragraph({ children: [new TextRun({ text: mitra.nik || '-', font: 'Arial', size: 20 })] })],
            }),
            new TableCell({
              borders: THIN_BORDER,
              children: [new Paragraph({ children: [new TextRun({ text: mitra.nama || '-', font: 'Arial', size: 20 })] })],
            }),
            new TableCell({
              borders: THIN_BORDER,
              children: [new Paragraph({ children: [new TextRun({ text: mitra.jabatan || 'Mitra Pendataan', font: 'Arial', size: 20 })] })],
            }),
          ],
        })
      );
    });

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: tableRows,
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1200, bottom: 1200, left: 1400, right: 1400 },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * Generate File Word (.docx) BAST (Bisa Single Mitra atau Batch Seluruh Mitra digabung dengan Page Break)
 */
export async function generateBastDocx(data, singleMitraIndex = null) {
  const {
    satker_nama = 'BPS Kabupaten Kepulauan Selayar',
    satker_kota = 'Benteng',
    nama_ppk = 'SRI WAHYUNI, S.Si',
    nip_ppk = '198409292009022004',
    jabatan_ppk = 'Ketua Tim Statistik Distribusi BPS Kabupaten Kepulauan Selayar',
    nama_kegiatan = 'SURVEI PERUSAHAAN/USAHA PENYEDIA JASA AKOMODASI (VHTS)',
    periode_kegiatan = 'BULAN JULI TAHUN 2026',
    bast_prefix = '67',
    bast_suffix = '7301/VS.330/2026',
    bast_tanggal = '2026-07-20',
    mitra_list = [],
  } = data;

  const targetMitras = singleMitraIndex !== null && mitra_list[singleMitraIndex]
    ? [mitra_list[singleMitraIndex]]
    : mitra_list;

  const children = [];

  targetMitras.forEach((mitra, idx) => {
    // Nomor BAST: jika ada index perorangan gunakan bast_prefix.[nomor]
    const nomorUrut = singleMitraIndex !== null ? singleMitraIndex + 1 : idx + 1;
    const nomorBast = `${bast_prefix}.${nomorUrut}/${bast_suffix}`;

    // Header BAST
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: 'BERITA ACARA SERAH TERIMA PEKERJAAN', bold: true, size: 24, font: 'Arial' }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: nama_kegiatan.toUpperCase(), bold: true, size: 24, font: 'Arial' }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: periode_kegiatan.toUpperCase(), bold: true, size: 24, font: 'Arial' }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: `NOMOR: ${nomorBast}`, bold: true, size: 22, font: 'Arial' }),
        ],
        spacing: { after: 180 },
      }),
      // Paragraf Pembuka Tanggal Terbilang
      new Paragraph({
        children: [
          new TextRun({
            text: formatBastTanggalLengkap(bast_tanggal, satker_kota),
            font: 'Arial',
            size: 22,
          }),
        ],
        spacing: { after: 120 },
      })
    );

    // Tabel Para Pihak
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          // Pihak Pertama
          new TableRow({
            children: [
              new TableCell({
                width: { size: 5, type: WidthType.PERCENTAGE },
                borders: NO_BORDER,
                children: [new Paragraph({ children: [new TextRun({ text: '1.', font: 'Arial', size: 22 })] })],
              }),
              new TableCell({
                width: { size: 16, type: WidthType.PERCENTAGE },
                borders: NO_BORDER,
                children: [
                  new Paragraph({ children: [new TextRun({ text: 'Nama', font: 'Arial', size: 22 })] }),
                  new Paragraph({ children: [new TextRun({ text: 'NIP', font: 'Arial', size: 22 })] }),
                  new Paragraph({ children: [new TextRun({ text: 'Jabatan', font: 'Arial', size: 22 })] }),
                ],
              }),
              new TableCell({
                width: { size: 4, type: WidthType.PERCENTAGE },
                borders: NO_BORDER,
                children: [
                  new Paragraph({ children: [new TextRun({ text: ':', font: 'Arial', size: 22 })] }),
                  new Paragraph({ children: [new TextRun({ text: ':', font: 'Arial', size: 22 })] }),
                  new Paragraph({ children: [new TextRun({ text: ':', font: 'Arial', size: 22 })] }),
                ],
              }),
              new TableCell({
                width: { size: 75, type: WidthType.PERCENTAGE },
                borders: NO_BORDER,
                children: [
                  new Paragraph({ children: [new TextRun({ text: nama_ppk, bold: true, font: 'Arial', size: 22 })] }),
                  new Paragraph({ children: [new TextRun({ text: nip_ppk || '-', font: 'Arial', size: 22 })] }),
                  new Paragraph({ children: [new TextRun({ text: jabatan_ppk, font: 'Arial', size: 22 })] }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `bertindak untuk dan atas nama ${satker_nama}, selanjutnya disebut sebagai PIHAK PERTAMA.dan`,
                        font: 'Arial',
                        size: 22,
                      }),
                    ],
                    spacing: { after: 120 },
                  }),
                ],
              }),
            ],
          }),

          // Pihak Kedua
          new TableRow({
            children: [
              new TableCell({
                width: { size: 5, type: WidthType.PERCENTAGE },
                borders: NO_BORDER,
                children: [new Paragraph({ children: [new TextRun({ text: '2.', font: 'Arial', size: 22 })] })],
              }),
              new TableCell({
                width: { size: 16, type: WidthType.PERCENTAGE },
                borders: NO_BORDER,
                children: [
                  new Paragraph({ children: [new TextRun({ text: 'Nama', font: 'Arial', size: 22 })] }),
                  new Paragraph({ children: [new TextRun({ text: 'Jabatan', font: 'Arial', size: 22 })] }),
                ],
              }),
              new TableCell({
                width: { size: 4, type: WidthType.PERCENTAGE },
                borders: NO_BORDER,
                children: [
                  new Paragraph({ children: [new TextRun({ text: ':', font: 'Arial', size: 22 })] }),
                  new Paragraph({ children: [new TextRun({ text: ':', font: 'Arial', size: 22 })] }),
                ],
              }),
              new TableCell({
                width: { size: 75, type: WidthType.PERCENTAGE },
                borders: NO_BORDER,
                children: [
                  new Paragraph({ children: [new TextRun({ text: (mitra.nama || '').toUpperCase(), bold: true, font: 'Arial', size: 22 })] }),
                  new Paragraph({ children: [new TextRun({ text: mitra.jabatan || 'Petugas Pendataan Lapangan', font: 'Arial', size: 22 })] }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'bertindak untuk dan atas namanya sendiri, selanjutnya disebut sebagai PIHAK KEDUA.',
                        font: 'Arial',
                        size: 22,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );

    // Klausul Pernyataan
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Dengan ini menyatakan bahwa PIHAK KEDUA telah menyelesaikan dan menyerahkan dengan baik hasil pekerjaan Pendataan ${nama_kegiatan} ${periode_kegiatan} kepada PIHAK PERTAMA dengan rincian:`,
            font: 'Arial',
            size: 22,
          }),
        ],
        spacing: { before: 120, after: 60 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `TARGET DOKUMEN: ${mitra.target || 0} SAMPEL`, bold: true, font: 'Arial', size: 22 }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `REALISASI DOKUMEN: ${mitra.realisasi || 0} SAMPEL`, bold: true, font: 'Arial', size: 22 }),
        ],
        spacing: { after: 120 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'Demikian Berita Acara Serah Terima Hasil Pekerjaan ini dibuat untuk dapat dipergunakan sebagaimana semestinya.',
            font: 'Arial',
            size: 22,
          }),
        ],
        spacing: { after: 360 },
      })
    );

    // Kaki Tanda Tangan Para Pihak (2 Kolom Sejajar)
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: NO_BORDER,
                children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'PIHAK KEDUA,', bold: true, font: 'Arial', size: 22 })] }),
                  new Paragraph({ spacing: { after: 700 } }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: mitra.nama || 'Mitra Statistik', bold: true, underline: {}, font: 'Arial', size: 22 })],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: NO_BORDER,
                children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'PIHAK PERTAMA,', bold: true, font: 'Arial', size: 22 })] }),
                  new Paragraph({ spacing: { after: 700 } }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: nama_ppk, bold: true, underline: {}, font: 'Arial', size: 22 })],
                  }),
                  ...(nip_ppk
                    ? [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [new TextRun({ text: `NIP. ${nip_ppk}`, font: 'Arial', size: 22 })],
                        }),
                      ]
                    : []),
                ],
              }),
            ],
          }),
        ],
      })
    );

    // Jika masih ada mitra berikutnya di batch, tambahkan Page Break
    if (idx < targetMitras.length - 1) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1200, bottom: 1200, left: 1400, right: 1400 },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}
