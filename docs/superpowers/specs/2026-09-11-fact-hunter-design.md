# FactHunter — designspec

**Dato:** 2026-09-11  
**Status:** klar for gjennomgang  
**Mål:** En telefon-PWA der du peker kameraet i den virkelige verden, ser Wikipedia-steder som AR-skilt, låser dem opp lokalt, leser, får poeng og deler Wikipedia-lenken.

## 1. Hva vi bygger

FactHunter er et tynt lag over Wikipedia GeoSearch. Brukeren speider først på kartet etter kunnskap i det fjerne, går mot sporene, peker bakkameraet når hen er nær, ser steder som fysiske skilt i synsfeltet, trykker for å låse opp, og samler fakta på telefonen.

Appen er ikke et lukket Trondheim-spill. Trondheim er bare et sted med mange treff. Jakten virker overalt Wikipedia har koordinater.

## 2. Ikke i scope

- WikiStrinda (mangler GeoSearch og CORS; tas ikke nå)
- Server, konto, sky-synk, lederlister
- Native butikk / Capacitor
- Kart som erstatning for kamera-jakt
- Desktop som jaktmål

## 3. Plattform og hosting

- Statisk PWA: Vite + React + TypeScript, ut fra stillaset i repoet.
- Hosting: **GitHub Pages** (HTTPS).
- Vite `base` og service worker-scope: `/fact_hunter/` (project pages: `https://<bruker>.github.io/fact_hunter/`).
- Installasjon: «Legg til på hjem-skjermen». Rute `/install` forklarer stegene på iOS og Android, pluss personvernteksten i §7.1.
- Delingslenken til appen er den deployede Pages-URL-en + `/install`.
- Ingen backend. Wikipedia kalles lesende fra enheten. Appen laster aldri opp samling, poeng eller posisjon. Brukerdata lagres i IndexedDB i den nettleseren på den telefonen. Flytting skjer bare hvis brukeren selv eksporterer og importerer en fil.

Utvikling mot telefon krever HTTPS-devserver (ikke `http://<LAN-IP>`).

## 4. Tilgangsgate (jakt starter ikke uten dette)

Appen åpner på **Rekognoser**. Jakt-gaten er neste kapittel, ikke velkomsten. Begge viser jegermerket og tittelen FactHunter.

Én knapp, **Start jakt**, i samme bruker-gest:

1. Posisjon (`watchPosition`)
2. Bakkamera (`getUserMedia`, `facingMode: environment`)
3. Kompass (se under)

Jakten åpnes først når **alle tre lever**: kamerastrøm vises med minst ett video-spor i `readyState === 'live'`, minst én gyldig heading er mottatt, og minst én GPS-posisjon er mottatt. Et MediaStream-objekt med avsluttede spor teller ikke.

Videoelementet skal ha `playsinline` (og være muted) slik at iOS ikke tar fullskjerm og ødelegger overlay.

### 4.1 Kompass

- **iOS / WebKit:** `DeviceOrientationEvent.requestPermission()` fra Start-knappen, deretter `deviceorientation` og `event.webkitCompassHeading`.
- **Android / Chromium:** lytt på `deviceorientationabsolute`; heading = `(360 - alpha) mod 360`. Reserve: `deviceorientation` når `absolute === true`.
- Juster for `screen.orientation.angle`.
- Kort glatting av heading så skiltet ikke flimrer, uten at nålen føles treg.
- Et kompassros på jaktskjermen viser at heading lever.

### 4.2 Hvis noe mangler

Jakten starter ikke. Én skjerm viser hva som mangler, **Prøv igjen**, og kort hint:

- HTTPS / åpnet via GitHub Pages eller HTTPS-dev
- Kamera- og posisjonstillatelse
- iPhone: Innstillinger → Safari (eller appen) → Bevegelse og retning

Hvis kamera- eller GPS-tilgang faller (appen i bakgrunnen, video-spor `ended`, avslag), er jakten ikke klar. Gaten vises igjen. Når appen blir synlig etter at Start jakt er brukt, startes GPS-watch på nytt og kameraet forsøkes hentet. iOS krever ofte et nytt trykk; **Prøv igjen** ber om kamera, posisjon og kompass fra samme gest. Kamera/`getUserMedia` kalles ikke automatisk før Start jakt har vært brukt i denne økten.

Samlingen og installasjonssiden er tilgjengelige uten sensorer.

## 5. Jakt og AR

### 5.1 Avstander

| Regel | Verdi |
| --- | --- |
| Wikipedia-henting | radius 1000 m (buffer) |
| Synlig i kamera | avstand ≤ **500 m** |
| Kan låses opp | avstand ≤ **50 m** og GPS `accuracy` ≤ **50 m** |
| Synsfelt | ±30° fra kompassheading (ca. 60° totalt) |

Utenfor 50 m (eller ved dårlig GPS): skiltet vises dempet med «Gå nærmere». Trykk låser ikke opp.

Hvis `accuracy > 50 m`: vis «GPS usikker». Ingen opplåsing før både avstand og accuracy er innenfor 50 m.

