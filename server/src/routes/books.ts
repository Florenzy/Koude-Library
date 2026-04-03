import { Router } from 'express'
import { z } from 'zod'
import { db } from '../lib/db.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()

router.use(requireAuth)

const bookSchema = z.object({
  title: z.string().trim().min(1).max(140),
  author: z.string().trim().min(1).max(100),
  year: z.number().int().min(0).max(new Date().getFullYear() + 5).nullable().optional(),
  genre: z.string().trim().max(60).nullable().optional(),
  status: z.enum(['want', 'reading', 'finished']).default('want'),
  rating: z.number().int().min(0).max(5).default(0),
  progress: z.number().int().min(0).max(100).default(0),
  notes: z.string().trim().max(3000).default('')
})

const updateBookSchema = bookSchema.partial()

function mapBook(row: Record<string, unknown>) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    year: row.year,
    genre: row.genre,
    status: row.status,
    rating: row.rating,
    progress: row.progress,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

router.get('/', (request, response) => {
  const userId = request.user!.userId
  const search = typeof request.query.q === 'string' ? request.query.q.trim() : ''
  const status = typeof request.query.status === 'string' ? request.query.status : 'all'
  const allowedStatuses = new Set(['all', 'want', 'reading', 'finished'])
  const normalizedStatus = allowedStatuses.has(status) ? status : 'all'
  const like = `%${search}%`

  const rows = db.prepare(`
    SELECT * FROM books
    WHERE user_id = ?
      AND (? = '' OR title LIKE ? OR author LIKE ? OR COALESCE(genre, '') LIKE ?)
      AND (? = 'all' OR status = ?)
    ORDER BY
      CASE status WHEN 'reading' THEN 0 WHEN 'want' THEN 1 ELSE 2 END,
      updated_at DESC,
      id DESC
  `).all(userId, search, like, like, like, normalizedStatus, normalizedStatus) as Record<string, unknown>[]

  response.json({ books: rows.map(mapBook) })
})

router.get('/stats', (request, response) => {
  const userId = request.user!.userId

  const counts = db.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'reading' THEN 1 ELSE 0 END) AS reading,
      SUM(CASE WHEN status = 'finished' THEN 1 ELSE 0 END) AS finished,
      SUM(CASE WHEN status = 'want' THEN 1 ELSE 0 END) AS want,
      ROUND(AVG(CASE WHEN rating > 0 THEN rating END), 1) AS average_rating
    FROM books
    WHERE user_id = ?
  `).get(userId) as Record<string, unknown>

  response.json({
    total: Number(counts.total ?? 0),
    reading: Number(counts.reading ?? 0),
    finished: Number(counts.finished ?? 0),
    want: Number(counts.want ?? 0),
    averageRating: counts.average_rating === null ? 0 : Number(counts.average_rating)
  })
})

router.post('/', (request, response) => {
  const parsed = bookSchema.safeParse(request.body)

  if (!parsed.success) {
    response.status(400).json({ message: 'Invalid book data', issues: parsed.error.flatten() })
    return
  }

  const book = parsed.data
  const result = db.prepare(`
    INSERT INTO books (user_id, title, author, year, genre, status, rating, progress, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    request.user!.userId,
    book.title,
    book.author,
    book.year ?? null,
    book.genre || null,
    book.status,
    book.rating,
    book.progress,
    book.notes
  )

  const row = db.prepare('SELECT * FROM books WHERE id = ? AND user_id = ?')
    .get(Number(result.lastInsertRowid), request.user!.userId) as Record<string, unknown>

  response.status(201).json({ book: mapBook(row) })
})

router.patch('/:id', (request, response) => {
  const id = Number(request.params.id)

  if (!Number.isInteger(id) || id <= 0) {
    response.status(400).json({ message: 'Invalid book id' })
    return
  }

  const parsed = updateBookSchema.safeParse(request.body)

  if (!parsed.success) {
    response.status(400).json({ message: 'Invalid book data', issues: parsed.error.flatten() })
    return
  }

  const current = db.prepare('SELECT * FROM books WHERE id = ? AND user_id = ?')
    .get(id, request.user!.userId) as Record<string, unknown> | undefined

  if (!current) {
    response.status(404).json({ message: 'Book not found' })
    return
  }

  const next = {
    title: parsed.data.title ?? current.title,
    author: parsed.data.author ?? current.author,
    year: parsed.data.year !== undefined ? parsed.data.year : current.year,
    genre: parsed.data.genre !== undefined ? parsed.data.genre : current.genre,
    status: parsed.data.status ?? current.status,
    rating: parsed.data.rating ?? current.rating,
    progress: parsed.data.progress ?? current.progress,
    notes: parsed.data.notes ?? current.notes
  }

  db.prepare(`
    UPDATE books
    SET title = ?, author = ?, year = ?, genre = ?, status = ?, rating = ?, progress = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `).run(
    next.title,
    next.author,
    next.year,
    next.genre,
    next.status,
    next.rating,
    next.progress,
    next.notes,
    id,
    request.user!.userId
  )

  const row = db.prepare('SELECT * FROM books WHERE id = ? AND user_id = ?')
    .get(id, request.user!.userId) as Record<string, unknown>

  response.json({ book: mapBook(row) })
})

router.delete('/:id', (request, response) => {
  const id = Number(request.params.id)

  if (!Number.isInteger(id) || id <= 0) {
    response.status(400).json({ message: 'Invalid book id' })
    return
  }

  const result = db.prepare('DELETE FROM books WHERE id = ? AND user_id = ?')
    .run(id, request.user!.userId)

  if (result.changes === 0) {
    response.status(404).json({ message: 'Book not found' })
    return
  }

  response.status(204).send()
})

export default router
