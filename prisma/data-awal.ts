/**
 * Isi awal basis data — salinan dari berkas `kkn/src/data/*.ts` yang selama
 * ini menjadi sumber tampilan situs.
 *
 * SUMBER: publikasi resmi Kelurahan Landasan Ulin Tengah
 * (https://kel-landasanulintengah.banjarbarukota.go.id/) dan profil Kampung
 * Keluarga Berkualitas pada portal Kemendukbangga/BKKBN.
 *
 * Kolom `foto` menunjuk ke `/berita/…`, yaitu berkas yang sudah ada di
 * `kkn/public/berita/`. Gambar yang diunggah admin lewat panel akan memakai
 * awalan `/uploads/…` dan dilayani oleh backend ini.
 */

export type Blok =
  | { t: 'p'; v: string }
  | { t: 'h2'; v: string }
  | { t: 'ul'; v: string[] }
  | { t: 'quote'; v: string; by?: string }

const SRC = {
  eco: 'https://kel-landasanulintengah.banjarbarukota.go.id/penilaian-program-eco-office-di-kelurahan-landasan-ulin-tengah-tahun-2025/',
  loka: 'https://kel-landasanulintengah.banjarbarukota.go.id/lokakarya-mini-lintas-sektor-puskesmas-landasan-ulin-tingkatkan-sinergi-untuk-pelayanan-kesehatan-masyarakat/',
  info: 'https://kel-landasanulintengah.banjarbarukota.go.id/informasi-kelurahan-landasan-ulin-tengah/',
  apel15okt:
    'https://kel-landasanulintengah.banjarbarukota.go.id/apel-pagi-para-pejabat-struktural-asn-pppk-dan-non-asn-kel-landasan-ulin-tengah-24-09-2025-2/',
  apel13okt:
    'https://kel-landasanulintengah.banjarbarukota.go.id/apel-pagi-para-pejabat-struktural-asn-pppk-dan-non-asn-kel-landasan-ulin-tengah-13-10-2025/',
  apel24sep:
    'https://kel-landasanulintengah.banjarbarukota.go.id/apel-pagi-para-pejabat-struktural-asn-pppk-dan-non-asn-kel-landasan-ulin-tengah-24-09-2025/',
  apel22sep:
    'https://kel-landasanulintengah.banjarbarukota.go.id/apel-pagi-para-pejabat-struktural-asn-pppk-dan-non-asn-kel-landasan-ulin-tengah-22-09-2025/',
  apel17sep:
    'https://kel-landasanulintengah.banjarbarukota.go.id/apel-pagi-para-pejabat-struktural-asn-pppk-dan-non-asn-kel-landasan-ulin-tengah-17-09-2025/',
  apel15sep:
    'https://kel-landasanulintengah.banjarbarukota.go.id/apel-pagi-para-pejabat-struktural-asn-pppk-dan-non-asn-kel-landasan-ulin-tengah-15-09-2025/',
  apel03sep:
    'https://kel-landasanulintengah.banjarbarukota.go.id/apel-pagi-para-pejabat-struktural-asn-pppk-dan-non-asn-kel-landasan-ulin-tengah-03-09-2025/',
}

/* ---------------------------------------------------------------- Berita */

