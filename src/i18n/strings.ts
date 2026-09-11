import type { Locale } from '../lib/locale'

const no = {
  navMain: 'Hovedmeny',
  tabRecon: 'Rekognoser',
  tabHunt: 'Jakt',
  tabCollection: 'Samling',
  menu: 'Meny',
  settings: 'Innstillinger',
  about: 'Om appen',
  back: 'Tilbake',
  huntGateBody:
    'Jakten starter når kamera, posisjon og kompass er på. Én gang, fra samme trykk.',
  missingCamera: 'Kamera mangler eller ble avslått',
  missingLocation: 'Posisjon mangler eller ble avslått',
  missingCompass:
    'Kompass mangler eller ble avslått. iPhone: Innstillinger → Safari (eller FactHunter) → Bevegelse og retning, deretter Prøv igjen. Si ja når telefonen spør om bevegelse.',
  missingHttps: 'Åpne appen over HTTPS, ikke http://192.168…',
  waitingCompass: 'Venter på kompass — beveg telefonen litt.',
  tryAgain: 'Prøv igjen',
  startHunt: 'Start jakt',
  huntHintIphone:
    'iPhone: Innstillinger → Safari (eller appen) → Bevegelse og retning.',
  gpsUncertain: 'GPS usikker',
  wikiFetchFailed: 'Kunne ikke hente steder fra Wikipedia',
  noPlacesHere: 'Ingen steder her — gå litt',
  moveCloser: 'Gå nærmere',
  reconTitle: 'Rekognoser',
  reconIntro:
    'Speid 2 km rundt deg. Prikkene viser at noe er der — ikke hva. Gå mot dem, og bytt til Jakt når du er innen 500 m.',
  startRecon: 'Start rekognosering',
  reconLiveTitle: 'Rekognoser · 2 km',
  reconWikiFailed: 'Kunne ikke speide Wikipedia',
  reconEmpty: 'Ingen spor i 2 km. Gå et annet sted.',
  reconHint: 'Noe er i nærheten. Bytt til Jakt innen den stiplede ringen.',
  reconOsm: 'Kart: OpenStreetMap',
  collectionTitle: 'Samling',
  points: '{score} poeng',
  search: 'Søk',
  searchPlaceholder: 'Søk i tittel og utdrag',
  filter: 'Filter',
  filterAll: 'Alle',
  filterUnread: 'Ulest',
  filterRead: 'Lest',
  export: 'Eksporter',
  import: 'Importer',
  importFailed: 'Kunne ikke lese filen',
  importedNew: 'Importerte {count} nye fakta',
  emptyJournal: 'Journalen er tom. Gå ut og jakt noen fakta.',
  read: 'Lest',
  unread: 'Ulest',
  close: 'Lukk',
  metersAway: '{m} m unna',
  readMoreWiki: 'Les mer på Wikipedia',
  share: 'Del',
  copy: 'Kopier',
  sms: 'SMS',
  email: 'E-post',
  shareIntro: 'Se hva jeg fant via FactHunter!',
  shareInstall: 'Installer appen:',
  settingsTitle: 'Innstillinger',
  language: 'Språk',
  langNo: 'Norsk',
  langEn: 'English',
  whatThisIs: 'Hva dette er',
  whatThisIsBody:
    'FactHunter er et tynt lag som gjør Wikipedia morsommere å oppdage i den virkelige verden. Du peker bakkameraet, ser steder som skilt i gata, låser dem opp og samler dem i en feltjournal. Innholdet kommer fra Wikipedia; appen eier det ikke.',
  privacy: 'Personvern',
  privacyBody1:
    'Appen lagrer ingenting i skyen. Samling, lest-status og poeng ligger bare lokalt på telefonen. FactHunter synker ikke mellom enheter.',
  privacyBody2:
    'Bytt telefon: eksporter filen på den gamle, importer på den nye. Mister du filen, eller sletter nettsteddata uten eksport, er samlingen borte. Wikipedia-lenker du deler går til Wikipedia — det er ikke FactHunter-sky.',
  addToHome: 'Legg til på hjem-skjermen',
  addToHomeBody:
    'FactHunter er en nettside du installerer som app. Den ligger ikke i App Store eller Google Play. Du må åpne den over HTTPS, ellers nekter telefonen kamera og kompass.',
  origin: 'Opphav',
  originBody: 'Ideen er Reidar Kind sin. Utviklet ved hjelp av AI.',
  ios1:
    'Åpne FactHunter i Safari (ikke Chrome, ikke en lenke inne i en annen app).',
  ios2: 'Trykk Del (firkanten med pil opp) nederst på skjermen.',
  ios3:
    'Bla i Del-arket og trykk Legg til på Hjem-skjerm. Ser du den ikke: sveip nederste rad, eller trykk Rediger handlinger.',
  ios4: 'Trykk Legg til. Åpne FactHunter fra det nye ikonet.',
  ios5: 'Første gang du trykker Start jakt: tillat kamera og posisjon.',
  ios6:
    'Kompass: Innstillinger → Safari → Bevegelse og retning. Har du lagt til appen på hjem-skjermen: Innstillinger → FactHunter → Bevegelse og retning.',
  iosNote:
    'Jakten virker ikke fra en vanlig Safari-fane like godt som fra hjem-skjerm-ikonet. Start derfra hvis kompasset mangler.',
  android1: 'Åpne FactHunter i Chrome (eller Samsung Internet).',
  android2:
    'Trykk menyen (tre prikker) oppe til høyre, deretter Installer app eller Legg til på startskjerm. Noen telefoner viser også et installasjonsbanner nederst.',
  android3: 'Åpne FactHunter fra startskjermen.',
  android4: 'Trykk Start jakt og tillat kamera og posisjon når telefonen spør.',
  androidNote:
    'Kompasset på Android kommer fra telefonens retningssensor. Hold telefonen unna magnetiske deksler hvis pila hopper.',
}

