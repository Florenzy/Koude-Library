import { BookOpen, LibraryBig, LogOut, Plus, Settings, WifiOff } from 'lucide-react'
import type { User } from '../types'

type Props = {
  user: User
  activeView: 'overview' | 'library'
  onViewChange: (view: 'overview' | 'library') => void
  onAdd: () => void
  onLogout: () => void
}

export function Sidebar({ user, activeView, onViewChange, onAdd, onLogout }: Props) {
  return (
    <aside className="sidebar">
      <div className="brand-lockup compact">
        <div className="brand-mark"><BookOpen size={17} /></div>
        <div><strong>KOUDE</strong><span>LIBRARY</span></div>
      </div>

      <nav className="nav-list">
        <button className={activeView === 'overview' ? 'active' : ''} onClick={() => onViewChange('overview')}>
          <LibraryBig size={17} /> Overview
        </button>
        <button className={activeView === 'library' ? 'active' : ''} onClick={() => onViewChange('library')}>
          <BookOpen size={17} /> Library
        </button>
        <button onClick={onAdd}><Plus size={17} /> Add book</button>
      </nav>

      <div className="sidebar-spacer" />

      <div className="local-status">
        <div className="status-dot" />
        <div><strong>Local database</strong><span><WifiOff size={12} /> No cloud sync</span></div>
      </div>

      <div className="profile-card">
        <div className="avatar">{user.name.slice(0, 1).toUpperCase()}</div>
        <div className="profile-copy"><strong>{user.name}</strong><span>{user.email}</span></div>
        <button className="icon-button" aria-label="Log out" onClick={onLogout}><LogOut size={16} /></button>
      </div>

      <button className="settings-button" disabled><Settings size={15} /> Settings <span>soon</span></button>
    </aside>
  )
}
