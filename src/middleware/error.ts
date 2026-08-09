import type { NextFunction, Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import multer from 'multer'
import { ZodError } from 'zod'
import { ApiError } from '../lib/errors.js'

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ pesan: 'Endpoint tidak ditemukan.' })
}

/**
 * Semua galat bermuara di sini agar bentuk respons seragam:
 * `{ pesan, detail? }`. Frontend cukup membaca `pesan`.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ApiError) {
    res.status(err.status).json({ pesan: err.message, detail: err.detail })
    return
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      pesan: 'Data yang dikirim belum lengkap atau tidak valid.',
      detail: err.issues.map((i) => ({
        field: i.path.join('.'),
        pesan: i.message,
      })),
    })
    return
  }

  if (err instanceof multer.MulterError) {
    const pesan =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Ukuran gambar melebihi batas yang diizinkan.'
        : `Gagal mengunggah berkas (${err.code}).`
    res.status(400).json({ pesan })
    return
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[] | undefined)?.join(', ')
      res.status(409).json({
        pesan: target
          ? `Nilai ${target} sudah dipakai data lain.`
          : 'Data dengan nilai unik yang sama sudah ada.',
      })
      return
    }
    if (err.code === 'P2025') {
      res.status(404).json({ pesan: 'Data tidak ditemukan.' })
      return
    }
  }

  // Kesalahan paling sering saat pemasangan: PostgreSQL belum dijalankan atau
  // DATABASE_URL salah. Sebutkan apa adanya agar tidak ditebak-tebak.
  if (err instanceof Prisma.PrismaClientInitializationError) {
    console.error('[db]', err.message)
    res.status(503).json({
      pesan:
        'Server tidak dapat terhubung ke basis data. Pastikan PostgreSQL berjalan dan DATABASE_URL di backend/.env sudah benar.',
    })
    return
  }

  console.error('[error]', err)
  res.status(500).json({ pesan: 'Terjadi kesalahan pada server.' })
}
