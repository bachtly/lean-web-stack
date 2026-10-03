import { useState } from 'react'
import type { components } from '../../api/schema'
import { summariseNote } from './summary'

type Note = components['schemas']['NoteOut']

export function NoteItem({ note, onChanged }: { note: Note; onChanged: () => void }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSummarise() {
    setPending(true)
    setError(null)
    try {
      await summariseNote(note.id)
      onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Summary failed')
    } finally {
      setPending(false)
    }
  }

  return (
    <li>
      <strong>{note.title}</strong>
      <p>{note.body}</p>
      <small>{new Date(note.created_at).toLocaleString()}</small>{' '}
      <button onClick={onSummarise} disabled={pending} aria-busy={pending}>
        {pending ? 'Summarising…' : 'Summarise'}
      </button>
      {error && <p role="alert">{error}</p>}
      {note.summary && (
        <div>
          <em>{note.summary}</em> <span>({note.sentiment})</span>
          <div>
            {note.tags?.map((t) => (
              <span key={t} className="chip" style={{ border: '1px solid #999', borderRadius: 12, padding: '0 8px', marginRight: 4 }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </li>
  )
}
