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
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Link einfügen…"
          disabled={loading}
          className="flex-1 border border-black bg-white px-3 py-2.5 text-black outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-black/20 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 border border-black bg-black px-5 py-2.5 font-medium text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Prüfe…
            </>
          ) : (
            'Prüfen'
          )}
        </button>
      </div>

      {touched && !valid && (
        <p className="mt-2 text-sm">Bitte einen gültigen Link einfügen.</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
        <span>Beispiele:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setValue(ex)}
            disabled={loading}
            className="border border-black/20 px-2 py-1 font-mono transition hover:border-black disabled:opacity-50"
          >
            {ex}
          </button>
        ))}
      </div>
    </form>
  )
}
