import cors from 'cors'
import express from 'express'
import authRouter from './routes/auth.js'
import booksRouter from './routes/books.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json({ limit: '1mb' }))

  app.use('/api/auth', authRouter)
  app.use('/api/books', booksRouter)

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok', service: 'koude-library-api' })
  })

  app.use((_request, response) => {
    response.status(404).json({ message: 'Route not found' })
  })

  return app
}
