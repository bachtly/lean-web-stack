import { ChatPanel } from './features/chat/ChatPanel'
import { NotesPage } from './features/notes/NotesPage'

export default function App() {
  return (
    <main style={{ maxWidth: 720, margin: '2rem auto', fontFamily: 'system-ui' }}>
      <NotesPage />
      <ChatPanel />
    </main>
  )
}
