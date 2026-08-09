import express from 'express'
import cors from 'cors'
import { corsOrigins } from './env.js'
import { errorHandler, notFoundHandler } from './middleware/error.js'
import { authRouter } from './routes/auth.js'
import { beritaRouter } from './routes/berita.js'
import { galeriRouter } from './routes/galeri.js'
import { statistikRouter } from './routes/statistik.js'
import { uploadRouter } from './routes/upload.js'

export function buatApp() {
  const app = express()

  app.disable('x-powered-by')
  app.use(
    cors({
      // `origin` kosong terjadi pada permintaan same-origin dan curl —
      // keduanya bukan permintaan lintas situs, jadi diteruskan saja.
      origin: (origin, cb) =>
        !origin || corsOrigins.includes(origin)
          ? cb(null, true)
          : cb(new Error(`Origin ${origin} tidak diizinkan.`)),
    }),
  )
  app.use(express.json({ limit: '2mb' }))

  // Gambar unggahan dilayani langsung oleh Supabase Storage lewat URL
  // publiknya, jadi backend ini tidak menyajikan berkas statis sama sekali.

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, waktu: new Date().toISOString() })
  })

  app.use('/api/auth', authRouter)
  app.use('/api/berita', beritaRouter)
  app.use('/api/galeri', galeriRouter)
  app.use('/api/statistik', statistikRouter)
  app.use('/api/upload', uploadRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
