import jwt from 'jsonwebtoken'

const secret = process.env.JWT_SECRET ?? 'koude-library-local-secret'

export type AuthToken = {
  userId: number
  email: string
}

export function createToken(payload: AuthToken) {
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

export function verifyToken(token: string) {
  return jwt.verify(token, secret) as AuthToken
}
