import { z } from 'zod'

/* --------------------------------------------------------------- Dasar */

const teks = (maks: number) => z.string().trim().min(1).max(maks)
const teksOpsional = (maks: number) =>
  z
    .string()
    .trim()
    .max(maks)
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional()

const cacah = z.coerce.number().int().min(0).max(100_000_000)
const urutan = z.coerce.number().int().min(0).max(9999).default(0)

/** `YYYY-MM-DD` */
export const tanggalIso = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal harus berformat YYYY-MM-DD')

/** Huruf kecil, angka, dan tanda hubung. */
export const slug = z
  .string()
  .trim()
  .min(3)
  .max(160)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug hanya boleh huruf kecil, angka, dan tanda hubung',
  )

/** Ubah judul menjadi slug yang aman untuk URL. */
export function buatSlug(judul: string): string {
  return judul
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 160)
}

/* ---------------------------------------------------------------- Auth */

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username wajib diisi').max(60),
  password: z.string().min(1, 'Kata sandi wajib diisi').max(200),
})

export const gantiSandiSchema = z.object({
  passwordLama: z.string().min(1, 'Kata sandi lama wajib diisi'),
  passwordBaru: z.string().min(8, 'Kata sandi baru minimal 8 karakter').max(200),
})

/* -------------------------------------------------------------- Berita */

export const blokSchema = z.discriminatedUnion('t', [
  z.object({ t: z.literal('p'), v: z.string().trim().min(1).max(8000) }),
  z.object({ t: z.literal('h2'), v: z.string().trim().min(1).max(300) }),
  z.object({
    t: z.literal('ul'),
    v: z.array(z.string().trim().min(1).max(2000)).min(1).max(50),
  }),
  z.object({
    t: z.literal('quote'),
    v: z.string().trim().min(1).max(2000),
    by: z.string().trim().max(160).optional(),
  }),
])

export const beritaSchema = z.object({
  slug: slug.optional(),
  judul: teks(240),
  kategori: teks(60),
  tanggal: tanggalIso,
  lokasi: teks(200),
  penulis: teks(120),
  ringkas: teks(600),
  foto: teksOpsional(500),
  sumber: teksOpsional(500),
  isi: z.array(blokSchema).max(120).default([]),
})

export const beritaPatchSchema = beritaSchema.partial()

/* -------------------------------------------------------------- Galeri */

export const fotoSchema = z.object({
  judul: teks(240),
  ringkas: teks(60),
  album: teks(60),
  tanggal: tanggalIso,
  foto: teks(500),
  sumber: teksOpsional(500),
  urutan,
})

export const fotoPatchSchema = fotoSchema.partial()

/* ----------------------------------------------------------- Statistik */

export const gambaranUmumSchema = z.object({
  penduduk: cacah,
  kk: cacah,
  pus: cacah,
  ibuHamil: cacah,
  balitaStunting: cacah,
  remaja: cacah,
  lansia: cacah,
  totalResmiKk: cacah,
  totalResmiJiwa: cacah,
  luasWilayah: teks(60),
  rtRw: teks(60),
  jarakPusatKota: teks(60),
})

export const statistikKampungSchema = z.object({
  jiwa: cacah,
  kk: cacah,
  pus: cacah,
  keluargaBalita: cacah,
  keluargaRemaja: cacah,
  keluargaLansia: cacah,
  remaja: cacah,
})

export const pendudukRtSchema = z
  .array(
    z.object({
      rt: teks(30),
      rw: teks(30),
      kk: cacah,
      jiwa: cacah,
    }),
  )
  .max(200)

export const pendidikanSchema = z
  .array(z.object({ nama: teks(120), l: cacah, p: cacah }))
  .max(60)

export const kepesertaanKbSchema = z
  .array(z.object({ nama: teks(120), jml: cacah, warna: teks(60) }))
  .max(20)

export const saranaSchema = z
  .array(
    z.object({
      grup: teks(120),
      icon: teks(40),
      items: z
        .array(z.object({ nama: teks(160), ket: teks(240) }))
        .max(30)
        .default([]),
    }),
  )
  .max(20)

export const posyanduSchema = z
  .array(
    z.object({ nama: teks(120), alamat: teks(240), layanan: teks(240) }),
  )
  .max(60)

export const lembagaSchema = z
  .array(z.object({ nama: teks(120), jml: cacah }))
  .max(40)
