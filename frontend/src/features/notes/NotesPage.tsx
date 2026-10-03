import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../../api/client'
import type { components } from '../../api/schema'
import { NoteItem } from './NoteItem'

export type Note = components['schemas']['NoteOut']

export function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [version, setVersion] = useState(0)

  useEffect(() => {
    api
      .GET('/api/notes')
      .then(({ data }) => setNotes(data ?? []))
      .catch(() => setError('Could not load notes'))
  }, [version])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const { error: err, response } = await api.POST('/api/notes', { body: { title, body } })
    if (err) {
      setError(`Could not save (${response.status})`)
      return
    }
    setError(null)
    setTitle('')
    setBody('')
    setVersion((v) => v + 1)
  }

  return (
    <section>
      <h1>Notes ({notes.length})</h1>
      <form onSubmit={onSubmit}>
        <input aria-label="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
        <textarea aria-label="body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Body" />
        <button type="submit">Add note</button>
      </form>
      {error && <p role="alert">{error}</p>}
      <ul>
        {notes.map((n) => (
          <NoteItem key={n.id} note={n} onChanged={() => setVersion((v) => v + 1)} />
        ))}
      </ul>
    </section>
  )
}
