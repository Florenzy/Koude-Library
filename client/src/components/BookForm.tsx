import { FormEvent, useEffect, useState } from 'react'
import { ArrowRight, X } from 'lucide-react'
import type { Book, BookInput, BookStatus } from '../types'

type Props = {
  book: Book | null
  onClose: () => void
  onSubmit: (input: BookInput) => Promise<void>
}

const emptyBook: BookInput = {
  title: '',
  author: '',
  year: null,
  genre: '',
  status: 'want',
  rating: 0,
  progress: 0,
  notes: ''
}

export function BookForm({ book, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<BookInput>(emptyBook)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setForm(book ? {
      title: book.title,
      author: book.author,
      year: book.year,
      genre: book.genre ?? '',
      status: book.status,
      rating: book.rating,
      progress: book.progress,
      notes: book.notes
    } : emptyBook)
    setError('')
  }, [book])

  function patch<K extends keyof BookInput>(key: K, value: BookInput[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      await onSubmit({
        ...form,
        progress: form.status === 'finished' ? 100 : form.progress
      })
      onClose()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to save book')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="book-drawer">
        <div className="drawer-header">
          <div><p className="eyebrow">{book ? 'EDIT ENTRY' : 'NEW ENTRY'}</p><h2>{book ? 'Update book' : 'Add to library'}</h2></div>
          <button className="icon-button drawer-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form className="book-form" onSubmit={submit}>
          <label className="field-wide">
            Title
            <input value={form.title} onChange={(event) => patch('title', event.target.value)} placeholder="The Left Hand of Darkness" required />
          </label>
          <label className="field-wide">
            Author
            <input value={form.author} onChange={(event) => patch('author', event.target.value)} placeholder="Ursula K. Le Guin" required />
          </label>
          <label>
            Year
            <input
              type="number"
              min="0"
              max={new Date().getFullYear() + 5}
              value={form.year ?? ''}
              onChange={(event) => patch('year', event.target.value ? Number(event.target.value) : null)}
              placeholder="1969"
            />
          </label>
          <label>
            Genre
            <input value={form.genre} onChange={(event) => patch('genre', event.target.value)} placeholder="Science fiction" />
          </label>
          <label className="field-wide">
            Reading status
            <div className="segmented-control">
              {(['want', 'reading', 'finished'] as BookStatus[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  className={form.status === status ? 'active' : ''}
                  onClick={() => patch('status', status)}
                >
                  {status === 'want' ? 'Want to read' : status === 'reading' ? 'Reading' : 'Finished'}
                </button>
              ))}
            </div>
          </label>

          {form.status === 'reading' && (
            <label className="field-wide range-field">
              <div><span>Progress</span><strong>{form.progress}%</strong></div>
              <input type="range" min="0" max="100" value={form.progress} onChange={(event) => patch('progress', Number(event.target.value))} />
            </label>
          )}

          <label className="field-wide range-field">
            <div><span>Rating</span><strong>{form.rating ? `${form.rating}/5` : '—'}</strong></div>
            <input type="range" min="0" max="5" value={form.rating} onChange={(event) => patch('rating', Number(event.target.value))} />
          </label>

          <label className="field-wide">
            Notes
            <textarea value={form.notes} onChange={(event) => patch('notes', event.target.value)} placeholder="A thought worth keeping…" rows={5} />
          </label>

          {error && <div className="form-error field-wide">{error}</div>}

          <div className="drawer-actions field-wide">
            <button className="secondary-button" type="button" onClick={onClose}>Cancel</button>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? 'Saving…' : book ? 'Save changes' : 'Add book'}
              {!saving && <ArrowRight size={16} />}
            </button>
          </div>
        </form>
      </aside>
    </div>
  )
}