export const BERITA: {
  slug: string
  judul: string
  kategori: string
  tanggal: string
  lokasi: string
  penulis: string
  ringkas: string
  foto?: string
  sumber?: string
  isi: Blok[]
}[] = [
  {
    slug: 'bank-sampah-organik-berbasis-warga',
    judul:
      'Lurah Dorong Pemilahan Sampah dan Penguatan Bank Sampah Organik Berbasis Warga',
    kategori: 'Pembangunan',
    tanggal: '2026-04-12',
    lokasi: 'Kelurahan Landasan Ulin Tengah',
    penulis: 'Banjarbaru Emas',
    sumber:
      'https://banjarbaruemas.com/lurah-landasan-ulin-tengah-dorong-pengelolaan-sampah-dan-penguatan-bank-sampah-organik-berbasis-warga/',
    ringkas:
      'Empat drop point disiapkan di dua RW untuk melayani sekitar 200 kepala keluarga, memilah sampah organik dan anorganik langsung dari sumbernya.',
    isi: [
      {
        t: 'p',
        v: 'Kelurahan Landasan Ulin Tengah menjalankan sistem pemilahan sampah berbasis warga untuk menekan timbulan sampah dari sumbernya. Sampah dipilah menjadi dua aliran, organik dan anorganik, dengan jalur pengumpulan yang terpisah.',
      },
      {
        t: 'p',
        v: 'Empat drop point disiapkan di dua rukun warga dan melayani sekitar 200 kepala keluarga. Warga menerima wadah khusus untuk memisahkan sampah organik langsung dari rumah.',
      },
      {
        t: 'quote',
        v: 'Sampah anorganik kita integrasikan dengan Bank Sampah Hidayah RT 2 RW 1.',
        by: 'Lurah Landasan Ulin Tengah',
      },
      {
        t: 'p',
        v: 'Sampah organik dari dapur warga dialirkan melalui titik kumpul lingkungan menuju bank sampah organik yang dikelola bersama Tim Penggerak PKK kelurahan dan pengurus rukun tetangga. Dinas terkait kemudian mengangkut material yang sudah diolah untuk penanganan akhir.',
      },
      {
        t: 'p',
        v: 'Kegiatan ini menindaklanjuti arahan Wali Kota Banjarbaru yang meminta setiap kelurahan menunjukkan kemajuan terukur dalam pengelolaan sampah di tingkat sumber dalam waktu enam bulan.',
      },
    ],
  },
  {
    slug: 'penilaian-eco-office-2025',
    judul: 'Penilaian Program Eco Office di Kelurahan Landasan Ulin Tengah Tahun 2025',
    kategori: 'Pembangunan',
    tanggal: '2025-10-15',
    lokasi: 'Kantor Kelurahan Landasan Ulin Tengah',
    penulis: 'Admin Kelurahan',
    foto: '/berita/eco-office-1.jpg',
    sumber: SRC.eco,
    ringkas:
      'Tim penilai meninjau langsung kebersihan lingkungan, pengelolaan sampah, penggunaan energi, serta penataan ruang kerja di kantor kelurahan.',
    isi: [
      {
        t: 'p',
        v: 'Rabu, 15 Oktober 2025 — Kelurahan Landasan Ulin Tengah menjadi salah satu lokasi pelaksanaan Penilaian Eco Office. Kegiatan ini bertujuan menilai penerapan prinsip ramah lingkungan di lingkungan perkantoran pemerintah.',
      },
      {
        t: 'p',
        v: 'Tim penilai melakukan peninjauan langsung terhadap kebersihan lingkungan, pengelolaan sampah, penggunaan energi, serta penataan ruang kerja agar menjaga kebersihan dan menerapkan perilaku hemat energi di lingkungan kerja.',
      },
      {
        t: 'p',
        v: 'Kegiatan ini diharapkan dapat mendorong aparatur kelurahan untuk terus meningkatkan kesadaran terhadap pentingnya menjaga lingkungan dan mewujudkan kantor yang bersih, hijau, serta nyaman bagi masyarakat.',
      },
    ],
  },
  {
    slug: 'apel-pagi-13-oktober-2025',
    judul: 'Apel Pagi: Kasi Ekobang Tekankan Pentingnya Pelayanan Prima',
    kategori: 'Pemerintahan',
    tanggal: '2025-10-13',
    lokasi: 'Halaman Kantor Kelurahan Landasan Ulin Tengah',
    penulis: 'Admin Kelurahan',
    foto: '/berita/apel-13-okt.jpg',
    sumber: SRC.apel13okt,
    ringkas:
      'Apel pagi Senin, 13 Oktober 2025, dipimpin Kasi Ekobang dengan arahan mengenai pelayanan prima dalam tugas pemerintahan dan pelayanan kepada warga.',
    isi: [
      {
        t: 'p',
        v: 'Apel pagi Kelurahan Landasan Ulin Tengah pada Senin, 13 Oktober 2025 dipimpin oleh Kasi Ekonomi dan Pembangunan (Ekobang).',
      },
      {
        t: 'p',
        v: 'Arahan yang disampaikan menekankan pentingnya pelayanan prima dalam menjalankan tugas pemerintahan serta pelayanan kepada warga.',
      },
      {
        t: 'p',
        v: 'Apel pagi diikuti pejabat struktural, ASN, PPPK, dan tenaga non-ASN di lingkungan Kelurahan Landasan Ulin Tengah, dan dilaksanakan secara rutin sebagai sarana penyampaian arahan pimpinan.',
      },
    ],
  },
  {
    slug: 'lokakarya-mini-lintas-sektor-2025',
    judul:
      'Lokakarya Mini Lintas Sektor: Puskesmas Landasan Ulin Tingkatkan Sinergi untuk Pelayanan Kesehatan Masyarakat',
    kategori: 'Kesehatan',
    tanggal: '2025-09-24',
    lokasi: 'Aula Kelurahan Landasan Ulin Tengah',
    penulis: 'Admin Kelurahan',
    foto: '/berita/lokakarya-1.jpg',
    sumber: SRC.loka,
    ringkas:
      'Lokakarya dipimpin langsung Kepala Puskesmas Landasan Ulin untuk memperkuat koordinasi lintas sektor dalam meningkatkan kualitas pelayanan kesehatan masyarakat.',
    isi: [
      {
        t: 'p',
        v: 'Landasan Ulin Tengah, 24 September 2025 — Bertempat di Aula Kelurahan Landasan Ulin Tengah, telah dilaksanakan Lokakarya Mini Lintas Sektor yang dipimpin langsung oleh Kepala Puskesmas Landasan Ulin, Imam Muftadi, S.Far., Apt.',
      },
      {
        t: 'p',
        v: 'Kegiatan ini bertujuan memperkuat koordinasi lintas sektor dalam rangka meningkatkan kualitas pelayanan kesehatan masyarakat.',
      },
      { t: 'h2', v: 'Agenda utama' },
      {
        t: 'ul',
        v: [
          'Penyampaian hasil kegiatan imunisasi anak — evaluasi capaian imunisasi di wilayah kerja Puskesmas Landasan Ulin.',
          'Penyampaian hasil PHBS (Perilaku Hidup Bersih dan Sehat) — laporan perkembangan perilaku hidup sehat masyarakat.',
          'Penyampaian usul dan saran terkait pelayanan kesehatan — forum diskusi terbuka sebagai bahan evaluasi untuk peningkatan layanan.',
        ],
      },
      {
        t: 'p',
        v: 'Melalui lokakarya ini diharapkan terjalin sinergi yang lebih kuat sehingga pelayanan kesehatan semakin mudah diakses, berkualitas, dan tepat sasaran bagi masyarakat Landasan Ulin.',
      },
    ],
  },
  {
    slug: 'informasi-pengaduan-tindak-pidana-korupsi',
    judul: 'Kelurahan Membuka Pengaduan Pencegahan Tindak Pidana Korupsi',
    kategori: 'Pemerintahan',
    tanggal: '2025-09-20',
    lokasi: 'Kelurahan Landasan Ulin Tengah',
    penulis: 'Admin Kelurahan',
    foto: '/berita/informasi-1.jpg',
    sumber: SRC.info,
    ringkas:
      'Warga yang menemukan indikasi tindak pidana korupsi dalam tata pemerintahan dapat menyampaikan laporannya melalui situs resmi kelurahan.',
    isi: [
      {
        t: 'p',
        v: 'Dalam rangka pencegahan dan pemberantasan korupsi tata pemerintahan, Kelurahan Landasan Ulin Tengah menerima pengaduan pelaporan tindak pidana tersebut melalui situs resmi kelurahan.',
      },
      {
        t: 'p',
        v: 'Warga yang menemukan atau melihat indikasi pelanggaran dapat memberikan informasinya melalui kanal pengaduan tersebut.',
      },
    ],
  },
]

