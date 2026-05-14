# kickwise.striker

SvelteKit-Frontend für Kickwise.

## Stack

- SvelteKit 2 mit Svelte 5 Runes
- Tailwind CSS 4
- Vite 7
- Vitest (unit), Playwright (e2e)
- Adapter: `@sveltejs/adapter-static` → statisches Output für Cloud Storage Hosting

## Routen

| Pfad | Zweck |
|------|-------|
| `/` | Redirect: authenticated → `/matchday`, sonst → `/login` |
| `/login` | E-Mail/Passwort-Form, ruft Playmaker `POST /api/v1/auth/login` |
| `/matchday` | Lädt aktuellen Spieltag, redirected zu `/matchday/[N]` |
| `/matchday/[matchday]` | Match-Cards für den Spieltag |
| `/league` | Tabelle der eigenen Kickbase-Liga |
| `/squad` | Eigener Kader, gruppiert nach Position |

## Auth-Verhalten

- `+layout.svelte` ruft beim Mount `authStore.refresh()` → `GET /api/v1/auth/me`
- Bei `401` redirected die App nach `/login`
- Sessions sind ein HttpOnly-Cookie `kickwise_token` vom Playmaker — kein localStorage

## Lokal starten

Voraussetzung: parallel laufende Playmaker (`http://localhost:3000`) und Winger (`http://localhost:3001`).

```bash
cp .env.example .env.local    # optional, falls VITE_API_URL überschrieben werden soll
npm install
npm run dev                   # http://localhost:5173
```

Der Vite-Dev-Server proxied `/api/*` nach `localhost:3000`, sodass die Cookies sauber gesetzt werden können.

## Tests

```bash
npm run test:run    # Vitest (unit)
npm run test:e2e    # Playwright
npm run check       # svelte-check + biome
```

## Build

```bash
npm run build       # → build/ (statische Dateien für Cloud Storage)
npm run preview     # lokales Anschauen des Builds
```
