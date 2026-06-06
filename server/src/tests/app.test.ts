import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import type { Express } from 'express'

let app: Express
let token = ''

beforeAll(async () => {
  process.env.DATABASE_PATH = ':memory:'
  process.env.JWT_SECRET = 'test-secret'
  const module = await import('../app.js')
  app = module.createApp()
})

describe('Koude Library API', () => {
  it('reports health', async () => {
    const response = await request(app).get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'ok', service: 'koude-library-api' })
  })

  it('registers a local user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Anton', email: 'anton@example.com', password: 'library123' })

    expect(response.status).toBe(201)
    expect(response.body.user.email).toBe('anton@example.com')
    expect(response.body.token).toBeTypeOf('string')
    token = response.body.token
  })

  it('rejects protected routes without a session', async () => {
    const response = await request(app).get('/api/books')

    expect(response.status).toBe(401)
  })

  it('creates and lists a book', async () => {
    const created = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Fahrenheit 451',
        author: 'Ray Bradbury',
        year: 1953,
        genre: 'Dystopian fiction',
        status: 'reading',
        rating: 4,
        progress: 38,
        notes: 'First local library entry.'
      })

    expect(created.status).toBe(201)
    expect(created.body.book.title).toBe('Fahrenheit 451')

    const listed = await request(app)
      .get('/api/books?status=reading')
      .set('Authorization', `Bearer ${token}`)

    expect(listed.status).toBe(200)
    expect(listed.body.books).toHaveLength(1)
    expect(listed.body.books[0].progress).toBe(38)
  })

  it('updates statistics after adding a book', async () => {
    const response = await request(app)
      .get('/api/books/stats')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.total).toBe(1)
    expect(response.body.reading).toBe(1)
    expect(response.body.averageRating).toBe(4)
  })
})
