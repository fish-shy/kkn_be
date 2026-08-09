import { buatApp } from './app.js'
import { env } from './env.js'
import { prisma } from './prisma.js'
import { periksaBucket } from './lib/penyimpanan.js'

const app = buatApp()

const server = app.listen(env.PORT, () => {
  console.log(`API kelurahan siap di http://localhost:${env.PORT}`)
  console.log(`Cek kesehatan  : http://localhost:${env.PORT}/api/health`)
  // Sekadar peringatan dini bila bucket salah nama atau kunci keliru; server
  // tetap jalan agar endpoint lain bisa dipakai.
  void periksaBucket()
})

async function tutup(sinyal: string) {
  console.log(`\n${sinyal} diterima, menutup server…`)
  server.close(() => void 0)
  await prisma.$disconnect()
  process.exit(0)
}

process.on('SIGINT', () => void tutup('SIGINT'))
process.on('SIGTERM', () => void tutup('SIGTERM'))