/* ---------------------------------------------------------------- Galeri */

export const GALERI: {
  judul: string
  ringkas: string
  album: string
  tanggal: string
  foto: string
  sumber: string
}[] = [
  {
    judul: 'Tim penilai Eco Office berdiskusi bersama aparatur kelurahan',
    ringkas: 'Eco Office',
    album: 'Penilaian Eco Office',
    tanggal: '2025-10-15',
    foto: '/berita/eco-office-1.jpg',
    sumber: SRC.eco,
  },
  {
    judul: 'Peninjauan penataan ruang kerja pada Penilaian Eco Office',
    ringkas: 'Penataan Ruang',
    album: 'Penilaian Eco Office',
    tanggal: '2025-10-15',
    foto: '/berita/eco-office-2.jpg',
    sumber: SRC.eco,
  },
  {
    judul: 'Aparatur kelurahan di depan ruang pelayanan',
    ringkas: 'Ruang Pelayanan',
    album: 'Penilaian Eco Office',
    tanggal: '2025-10-15',
    foto: '/berita/eco-office-3.jpg',
    sumber: SRC.eco,
  },
  {
    judul: 'Apel pagi aparatur kelurahan, Rabu 15 Oktober 2025',
    ringkas: 'Apel Pagi',
    album: 'Apel Pagi',
    tanggal: '2025-10-15',
    foto: '/berita/apel-15-okt.jpg',
    sumber: SRC.apel15okt,
  },
  {
    judul: 'Apel pagi aparatur kelurahan, Senin 13 Oktober 2025',
    ringkas: 'Apel Pagi',
    album: 'Apel Pagi',
    tanggal: '2025-10-13',
    foto: '/berita/apel-13-okt.jpg',
    sumber: SRC.apel13okt,
  },
  {
    judul: 'Lokakarya Mini Lintas Sektor di aula kelurahan',
    ringkas: 'Lokakarya Mini',
    album: 'Kesehatan',
    tanggal: '2025-09-24',
    foto: '/berita/lokakarya-1.jpg',
    sumber: SRC.loka,
  },
  {
    judul: 'Peserta Lokakarya Mini Lintas Sektor Puskesmas Landasan Ulin',
    ringkas: 'Lintas Sektor',
    album: 'Kesehatan',
    tanggal: '2025-09-24',
    foto: '/berita/lokakarya-2.jpg',
    sumber: SRC.loka,
  },
  {
    judul: 'Apel pagi aparatur kelurahan, 24 September 2025',
    ringkas: 'Apel Pagi',
    album: 'Apel Pagi',
    tanggal: '2025-09-24',
    foto: '/berita/apel-24-sep.jpg',
    sumber: SRC.apel24sep,
  },
  {
    judul: 'Apel pagi aparatur kelurahan, 22 September 2025',
    ringkas: 'Apel Pagi',
    album: 'Apel Pagi',
    tanggal: '2025-09-22',
    foto: '/berita/apel-22-sep.jpg',
    sumber: SRC.apel22sep,
  },
  {
    judul:
      'Poster: seluruh jenis pelayanan di kelurahan tidak dipungut biaya apa pun',
    ringkas: 'Layanan Gratis',
    album: 'Pengumuman',
    tanggal: '2025-09-20',
    foto: '/berita/informasi-1.jpg',
    sumber: SRC.info,
  },
  {
    judul: 'Poster: Tolak Korupsi & Gratifikasi',
    ringkas: 'Tolak Korupsi',
    album: 'Pengumuman',
    tanggal: '2025-09-20',
    foto: '/berita/informasi-2.jpg',
    sumber: SRC.info,
  },
  {
    judul: 'Apel pagi aparatur kelurahan, 17 September 2025',
    ringkas: 'Apel Pagi',
    album: 'Apel Pagi',
    tanggal: '2025-09-17',
    foto: '/berita/apel-17-sep.jpg',
    sumber: SRC.apel17sep,
  },
  {
    judul: 'Apel pagi aparatur kelurahan, 15 September 2025',
    ringkas: 'Apel Pagi',
    album: 'Apel Pagi',
    tanggal: '2025-09-15',
    foto: '/berita/apel-15-sep.jpg',
    sumber: SRC.apel15sep,
  },
  {
    judul: 'Apel pagi aparatur kelurahan, 3 September 2025',
    ringkas: 'Apel Pagi',
    album: 'Apel Pagi',
    tanggal: '2025-09-03',
    foto: '/berita/apel-03-sep-1.jpg',
    sumber: SRC.apel03sep,
  },
  {
    judul: 'Arahan pimpinan pada apel pagi 3 September 2025',
    ringkas: 'Arahan Pimpinan',
    album: 'Apel Pagi',
    tanggal: '2025-09-03',
    foto: '/berita/apel-03-sep-2.jpg',
    sumber: SRC.apel03sep,
  },
]

