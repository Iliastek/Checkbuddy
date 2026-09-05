import type { CheckResult, Platform, Verdict } from './types'

// ---------------------------------------------------------------------------
// Fakten-Check-Logik.
//
// ACHTUNG: Im Prototyp erfindet diese Datei die Ergebnisse (Mock-Daten).
// Es wird NICHTS echt geprüft. Der Rest der App ruft nur `checkLink()` auf –
// wenn später ein echtes Backend kommt, muss nur diese Funktion einen
// `fetch()` an die API machen und das Ergebnis im selben Format zurückgeben.
// ---------------------------------------------------------------------------

/** Erkennt die Plattform anhand der URL. */
export function detectPlatform(url: string): Platform {
  const u = url.toLowerCase()
  if (u.includes('tiktok.com')) return 'tiktok'
  if (u.includes('instagram.com')) return 'instagram'
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube'
  return 'unknown'
}

/** Prüft grob, ob der Text wie ein Link aussieht. */
export function looksLikeUrl(value: string): boolean {
  const v = value.trim()
  if (!v) return false
  try {
    // Erlaubt Eingaben mit und ohne Protokoll.
    new URL(v.startsWith('http') ? v : `https://${v}`)
    return v.includes('.')
  } catch {
    return false
  }
}

/** Kleiner, stabiler Hash, damit derselbe Link immer dasselbe Mock-Ergebnis gibt. */
function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