### 5.2 AR-skilt

Skiltet skal stå **i verden**, ikke som HUD-klistremerke.

- Horisontalt: differanse mellom kompassheading og peiling til stedet.
- Vertikalt: telefonens pitch (`beta`) slik at merket følger bakken/horisonten når brukeren ser opp eller ned.
- Skala: større og lavere i bildet når nærme; mindre mot horisonten når langt unna.
- Overlapp: det nærmeste skiltet ligger foran.
- Avstand vises på skiltet («{m} m unna»). Utenfor 50 m (eller ved dårlig GPS) også «Gå nærmere».
- Utseende: utforsker-støtte (stang + skilt) i dyp teal og messinggull. Innen 50 m lyser den og er trykkbar. Lenger unna dempet. Allerede låst opp: merket som ditt, fortsatt synlig.

### 5.3 Opplåsing og lesing

1. Trykk på et låsbart skilt → faktumet lagres lokalt → **10 poeng** (én gang).
2. Leseark åpnes med tittel, Wikipedia-utdrag, bilde (hvis API-et gir det), avstand og delingsknapper.
3. Brukeren kan lukke arket og lese senere fra samlingen.
4. Scroll arket slik at minst 80 % av utdraget er synlig (eller det allerede får plass), **eller** åpne Wikipedia-artikkelen → markeres som lest → **5 poeng** (én gang). Faktumet fjernes ikke.
5. Nytt trykk på samme sted åpner arket igjen. Ingen nye opplåsingspoeng.

### 5.4 Wikipedia

- Hent fra 1–3 Wikipedia-utgaver valgt i innstillinger, i prioritert rekkefølge (standard `no` deretter `en`).
- Samme artikkel på tvers av språk (Wikidata-Q, ellers langlink-tittel): behold den første. To ulike artikler vises begge, også om de ligger nær hverandre.
- Bruk GeoSearch + extracts/thumbnail i batch (CORS `origin=*`). Alle kall sender `Api-User-Agent` med appnavn og kontakt-URL (Wikimedia User-Agent-policy).
- Ikke cache API-svar som sannhet på disk; minnecache mens jakten kjører. Nytt søk når posisjonen har flyttet seg mer enn 150 m siden *forrige ferdige søk*. Et søk som er i gang avbrytes ikke av nye GPS-punkt; skiltene flytter seg mot deg fra treffene du allerede har.
- Tomt resultat: «Ingen steder her — gå litt».
- Nettfeil: melding i jakt; samlingen virker offline.

## 6. Samling, poeng, deling

### 6.1 Lagret faktum

| Felt | Betydning |
| --- | --- |
| `id` | `wikipedia:<lang>:<pageId>` |
| `title` | Artikkel tittel |
| `extract` | Utdrag (lagres ved opplåsing) |
| `thumbnailUrl` | Valgfri |
| `pageUrl` | Kanonisk Wikipedia-URL |
| `lang` | Wikipedia-utgave for artikkelen |
| `lat`, `lon` | Koordinater |
| `unlockedAt` | ISO-tid |
| `readAt` | ISO-tid eller tom |
| `source` | `wikipedia` |

Slettes aldri av appen. IndexedDB i denne nettleseren på denne telefonen. Ingen konto, ingen sky-kopi.

Ny telefon, annen nettleser, slettet nettsteddata eller avinstallering tømmer samlingen, **med mindre** brukeren har en eksportfil og importerer den.

### 6.2 Poeng

- Opplåsing: **10**
- Lest: **5**
- Aldri dobbelt for samme `id`
- Summen vises i samlingen og utledes fra lagrede fakta (ikke et eget tall som kan drifte)

### 6.3 Samling-UI

Egen fane. Søk i tittel og utdrag. Filter: alle / ulest / lest. Åpner samme leseark. Knappene Eksporter og Importer ligger her.

### 6.4 Deling

Ingen FactHunter-URL per faktum. Handlingene kopier, Web Share der den finnes, ellers `mailto:` og `sms:`.

Tekst, med faktiske URL-er fylt inn:

```
Se hva jeg fant via FactHunter!
{pageUrl}

Installer appen: {installUrl}
```

`installUrl` er alltid appens faktiske origin + Vite `base` + `install` (på GitHub project pages: `https://<bruker>.github.io/fact_hunter/install`).

### 6.5 Eksport og import

På samling-fanen: **Eksporter** og **Importer**. Ingen server.

**Eksport.** JSON-fil, f.eks. `facthunter-samling-YYYY-MM-DD.json`. Innhold:

```json
{
  "app": "FactHunter",
  "version": 1,
  "exportedAt": "<ISO-tid>",
  "facts": [ { "...samme felt som i §6.1" } ]
}
```

Nedlasting via `Blob` + deling av filen der Web Share med fil støttes.

**Import.** Filvelger, parse JSON. Avvis filer som ikke har `app: "FactHunter"`, `version: 1` og en `facts`-liste. Feilmelding, ingen delvis skriving.

**Fletting.** Aldri slett lokale fakta som mangler i filen.