/* ------------------------------------------------------------- Statistik */

export const GAMBARAN_UMUM = {
  penduduk: 9063,
  kk: 2843,
  pus: 1929,
  ibuHamil: 22,
  balitaStunting: 129,
  remaja: 2025,
  lansia: 403,
  totalResmiKk: 2843,
  totalResmiJiwa: 9063,
  luasWilayah: '1.818,00 ha',
  rtRw: '16 / 3',
  jarakPusatKota: '± 9 km',
}

export const STATISTIK_KAMPUNG = {
  jiwa: 8475,
  kk: 2843,
  pus: 1749,
  keluargaBalita: 528,
  keluargaRemaja: 768,
  keluargaLansia: 208,
  remaja: 1536,
}

export const PENDUDUK_RT = [
  { rt: 'RT 01', rw: 'RW 01', kk: 97, jiwa: 734 },
  { rt: 'RT 02', rw: 'RW 01', kk: 172, jiwa: 406 },
  { rt: 'RT 13', rw: 'RW 01', kk: 168, jiwa: 488 },
  { rt: 'RT 16', rw: 'RW 01', kk: 181, jiwa: 598 },
  { rt: 'RT 03', rw: 'RW 02', kk: 172, jiwa: 435 },
  { rt: 'RT 04', rw: 'RW 02', kk: 286, jiwa: 924 },
  { rt: 'RT 05', rw: 'RW 02', kk: 172, jiwa: 626 },
  { rt: 'RT 06', rw: 'RW 02', kk: 180, jiwa: 539 },
  { rt: 'RT 07', rw: 'RW 03', kk: 192, jiwa: 775 },
  { rt: 'RT 08', rw: 'RW 03', kk: 55, jiwa: 137 },
  { rt: 'RT 09', rw: 'RW 03', kk: 58, jiwa: 202 },
  { rt: 'RT 10', rw: 'RW 03', kk: 48, jiwa: 144 },
  { rt: 'RT 11', rw: 'RW 03', kk: 590, jiwa: 1270 },
  { rt: 'RT 12', rw: 'RW 03', kk: 187, jiwa: 575 },
  { rt: 'RT 14', rw: 'RW 03', kk: 168, jiwa: 488 },
  { rt: 'RT 15', rw: 'RW 03', kk: 220, jiwa: 955 },
]

