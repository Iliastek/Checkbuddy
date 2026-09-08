import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdtemp, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const execFileAsync = promisify(execFile)

export interface ExtractedContent {
  /** Pfad zur extrahierten Audiodatei (mp3). */
  audioPath: string
  /** Aufräum-Funktion – löscht das temporäre Verzeichnis. */
  cleanup: () => Promise<void>
  /** Titel/Beschreibung aus den Metadaten, falls vorhanden. */
  title?: string
  description?: string
}

/**
 * Lädt mit yt-dlp die Audiospur eines Video-Links herunter und wandelt sie
 * in eine mp3 um (dafür wird ffmpeg gebraucht).
 *
 * Wichtig: Die URL wird als eigenes Argument an execFile übergeben (kein
 * Shell-String), damit keine Shell-Injection möglich ist.
 */
export async function extractAudio(url: string): Promise<ExtractedContent> {
  const dir = await mkdtemp(join(tmpdir(), 'checkbuddy-'))
  const cleanup = () => rm(dir, { recursive: true, force: true })

  try {
    // 1) Metadaten (Titel/Beschreibung) holen – hilft dem Fact-Check als Kontext.
    let title: string | undefined
    let description: string | undefined
    try {
      const { stdout } = await execFileAsync('yt-dlp', [
        '--no-playlist',
        '--dump-json',
        '--skip-download',
        url,
      ])
      const meta = JSON.parse(stdout)
      title = meta.title
      description = meta.description
    } catch {
      // Metadaten sind optional – wenn das scheitert, geht es ohne weiter.
    }

    // 2) Audio herunterladen und in mp3 umwandeln.
    await execFileAsync(
      'yt-dlp',
      [
        '--no-playlist',
        '-x',
        '--audio-format',
        'mp3',
        '--audio-quality',
        '5',
        '-o',
        join(dir, 'audio.%(ext)s'),
        url,
      ],
      { maxBuffer: 1024 * 1024 * 10 },
    )

    // Die erzeugte mp3 im Temp-Ordner finden.
    const files = await readdir(dir)
    const mp3 = files.find((f) => f.endsWith('.mp3'))
    if (!mp3) {
      throw new Error('Es konnte keine Audiospur aus dem Link extrahiert werden.')
    }

    return { audioPath: join(dir, mp3), cleanup, title, description }
  } catch (err) {
    await cleanup()
    throw err
  }
}