- Ny `id`: sett inn.
- Samme `id`: behold tidligste `unlockedAt`; sett `readAt` hvis minst én av dem er lest (behold tidligste `readAt`); behold eksisterende tekst/bilde hvis importen mangler dem.

Poeng følger automatisk av flettet samling. Bekreftelse etterpå: «Importerte N nye fakta» (N = antall nye id-er).

## 7. Skjermer

Tre faner, i denne rekkefølgen: **Rekognoser** (start), **Jakt**, **Samling**. Ruten `/install` er ikke en fane; den nås fra hamburgeren og deling.

Rekognoser er hjemskjermen: jegermerke, FactHunter, «kunnskap i det fjerne», deretter kartet. Ingen titler, ingen opplåsing. Når brukeren er innen den stiplede 500 m-ringen, bytter hen til Jakt. Jakt-gaten beholder merket; teksten sier at kameraet er nærsynet.

Norsk UI. Appnavn: **FactHunter**.

### 7.1 Installasjonssiden

Siden skal ha tre tydelige deler:

1. **Hva dette er** — FactHunter er et tynt lag som gjør Wikipedia morsommere å oppdage i den virkelige verden (speid på kartet, deretter kamera og skilt, samling). Innholdet kommer fra Wikipedia; appen eier det ikke.
2. **Personvern** — Appen lagrer ingenting i skyen. Samling, lest-status og poeng ligger bare lokalt på telefonen. FactHunter synker ikke mellom enheter. Bytt telefon: eksporter filen på den gamle, importer på den nye. Mister du filen (eller sletter nettsteddata uten eksport), er samlingen borte.
3. **Legg til på hjem-skjermen** — korte steg for iOS (Del → Legg til på Hjem-skjerm) og Android (meny → Installer app / Legg til på startside).

Formuleringen på siden skal være klar, ikke juridisk tåke. Wikipedia-lenker brukeren selv deler, går til Wikipedia — det er ikke FactHunter-sky.

Uttrykk: feltjournal / utforsker. Teal, krem, gull. Grafikk skal være lesbar og «stå i gata», ikke overdesignet. App-ikon og tom tilstand i samlingen kan bruke de genererte illustrasjonene (kompass + journal).

## 8. Dataflyt

```
Åpne appen
  → Rekognoser (kart, anonyme spor, 2 km)
  → gå mot den stiplede ringen
  → Start jakt (tap)
  → tillatelser + kamera + heading + GPS
  → Wikipedia GeoSearch (1–3 utgaver fra innstillinger) rundt posisjon
  → for hvert sted: avstand, peiling
  → hvis ≤500 m og i synsfelt: tegn AR-skilt
  → tap + ≤50 m + accuracy ≤50 m → IndexedDB unlock + 10 poeng → leseark
  → scroll ≥80 % → readAt + 5 poeng
  → del → Wikipedia-URL + installasjonslenke
```

## 9. Feil

| Situasjon | Atferd |
| --- | --- |
| Kamera/kompass/GPS nektet eller ingen heading | Jakt stengt, forklaring + Prøv igjen |
| GPS accuracy > 50 m | «GPS usikker», ingen opplåsing |
| 50–500 m unna | Synlig, dempet, «Gå nærmere» |
| Wikipedia nede | Feilmelding; samling OK |
| Ingen GeoSearch-treff | Tom jakt-tilstand |
| Web Share mangler | Kopier / mailto / sms |
| Ugyldig importfil | Feilmelding, samlingen uendret |
| Offline etter opplåsing | Samling, lest-status, eksport virker |

## 10. Testing

### Automatisk

- Haversine-avstand og peiling
- Synlig ≤500 m, låsbar ≤50 m (og ikke låsbar utenfor / ved dårlig accuracy)
- Poeng 10+5, ikke dobbelt
- Lest ved 80 % scroll / bunn
- Søk og filter i samling
- Delingstekst inneholder Wikipedia-URL, «FactHunter» og installasjonslenke
- Eksport-JSON har `app`, `version: 1` og facts
- Import fletter på `id` (nye inn, eksisterende ikke slettet, lest vinner)
- Ugyldig fil avvises uten å endre lagring

### Manuelt (telefon, HTTPS)

På minst én iPhone og én Android, så langt enhetene finnes:

- Start jakt-gesten gir bakkamera og levende kompassnål
- Skilt står i verden og flytter seg når en snur seg
- Fange på ~50 m, avvist lenger unna
- Scroll gir lest + poeng
- Samling/søk
- Deling
- Legg til på hjem-skjermen fra `/install`
- `/install` sier tydelig: ingen sky, kun lokalt, flytting bare via eksportfil
- Eksporter og importer en samling på enheten

Kort sjekk der GeoSearch er tom.

## 11. Suksesskriterier

Appen er ferdig nok når en person på gaten (HTTPS-PWA) kan peke kameraet, se et skilt på et virkelig sted, låse det opp innen 50 m, lese det, få poeng, finne det igjen i samlingen, dele Wikipedia-lenken med installasjonshint, og ta vare på samlingen med en eksportfil — uten at FactHunter laster opp brukerdata.