export const PENDIDIKAN = [
  { nama: 'Tidak / belum sekolah', l: 1169, p: 1100 },
  { nama: 'Belum tamat SD', l: 609, p: 580 },
  { nama: 'Tamat SD sederajat', l: 642, p: 787 },
  { nama: 'SLTP sederajat', l: 640, p: 676 },
  { nama: 'SLTA sederajat', l: 1258, p: 1007 },
  { nama: 'Diploma I / II', l: 16, p: 28 },
  { nama: 'Diploma III / S. Muda', l: 53, p: 88 },
  { nama: 'Diploma IV / Strata I', l: 292, p: 332 },
  { nama: 'Strata II', l: 31, p: 21 },
  { nama: 'Strata III', l: 0, p: 0 },
]

export const KEPESERTAAN_KB = [
  { nama: 'PUS peserta KB aktif', jml: 1329, warna: 'var(--leaf-600)' },
  { nama: 'PUS belum ber-KB', jml: 420, warna: 'var(--clay-500)' },
]

export const SARANA = [
  {
    grup: 'Kelompok kegiatan',
    icon: 'users',
    items: [
      { nama: 'Bina Keluarga Balita (BKB)', ket: 'Ada' },
      { nama: 'Bina Keluarga Remaja (BKR)', ket: 'Ada — BKR Akasia, RT 05 RW 02' },
      {
        nama: 'Bina Keluarga Lansia (BKL)',
        ket: 'Ada — BKL Ramania, Komp. Borneo Indah',
      },
      { nama: 'PIK Remaja', ket: 'Ada' },
    ],
  },
  {
    grup: 'Sarana Kampung KB',
    icon: 'building',
    items: [
      { nama: 'Rumah Data Kependudukan', ket: 'Ada — pemutakhiran berkala' },
      { nama: 'DASHAT', ket: 'Ada — gizi balita berisiko stunting' },
      { nama: 'UPPKA', ket: 'Ada' },
      { nama: 'Sekretariat Kampung KB', ket: 'Menumpang di kantor kelurahan' },
    ],
  },
  {
    grup: 'Kesehatan',
    icon: 'heart',
    items: [
      { nama: 'Posyandu aktif', ket: '8 posyandu' },
      { nama: 'Puskesmas pembina', ket: 'Puskesmas Landasan Ulin' },
      { nama: 'Ibu hamil terdata', ket: '22 orang' },
      { nama: 'Balita gizi kurang / stunting', ket: '129 balita' },
    ],
  },
  {
    grup: 'Kelembagaan',
    icon: 'shield',
    items: [
      { nama: 'SK Lurah tentang Kampung KB', ket: 'Ada' },
      { nama: 'Kepengurusan Pokja', ket: 'Ada — 13 orang, seluruhnya terlatih' },
      { nama: 'Pendamping PLKB / PKB', ket: 'Nurul Hasanah, S.Pd.' },
      { nama: 'Rencana Kegiatan Masyarakat', ket: 'Ada' },
    ],
  },
]

