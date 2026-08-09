import crypto from 'node:crypto'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { env } from '../env.js'
import { ApiError } from './errors.js'

/**
 * Gambar unggahan admin disimpan di Supabase Storage, bukan di disk server —
 * supaya berkasnya tidak ikut hilang saat aplikasi di-deploy ulang, dan
 * backend bisa ditaruh di hosting mana pun termasuk yang tanpa disk permanen.
 *
 * Yang tersimpan di basis data adalah URL publik lengkapnya, jadi frontend
 * cukup memasangnya langsung ke `<img src>`.
 *
 * Kunci yang dipakai di sini adalah **service role key**: hanya ada di
 * `.env` backend, tidak pernah sampai ke browser.
 */
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const BUCKET = env.SUPABASE_BUCKET

/** Awalan URL publik bucket ini — dipakai untuk mengenali berkas milik sendiri. */
const AWALAN_PUBLIK = `${env.SUPABASE_URL.replace(/\/+$/, '')}/storage/v1/object/public/${BUCKET}/`

/** Nama berkas yang aman untuk URL, tetap menyisakan nama asli agar mudah dikenali. */
function namaBerkas(namaAsli: string): string {
  // Pemotongan ekstensi memakai ejaan aslinya (`.JPG`) karena `basename`
  // membandingkan persis huruf besar-kecilnya; yang dilekatkan kembali di
  // akhir barulah versi huruf kecilnya.
  const extAsli = path.extname(namaAsli)
  const ext = extAsli.toLowerCase()
  const dasar = path
    .basename(namaAsli, extAsli)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)

  const acak = crypto.randomBytes(6).toString('hex')
  return `${dasar || 'gambar'}-${Date.now()}-${acak}${ext}`
}

/** Berkas dikelompokkan per bulan supaya isi bucket tetap mudah ditelusuri. */
function jalurBaru(namaAsli: string): string {
  const kini = new Date()
  const bulan = String(kini.getUTCMonth() + 1).padStart(2, '0')
  return `${kini.getUTCFullYear()}/${bulan}/${namaBerkas(namaAsli)}`
}

/** Unggah satu gambar, kembalikan URL publiknya. */
export async function unggah(berkas: Express.Multer.File): Promise<string> {
  const jalur = jalurBaru(berkas.originalname)

  // Cache panjang aman karena tiap unggahan memakai nama berkas yang unik:
  // mengganti gambar selalu menghasilkan URL baru, jadi tidak pernah ada
  // versi basi yang tersaji. Efek sampingnya, gambar yang dihapus masih bisa
  // dibuka lewat URL lamanya sampai cache CDN kedaluwarsa.
  const { error } = await supabase.storage.from(BUCKET).upload(jalur, berkas.buffer, {
    contentType: berkas.mimetype,
    cacheControl: '31536000',
    upsert: false,
  })

  if (error) {
    console.error('[storage] gagal unggah', error)
    const kurangBucket = /bucket not found/i.test(error.message)
    throw new ApiError(
      502,
      kurangBucket
        ? `Bucket "${BUCKET}" belum ada di Supabase Storage. Buat dulu bucket publik dengan nama itu.`
        : `Gagal mengunggah gambar ke Supabase: ${error.message}`,
    )
  }

  return supabase.storage.from(BUCKET).getPublicUrl(jalur).data.publicUrl
}

/**
 * Hapus berkas berdasarkan URL publiknya. URL di luar bucket ini diabaikan —
 * mis. gambar bawaan `/berita/…` yang dilayani frontend dari `public/`.
 */
export async function hapus(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith(AWALAN_PUBLIK)) return

  const jalur = decodeURIComponent(url.slice(AWALAN_PUBLIK.length).split('?')[0])
  if (!jalur) return

  const { error } = await supabase.storage.from(BUCKET).remove([jalur])
  if (error) console.warn('[storage] gagal menghapus', jalur, error.message)
}

/**
 * Dipanggil sekali saat server mulai: memastikan bucket benar-benar ada,
 * supaya kesalahan konfigurasi ketahuan sebelum admin mencoba mengunggah.
 */
export async function periksaBucket(): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).list('', { limit: 1 })

  if (error) {
    console.warn(
      `[storage] Bucket "${BUCKET}" belum bisa diakses: ${error.message}\n` +
        '          Buat bucket publik dengan nama itu di Supabase → Storage,\n' +
        '          lalu pastikan SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY benar.',
    )
    return
  }

  console.log(`Penyimpanan gambar: Supabase bucket "${BUCKET}" siap`)
}
