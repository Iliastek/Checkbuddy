import { test, expect } from 'vitest'
import { isMeaningfulText, cleanTranscript, buildAnalysisInput } from './content'

// Schreibt das AKTUELLE Verhalten der reinen Inhalts-Filter fest.

test('leerer Text ist nicht prüfbar', () => {
  expect(isMeaningfulText('')).toBe(false)
  expect(isMeaningfulText('   ')).toBe(false)
})

test('reiner Emoji-/Zeichen-Text ist nicht prüfbar (zu wenige Buchstaben)', () => {
  expect(isMeaningfulText('🔥🔥🔥 👍 ✨')).toBe(false)
})

test('stumpfe Wiederholung (Whisper-Halluzination) ist nicht prüfbar', () => {
  expect(isMeaningfulText('ha ha ha ha ha ha ha ha')).toBe(false)
})

test('normaler Satz ist prüfbar', () => {
  expect(isMeaningfulText('The earth orbits the sun once every year.')).toBe(true)
})

test('cleanTranscript entfernt Halluzinations-Credits', () => {
  expect(cleanTranscript('Untertitel im Auftrag des ZDF.')).toBe('')
  expect(cleanTranscript('Transcription by amara.org community.')).toBe('')
})

test('cleanTranscript behält normale Sätze neben einer Credit-Zeile', () => {
  expect(cleanTranscript('The earth orbits the sun. Untertitel im Auftrag des ZDF.')).toBe(
    'The earth orbits the sun.',
  )
})

test('cleanTranscript faltet unmittelbar wiederholte Sätze zusammen', () => {
  expect(cleanTranscript('The sky is blue. The sky is blue.')).toBe('The sky is blue.')
})

test('buildAnalysisInput ohne Transkript und ohne Beschreibung -> null', () => {
  expect(buildAnalysisInput('', undefined)).toBeNull()
})

test('buildAnalysisInput mit echter Sprache -> hasSpeech true', () => {
  const input = buildAnalysisInput('The earth orbits the sun once every year.', undefined)
  expect(input).not.toBeNull()
  expect(input?.hasSpeech).toBe(true)
  expect(input?.hasCaption).toBe(false)
})

test('buildAnalysisInput nur mit Beschreibung -> hasCaption true, hasSpeech false', () => {
  const input = buildAnalysisInput('', 'This clip explains how vaccines are tested for safety.')
  expect(input).not.toBeNull()
  expect(input?.hasSpeech).toBe(false)
  expect(input?.hasCaption).toBe(true)
})
