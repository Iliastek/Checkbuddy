import { useState } from 'react'
import { looksLikeUrl } from '../factCheck'

interface Props {
  onCheck: (url: string) => void
  loading: boolean
}

const EXAMPLES = [
  'https://www.tiktok.com/@user/video/123',
  'https://www.instagram.com/reel/abc',
  'https://youtube.com/shorts/xyz',
]

/** Eingabefeld für den Link plus „Prüfen“-Button. */
export default function LinkForm({ onCheck, loading }: Props) {
  const [value, setValue] = useState('')
  const [touched, setTouched] = useState(false)

  const valid = looksLikeUrl(value)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (valid && !loading) onCheck(value.trim())
  }

  return (
    <form onSubmit={submit} className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Link zu Reel, TikTok oder Short einfügen…"
          disabled={loading}
          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Prüfe…
            </>
          ) : (
            'Fakten prüfen'
          )}
        </button>
      </div>

      {touched && !valid && (
        <p className="mt-2 text-sm text-red-500">Bitte einen gültigen Link einfügen.</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <span>Beispiele:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setValue(ex)}
            disabled={loading}
            className="rounded-md bg-slate-100 px-2 py-1 font-mono transition hover:bg-slate-200 disabled:opacity-60 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            {ex}
          </button>
        ))}
      </div>
    </form>
  )
}
