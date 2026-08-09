import { PrismaClient } from '@prisma/client'

/**
 * Satu instance dipakai seluruh aplikasi. Di mode `tsx watch` modul dimuat
 * ulang tiap kali berkas berubah, jadi instance disimpan di globalThis agar
 * koneksi lama tidak menumpuk.
 */
const globalRef = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalRef.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') globalRef.prisma = prisma
