import JSZip from 'jszip';
import { DOMParser as XMLDOMParser, XMLSerializer as XMLDOMSerializer } from '@xmldom/xmldom';
import { formatBastTanggalLengkap, formatTanggalIndo } from './terbilang.js';
import { ST_TEMPLATE_B64, BAST_TEMPLATE_B64 } from './templateAssets.js';

// Helper parser & serializer compatible with browser and node
function getParser() {
  if (typeof window !== 'undefined' && window.DOMParser) {
    return new window.DOMParser();
  }
  return new XMLDOMParser();
}

function getSerializer() {
  if (typeof window !== 'undefined' && window.XMLSerializer) {
    return new window.XMLSerializer();
  }
  return new XMLDOMSerializer();
}

// Convert base64 string to Uint8Array
function base64ToUint8Array(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Load template as ArrayBuffer (Fetch first, fallback to embedded base64)
async function loadTemplateBuffer(filename, fallbackB64) {
  try {
    const base = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/';
    const cleanBase = base.endsWith('/') ? base : base + '/';
    const res = await fetch(`${cleanBase}template/${encodeURIComponent(filename)}`);
    if (res.ok) {
      return await res.arrayBuffer();
    }
  } catch (err) {
    console.warn(`Fetch template ${filename} failed, falling back to embedded asset:`, err);
  }
  return base64ToUint8Array(fallbackB64).buffer;
}

// Replace all text runs in a paragraph while preserving paragraph and run formatting
function setTextInP(p, text, xmlDoc, isBold = null) {
  if (!p) return;
  const runs = p.getElementsByTagName('w:r');
  let rPr = null;
  if (runs.length > 0) {
    const existingRPr = runs[0].getElementsByTagName('w:rPr')[0];
    if (existingRPr) {
      rPr = existingRPr.cloneNode(true);
    }
  }

  if (rPr && isBold !== null) {
    const bTags = Array.from(rPr.getElementsByTagName('w:b'));
    if (isBold && bTags.length === 0) {
      rPr.appendChild(xmlDoc.createElement('w:b'));
    } else if (!isBold && bTags.length > 0) {
      bTags.forEach((b) => rPr.removeChild(b));
    }
  }

  const runsToRemove = [];
  for (let i = 0; i < p.childNodes.length; i++) {
    const child = p.childNodes[i];
    if (child.nodeType === 1 && child.nodeName === 'w:r') {
      runsToRemove.push(child);
    }
  }
  runsToRemove.forEach((r) => p.removeChild(r));

  const lines = String(text ?? '').split('\n');
  lines.forEach((line, idx) => {
    if (idx > 0) {
      const brR = xmlDoc.createElement('w:r');
      brR.appendChild(xmlDoc.createElement('w:br'));
      p.appendChild(brR);
    }
    const newR = xmlDoc.createElement('w:r');
    if (rPr) newR.appendChild(rPr.cloneNode(true));
    // Tab literal tidak valid di dalam <w:t>, gunakan elemen <w:tab/>
    line.split('\t').forEach((segment, segIdx) => {
      if (segIdx > 0) newR.appendChild(xmlDoc.createElement('w:tab'));
      if (!segment) return;
      const newT = xmlDoc.createElement('w:t');
      newT.setAttribute('xml:space', 'preserve');
      newT.appendChild(xmlDoc.createTextNode(segment));
      newR.appendChild(newT);
    });
    p.appendChild(newR);
  });
}

/**
 * Generate File Word (.docx) Surat Tugas (Identik 100% dengan Template Resmi BPS Satker 7301)
 */
export async function generateSuratTugasDocx(data) {
  const {
    satker_nama = 'BPS Kabupaten Kepulauan Selayar',
    satker_kota = 'Benteng',
    nama_kepala = 'Muhammad Nur',
    nip_kepala = '',
    st_nomor = 'B-128/7301/VS.330/2026',
    st_tanggal = '2026-07-01',
    nama_kegiatan = 'Survei Perusahaan/Usaha Penyedia Jasa Akomodasi (VHTS)',
    periode_kegiatan = 'Bulan Juli Tahun 2026',
    tgl_mulai = '2026-07-01',
    tgl_selesai = '2026-07-20',
    lokasi_kegiatan = 'Kepulauan Selayar',
    sk_nomor = '043 TAHUN 2026',
    sk_tanggal = '05 Januari 2026',
    sk_perihal = 'Petugas Survei VHTS Tahun 2026',
    mitra_list = [],
  } = data;

  const templateBuffer = await loadTemplateBuffer('ST - VHTS.docx', ST_TEMPLATE_B64);
  const zip = await JSZip.loadAsync(templateBuffer);
  const xmlStr = await zip.file('word/document.xml').async('text');

  const parser = getParser();
  const xmlDoc = parser.parseFromString(xmlStr, 'application/xml');
  const body = xmlDoc.getElementsByTagName('w:body')[0];
  const elementChildren = Array.from(body.childNodes).filter((n) => n.nodeType === 1);
  const sectPr = elementChildren[elementChildren.length - 1];

  const isKolektif = mitra_list.length > 1;
  const penerimaTugas = isKolektif ? 'Terlampir' : (mitra_list[0]?.nama || 'Nama Mitra');
  const peranUtama = mitra_list[0]?.jabatan || 'Petugas Pendataan Lapangan';

  // Base slice: Page 3 of ST template is elements 59 to 74
  const stElems = elementChildren.slice(59, 75).map((el) => el.cloneNode(true));
  const lampiranHeader = elementChildren[89]?.cloneNode(true);
  const lampiranTbl = elementChildren[91]?.cloneNode(true);

  // Clear body
  while (body.firstChild) {
    body.removeChild(body.firstChild);
  }

  // Update ST Header & Nomor (stElems[3] is Nomor)
  setTextInP(stElems[3], `Nomor : ${st_nomor}`, xmlDoc);

  // Update Table ST (stElems[4] is Table)
  const tbl = stElems[4];
  const rows = tbl.getElementsByTagName('w:tr');

  // Row 0: Menimbang
  if (rows[0]) {
    const cells = rows[0].getElementsByTagName('w:tc');
    if (cells[2]) {
      const ps = cells[2].getElementsByTagName('w:p');
      if (ps[0]) {
        setTextInP(
          ps[0],
          `a. bahwa dengan adanya kegiatan Pendataan ${nama_kegiatan} ${periode_kegiatan} di Lingkungan ${satker_nama}, maka diperlukan keikutsertaan pegawai/mitra Badan Pusat Statistik (BPS);`,
          xmlDoc
        );
      }
      if (ps[1]) {
        setTextInP(
          ps[1],
          `b. bahwa berdasarkan pertimbangan sebagaimana dimaksud pada huruf a, perlu menugaskan mitra BPS sebagai ${peranUtama};`,
          xmlDoc
        );
      }
    }
  }

  // Row 1: Mengingat
  if (rows[1]) {
    const cells = rows[1].getElementsByTagName('w:tc');
    if (cells[2]) {
      const ps = cells[2].getElementsByTagName('w:p');
      if (ps[0]) {
        setTextInP(
          ps[0],
          `Surat Kepala Badan Pusat Statistik ${satker_nama} Nomor ${sk_nomor} tanggal ${sk_tanggal} perihal ${sk_perihal}`,
          xmlDoc
        );
      }
    }
  }

  // Row 2: Memberi Tugas
  if (rows[2]) {
    const cells = rows[2].getElementsByTagName('w:tc');
    if (cells[2]) {
      const ps = cells[2].getElementsByTagName('w:p');
      if (ps[0]) {
        setTextInP(ps[0], penerimaTugas, xmlDoc);
      }
    }
  }

  // Row 3: Untuk
  if (rows[3]) {
    const cells = rows[3].getElementsByTagName('w:tc');
    if (cells[2]) {
      const ps = cells[2].getElementsByTagName('w:p');
      if (ps[0]) {
        const tglText = `Pendataan ${nama_kegiatan} ${periode_kegiatan} di Lingkungan ${satker_nama} pada tanggal ${formatTanggalIndo(
          tgl_mulai
        )} s.d ${formatTanggalIndo(tgl_selesai)}. yang diselenggarakan di ${lokasi_kegiatan}`;
        setTextInP(ps[0], tglText, xmlDoc);
      }
    }
  }

  // Kaki Tanda Tangan
  // stElems[10] = Kota, Tanggal
  setTextInP(stElems[10], `${satker_kota}, ${formatTanggalIndo(st_tanggal)}`, xmlDoc);
  // stElems[11] = Kepala Badan Pusat Statistik
  setTextInP(stElems[11], 'Kepala Badan Pusat Statistik', xmlDoc);
  // stElems[12] = Kabupaten Kepulauan Selayar
  const satkerWilayah = satker_nama.replace(/^BPS\s+/i, '');
  setTextInP(stElems[12], satkerWilayah, xmlDoc);
  // stElems[15] = Nama Kepala
  setTextInP(stElems[15], nama_kepala, xmlDoc, true);

  // Tambahkan NIP Kepala jika ada (template tidak punya baris NIP, jadi clone baris nama)
  if (nip_kepala && stElems[15]) {
    const nipP = stElems[15].cloneNode(true);
    setTextInP(nipP, `NIP. ${nip_kepala}`, xmlDoc, false);
    stElems.splice(16, 0, nipP);
  }

  // Append Surat Tugas Main Page
  stElems.forEach((el) => body.appendChild(el));

  // Jika Penugasan Kolektif (>1 mitra), tambahkan Lampiran Anggota
  if (isKolektif && lampiranHeader && lampiranTbl) {
    // Page break
    const pb = xmlDoc.createElement('w:p');
    const pbr = xmlDoc.createElement('w:r');
    const br = xmlDoc.createElement('w:br');
    br.setAttribute('w:type', 'page');
    pbr.appendChild(br);
    pb.appendChild(pbr);
    body.appendChild(pb);

    body.appendChild(lampiranHeader);

    // Populate rows in lampiran table
    const lRows = Array.from(lampiranTbl.getElementsByTagName('w:tr'));
    if (lRows.length > 1) {
      const sampleRow = lRows[1].cloneNode(true);
      // Remove placeholder rows
      for (let i = 1; i < lRows.length; i++) {
        lampiranTbl.removeChild(lRows[i]);
      }

      mitra_list.forEach((mitra, idx) => {
        const newRow = sampleRow.cloneNode(true);
        const cells = newRow.getElementsByTagName('w:tc');
        if (cells[0]) setTextInP(cells[0].getElementsByTagName('w:p')[0], String(idx + 1), xmlDoc);
        if (cells[1]) setTextInP(cells[1].getElementsByTagName('w:p')[0], mitra.nik || '-', xmlDoc);
        if (cells[2]) setTextInP(cells[2].getElementsByTagName('w:p')[0], mitra.nama || '-', xmlDoc);
        if (cells[3])
          setTextInP(cells[3].getElementsByTagName('w:p')[0], mitra.jabatan || 'Mitra Pendataan', xmlDoc);
        lampiranTbl.appendChild(newRow);
      });
    }

    body.appendChild(lampiranTbl);
  }

  body.appendChild(sectPr);

  const serializer = getSerializer();
  const newXmlStr = serializer.serializeToString(xmlDoc);
  zip.file('word/document.xml', newXmlStr);

  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

/**
 * Generate File Word (.docx) BAST (Identik 100% dengan Template Resmi BPS Satker 7301)
 * Mendukung Single Mitra atau Batch Seluruh Mitra (Tiap mitra di halaman terpisah dengan Page Break)
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

  const templateBuffer = await loadTemplateBuffer(
    'BAST VHTS juli dan Agustus.docx',
    BAST_TEMPLATE_B64
  );
  const zip = await JSZip.loadAsync(templateBuffer);
  const xmlStr = await zip.file('word/document.xml').async('text');

  const parser = getParser();
  const xmlDoc = parser.parseFromString(xmlStr, 'application/xml');
  const body = xmlDoc.getElementsByTagName('w:body')[0];
  const elementChildren = Array.from(body.childNodes).filter((n) => n.nodeType === 1);
  const sectPr = elementChildren[elementChildren.length - 1];

  // Template elements for 1 BAST page (elements 0 to 19)
  const templateElems = elementChildren.slice(0, 20);

  // Clear body
  while (body.firstChild) {
    body.removeChild(body.firstChild);
  }

  const targetMitras =
    singleMitraIndex !== null && mitra_list[singleMitraIndex]
      ? [{ ...mitra_list[singleMitraIndex], origIndex: singleMitraIndex }]
      : mitra_list.map((m, idx) => ({ ...m, origIndex: idx }));

  targetMitras.forEach((mitra, idx) => {
    const nomorUrut = mitra.origIndex + 1;
    const nomorBast = `${bast_prefix}.${nomorUrut}/${bast_suffix}`;

    // Add Page Break between multiple BAST pages
    if (idx > 0) {
      const pb = xmlDoc.createElement('w:p');
      const pbr = xmlDoc.createElement('w:r');
      const br = xmlDoc.createElement('w:br');
      br.setAttribute('w:type', 'page');
      pbr.appendChild(br);
      pb.appendChild(pbr);
      body.appendChild(pb);
    }

    const cloned = templateElems.map((el) => el.cloneNode(true));

    // Element 1: Nama Kegiatan
    setTextInP(cloned[1], String(nama_kegiatan || 'SURVEI VHTS').toUpperCase(), xmlDoc);

    // Element 2: Periode Kegiatan
    setTextInP(cloned[2], String(periode_kegiatan || 'BULAN JULI TAHUN 2026').toUpperCase(), xmlDoc);

    // Element 4: Nomor BAST
    setTextInP(cloned[4], `NOMOR: ${nomorBast}`, xmlDoc);

    // Element 6: Paragraf Pembuka Tanggal Terbilang
    const pembukaText = formatBastTanggalLengkap(bast_tanggal, satker_kota);
    setTextInP(cloned[6], pembukaText, xmlDoc);

    // Element 7: Tabel Komparasi Para Pihak
    const tbl = cloned[7];
    const rows = tbl.getElementsByTagName('w:tr');

    // Row 0: Pihak Pertama Nama
    if (rows[0]) {
      const cells = rows[0].getElementsByTagName('w:tc');
      if (cells[3]) {
        setTextInP(cells[3].getElementsByTagName('w:p')[0], nama_ppk, xmlDoc, true);
      }
    }

    // Row 1: Pihak Pertama NIP
    if (rows[1]) {
      const cells = rows[1].getElementsByTagName('w:tc');
      if (cells[3]) {
        setTextInP(cells[3].getElementsByTagName('w:p')[0], nip_ppk || '-', xmlDoc);
      }
    }

    // Row 2: Pihak Pertama Jabatan
    if (rows[2]) {
      const cells = rows[2].getElementsByTagName('w:tc');
      if (cells[3]) {
        setTextInP(cells[3].getElementsByTagName('w:p')[0], jabatan_ppk, xmlDoc);
      }
    }

    // Row 3: Klausul Pihak Pertama
    if (rows[3]) {
      const cells = rows[3].getElementsByTagName('w:tc');
      const cellP = cells[1] || cells[0];
      if (cellP) {
        setTextInP(
          cellP.getElementsByTagName('w:p')[0],
          `bertindak untuk dan atas nama ${satker_nama}, selanjutnya disebut sebagai PIHAK PERTAMA.\n\ndan`,
          xmlDoc
        );
      }
    }

    // Row 4: Pihak Kedua Nama
    if (rows[4]) {
      const cells = rows[4].getElementsByTagName('w:tc');
      if (cells[3]) {
        setTextInP(cells[3].getElementsByTagName('w:p')[0], String(mitra.nama || '').toUpperCase(), xmlDoc, true);
      }
    }

    // Row 5: Pihak Kedua Jabatan
    if (rows[5]) {
      const cells = rows[5].getElementsByTagName('w:tc');
      if (cells[3]) {
        setTextInP(
          cells[3].getElementsByTagName('w:p')[0],
          mitra.jabatan || 'Petugas Pendataan Lapangan',
          xmlDoc
        );
      }
    }

    // Row 6: Klausul Pihak Kedua
    if (rows[6]) {
      const cells = rows[6].getElementsByTagName('w:tc');
      const cellP = cells[1] || cells[0];
      if (cellP) {
        setTextInP(
          cellP.getElementsByTagName('w:p')[0],
          'bertindak untuk dan atas namanya sendiri, selanjutnya disebut sebagai PIHAK KEDUA.',
          xmlDoc
        );
      }
    }

    // Element 9: Klausul Pernyataan Penyelesaian
    setTextInP(
      cloned[9],
      `Dengan ini menyatakan bahwa PIHAK KEDUA telah menyelesaikan dan menyerahkan dengan baik hasil pekerjaan Pendataan ${nama_kegiatan} ${periode_kegiatan} kepada PIHAK PERTAMA dengan rincian:`,
      xmlDoc
    );

    // Element 10: Target Dokumen
    setTextInP(cloned[10], `TARGET DOKUMEN\t\t: ${mitra.target ?? 0} SAMPEL`, xmlDoc);

    // Element 11: Realisasi Dokumen
    setTextInP(cloned[11], `REALISASI DOKUMEN\t\t: ${mitra.realisasi ?? 0} SAMPEL`, xmlDoc);

    // Element 19: Signatures Dual Columns
    const p19 = cloned[19];
    if (p19) {
      const p19Runs = Array.from(p19.getElementsByTagName('w:r'));
      p19Runs.forEach((r) => p19.removeChild(r));

      // Left Column (Mitra)
      const rLeft = xmlDoc.createElement('w:r');
      rLeft.appendChild(xmlDoc.createElement('w:tab'));
      const tLeft = xmlDoc.createElement('w:t');
      tLeft.setAttribute('xml:space', 'preserve');
      tLeft.appendChild(xmlDoc.createTextNode(mitra.nama || 'Mitra'));
      rLeft.appendChild(tLeft);
      p19.appendChild(rLeft);

      // Right Column (PPK)
      const rRight = xmlDoc.createElement('w:r');
      rRight.appendChild(xmlDoc.createElement('w:tab'));
      const tRight = xmlDoc.createElement('w:t');
      tRight.setAttribute('xml:space', 'preserve');
      tRight.appendChild(xmlDoc.createTextNode(nama_ppk));
      rRight.appendChild(tRight);
      p19.appendChild(rRight);
    }

    // Append all cloned page elements to body
    cloned.forEach((el) => body.appendChild(el));
  });

  body.appendChild(sectPr);

  const serializer = getSerializer();
  const newXmlStr = serializer.serializeToString(xmlDoc);
  zip.file('word/document.xml', newXmlStr);

  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}