// Ein paar vorgefertigte Beispiel-Ergebnisse, zwischen denen je nach Link
// gewechselt wird – damit sich der Prototyp lebendig anfühlt.
const SCENARIOS: Omit<CheckResult, 'url' | 'platform'>[] = [
  {
    transcript:
      '„Wissenschaftler haben bewiesen, dass man mit dieser einen Frucht in 3 Tagen 5 Kilo abnimmt – die Lebensmittelindustrie will das vor dir geheim halten.“',
    overallVerdict: 'false',
    overallSummary:
      'Das Video verbreitet eine typische Diät-Falschbehauptung. Es gibt keine Studie, die diesen Effekt belegt, und die „Verschwörung“ der Lebensmittelindustrie ist frei erfunden.',
    trustScore: 12,
    claims: [
      {
        statement: 'Man nimmt mit dieser Frucht in 3 Tagen 5 Kilo ab.',
        verdict: 'false',
        explanation:
          'Kein Lebensmittel bewirkt einen derart schnellen Fettabbau. Ein Verlust von 5 kg in 3 Tagen wäre fast nur Wasser, nicht Fett.',
        sources: [
          { title: 'DGE – Bewertung von Blitzdiäten', url: 'https://www.dge.de' },
          { title: 'NHS – The truth about crash diets', url: 'https://www.nhs.uk' },
        ],
      },
      {
        statement: 'Wissenschaftler haben diesen Effekt bewiesen.',
        verdict: 'false',
        explanation:
          'Es wird keine konkrete Studie genannt und es existiert keine peer-reviewte Forschung mit diesem Ergebnis.',
        sources: [{ title: 'PubMed – Suche nach Belegen', url: 'https://pubmed.ncbi.nlm.nih.gov' }],
      },
      {
        statement: 'Die Lebensmittelindustrie hält das geheim.',
        verdict: 'unverifiable',
        explanation:
          'Eine nicht belegbare Verschwörungsbehauptung. Solche „geheim gehalten“-Aussagen sind ein typisches Warnsignal für Falschinformation.',
        sources: [],
      },
    ],
  },
  {
    transcript:
      '„Die Große Mauer in China ist das einzige von Menschen gebaute Objekt, das man vom Mond aus sehen kann.“',
    overallVerdict: 'misleading',
    overallSummary:
      'Ein weit verbreiteter Mythos. Die Aussage klingt plausibel, ist aber falsch – mit bloßem Auge ist die Mauer vom Mond aus nicht zu erkennen.',
    trustScore: 34,
    claims: [
      {
        statement: 'Die Chinesische Mauer ist vom Mond aus mit bloßem Auge sichtbar.',
        verdict: 'false',
        explanation:
          'Aus der Mondentfernung (~384.000 km) ist die schmale Mauer unmöglich mit bloßem Auge erkennbar. Auch die NASA hat das mehrfach klargestellt.',
        sources: [
          { title: 'NASA – Great Wall from Space', url: 'https://www.nasa.gov' },
          { title: 'Scientific American', url: 'https://www.scientificamerican.com' },
        ],
      },
      {
        statement: 'Es ist das einzige menschengemachte Objekt aus dem All.',
        verdict: 'false',
        explanation:
          'Aus niedriger Erdumlaufbahn sind viele Bauwerke (Städte, Flughäfen, Straßen) sichtbar – die Mauer ist da sogar schwerer zu sehen.',
        sources: [{ title: 'ESA – Sichtbarkeit aus dem Orbit', url: 'https://www.esa.int' }],
      },
    ],
  },
  {
    transcript:
      '„Trinke jeden Morgen ein Glas Wasser auf nüchternen Magen – das kann deine Verdauung und Konzentration unterstützen.“',
    overallVerdict: 'true',
    overallSummary:
      'Die Kernaussage ist grundsätzlich vernünftig und unproblematisch. Ausreichend Flüssigkeit ist gesund – die Formulierung bleibt vorsichtig („kann unterstützen“) und übertreibt nicht.',
    trustScore: 82,
    claims: [
      {
        statement: 'Am Morgen Wasser zu trinken unterstützt die Flüssigkeitszufuhr.',
        verdict: 'true',
        explanation:
          'Nach dem Schlaf ist der Körper leicht dehydriert; Wasser gleicht das aus. Das ist gesundheitlich unstrittig.',
        sources: [
          { title: 'DGE – Trinken und Wasserhaushalt', url: 'https://www.dge.de' },
          { title: 'Harvard T.H. Chan – Water', url: 'https://www.hsph.harvard.edu' },
        ],
      },
      {
        statement: 'Es kann Verdauung und Konzentration unterstützen.',
        verdict: 'misleading',
        explanation:
          'Vorsichtig formuliert korrekt: Dehydrierung verschlechtert die Konzentration. „Heilende“ Wunder sollte man daraus aber nicht ableiten.',
        sources: [{ title: 'European Journal of Nutrition', url: 'https://link.springer.com' }],
      },
    ],
  },
  {
    transcript:
      '„5G-Masten schwächen dein Immunsystem und sind der wahre Grund für viele Krankheiten – die Studien dazu werden unterdrückt.“',
    overallVerdict: 'false',
    overallSummary:
      'Klassische Gesundheits-Desinformation. Es gibt keinen wissenschaftlichen Beleg dafür, dass 5G das Immunsystem schwächt oder Krankheiten auslöst.',
    trustScore: 8,
    claims: [
      {
        statement: '5G schwächt das Immunsystem.',
        verdict: 'false',
        explanation:
          '5G nutzt nicht-ionisierende Strahlung weit unterhalb schädlicher Schwellenwerte. Kein anerkannter Beleg für eine Immunwirkung existiert.',
        sources: [
          { title: 'WHO – 5G und Gesundheit', url: 'https://www.who.int' },
          { title: 'Bundesamt für Strahlenschutz', url: 'https://www.bfs.de' },
        ],
      },
      {
        statement: 'Die Studien dazu werden unterdrückt.',
        verdict: 'unverifiable',
        explanation:
          'Eine nicht belegbare Unterdrückungs-Behauptung – ein typisches Muster von Verschwörungserzählungen.',
        sources: [],
      },
    ],
  },
]

/** Simulierte Wartezeit, damit sich das „Analysieren“ echt anfühlt. */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Prüft einen Link und liefert ein Ergebnis.
 *
 * PROTOTYP: erfundene Mock-Daten. Signatur bleibt gleich, wenn später ein
 * echtes Backend dahinterkommt.
 */
export async function checkLink(url: string): Promise<CheckResult> {
  await delay(1600)

  const scenario = SCENARIOS[hash(url) % SCENARIOS.length]
  return {
    url,
    platform: detectPlatform(url),
    ...scenario,
  }
}

// --- Anzeige-Helfer -------------------------------------------------------

export const VERDICT_LABEL: Record<Verdict, string> = {
  true: 'Wahr',
  misleading: 'Irreführend',
  false: 'Falsch',
  unverifiable: 'Nicht überprüfbar',
}

export const PLATFORM_LABEL: Record<Platform, string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  youtube: 'YouTube',
  unknown: 'Unbekannte Quelle',
}
