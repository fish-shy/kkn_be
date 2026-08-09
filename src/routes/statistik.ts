import { Router } from 'express'
import { prisma } from '../prisma.js'
import { wajibAdmin } from '../middleware/auth.js'
import {
  gambaranUmumSchema,
  kepesertaanKbSchema,
  lembagaSchema,
  pendidikanSchema,
  pendudukRtSchema,
  posyanduSchema,
  saranaSchema,
  statistikKampungSchema,
} from '../validators.js'

export const statistikRouter = Router()

/** Nilai awal bila baris singleton belum pernah dibuat. */
const GU_KOSONG = {
  penduduk: 0,
  kk: 0,
  pus: 0,
  ibuHamil: 0,
  balitaStunting: 0,
  remaja: 0,
  lansia: 0,
  totalResmiKk: 0,
  totalResmiJiwa: 0,
  luasWilayah: '—',
  rtRw: '—',
  jarakPusatKota: '—',
}

const SK_KOSONG = {
  jiwa: 0,
  kk: 0,
  pus: 0,
  keluargaBalita: 0,
  keluargaRemaja: 0,
  keluargaLansia: 0,
  remaja: 0,
}

/* ------------------------------------------------------------- Publik */

statistikRouter.get('/', async (_req, res) => {
  const [
    gambaranUmum,
    statistikKampung,
    pendudukRt,
    pendidikan,
    kepesertaanKb,
    sarana,
    posyandu,
    lembaga,
  ] = await Promise.all([
    prisma.gambaranUmum.findUnique({ where: { id: 1 } }),
    prisma.statistikKampung.findUnique({ where: { id: 1 } }),
    prisma.pendudukRt.findMany({ orderBy: { urutan: 'asc' } }),
    prisma.pendidikan.findMany({ orderBy: { urutan: 'asc' } }),
    prisma.kepesertaanKb.findMany({ orderBy: { urutan: 'asc' } }),
    prisma.saranaGrup.findMany({
      orderBy: { urutan: 'asc' },
      include: { items: { orderBy: { urutan: 'asc' } } },
    }),
    prisma.posyandu.findMany({ orderBy: { urutan: 'asc' } }),
    prisma.lembaga.findMany({ orderBy: { urutan: 'asc' } }),
  ])

  res.json({
    gambaranUmum: gambaranUmum
      ? { ...GU_KOSONG, ...gambaranUmum, updatedAt: undefined, id: undefined }
      : GU_KOSONG,
    statistikKampung: statistikKampung
      ? { ...SK_KOSONG, ...statistikKampung, updatedAt: undefined, id: undefined }
      : SK_KOSONG,
    pendudukRt: pendudukRt.map((r) => ({
      rt: r.rt,
      rw: r.rw,
      kk: r.kk,
      jiwa: r.jiwa,
    })),
    pendidikan: pendidikan.map((r) => ({ nama: r.nama, l: r.l, p: r.p })),
    kepesertaanKb: kepesertaanKb.map((r) => ({
      nama: r.nama,
      jml: r.jml,
      warna: r.warna,
    })),
    sarana: sarana.map((g) => ({
      grup: g.grup,
      icon: g.icon,
      items: g.items.map((i) => ({ nama: i.nama, ket: i.ket })),
    })),
    posyandu: posyandu.map((p) => ({
      nama: p.nama,
      alamat: p.alamat,
      layanan: p.layanan,
    })),
    lembaga: lembaga.map((l) => ({ nama: l.nama, jml: l.jml })),
  })
})

/* -------------------------------------------------------------- Admin */

statistikRouter.put('/gambaran-umum', wajibAdmin, async (req, res) => {
  const data = gambaranUmumSchema.parse(req.body)
  const baris = await prisma.gambaranUmum.upsert({
    where: { id: 1 },
    create: { id: 1, ...data },
    update: data,
  })
  res.json({ ...baris, id: undefined, updatedAt: undefined })
})

statistikRouter.put('/statistik-kampung', wajibAdmin, async (req, res) => {
  const data = statistikKampungSchema.parse(req.body)
  const baris = await prisma.statistikKampung.upsert({
    where: { id: 1 },
    create: { id: 1, ...data },
    update: data,
  })
  res.json({ ...baris, id: undefined, updatedAt: undefined })
})

/*
 * Daftar diganti utuh, bukan ditambal baris per baris. Panel admin mengedit
 * seluruh tabel sekaligus lalu menyimpannya, jadi cara ini yang paling dekat
 * dengan apa yang dilakukan pengguna — dan tidak meninggalkan baris yatim.
 */

statistikRouter.put('/penduduk-rt', wajibAdmin, async (req, res) => {
  const rows = pendudukRtSchema.parse(req.body)
  await prisma.$transaction([
    prisma.pendudukRt.deleteMany(),
    prisma.pendudukRt.createMany({
      data: rows.map((r, urutan) => ({ ...r, urutan })),
    }),
  ])
  res.json(rows)
})

statistikRouter.put('/pendidikan', wajibAdmin, async (req, res) => {
  const rows = pendidikanSchema.parse(req.body)
  await prisma.$transaction([
    prisma.pendidikan.deleteMany(),
    prisma.pendidikan.createMany({
      data: rows.map((r, urutan) => ({ ...r, urutan })),
    }),
  ])
  res.json(rows)
})

statistikRouter.put('/kepesertaan-kb', wajibAdmin, async (req, res) => {
  const rows = kepesertaanKbSchema.parse(req.body)
  await prisma.$transaction([
    prisma.kepesertaanKb.deleteMany(),
    prisma.kepesertaanKb.createMany({
      data: rows.map((r, urutan) => ({ ...r, urutan })),
    }),
  ])
  res.json(rows)
})

statistikRouter.put('/posyandu', wajibAdmin, async (req, res) => {
  const rows = posyanduSchema.parse(req.body)
  await prisma.$transaction([
    prisma.posyandu.deleteMany(),
    prisma.posyandu.createMany({
      data: rows.map((r, urutan) => ({ ...r, urutan })),
    }),
  ])
  res.json(rows)
})

statistikRouter.put('/lembaga', wajibAdmin, async (req, res) => {
  const rows = lembagaSchema.parse(req.body)
  await prisma.$transaction([
    prisma.lembaga.deleteMany(),
    prisma.lembaga.createMany({
      data: rows.map((r, urutan) => ({ ...r, urutan })),
    }),
  ])
  res.json(rows)
})

statistikRouter.put('/sarana', wajibAdmin, async (req, res) => {
  const grup = saranaSchema.parse(req.body)

  await prisma.$transaction(async (tx) => {
    // Item ikut terhapus lewat onDelete: Cascade.
    await tx.saranaGrup.deleteMany()
    for (const [urutan, g] of grup.entries()) {
      await tx.saranaGrup.create({
        data: {
          grup: g.grup,
          icon: g.icon,
          urutan,
          items: {
            create: g.items.map((it, i) => ({
              nama: it.nama,
              ket: it.ket,
              urutan: i,
            })),
          },
        },
      })
    }
  })

  res.json(grup)
})
