import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../env.js'
import { unauthorized } from '../lib/errors.js'

export type TokenPayload = {
  sub: string
  username: string
  nama: string
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: TokenPayload
    }
  }
}

export function buatToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
}

/**
 * Menjaga seluruh endpoint tulis. Token dikirim lewat header
 * `Authorization: Bearer <token>`.
 */
export function wajibAdmin(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? ''
  const [skema, token] = header.split(' ')

  if (skema !== 'Bearer' || !token) {
    next(unauthorized('Perlu masuk sebagai admin.'))
    return
  }

  try {
    const data = jwt.verify(token, env.JWT_SECRET) as TokenPayload
    req.admin = data
    next()
  } catch {
    next(unauthorized('Sesi sudah berakhir. Silakan masuk lagi.'))
  }
}
