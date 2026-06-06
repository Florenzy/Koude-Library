import type { Book, BookInput, LibraryStats, User } from '../types'

const TOKEN_KEY = 'koude-library-token'

export const session = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY)
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = session.getToken()
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: 'Something went wrong' }))
    throw new Error(body.message ?? 'Something went wrong')
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const api = {
  register: (payload: { name: string; email: string; password: string }) =>
    request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  me: () => request<{ user: User }>('/api/auth/me'),
  books: (query = '') => request<{ books: Book[] }>(`/api/books${query}`),
  stats: () => request<LibraryStats>('/api/books/stats'),
  createBook: (payload: BookInput) =>
    request<{ book: Book }>('/api/books', { method: 'POST', body: JSON.stringify(payload) }),
  updateBook: (id: number, payload: Partial<BookInput>) =>
    request<{ book: Book }>(`/api/books/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteBook: (id: number) => request<void>(`/api/books/${id}`, { method: 'DELETE' })
}
