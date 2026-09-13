# FactHunter

[![CI](https://github.com/reidarkind/facthunter/actions/workflows/ci.yml/badge.svg)](https://github.com/reidarkind/facthunter/actions/workflows/ci.yml)

Speid kartet etter kunnskap i det fjerne. Når du er nær, pek kameraet, se Wikipedia-steder som skilt i gata, lås dem opp og samle dem på telefonen.

<p align="center">
  <img src="public/icon.png" alt="FactHunter-ikon" width="128" height="128" />
</p>

FactHunter er et tynt lag over Wikipedia GeoSearch — ikke et lukket spill. Jakten virker overalt Wikipedia har koordinater. Ingen konto, ingen backend og ingen sky: samlingen ligger i IndexedDB i den nettleseren på den telefonen.

**Live:** [reidarkind.github.io/facthunter](https://reidarkind.github.io/facthunter/)

## Funksjoner

- **Rekognoser** — startsiden. Låst kart med 2 km tåke-sirkel. Prikkene viser at noe er i nærheten, ikke hva. En kile viser hvor telefonen peker (samme ±30° / 500 m som jakten). Bytt til Jakt når du er innen den stiplede ringen.
- **Jakt** — bakkamera, GPS og kompass. Steder innen 500 m vises som AR-skilt i synsfeltet (±30°).
- **Innstillinger** — hamburger-meny: UI-språk (norsk/engelsk), Wikipedia-kilder (1–3 utgaver) og treff-tak, og Om appen.
- **Lås opp** — innen 50 m og med GPS-nøyaktighet ≤ 50 m: 10 poeng, én gang per sted.
- **Les** — scroll utdraget til bunnen eller minst 80 %: 5 poeng, én gang. Fakta slettes aldri.
- **Samling** — søk, filter (alle / ulest / lest), avledet poengsum.
- **Del** — Wikipedia-lenke + «Se hva jeg fant via FactHunter!» + installasjonslenke (Del, kopier, SMS, e-post).
- **Flytt mellom telefoner** — eksporter/importer JSON. Ingen sky-synk.
- **PWA** — legg til på hjem-skjermen. Norsk UI.

## Installer på telefonen

Appen ligger ikke i App Store eller Google Play. Åpne [FactHunter](https://reidarkind.github.io/facthunter/) over HTTPS og legg den på hjem-skjermen. Samling og [installasjonssiden](https://reidarkind.github.io/facthunter/install) virker uten sensorer; jakten gjør det ikke.

### iPhone

1. Åpne lenken i **Safari** (ikke Chrome, og ikke inne i en annen app).
2. Trykk **Del** (firkanten med pil opp) nederst.
3. Bla og trykk **Legg til på Hjem-skjerm**. Ser du den ikke: sveip nederste rad, eller trykk Rediger handlinger.
4. Trykk **Legg til**. Start FactHunter fra det nye ikonet, ikke fra Safari-fanen.
5. Appen åpner på **Rekognoser**. Når du er nær: trykk **Start jakt** og tillat kamera og posisjon.
6. Kompass: Innstillinger → Safari → **Bevegelse og retning**. Er appen installert: Innstillinger → FactHunter → Bevegelse og retning.

### Android

1. Åpne lenken i **Chrome** (eller Samsung Internet).
2. Meny (tre prikker) → **Installer app** eller Legg til på startskjerm. Noen telefoner viser et banner nederst.
3. Åpne FactHunter fra startskjermen.
4. Appen åpner på **Rekognoser**. Når du er nær: trykk **Start jakt** og tillat kamera og posisjon.

## Personvern

Ingenting lastes opp til FactHunter. Wikipedia kalles lesende fra enheten. Mister du telefonen, sletter nettsteddata eller bytter nettleser uten eksportfil, er samlingen borte. Wikipedia-lenker du deler går til Wikipedia.

## Utvikling

Krever Node 22+ og npm. Dette repoet bruker **npm**, ikke uv.

```powershell
npm ci
npm test
npm run lint
npm run typecheck
npm run dev:https
```

| Kommando | Hva den gjør |
| --- | --- |
| `npm run dev` | Dev-server (HTTP). Greit på localhost. |
| `npm run dev:https` | Dev-server med TLS. Nødvendig for kamera/kompass på telefon. |
| `npm test` | Vitest |
| `npm run lint` | Oxlint |
| `npm run typecheck` | `tsc -b` |
| `npm run build` | Produksjonsbygg til `dist/` |

Kamera, GPS og kompass krever en sikker kontekst. `http://192.168…` virker ikke. På telefon: kjør `npm run dev:https`, stol på sertifikatet, åpne `https://`-adressen i Safari (iPhone) eller Chrome (Android).

Enkelt testfil: `npx vitest run src/lib/geo.test.ts`

## Stack

Vite 8, React 19, TypeScript, vitest, vite-plugin-pwa. Wikipedia Action API (1–3 utgaver fra innstillinger, standard `no.wikipedia.org` deretter `en.wikipedia.org`). Hosting: GitHub Pages med `base` `/facthunter/`.

## Deploy

Repoet må være **public**. Første deploy krever at Pages er slått på: [Settings → Pages](https://github.com/reidarkind/facthunter/settings/pages) → Source = **GitHub Actions**. Push til `main` (eller **Run workflow** under Actions) kjører lint, typecheck, test og build, og deployer Pages.

## Agent-instruksjoner

Se [AGENTS.md](AGENTS.md) for konvensjoner som AI-agenter skal følge.

Ideen er Reidar Kind sin. Utviklet ved hjelp av AI.

[Andre apper jeg har laget](https://reidarkind.github.io/myapps/) · [Kjøp en kaffe](https://www.buymeacoffee.com/reidarkind)
