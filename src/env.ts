import 'dotenv/config'
import { z } from 'zod'

/**
 * Konfigurasi dibaca sekali saat proses mulai dan divalidasi di sini, supaya
 * kesalahan .env ketahuan waktu start — bukan saat request pertama masuk.
 */
const skema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL wajib diisi'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET minimal 16 karakter'),
  JWT_EXPIRES_IN: z.string().default('12h'),
  ADMIN_USERNAME: z.string().default('admin'),
  ADMIN_PASSWORD: z.string().default('admin123'),
  ADMIN_NAMA: z.string().default('Administrator Kelurahan'),
  UPLOAD_MAX_MB: z.coerce.number().positive().default(5),

  // Supabase Storage — tempat gambar unggahan admin disimpan.
  SUPABASE_URL: z.url('SUPABASE_URL harus berupa URL proyek Supabase'),
  // Service role key, bukan anon key: dipakai server untuk menulis ke bucket
  // dan tidak pernah dikirim ke browser.
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(20, 'SUPABASE_SERVICE_ROLE_KEY belum diisi'),
  SUPABASE_BUCKET: z.string().min(1).default('gambar'),
})

const hasil = skema.safeParse(process.env)

if (!hasil.success) {
  const rincian = hasil.error.issues
    .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
    .join('\n')
  console.error(`Konfigurasi .env belum benar:\n${rincian}\n`)
  console.error('Salin backend/.env.example menjadi backend/.env lalu isi.')
  process.exit(1)
}

export const env = hasil.data

/** Daftar origin yang diizinkan memanggil API. */
export const corsOrigins = env.CORS_ORIGIN.split(',')
  .map((s) => s.trim())
  .filter(Boolean)
