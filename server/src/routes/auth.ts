import bcrypt from 'bcryptjs'
import { Router } from 'express'
import { z } from 'zod'
import { createToken } from '../lib/auth.js'
import { db } from '../lib/db.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()

const credentialsSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(6).max(128)
})

const registerSchema = credentialsSchema.extend({
  name: z.string().trim().min(2).max(60)
})

type UserRow = {
  id: number
  name: string
  email: string
  password_hash: string
  created_at: string
}

router.post('/register', async (request, response) => {
  const parsed = registerSchema.safeParse(request.body)

  if (!parsed.success) {
    response.status(400).json({ message: 'Invalid registration data', issues: parsed.error.flatten() })
    return
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(parsed.data.email)

  if (existing) {
    response.status(409).json({ message: 'An account with this email already exists' })
    return
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10)
  const result = db
    .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    .run(parsed.data.name, parsed.data.email, passwordHash)

  const userId = Number(result.lastInsertRowid)
  const token = createToken({ userId, email: parsed.data.email })

  response.status(201).json({
    token,
    user: {
      id: userId,
      name: parsed.data.name,
      email: parsed.data.email
    }
  })
})

router.post('/login', async (request, response) => {
  const parsed = credentialsSchema.safeParse(request.body)

  if (!parsed.success) {
    response.status(400).json({ message: 'Invalid email or password' })
    return
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(parsed.data.email) as UserRow | undefined

  if (!user || !(await bcrypt.compare(parsed.data.password, user.password_hash))) {
    response.status(401).json({ message: 'Invalid email or password' })
    return
  }

  const token = createToken({ userId: user.id, email: user.email })

  response.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  })
})

router.get('/me', requireAuth, (request, response) => {
  const user = db
    .prepare('SELECT id, name, email, created_at FROM users WHERE id = ?')
    .get(request.user!.userId)

  if (!user) {
    response.status(404).json({ message: 'User not found' })
    return
  }

  response.json({ user })
})

export default router
