import { useEffect, useState } from 'react'
import { AuthScreen } from './components/AuthScreen'
import { Sidebar } from './components/Sidebar'
import { LibraryDashboard } from './components/LibraryDashboard'
import { api, session } from './lib/api'
import type { User } from './types'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [activeView, setActiveView] = useState<'overview' | 'library'>('overview')
  const [formOpen, setFormOpen] = useState(false)

  useEffect(() => {
    if (!session.getToken()) {
      setCheckingSession(false)
      return
    }

    api.me()
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch(() => session.clear())
      .finally(() => setCheckingSession(false))
  }, [])

  if (checkingSession) {
    return <div className="app-loader"><div className="loader-mark">K</div><span>Opening library</span></div>
  }

  if (!user) {
    return <AuthScreen onAuthenticated={setUser} />
  }

  return (
    <div className="app-shell">
      <Sidebar
        user={user}
        activeView={activeView}
        onViewChange={setActiveView}
        onAdd={() => { setActiveView('library'); setFormOpen(true) }}
        onLogout={() => {
          session.clear()
          setUser(null)
        }}
      />
      <main className="workspace">
        <header className="page-header">
          <div><p className="eyebrow">PERSONAL COLLECTION</p><h1>{activeView === 'overview' ? 'Reading overview' : 'Your library'}</h1></div>
          <div className="header-meta"><span>LOCAL</span><strong>{new Date().toLocaleDateString('en', { month: 'short', day: 'numeric' })}</strong></div>
        </header>
        <LibraryDashboard view={activeView} formOpen={formOpen} onFormOpenChange={setFormOpen} />
      </main>
    </div>
  )
}

export default App
