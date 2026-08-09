/**
 * Mengisi basis data dengan akun admin dan isi awal situs.
 *
 *   npm run db:seed              → aman diulang; isi yang sudah ada dibiarkan
 *   npm run db:seed -- --reset   → kosongkan dulu, lalu isi ulang dari nol
 *
 * Akun admin selalu di-upsert mengikuti ADMIN_USERNAME/ADMIN_PASSWORD di .env,
 * jadi lupa kata sandi cukup diperbaiki lewat .env lalu jalankan ulang.
 */

import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { env } from '../src/env.js'
import { keTanggal } from '../src/lib/tanggal.js'
import {
  BERITA,
  GALERI,
  GAMBARAN_UMUM,
  KEPESERTAAN_KB,
  LEMBAGA,
  PENDIDIKAN,
  PENDUDUK_RT,
  POSYANDU,
  SARANA,
  STATISTIK_KAMPUNG,
} from './data-awal.js'

const prisma = new PrismaClient()
const reset = process.argv.includes('--reset')

async function seedAdmin() {
  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12)

  await prisma.admin.upsert({
    where: { username: env.ADMIN_USERNAME },
    create: {
      username: env.ADMIN_USERNAME,
      passwordHash,
      nama: env.ADMIN_NAMA,
    },
    update: { passwordHash, nama: env.ADMIN_NAMA },
  })

  console.log(`  admin        : ${env.ADMIN_USERNAME} (siap)`)

  if (env.ADMIN_PASSWORD === 'ubah-password-ini' || env.ADMIN_PASSWORD.length < 8) {
    console.warn(
      '  PERINGATAN   : ADMIN_PASSWORD di .env masih lemah — ganti sebelum situs dipublikasikan.',
    )
  }
}

async function seedBerita() {
  if (!reset && (await prisma.berita.count()) > 0) {
    console.log('  berita       : sudah terisi, dilewati')
    return
  }
  if (reset) await prisma.berita.deleteMany()

  for (const b of BERITA) {
    await prisma.berita.create({
      data: {
        slug: b.slug,
        judul: b.judul,
        kategori: b.kategori,
        tanggal: keTanggal(b.tanggal),
        lokasi: b.lokasi,
        penulis: b.penulis,
        ringkas: b.ringkas,
        foto: b.foto ?? null,
        sumber: b.sumber ?? null,
        isi: b.isi,
      },
    })
  }
  console.log(`  berita       : ${BERITA.length} artikel`)
}

async function seedGaleri() {
  if (!reset && (await prisma.foto.count()) > 0) {
    console.log('  galeri       : sudah terisi, dilewati')
    return
  }
  if (reset) await prisma.foto.deleteMany()

  await prisma.foto.createMany({
    data: GALERI.map((g, urutan) => ({
      judul: g.judul,
      ringkas: g.ringkas,
      album: g.album,
      tanggal: keTanggal(g.tanggal),
      foto: g.foto,
      sumber: g.sumber,
      urutan,
    })),
  })
  console.log(`  galeri       : ${GALERI.length} foto`)
}

async function seedStatistik() {
  const adaIsi =
    (await prisma.gambaranUmum.count()) > 0 &&
    (await prisma.pendudukRt.count()) > 0

  if (!reset && adaIsi) {
    console.log('  statistik    : sudah terisi, dilewati')
    return
  }

  await prisma.gambaranUmum.upsert({
    where: { id: 1 },
    create: { id: 1, ...GAMBARAN_UMUM },
    update: GAMBARAN_UMUM,
  })

  await prisma.statistikKampung.upsert({
    where: { id: 1 },
    create: { id: 1, ...STATISTIK_KAMPUNG },
    update: STATISTIK_KAMPUNG,
  })

  await prisma.$transaction([
    prisma.pendudukRt.deleteMany(),
    prisma.pendudukRt.createMany({
      data: PENDUDUK_RT.map((r, urutan) => ({ ...r, urutan })),
    }),
    prisma.pendidikan.deleteMany(),
    prisma.pendidikan.createMany({
      data: PENDIDIKAN.map((r, urutan) => ({ ...r, urutan })),
    }),
    prisma.kepesertaanKb.deleteMany(),
    prisma.kepesertaanKb.createMany({
      data: KEPESERTAAN_KB.map((r, urutan) => ({ ...r, urutan })),
    }),
    prisma.posyandu.deleteMany(),
    prisma.posyandu.createMany({
      data: POSYANDU.map((r, urutan) => ({ ...r, urutan })),
    }),
    prisma.lembaga.deleteMany(),
    prisma.lembaga.createMany({
      data: LEMBAGA.map((r, urutan) => ({ ...r, urutan })),
    }),
  ])

  await prisma.saranaGrup.deleteMany()
  for (const [urutan, g] of SARANA.entries()) {
    await prisma.saranaGrup.create({
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

  console.log(
    `  statistik    : ${PENDUDUK_RT.length} RT, ${PENDIDIKAN.length} jenjang, ${POSYANDU.length} posyandu, ${SARANA.length} grup sarana`,
  )
}

async function main() {
  console.log(reset ? 'Mengisi ulang basis data (--reset)…' : 'Mengisi basis data…')
  await seedAdmin()
  await seedBerita()
  await seedGaleri()
  await seedStatistik()
  console.log('Selesai.')
}

main()
  .catch((e) => {
    console.error('Seed gagal:', e)
    process.exitCode = 1
  })
  .finally(() => void prisma.$disconnect())
