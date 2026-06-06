import { BarChart3, BookOpen, CheckCircle2, Plus, Search, Star, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import type { Book, BookInput, BookStatus, LibraryStats } from '../types'
import { BookCard } from './BookCard'
import { BookForm } from './BookForm'
import { StatCard } from './StatCard'

type Props = {
  view: 'overview' | 'library'
  formOpen: boolean
  onFormOpenChange: (open: boolean) => void
}

const emptyStats: LibraryStats = { total: 0, reading: 0, finished: 0, want: 0, averageRating: 0 }

export function LibraryDashboard({ view, formOpen, onFormOpenChange }: Props) {
  const [books, setBooks] = useState<Book[]>([])
  const [stats, setStats] = useState<LibraryStats>(emptyStats)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | BookStatus>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Book | null>(null)
  const [deleting, setDeleting] = useState<Book | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const params = new URLSearchParams()
    if (search.trim()) params.set('q', search.trim())
    if (status !== 'all') params.set('status', status)

    try {
      const [bookResult, statResult] = await Promise.all([
        api.books(params.toString() ? `?${params.toString()}` : ''),
        api.stats()
      ])
      setBooks(bookResult.books)
      setStats(statResult)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load library')
    } finally {
      setLoading(false)
    }
  }, [search, status])

  useEffect(() => {
    const timer = window.setTimeout(load, 180)
    return () => window.clearTimeout(timer)
  }, [load])

  async function saveBook(input: BookInput) {
    if (editing) {
      await api.updateBook(editing.id, input)
    } else {
      await api.createBook(input)
    }
    setEditing(null)
    await load()
  }

  async function deleteBook() {
    if (!deleting) return
    await api.deleteBook(deleting.id)
    setDeleting(null)
    await load()
  }

  const recentBooks = useMemo(() => books.slice(0, view === 'overview' ? 6 : books.length), [books, view])

  return (
    <>
      <section className="stats-grid">
        <StatCard label="ALL BOOKS" value={stats.total} note={`${stats.want} waiting on the shelf`} icon={BookOpen} />
        <StatCard label="READING NOW" value={stats.reading} note={stats.reading ? 'Keep the thread alive' : 'Nothing in progress'} icon={BarChart3} />
        <StatCard label="FINISHED" value={stats.finished} note="Books completed" icon={CheckCircle2} />
        <StatCard label="AVG. RATING" value={stats.averageRating ? stats.averageRating.toFixed(1) : '—'} note="Across rated books" icon={Star} />
      </section>

      <section className="library-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{view === 'overview' ? 'RECENT SHELF' : 'COLLECTION'}</p>
            <h2>{view === 'overview' ? 'Recently touched' : 'All books'}</h2>
          </div>
          <button className="primary-button add-button" onClick={() => { setEditing(null); onFormOpenChange(true) }}>
            <Plus size={16} /> Add book
          </button>
        </div>

        <div className="library-toolbar">
          <label className="search-box">
            <Search size={15} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, author, genre…" />
            {search && <button onClick={() => setSearch('')}><X size={13} /></button>}
          </label>
          <div className="filter-tabs">
            {(['all', 'reading', 'want', 'finished'] as const).map((filter) => (
              <button key={filter} className={status === filter ? 'active' : ''} onClick={() => setStatus(filter)}>
                {filter === 'all' ? 'All' : filter === 'want' ? 'Want to read' : filter[0].toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="inline-error">{error}<button onClick={load}>Try again</button></div>}

        {loading ? (
          <div className="books-grid skeleton-grid">{[1,2,3].map((value) => <div className="book-card skeleton-card" key={value} />)}</div>
        ) : recentBooks.length ? (
          <div className="books-grid">
            {recentBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onEdit={(selected) => { setEditing(selected); onFormOpenChange(true) }}
                onDelete={setDeleting}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-mark"><BookOpen size={24} /></div>
            <p className="eyebrow">EMPTY SHELF</p>
            <h3>{search || status !== 'all' ? 'No books match this view.' : 'Start with one book.'}</h3>
            <p>{search || status !== 'all' ? 'Change the search or filter to see the rest of your collection.' : 'Add the first title and Koude Library will build the rest around it.'}</p>
            {!search && status === 'all' && <button className="secondary-button" onClick={() => onFormOpenChange(true)}><Plus size={14} /> Add first book</button>}
          </div>
        )}
      </section>

      {formOpen && (
        <BookForm
          book={editing}
          onClose={() => { onFormOpenChange(false); setEditing(null) }}
          onSubmit={saveBook}
        />
      )}

      {deleting && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setDeleting(null)}>
          <div className="confirm-modal">
            <p className="eyebrow">REMOVE ENTRY</p>
            <h3>Delete “{deleting.title}”?</h3>
            <p>This only removes the book from your local library. The action cannot be undone.</p>
            <div><button className="secondary-button" onClick={() => setDeleting(null)}>Cancel</button><button className="danger-button" onClick={deleteBook}>Delete book</button></div>
          </div>
        </div>
      )}
    </>
  )
}
