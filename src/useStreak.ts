import { useCallback, useState } from 'react'

// Streak-System zur Motivation: Anzahl aufeinanderfolgender TAGE mit
// mindestens einer Prüfung. Wird ein Tag ausgelassen, startet der Streak neu.
// Für den Prototyp reicht der Browser-Speicher (localStorage) – kein Backend.

const STREAK_KEY = 'checkbuddy.streak'
const LASTDAY_KEY = 'checkbuddy.lastCheckDay'

/** Lokales Datum als YYYY-MM-DD (nicht UTC, damit der Tageswechsel lokal stimmt). */
function dayStr(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function yesterdayStr(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return dayStr(d)
}

function readNumber(key: string): number {
  try {
    const n = parseInt(localStorage.getItem(key) ?? '', 10)
    return Number.isFinite(n) && n >= 0 ? n : 0
  } catch {
    return 0
  }
}

function readLastDay(): string {
  try {
    return localStorage.getItem(LASTDAY_KEY) ?? ''
  } catch {
    return ''
  }
}

/** Streak ist nur „aktiv“, wenn zuletzt heute oder gestern geprüft wurde. */
function activeStreak(): number {
  const last = readLastDay()
  if (last === dayStr() || last === yesterdayStr()) return readNumber(STREAK_KEY)
  return 0
}

function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Speichern optional – ignorieren, falls localStorage blockiert ist.
  }
}

export function useStreak() {
  const [streak, setStreak] = useState<number>(() => activeStreak())

  /**
   * Eine abgeschlossene Prüfung verbuchen. Gibt zurück, ob der Streak dadurch
   * gewachsen ist (true = neuer Tag gezählt, für einen kleinen Belohnungseffekt).
   */
  const registerCheck = useCallback((): boolean => {
    const today = dayStr()
    const last = readLastDay()

    let nextStreak: number
    let grew: boolean
    if (last === today) {
      nextStreak = readNumber(STREAK_KEY) || 1 // heute schon gezählt – unverändert
      grew = false
    } else if (last === yesterdayStr()) {
      nextStreak = readNumber(STREAK_KEY) + 1 // Folgetag – Streak wächst
      grew = true
    } else {
      nextStreak = 1 // Lücke (oder erster Check) – Streak startet neu
      grew = true
    }

    save(STREAK_KEY, String(nextStreak))
    save(LASTDAY_KEY, today)
    setStreak(nextStreak)
    return grew
  }, [])

  return { streak, registerCheck }
}
