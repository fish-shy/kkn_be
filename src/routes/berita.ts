import { Router } from 'express'
import type { Berita } from '@prisma/client'
import { prisma } from '../prisma.js'
import { wajibAdmin } from '../middleware/auth.js'
import { notFound } from '../lib/errors.js'
import { dariTanggal, keTanggal } from '../lib/tanggal.js'
import { hapus } from '../lib/penyimpanan.js'
import { beritaPatchSchema, beritaSchema, buatSlug } from '../validators.js'

export const beritaRouter = Router()

function bentuk(b: Berita) {
  return {
    id: b.id,
    slug: b.slug,
    judul: b.judul,
    kategori: b.kategori,
    tanggal: dariTanggal(b.tanggal),
    lokasi: b.lokasi,
    penulis: b.penulis,
    ringkas: b.ringkas,
    foto: b.foto,
    sumber: b.sumber,
    isi: b.isi,
    diperbarui: b.updatedAt.toISOString(),
  }
}

/** Menambah akhiran angka bila slug sudah terpakai berita lain. */
async function slugUnik(dasar: string, kecualiId?: string) {
  const awal = dasar || 'berita'
  for (let i = 0; i < 50; i++) {
    const calon = i === 0 ? awal : `${awal}-${i + 1}`
    const ada = await prisma.berita.findUnique({
      where: { slug: calon },
      select: { id: true },
    })
    if (!ada || ada.id === kecualiId) return calon
  }
  return `${awal}-${Date.now()}`
}

/* ------------------------------------------------------------- Publik */

beritaRouter.get('/', async (req, res) => {
  const kategori =
    typeof req.query.kategori === 'string' && req.query.kategori !== 'Semua'
      ? req.query.kategori
      : undefined

  const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''

  const daftar = await prisma.berita.findMany({
    where: {
      ...(kategori ? { kategori } : {}),
      ...(q
        ? {
            OR: [
              { judul: { contains: q, mode: 'insensitive' as const } },
              { ringkas: { contains: q, mode: 'insensitive' as const } },
              { kategori: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    },
    orderBy: [{ tanggal: 'desc' }, { createdAt: 'desc' }],
  })

  res.json(daftar.map(bentuk))
})

/** Menerima slug maupun id, supaya panel admin tidak perlu endpoint sendiri. */
beritaRouter.get('/:kunci', async (req, res) => {
  const { kunci } = req.params

  const berita = await prisma.berita.findFirst({
    where: { OR: [{ slug: kunci }, { id: kunci }] },
  })
  if (!berita) throw notFound('Berita tidak ditemukan.')

  const terkait = await prisma.berita.findMany({
    where: { id: { not: berita.id } },
    orderBy: [{ tanggal: 'desc' }],
    take: 12,
  })

  // Kategori yang sama didahulukan, sisanya sebagai pelengkap.
  const urut = [
    ...terkait.filter((t) => t.kategori === berita.kategori),
    ...terkait.filter((t) => t.kategori !== berita.kategori),
  ].slice(0, 4)

  res.json({ berita: bentuk(berita), terkait: urut.map(bentuk) })
})

/* -------------------------------------------------------------- Admin */

beritaRouter.post('/', wajibAdmin, async (req, res) => {
  const data = beritaSchema.parse(req.body)

  const berita = await prisma.berita.create({
    data: {
      slug: await slugUnik(data.slug ?? buatSlug(data.judul)),
      judul: data.judul,
      kategori: data.kategori,
      tanggal: keTanggal(data.tanggal),
      lokasi: data.lokasi,
      penulis: data.penulis,
      ringkas: data.ringkas,
      foto: data.foto ?? null,
      sumber: data.sumber ?? null,
      isi: data.isi,
    },
  })

  res.status(201).json(bentuk(berita))
})

beritaRouter.patch('/:id', wajibAdmin, async (req, res) => {
  const data = beritaPatchSchema.parse(req.body)
  const lama = await prisma.berita.findUnique({ where: { id: String(req.params.id) } })
  if (!lama) throw notFound('Berita tidak ditemukan.')

  const slug =
    data.slug !== undefined
      ? await slugUnik(data.slug, lama.id)
      : data.judul !== undefined && data.judul !== lama.judul
        ? await slugUnik(buatSlug(data.judul), lama.id)
        : undefined

  const berita = await prisma.berita.update({
    where: { id: lama.id },
    data: {
      ...(slug ? { slug } : {}),
      ...(data.judul !== undefined ? { judul: data.judul } : {}),
      ...(data.kategori !== undefined ? { kategori: data.kategori } : {}),
      ...(data.tanggal !== undefined
        ? { tanggal: keTanggal(data.tanggal) }
        : {}),
      ...(data.lokasi !== undefined ? { lokasi: data.lokasi } : {}),
      ...(data.penulis !== undefined ? { penulis: data.penulis } : {}),
      ...(data.ringkas !== undefined ? { ringkas: data.ringkas } : {}),
      ...(data.foto !== undefined ? { foto: data.foto } : {}),
      ...(data.sumber !== undefined ? { sumber: data.sumber } : {}),
      ...(data.isi !== undefined ? { isi: data.isi } : {}),
    },
  })

  // Foto lama yang sudah diganti tidak perlu disimpan lagi.
  if (data.foto !== undefined && lama.foto && lama.foto !== berita.foto) {
    void hapus(lama.foto)
  }

  res.json(bentuk(berita))
})

beritaRouter.delete('/:id', wajibAdmin, async (req, res) => {
  const berita = await prisma.berita.delete({ where: { id: String(req.params.id) } })
  void hapus(berita.foto)
  res.json({ pesan: 'Berita dihapus.' })
})
