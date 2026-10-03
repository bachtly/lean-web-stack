import { useState, type FormEvent } from 'react'
import { readSse } from './sse'

type Msg = { role: 'user' | 'assistant'; text: string; tools: string[] }

export function ChatPanel() {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)

  async function send(e: FormEvent) {
    e.preventDefault()
    const message = input
    setInput('')
    setBusy(true)
    setMsgs((m) => [...m, { role: 'user', text: message, tools: [] }, { role: 'assistant', text: '', tools: [] }])
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })
    if (!res.ok || !res.body) {
      setBusy(false)
      return
    }
    for await (const ev of readSse(res.body)) {
      setMsgs((m) => {
        const last = { ...m[m.length - 1] }
        if (ev.type === 'delta') last.text += ev.text
        if (ev.type === 'tool') last.tools = [...last.tools, ev.name]
        return [...m.slice(0, -1), last]
      })
    }
    setBusy(false)
  }

  return (
    <section>
      <h2>Chat</h2>
      {msgs.map((m, i) => (
        <p key={i}>
          <b>{m.role}:</b> {m.tools.map((t) => `[tool ${t}] `)}
          {m.text}
        </p>
      ))}
      <form onSubmit={send}>
        <input aria-label="message" value={input} onChange={(e) => setInput(e.target.value)} />
        <button disabled={busy || !input}>Send</button>
      </form>
    </section>
  )
}
