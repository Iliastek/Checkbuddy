import { useState } from 'react'
import { looksLikeUrl } from '../factCheck'

interface Props {
  onCheck: (url: string) => void
  loading: boolean
}

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
          placeholder="Link zu TikTok oder Reel einfügen…"
          disabled={loading}
          className="flex-1 rounded-2xl border border-black/5 bg-[#f4f6fb] px-5 py-3.5 text-[var(--heading)] outline-none transition placeholder:text-[var(--muted)] focus:ring-2 focus:ring-[var(--primary)]/25 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-7 py-3.5 font-semibold text-white shadow-lg shadow-[var(--primary)]/25 transition hover:bg-[var(--primary-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Prüfe…
            </>
          ) : (
            'Prüfen'
          )}
        </button>
      </div>

      {touched && !valid && (
        <p className="mt-2 pl-1 text-sm text-rose-500">Bitte einen gültigen Link einfügen.</p>
      )}
    </form>
  )
}