export const POSYANDU = [
  {
    nama: 'Amanah Borneo',
    alamat: 'Komp. Borneo Indah, RW 01',
    layanan: 'RT 01 dan RT 13',
  },
  {
    nama: 'Al-Barokah',
    alamat: 'Komp. Putra Tunggal Mandiri, RW 01',
    layanan: 'RT 16',
  },
  {
    nama: 'Kaca Piring',
    alamat: 'Jl. A. Yani Km. 22,300, RW 01',
    layanan: 'RT 02',
  },
  {
    nama: 'Mayang Maurai',
    alamat: 'Jl. Pembangunan, RW 02',
    layanan: 'RT 03 dan RT 04',
  },
  { nama: 'Akasia', alamat: 'Jl. Akasia, RW 02', layanan: 'RT 05' },
  {
    nama: 'Al-Hidayah 1',
    alamat: 'Gg. Hidayah, RW 02',
    layanan: 'RT 06 dan RT 07',
  },
  {
    nama: 'Al-Hidayah 2',
    alamat: 'Komp. Putri Sulung, RW 03',
    layanan: 'RT 11',
  },
  {
    nama: 'Nusa Indah',
    alamat: 'Komp. Citra Bangun Persada, RW 03',
    layanan: 'RT 08, 09, 10, 11, 12, 14, dan 15',
  },
]

export const LEMBAGA = [
  { nama: 'Rukun Tetangga (RT)', jml: 16 },
  { nama: 'Rukun Warga (RW)', jml: 3 },
  { nama: 'Posyandu aktif', jml: 8 },
  { nama: 'Pengurus Pokja Kampung KB', jml: 13 },
]
