import { ArrowRight, BookOpen, LockKeyhole } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { api, session } from '../lib/api'
import type { User } from '../types'

type Props = {
  onAuthenticated: (user: User) => void
}

export function AuthScreen({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = mode === 'login'
        ? await api.login({ email, password })
        : await api.register({ name, email, password })
      session.setToken(result.token)
      onAuthenticated(result.user)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to continue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-intro">
        <div className="brand-lockup">
          <div className="brand-mark"><BookOpen size={18} /></div>
          <div><strong>KOUDE</strong><span>LIBRARY</span></div>
        </div>
        <div className="auth-copy">
          <p className="eyebrow">LOCAL READING SYSTEM</p>
          <h1>Your books.<br />Nothing else.</h1>
          <p>Keep a quiet, searchable record of what you want to read, what you are reading, and what stayed with you.</p>
        </div>
        <div className="local-note">
          <LockKeyhole size={16} />
          <span>Stored locally on this computer</span>
        </div>
      </section>

      <section className="auth-panel">
        <form className="auth-form" onSubmit={submit}>
          <div>
            <p className="eyebrow">WELCOME TO KOUDE</p>
            <h2>{mode === 'login' ? 'Open your library' : 'Create your library'}</h2>
            <p className="muted">{mode === 'login' ? 'Sign in to continue where you left off.' : 'Your account stays inside the local database.'}</p>
          </div>

          {mode === 'register' && (
            <label>
              Name
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Anton" required minLength={2} />
            </label>
          )}

          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
          </label>

          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" required minLength={6} />
          </label>

          {error && <div className="form-error">{error}</div>}

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Opening…' : mode === 'login' ? 'Open library' : 'Create account'}
            {!loading && <ArrowRight size={17} />}
          </button>

          <button
            className="text-button"
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setError('')
            }}
          >
            {mode === 'login' ? 'No account yet? Create one' : 'Already have an account? Sign in'}
          </button>
        </form>
      </section>
    </main>
  )
}
