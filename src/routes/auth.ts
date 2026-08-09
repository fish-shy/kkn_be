import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../prisma.js'
import { buatToken, wajibAdmin } from '../middleware/auth.js'
import { unauthorized } from '../lib/errors.js'
import { gantiSandiSchema, loginSchema } from '../validators.js'

export const authRouter = Router()

authRouter.post('/login', async (req, res) => {
  const { username, password } = loginSchema.parse(req.body)

  const admin = await prisma.admin.findUnique({ where: { username } })

  // Tetap jalankan compare walau user tidak ada, supaya lama respons untuk
  // username salah dan password salah tidak jauh berbeda.
  const cocok = await bcrypt.compare(
    password,
    admin?.passwordHash ?? '$2b$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv',
  )

  if (!admin || !cocok) {
    throw unauthorized('Username atau kata sandi salah.')
  }

  const payload = {
    sub: admin.id,
    username: admin.username,
    nama: admin.nama,
  }

  res.json({ token: buatToken(payload), admin: payload })
})

authRouter.get('/me', wajibAdmin, (req, res) => {
  res.json({ admin: req.admin })
})

authRouter.post('/password', wajibAdmin, async (req, res) => {
  const { passwordLama, passwordBaru } = gantiSandiSchema.parse(req.body)

  const admin = await prisma.admin.findUnique({
    where: { id: req.admin!.sub },
  })
  if (!admin) throw unauthorized()

  if (!(await bcrypt.compare(passwordLama, admin.passwordHash))) {
    throw unauthorized('Kata sandi lama salah.')
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: { passwordHash: await bcrypt.hash(passwordBaru, 12) },
  })

  res.json({ pesan: 'Kata sandi berhasil diganti.' })
})
