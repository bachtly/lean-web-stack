import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { NoteItem } from './NoteItem'
import * as summary from './summary'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const note = { id: 1, title: 'Sprint', body: 'Great review.', created_at: '2026-10-03T00:00:00Z' }

test('shows pending state, then asks the page to reload', async () => {
  let finish: () => void = () => {}
  vi.spyOn(summary, 'summariseNote').mockReturnValue(new Promise<void>((r) => (finish = r)))
  const onChanged = vi.fn()
  render(<NoteItem note={note} onChanged={onChanged} />)
  fireEvent.click(screen.getByRole('button', { name: 'Summarise' }))
  expect(await screen.findByRole('button', { name: 'Summarising…' })).toHaveProperty('disabled', true)
  finish()
  await screen.findByRole('button', { name: 'Summarise' })
  expect(onChanged).toHaveBeenCalledOnce()
})

test('renders summary chips and an inline error', async () => {
  vi.spyOn(summary, 'summariseNote').mockRejectedValue(new Error('Summary failed'))
  render(<NoteItem note={{ ...note, summary: 'Great review.', tags: ['sprint', 'review'], sentiment: 'positive' }} onChanged={() => {}} />)
  expect(screen.getByText('sprint')).toBeTruthy()
  expect(screen.getByText('review')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Summarise' }))
  expect((await screen.findByRole('alert')).textContent).toBe('Summary failed')
})
