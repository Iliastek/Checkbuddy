import { useCallback, useState } from 'react'

// Einfaches Punkte-/Motivations-System. Für den Prototyp reicht der Browser-
// Speicher (localStorage) – kein Backend/Account nötig. Jeder geprüfte Link
// bringt Punkte; ab bestimmten Schwellen steigt das „Level“.

const STORAGE_KEY = 'checkbuddy.points'
export const POINTS_PER_CHECK = 10

function readPoints(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const n = raw ? parseInt(raw, 10) : 0
    return Number.isFinite(n) && n >= 0 ? n : 0
  } catch {
    return 0
  }
}

/** Level aus Punkten ableiten (alle 50 Punkte ein Level). */
export function levelForPoints(points: number): number {
  return Math.floor(points / 50) + 1
}

export function usePoints() {
  const [points, setPoints] = useState<number>(() => readPoints())

  const addPoints = useCallback((amount = POINTS_PER_CHECK) => {
    setPoints((prev) => {
      const next = prev + amount
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        // Speichern optional – ignorieren, falls localStorage blockiert ist.
      }
      return next
    })
  }, [])

  return { points, addPoints, level: levelForPoints(points) }
}
