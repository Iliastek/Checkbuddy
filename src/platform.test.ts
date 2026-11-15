import { test, expect } from 'vitest'
import { detectPlatform, looksLikeUrl } from './platform'

// Schreibt das AKTUELLE Verhalten der Plattform-Erkennung und Link-Prüfung fest.

test('detectPlatform erkennt die bekannten Plattformen', () => {
  expect(detectPlatform('https://www.tiktok.com/@user/video/123')).toBe('tiktok')
  expect(detectPlatform('https://www.instagram.com/reel/abc/')).toBe('instagram')
  expect(detectPlatform('https://www.youtube.com/watch?v=abc')).toBe('youtube')
  expect(detectPlatform('https://youtu.be/abc')).toBe('youtube')
})

test('detectPlatform liefert unknown für andere URLs', () => {
  expect(detectPlatform('https://example.com/foo')).toBe('unknown')
})

test('looksLikeUrl akzeptiert plausible Links (auch ohne Schema)', () => {
  expect(looksLikeUrl('https://youtu.be/abc')).toBe(true)
  expect(looksLikeUrl('tiktok.com/@user/video/123')).toBe(true)
})

test('looksLikeUrl lehnt leeren Text, Text ohne Punkt und Text mit Leerzeichen ab', () => {
  expect(looksLikeUrl('')).toBe(false)
  expect(looksLikeUrl('justtext')).toBe(false)
  expect(looksLikeUrl('hello world')).toBe(false)
})
