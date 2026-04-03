import type { NextFunction, Request, Response } from 'express'
import { verifyToken } from '../lib/auth.js'

export function requireAuth(request: Request, response: Response, next: NextFunction) {
  const header = request.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    response.status(401).json({ message: 'Authentication required' })
    return
  }

  try {
    request.user = verifyToken(header.slice(7))
    next()
  } catch {
    response.status(401).json({ message: 'Invalid or expired session' })
  }
}
