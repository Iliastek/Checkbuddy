# Checkbuddy

Fakten-Check für Reels, TikToks & Shorts. Man fügt einen Link ein und Checkbuddy
prüft die Behauptungen im Video auf ihren Wahrheitsgehalt.

> **Status: Prototyp.** Diese Version ist eine reine React-Weboberfläche. Die
> Ergebnisse sind **simuliert** (Mock-Daten) – es wird noch nichts echt geprüft.
> Sie zeigt, wie sich die App anfühlen und aussehen soll.

## Tech-Stack

- **React 18** + **TypeScript**
- **Vite** als Build-Tool / Dev-Server
- **Tailwind CSS v4** fürs Styling

## Starten

```bash
npm install
npm run dev
```

Dann die angezeigte lokale Adresse (Standard: http://localhost:5173) im Browser öffnen.

Weitere Befehle:

```bash
npm run build     # Produktions-Build nach dist/
npm run preview   # Build lokal ansehen
```

## Projektstruktur

```
src/
├── App.tsx              # Haupt-Layout & Zustand (Eingabe → Ergebnis)
├── factCheck.ts         # Fakten-Check-Logik  ← HIER kommt später das echte Backend rein
├── types.ts             # Datentypen (Ergebnisformat)
├── verdictStyles.ts     # Farben/Icons pro Bewertung
└── components/
    ├── LinkForm.tsx     # Link-Eingabe + Button
    ├── ResultView.tsx   # Gesamturteil + Vertrauens-Score
    ├── ClaimCard.tsx    # Karte je Behauptung
    └── VerdictBadge.tsx # Farbiges Bewertungs-Etikett
```

## Wie es später „echt“ wird

Die ganze Prüf-Logik steckt gekapselt in [`src/factCheck.ts`](src/factCheck.ts) in der
Funktion `checkLink(url)`. Aktuell gibt sie Mock-Daten zurück. Für echtes Fact-Checking
muss nur diese Funktion einen Aufruf an ein Backend machen, das

1. den Video-Inhalt aus dem Link holt (Untertitel/Transkript),
2. die Behauptungen von einem KI-Modell prüfen lässt (idealerweise mit Websuche),
3. das Ergebnis im selben `CheckResult`-Format zurückgibt.

Die Oberfläche muss sich dafür **nicht** ändern.

## Fahrplan

- [x] Prototyp: Weboberfläche mit simulierten Ergebnissen
- [ ] Backend: Video-Inhalt aus Link extrahieren
- [ ] Echtes Fact-Checking per KI + Quellen
- [ ] Später: Mobile-App mit „Teilen“-Funktion aus TikTok/Instagram
