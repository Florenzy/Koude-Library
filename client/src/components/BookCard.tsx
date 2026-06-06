import { BookOpen, Check, MoreHorizontal, Pencil, Star, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { Book } from '../types'

type Props = {
  book: Book
  onEdit: (book: Book) => void
  onDelete: (book: Book) => void
}

const statusLabel = {
  want: 'Want to read',
  reading: 'Reading',
  finished: 'Finished'
}

export function BookCard({ book, onEdit, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const initials = book.title
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

  return (
    <article className="book-card">
      <div className="book-cover" data-status={book.status}>
        <span>KOUDE</span>
        <strong>{initials || 'BK'}</strong>
        <small>{book.genre || 'LIBRARY'}</small>
      </div>

      <div className="book-body">
        <div className="book-card-head">
          <div className={`status-chip ${book.status}`}>
            {book.status === 'finished' ? <Check size={11} /> : <BookOpen size={11} />}
            {statusLabel[book.status]}
          </div>
          <div className="book-menu-wrap">
            <button className="icon-button" aria-label="Book actions" onClick={() => setMenuOpen((value) => !value)}>
              <MoreHorizontal size={17} />
            </button>
            {menuOpen && (
              <div className="book-menu">
                <button onClick={() => { onEdit(book); setMenuOpen(false) }}><Pencil size={13} /> Edit</button>
                <button className="danger" onClick={() => { onDelete(book); setMenuOpen(false) }}><Trash2 size={13} /> Delete</button>
              </div>
            )}
          </div>
        </div>

        <div className="book-title-block">
          <h3>{book.title}</h3>
          <p>{book.author}{book.year ? ` · ${book.year}` : ''}</p>
        </div>

        <div className="book-card-footer">
          {book.status === 'reading' ? (
            <div className="progress-block">
              <div><span>Progress</span><strong>{book.progress}%</strong></div>
              <div className="progress-track"><span style={{ width: `${book.progress}%` }} /></div>
            </div>
          ) : (
            <div className="rating-row" aria-label={`${book.rating} out of 5 stars`}>
              {[1, 2, 3, 4, 5].map((value) => <Star key={value} size={13} fill={value <= book.rating ? 'currentColor' : 'none'} className={value <= book.rating ? 'filled' : ''} />)}
              <span>{book.rating ? `${book.rating}/5` : 'Not rated'}</span>
            </div>
          )}
          {book.genre && <span className="genre-label">{book.genre}</span>}
        </div>
      </div>
    </article>
  )
}
