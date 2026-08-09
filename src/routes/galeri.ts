import { Router } from 'express'
import type { Foto } from '@prisma/client'
import { prisma } from '../prisma.js'
import { wajibAdmin } from '../middleware/auth.js'
import { notFound } from '../lib/errors.js'
import { dariTanggal, keTanggal } from '../lib/tanggal.js'
import { hapus } from '../lib/penyimpanan.js'
import { fotoPatchSchema, fotoSchema } from '../validators.js'

export const galeriRouter = Router()

function bentuk(f: Foto) {
  return {
    id: f.id,
    judul: f.judul,
    ringkas: f.ringkas,
    album: f.album,
    tanggal: dariTanggal(f.tanggal),
    foto: f.foto,
    sumber: f.sumber,
    urutan: f.urutan,
  }
}

/** `urutan` menaik lebih dulu, lalu tanggal terbaru. */
const URUTAN = [
  { urutan: 'asc' as const },
  { tanggal: 'desc' as const },
  { createdAt: 'desc' as const },
]

/* ------------------------------------------------------------- Publik */

galeriRouter.get('/', async (req, res) => {
  const album =
    typeof req.query.album === 'string' && req.query.album !== 'Semua'
      ? req.query.album
      : undefined

  const daftar = await prisma.foto.findMany({
    where: album ? { album } : undefined,
    orderBy: URUTAN,
  })

  res.json(daftar.map(bentuk))
})

/* -------------------------------------------------------------- Admin */

galeriRouter.post('/', wajibAdmin, async (req, res) => {
  const data = fotoSchema.parse(req.body)

  const foto = await prisma.foto.create({
    data: {
      judul: data.judul,
      ringkas: data.ringkas,
      album: data.album,
      tanggal: keTanggal(data.tanggal),
      foto: data.foto,
      sumber: data.sumber ?? null,
      urutan: data.urutan,
    },
  })

  res.status(201).json(bentuk(foto))
})

galeriRouter.patch('/:id', wajibAdmin, async (req, res) => {
  const data = fotoPatchSchema.parse(req.body)
  const lama = await prisma.foto.findUnique({ where: { id: String(req.params.id) } })
  if (!lama) throw notFound('Foto tidak ditemukan.')

  const foto = await prisma.foto.update({
    where: { id: lama.id },
    data: {
      ...(data.judul !== undefined ? { judul: data.judul } : {}),
      ...(data.ringkas !== undefined ? { ringkas: data.ringkas } : {}),
      ...(data.album !== undefined ? { album: data.album } : {}),
      ...(data.tanggal !== undefined
        ? { tanggal: keTanggal(data.tanggal) }
        : {}),
      ...(data.foto !== undefined ? { foto: data.foto } : {}),
      ...(data.sumber !== undefined ? { sumber: data.sumber } : {}),
      ...(data.urutan !== undefined ? { urutan: data.urutan } : {}),
    },
  })

  if (data.foto !== undefined && lama.foto !== foto.foto) {
    void hapus(lama.foto)
  }

  res.json(bentuk(foto))
})

galeriRouter.delete('/:id', wajibAdmin, async (req, res) => {
  const foto = await prisma.foto.delete({ where: { id: String(req.params.id) } })
  void hapus(foto.foto)
  res.json({ pesan: 'Foto dihapus.' })
})
