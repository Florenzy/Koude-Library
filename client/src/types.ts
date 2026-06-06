export type User = {
  id: number
  name: string
  email: string
}

export type BookStatus = 'want' | 'reading' | 'finished'

export type Book = {
  id: number
  title: string
  author: string
  year: number | null
  genre: string | null
  status: BookStatus
  rating: number
  progress: number
  notes: string
  createdAt: string
  updatedAt: string
}

export type BookInput = {
  title: string
  author: string
  year: number | null
  genre: string
  status: BookStatus
  rating: number
  progress: number
  notes: string
}

export type LibraryStats = {
  total: number
  reading: number
  finished: number
  want: number
  averageRating: number
}
