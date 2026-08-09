import { Router } from 'express'
import { wajibAdmin } from '../middleware/auth.js'
import { unggahGambar } from '../middleware/upload.js'
import { badRequest } from '../lib/errors.js'
import { unggah } from '../lib/penyimpanan.js'

export const uploadRouter = Router()

/**
 * `POST /api/upload` — kirim satu gambar sebagai `multipart/form-data` pada
 * field `gambar`. Balasannya `{ url }` berisi URL publik Supabase Storage,
 * yang lalu disimpan admin sebagai kolom `foto` pada berita atau galeri.
 */
uploadRouter.post('/', wajibAdmin, unggahGambar, async (req, res) => {
  if (!req.file) throw badRequest('Tidak ada berkas gambar yang dikirim.')

  const url = await unggah(req.file)

  res.status(201).json({
    url,
    nama: req.file.originalname,
    ukuran: req.file.size,
  })
})