const en: { [K in keyof typeof no]: string } = {
  navMain: 'Main menu',
  tabRecon: 'Scout',
  tabHunt: 'Hunt',
  tabCollection: 'Collection',
  menu: 'Menu',
  settings: 'Settings',
  about: 'About',
  back: 'Back',
  huntGateBody:
    'The hunt starts when camera, location and compass are on. Once, from the same tap.',
  missingCamera: 'Camera is missing or was denied',
  missingLocation: 'Location is missing or was denied',
  missingCompass:
    'Compass is missing or was denied. iPhone: Settings → Safari (or FactHunter) → Motion & Orientation, then Try again. Allow motion when the phone asks.',
  missingHttps: 'Open the app over HTTPS, not http://192.168…',
  waitingCompass: 'Waiting for compass — move the phone a little.',
  tryAgain: 'Try again',
  startHunt: 'Start hunt',
  huntHintIphone:
    'iPhone: Settings → Safari (or the app) → Motion & Orientation.',
  gpsUncertain: 'GPS uncertain',
  wikiFetchFailed: 'Could not fetch places from Wikipedia',
  noPlacesHere: 'No places here — walk a bit',
  moveCloser: 'Move closer',
  reconTitle: 'Scout',
  reconIntro:
    'Scout 2 km around you. The dots show that something is there — not what. Walk toward them, and switch to Hunt when you are within 500 m.',
  startRecon: 'Start scouting',
  reconLiveTitle: 'Scout · 2 km',
  reconWikiFailed: 'Could not scout Wikipedia',
  reconEmpty: 'No traces in 2 km. Walk somewhere else.',
  reconHint: 'Something is nearby. Switch to Hunt inside the dashed ring.',
  reconOsm: 'Map: OpenStreetMap',
  collectionTitle: 'Collection',
  points: '{score} points',
  search: 'Search',
  searchPlaceholder: 'Search titles and extracts',
  filter: 'Filter',
  filterAll: 'All',
  filterUnread: 'Unread',
  filterRead: 'Read',
  export: 'Export',
  import: 'Import',
  importFailed: 'Could not read the file',
  importedNew: 'Imported {count} new facts',
  emptyJournal: 'The journal is empty. Go hunt some facts.',
  read: 'Read',
  unread: 'Unread',
  close: 'Close',
  metersAway: '{m} m away',
  readMoreWiki: 'Read more on Wikipedia',
  share: 'Share',
  copy: 'Copy',
  sms: 'SMS',
  email: 'Email',
  shareIntro: 'See what I found via FactHunter!',
  shareInstall: 'Install the app:',
  settingsTitle: 'Settings',
  language: 'Language',
  langNo: 'Norsk',
  langEn: 'English',
  whatThisIs: 'What this is',
  whatThisIsBody:
    'FactHunter is a thin layer that makes Wikipedia more fun to discover in the real world. You point the rear camera, see places as signs in the street, unlock them and collect them in a field journal. The content comes from Wikipedia; the app does not own it.',
  privacy: 'Privacy',
  privacyBody1:
    'The app stores nothing in the cloud. Collection, read status and score live only locally on the phone. FactHunter does not sync between devices.',
  privacyBody2:
    'Switch phones: export the file on the old one, import on the new one. If you lose the file, or clear site data without exporting, the collection is gone. Wikipedia links you share go to Wikipedia — that is not a FactHunter cloud.',
  addToHome: 'Add to Home Screen',
  addToHomeBody:
    'FactHunter is a website you install as an app. It is not in the App Store or Google Play. You must open it over HTTPS, or the phone will refuse camera and compass.',
  origin: 'Credits',
  originBody: "The idea is Reidar Kind's. Developed with help from AI.",
  ios1:
    'Open FactHunter in Safari (not Chrome, not a link inside another app).',
  ios2: 'Tap Share (the square with an arrow up) at the bottom of the screen.',
  ios3:
    'Scroll the Share sheet and tap Add to Home Screen. If you do not see it: swipe the bottom row, or tap Edit Actions.',
  ios4: 'Tap Add. Open FactHunter from the new icon.',
  ios5: 'The first time you tap Start hunt: allow camera and location.',
  ios6:
    'Compass: Settings → Safari → Motion & Orientation. If you added the app to the Home Screen: Settings → FactHunter → Motion & Orientation.',
  iosNote:
    'The hunt does not work as well from a regular Safari tab as from the Home Screen icon. Start from there if the compass is missing.',
  android1: 'Open FactHunter in Chrome (or Samsung Internet).',
  android2:
    'Tap the menu (three dots) at the top right, then Install app or Add to Home screen. Some phones also show an install banner at the bottom.',
  android3: 'Open FactHunter from the home screen.',
  android4: 'Tap Start hunt and allow camera and location when the phone asks.',
  androidNote:
    'Compass on Android comes from the phone’s orientation sensor. Keep the phone away from magnetic cases if the needle jumps.',
}

export const strings: Record<Locale, { [K in keyof typeof no]: string }> = {
  no,
  en,
}

export type MessageKey = keyof typeof no
