import { test, expect } from 'vitest'
import type { Claim, Verdict } from '../src/types'
import { computeTrustScore, deriveOverallVerdict } from './scoring'

// Diese Tests schreiben das AKTUELLE Verhalten fest (Schutznetz fürs Refactoring).
// Werte stammen direkt aus scoring.ts (VERDICT_BASE, Gewichtung mit 1,5x für Quellen).

/** Baut eine Test-Behauptung mit sinnvollen Defaults. */
function claim(partial: Partial<Claim> & { verdict: Verdict }): Claim {
  return {
    statement: 'irgendeine Aussage',
    explanation: '',
    evidence: '',
    confidence: 50,
    sources: [],
    ...partial,
  }
}

const SOURCE = { title: 'Quelle', url: 'https://example.com' }

test('leere Claim-Liste -> neutraler Score 50', () => {
  expect(computeTrustScore([])).toBe(50)
})

test('eine wahre Behauptung mit Quelle und hoher Confidence -> Score > 90', () => {
  const score = computeTrustScore([
    claim({ verdict: 'true', confidence: 100, sources: [SOURCE] }),
  ])
  expect(score).toBeGreaterThan(90)
  expect(score).toBe(100)
})

test('eine falsche Behauptung mit Quelle -> Score 0', () => {
  expect(computeTrustScore([claim({ verdict: 'false', confidence: 100, sources: [SOURCE] })])).toBe(0)
})

test('gleich gewichtete wahr/falsch-Behauptung -> Score 50', () => {
  const score = computeTrustScore([
    claim({ verdict: 'true', confidence: 50 }),
    claim({ verdict: 'false', confidence: 50 }),
  ])
  expect(score).toBe(50)
})

test('leere Liste -> Gesamturteil unverifiable', () => {
  expect(deriveOverallVerdict([], 50)).toBe('unverifiable')
})

test('alle Behauptungen unverifiable -> Gesamturteil unverifiable', () => {
  const claims = [claim({ verdict: 'unverifiable' }), claim({ verdict: 'unverifiable' })]
  expect(deriveOverallVerdict(claims, computeTrustScore(claims))).toBe('unverifiable')
})

test('Gesamturteil folgt den Score-Schwellen (70 / 40)', () => {
  const some = [claim({ verdict: 'true' })]
  expect(deriveOverallVerdict(some, 70)).toBe('true')
  expect(deriveOverallVerdict(some, 55)).toBe('misleading')
  expect(deriveOverallVerdict(some, 39)).toBe('false')
})
