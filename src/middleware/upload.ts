import path from 'node:path'
import multer from 'multer'
import { env } from '../env.js'
import { badRequest } from '../lib/errors.js'

const EKSTENSI = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'])
const MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
])

/**
 * Berkas ditahan di memori, bukan ditulis ke disk — dari sini langsung
 * diteruskan ke Supabase Storage. Batas ukurannya menjaga pemakaian memori
 * tetap wajar.
 */
export const unggahGambar = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.UPLOAD_MAX_MB * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (!EKSTENSI.has(ext) || !MIME.has(file.mimetype)) {
      cb(badRequest('Berkas harus berupa gambar (JPG, PNG, WEBP, GIF, AVIF).'))
      return
    }
    cb(null, true)
  },
}).single('gambar')
