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
    'Nå peker du kameraet. Skiltene står i verden når du er nær nok. Kamera, posisjon og kompass slås på med samme trykk.',
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
    'Det finnes kunnskap i det fjerne. Speid 2 km rundt deg. Prikkene viser at noe er der — ikke hva. Gå mot dem, og bytt til Jakt innen den stiplede ringen.',
  startRecon: 'Start rekognosering',
  reconLiveTitle: 'Rekognoser · 2 km',
  reconWikiFailed: 'Kunne ikke speide Wikipedia',
  reconEmpty: 'Ingen spor i 2 km. Gå et annet sted.',
  reconHint:
    'Kunnskap i det fjerne — bytt til Jakt innen den stiplede ringen.',
  reconOsm: 'Kart: OpenStreetMap',
  installHint: 'Bedre fra hjem-skjermen',
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
  importChooseHelp:
    'Flett inn i samlingen på telefonen, eller erstatt den. Samme Wikipedia-artikkel på ulike språk blir én; språket følger Wikipedia-kildene. Erstatt sletter det som bare finnes her.',
  importMerge: 'Flett inn',
  importReplace: 'Erstatt',
  importedReplaced: 'Samlingen er erstattet.',
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
  languageHelp:
    'Velg språket til appen. Språket på faktaene du finner, styres av Wikipedia-kildene.',
  langNo: 'Norsk',
  langEn: 'English',
  langDe: 'Deutsch',
  langEs: 'Español',
  langPt: 'Português',
  langFr: 'Français',
  wikiLimit: 'Wikipedia-treff',
  wikiLimitHelp:
    'Hvor mange steder som hentes rundt deg. Flere treff gir tettere kart og jakt, men tyngre lasting.',
  wikiSources: 'Wikipedia-kilder',
  wikiSourcesHelp:
    'Én til tre Wikipedia-utgaver, i prioritert rekkefølge. Samme artikkel (Wikidata) vises bare én gang; første språk vinner.',
  wikiSourcePrimary: 'Første',
  wikiSourceSecondary: 'Andre',
  wikiSourceTertiary: 'Tredje',
  wikiSourceNone: 'Ingen',
  collectionReset: 'Wikipedia-samling',
  collectionResetHelp:
    'Samlingen med opplåste Wikipedia-steder ligger bare på denne telefonen. Poeng følger med. Eksporter først hvis du vil ta vare på dem.',
  collectionResetAction: 'Tøm samling',
  collectionResetConfirm:
    'Slette alle opplåste steder? Dette kan ikke angres.',
  collectionResetConfirmAction: 'Tøm samlingen',
  collectionResetDone: 'Samlingen er tom.',
  cancel: 'Avbryt',
  appUpdateTitle: 'App',
  appUpdate: 'Sjekk for oppdateringer',
  appUpdateChecking: 'Sjekker…',
  appUpdateCurrent: 'Du har nyeste versjon.',
  appUpdateAvailable: 'Ny versjon. Trykk for å laste inn.',
  appUpdateApply: 'Last inn ny versjon',
  appUpdateOffline: 'Ingen nett. Prøv senere.',
  whatThisIs: 'Hva dette er',
  whatThisIsBody:
    'FactHunter er et tynt lag som gjør Wikipedia morsommere å oppdage i den virkelige verden. Først speider du på kartet etter spor i det fjerne. Når du er nær nok, peker du kameraet bak på telefonen: stedene vises som skilt i gata; du låser dem opp og samler dem i en feltjournal. Innholdet kommer fra Wikipedia; appen eier det ikke.',
  privacy: 'Personvern',
  privacyBody1:
    'Appen lagrer ingenting i skyen. Samling, lest-status og poeng ligger bare lokalt på telefonen. FactHunter synkroniserer ikke mellom enheter.',
  privacyBody2:
    'Bytt telefon: eksporter filen på den gamle, importer på den nye. I Innstillinger kan du tømme samlingen. Mister du filen, eller sletter nettsteddata uten eksport, er samlingen borte. Wikipedia-lenker du deler går til Wikipedia. FactHunter lagrer dem ikke i skyen.',
  addToHome: 'Legg til på hjem-skjermen',
  addToHomeBody:
    'FactHunter er en nettside du installerer som app. Den ligger ikke i App Store eller Google Play. Du må åpne den over HTTPS, ellers nekter telefonen kamera og kompass.',
  origin: 'Opphav',
  originBody: 'Ideen er Reidar Kind sin. Utviklet ved hjelp av AI.',
  otherApps: 'Andre apper jeg har laget',
  buyCoffee: 'Kjøp en kaffe',
  buyCoffeeBody:
    'Dette er et hobbyprosjekt. En kaffe hjelper meg å fortsette å fikle i fritiden.',
  ios1:
    'Åpne FactHunter i Safari (ikke Chrome, ikke en lenke inne i en annen app).',
  ios2: 'Trykk Del (firkanten med pil opp) nederst på skjermen.',
  ios3:
    'Bla i Del-arket og trykk Legg til på Hjem-skjerm. Ser du den ikke: sveip nederste rad, eller trykk Rediger handlinger.',
  ios4: 'Trykk Legg til. Åpne FactHunter fra det nye ikonet.',
  ios5:
    'Appen åpner på Rekognoser. Når du er nær: trykk Start jakt og tillat kamera og posisjon.',
  ios6:
    'Kompass: Innstillinger → Safari → Bevegelse og retning. Har du lagt til appen på hjem-skjermen: Innstillinger → FactHunter → Bevegelse og retning.',
  iosNote:
    'Jakten virker ikke fra en vanlig Safari-fane like godt som fra hjem-skjerm-ikonet. Start derfra hvis kompasset mangler.',
  android1: 'Åpne FactHunter i Chrome (eller Samsung Internet).',
  android2:
    'Trykk menyen (tre prikker) oppe til høyre, deretter Installer app eller Legg til på startskjerm. Noen telefoner viser også et installasjonsbanner nederst.',
  android3: 'Åpne FactHunter fra startskjermen.',
  android4:
    'Appen åpner på Rekognoser. Når du er nær: trykk Start jakt og tillat kamera og posisjon når telefonen spør.',
  androidNote:
    'Kompasset på Android kommer fra telefonens retningssensor. Hold telefonen unna magnetiske deksler hvis pila hopper.',
}

type Copy = { [K in keyof typeof no]: string }

const en: Copy = {
  navMain: 'Main menu',
  tabRecon: 'Scout',
  tabHunt: 'Hunt',
  tabCollection: 'Collection',
  menu: 'Menu',
  settings: 'Settings',
  about: 'About',
  back: 'Back',
  huntGateBody:
    'Now you point the camera. Signs stand in the world when you are close enough. Camera, location and compass turn on from the same tap.',
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
    'There is knowledge in the distance. Scout 2 km around you. The dots show that something is there — not what. Walk toward them, and switch to Hunt inside the dashed ring.',
  startRecon: 'Start scouting',
  reconLiveTitle: 'Scout · 2 km',
  reconWikiFailed: 'Could not scout Wikipedia',
  reconEmpty: 'No traces in 2 km. Walk somewhere else.',
  reconHint:
    'Knowledge in the distance — switch to Hunt inside the dashed ring.',
  reconOsm: 'Map: OpenStreetMap',
  installHint: 'Better from the Home Screen',
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
  importChooseHelp:
    'Merge into the collection on this phone, or replace it. The same Wikipedia article in different languages becomes one; language follows Wikipedia sources. Replace deletes places that only exist here.',
  importMerge: 'Merge',
  importReplace: 'Replace',
  importedReplaced: 'The collection was replaced.',
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
  languageHelp:
    'Choose the language of the app. The language of the facts you find is set under Wikipedia sources.',
  langNo: 'Norsk',
  langEn: 'English',
  langDe: 'Deutsch',
  langEs: 'Español',
  langPt: 'Português',
  langFr: 'Français',
  wikiLimit: 'Wikipedia results',
  wikiLimitHelp:
    'How many places to fetch around you. More results make the map and hunt denser, but loading is heavier.',
  wikiSources: 'Wikipedia sources',
  wikiSourcesHelp:
    'One to three Wikipedia editions, in priority order. The same article (Wikidata) is shown once; the first language wins.',
  wikiSourcePrimary: 'First',
  wikiSourceSecondary: 'Second',
  wikiSourceTertiary: 'Third',
  wikiSourceNone: 'None',
  collectionReset: 'Wikipedia collection',
  collectionResetHelp:
    'The collection of unlocked Wikipedia places lives only on this phone. Score follows. Export first if you want to keep them.',
  collectionResetAction: 'Clear collection',
  collectionResetConfirm:
    'Delete every unlocked place? This cannot be undone.',
  collectionResetConfirmAction: 'Clear collection now',
  collectionResetDone: 'The collection is empty.',
  cancel: 'Cancel',
  appUpdateTitle: 'App',
  appUpdate: 'Check for updates',
  appUpdateChecking: 'Checking…',
  appUpdateCurrent: 'You have the latest version.',
  appUpdateAvailable: 'New version. Tap to load it.',
  appUpdateApply: 'Load new version',
  appUpdateOffline: 'No network. Try later.',
  whatThisIs: 'What this is',
  whatThisIsBody:
    'FactHunter is a thin layer that makes Wikipedia more fun to discover in the real world. First you scout the map for traces in the distance. When you are close enough, you point the camera on the back of the phone: places appear as signs in the street; you unlock them and collect them in a field journal. The content comes from Wikipedia; the app does not own it.',
  privacy: 'Privacy',
  privacyBody1:
    'The app stores nothing in the cloud. Collection, read status and score live only locally on the phone. FactHunter does not sync between devices.',
  privacyBody2:
    'Switch phones: export the file on the old one, import on the new one. Settings can empty the collection. If you lose the file, or clear site data without exporting, the collection is gone. Wikipedia links you share go to Wikipedia. FactHunter does not store them in the cloud.',
  addToHome: 'Add to Home Screen',
  addToHomeBody:
    'FactHunter is a website you install as an app. It is not in the App Store or Google Play. You must open it over HTTPS, or the phone will refuse camera and compass.',
  origin: 'Credits',
  originBody: "The idea is Reidar Kind's. Developed with help from AI.",
  otherApps: 'Other apps I have made',
  buyCoffee: 'Buy me a coffee',
  buyCoffeeBody:
    'This is a hobby project. A coffee helps me keep tinkering in my spare time.',
  ios1:
    'Open FactHunter in Safari (not Chrome, not a link inside another app).',
  ios2: 'Tap Share (the square with an arrow up) at the bottom of the screen.',
  ios3:
    'Scroll the Share sheet and tap Add to Home Screen. If you do not see it: swipe the bottom row, or tap Edit Actions.',
  ios4: 'Tap Add. Open FactHunter from the new icon.',
  ios5:
    'The app opens on Scout. When you are close: tap Start hunt and allow camera and location.',
  ios6:
    'Compass: Settings → Safari → Motion & Orientation. If you added the app to the Home Screen: Settings → FactHunter → Motion & Orientation.',
  iosNote:
    'The hunt does not work as well from a regular Safari tab as from the Home Screen icon. Start from there if the compass is missing.',
  android1: 'Open FactHunter in Chrome (or Samsung Internet).',
  android2:
    'Tap the menu (three dots) at the top right, then Install app or Add to Home screen. Some phones also show an install banner at the bottom.',
  android3: 'Open FactHunter from the home screen.',
  android4:
    'The app opens on Scout. When you are close: tap Start hunt and allow camera and location when the phone asks.',
  androidNote:
    'Compass on Android comes from the phone’s orientation sensor. Keep the phone away from magnetic cases if the needle jumps.',
}

const de: Copy = {
  navMain: 'Hauptmenü',
  tabRecon: 'Erkunden',
  tabHunt: 'Jagd',
  tabCollection: 'Sammlung',
  menu: 'Menü',
  settings: 'Einstellungen',
  about: 'Über die App',
  back: 'Zurück',
  huntGateBody:
    'Jetzt richtest du die Kamera. Die Schilder stehen in der Welt, wenn du nah genug bist. Kamera, Standort und Kompass gehen mit demselben Tipp an.',
  missingCamera: 'Kamera fehlt oder wurde abgelehnt',
  missingLocation: 'Standort fehlt oder wurde abgelehnt',
  missingCompass:
    'Kompass fehlt oder wurde abgelehnt. iPhone: Einstellungen → Safari (oder FactHunter) → Bewegung und Ausrichtung, dann Erneut versuchen. Bewegung erlauben, wenn das Telefon fragt.',
  missingHttps: 'Öffne die App über HTTPS, nicht http://192.168…',
  waitingCompass: 'Warte auf den Kompass — bewege das Telefon ein wenig.',
  tryAgain: 'Erneut versuchen',
  startHunt: 'Jagd starten',
  huntHintIphone:
    'iPhone: Einstellungen → Safari (oder die App) → Bewegung und Ausrichtung.',
  gpsUncertain: 'GPS unsicher',
  wikiFetchFailed: 'Orte von Wikipedia konnten nicht geladen werden',
  noPlacesHere: 'Keine Orte hier — geh ein Stück',
  moveCloser: 'Komm näher',
  reconTitle: 'Erkunden',
  reconIntro:
    'Es gibt Wissen in der Ferne. Erkunde 2 km um dich herum. Die Punkte zeigen, dass etwas da ist — nicht was. Geh auf sie zu und wechsle zur Jagd innerhalb des gestrichelten Rings.',
  startRecon: 'Erkundung starten',
  reconLiveTitle: 'Erkunden · 2 km',
  reconWikiFailed: 'Wikipedia konnte nicht erkundet werden',
  reconEmpty: 'Keine Spuren in 2 km. Geh woanders hin.',
  reconHint:
    'Wissen in der Ferne — wechsle zur Jagd innerhalb des gestrichelten Rings.',
  reconOsm: 'Karte: OpenStreetMap',
  installHint: 'Besser vom Home-Bildschirm',
  collectionTitle: 'Sammlung',
  points: '{score} Punkte',
  search: 'Suchen',
  searchPlaceholder: 'Titel und Auszüge durchsuchen',
  filter: 'Filter',
  filterAll: 'Alle',
  filterUnread: 'Ungelesen',
  filterRead: 'Gelesen',
  export: 'Exportieren',
  import: 'Importieren',
  importFailed: 'Die Datei konnte nicht gelesen werden',
  importedNew: '{count} neue Fakten importiert',
  importChooseHelp:
    'Mit der Sammlung auf diesem Telefon zusammenführen oder sie ersetzen. Derselbe Wikipedia-Artikel in verschiedenen Sprachen wird einer; die Sprache folgt den Wikipedia-Quellen. Ersetzen löscht Orte, die nur hier existieren.',
  importMerge: 'Zusammenführen',
  importReplace: 'Ersetzen',
  importedReplaced: 'Die Sammlung wurde ersetzt.',
  emptyJournal: 'Das Journal ist leer. Geh raus und jage ein paar Fakten.',
  read: 'Gelesen',
  unread: 'Ungelesen',
  close: 'Schließen',
  metersAway: '{m} m entfernt',
  readMoreWiki: 'Mehr auf Wikipedia lesen',
  share: 'Teilen',
  copy: 'Kopieren',
  sms: 'SMS',
  email: 'E-Mail',
  shareIntro: 'Sieh, was ich mit FactHunter gefunden habe!',
  shareInstall: 'App installieren:',
  settingsTitle: 'Einstellungen',
  language: 'Sprache',
  languageHelp:
    'Wähle die Sprache der App. Die Sprache der Fakten, die du findest, kommt von den Wikipedia-Quellen.',
  langNo: 'Norsk',
  langEn: 'English',
  langDe: 'Deutsch',
  langEs: 'Español',
  langPt: 'Português',
  langFr: 'Français',
  wikiLimit: 'Wikipedia-Treffer',
  wikiLimitHelp:
    'Wie viele Orte um dich herum geladen werden. Mehr Treffer machen Karte und Jagd dichter, aber das Laden schwerer.',
  wikiSources: 'Wikipedia-Quellen',
  wikiSourcesHelp:
    'Ein bis drei Wikipedia-Ausgaben, in Prioritätsreihenfolge. Derselbe Artikel (Wikidata) erscheint nur einmal; die erste Sprache gewinnt.',
  wikiSourcePrimary: 'Erste',
  wikiSourceSecondary: 'Zweite',
  wikiSourceTertiary: 'Dritte',
  wikiSourceNone: 'Keine',
  collectionReset: 'Wikipedia-Sammlung',
  collectionResetHelp:
    'Die Sammlung freigeschalteter Wikipedia-Orte liegt nur auf diesem Telefon. Punkte folgen mit. Exportiere zuerst, wenn du sie behalten willst.',
  collectionResetAction: 'Sammlung leeren',
  collectionResetConfirm:
    'Alle freigeschalteten Orte löschen? Das lässt sich nicht rückgängig machen.',
  collectionResetConfirmAction: 'Sammlung jetzt leeren',
  collectionResetDone: 'Die Sammlung ist leer.',
  cancel: 'Abbrechen',
  appUpdateTitle: 'App',
  appUpdate: 'Nach Updates suchen',
  appUpdateChecking: 'Suche…',
  appUpdateCurrent: 'Du hast die neueste Version.',
  appUpdateAvailable: 'Neue Version. Tippe zum Laden.',
  appUpdateApply: 'Neue Version laden',
  appUpdateOffline: 'Kein Netz. Später versuchen.',
  whatThisIs: 'Was das ist',
  whatThisIsBody:
    'FactHunter ist eine dünne Schicht, die Wikipedia in der echten Welt spannender macht. Zuerst erkundest du die Karte nach Spuren in der Ferne. Wenn du nah genug bist, richtest du die Kamera auf der Rückseite des Telefons: Orte erscheinen als Schilder in der Straße; du schaltest sie frei und sammelst sie in einem Feldjournal. Der Inhalt kommt von Wikipedia; die App besitzt ihn nicht.',
  privacy: 'Datenschutz',
  privacyBody1:
    'Die App speichert nichts in der Cloud. Sammlung, Gelesen-Status und Punkte liegen nur lokal auf dem Telefon. FactHunter synchronisiert nicht zwischen Geräten.',
  privacyBody2:
    'Telefon wechseln: exportiere die Datei auf dem alten, importiere sie auf dem neuen. Unter Einstellungen kannst du die Sammlung leeren. Verlierst du die Datei oder löschst Website-Daten ohne Export, ist die Sammlung weg. Wikipedia-Links, die du teilst, gehen zu Wikipedia. FactHunter speichert sie nicht in der Cloud.',
  addToHome: 'Zum Home-Bildschirm hinzufügen',
  addToHomeBody:
    'FactHunter ist eine Website, die du als App installierst. Sie ist nicht im App Store oder bei Google Play. Du musst sie über HTTPS öffnen, sonst verweigert das Telefon Kamera und Kompass.',
  origin: 'Herkunft',
  originBody: 'Die Idee stammt von Reidar Kind. Entwickelt mit Hilfe von KI.',
  otherApps: 'Andere Apps, die ich gemacht habe',
  buyCoffee: 'Kauf mir einen Kaffee',
  buyCoffeeBody:
    'Das ist ein Hobbyprojekt. Ein Kaffee hilft mir, in der Freizeit weiterzubasteln.',
  ios1:
    'Öffne FactHunter in Safari (nicht Chrome, nicht einen Link in einer anderen App).',
  ios2: 'Tippe Teilen (das Quadrat mit Pfeil nach oben) unten auf dem Bildschirm.',
  ios3:
    'Scrolle im Teilen-Blatt und tippe Zum Home-Bildschirm. Wenn du es nicht siehst: wische die untere Reihe, oder tippe Aktionen bearbeiten.',
  ios4: 'Tippe Hinzufügen. Öffne FactHunter über das neue Symbol.',
  ios5:
    'Die App öffnet auf Erkunden. Wenn du nah bist: tippe Jagd starten und erlaube Kamera und Standort.',
  ios6:
    'Kompass: Einstellungen → Safari → Bewegung und Ausrichtung. Hast du die App auf dem Home-Bildschirm: Einstellungen → FactHunter → Bewegung und Ausrichtung.',
  iosNote:
    'Die Jagd funktioniert aus einem normalen Safari-Tab nicht so gut wie vom Home-Bildschirm-Symbol. Starte von dort, wenn der Kompass fehlt.',
  android1: 'Öffne FactHunter in Chrome (oder Samsung Internet).',
  android2:
    'Tippe das Menü (drei Punkte) oben rechts, dann App installieren oder Zum Startbildschirm hinzufügen. Manche Telefone zeigen auch ein Installationsbanner unten.',
  android3: 'Öffne FactHunter vom Startbildschirm.',
  android4:
    'Die App öffnet auf Erkunden. Wenn du nah bist: tippe Jagd starten und erlaube Kamera und Standort, wenn das Telefon fragt.',
  androidNote:
    'Der Kompass auf Android kommt vom Richtungssensor des Telefons. Halte das Telefon von magnetischen Hüllen fern, wenn die Nadel springt.',
}

const es: Copy = {
  navMain: 'Menú principal',
  tabRecon: 'Explorar',
  tabHunt: 'Caza',
  tabCollection: 'Colección',
  menu: 'Menú',
  settings: 'Ajustes',
  about: 'Acerca de la app',
  back: 'Atrás',
  huntGateBody:
    'Ahora apuntas la cámara. Los letreros están en el mundo cuando estás lo bastante cerca. Cámara, ubicación y brújula se activan con el mismo toque.',
  missingCamera: 'La cámara falta o se denegó',
  missingLocation: 'La ubicación falta o se denegó',
  missingCompass:
    'La brújula falta o se denegó. iPhone: Ajustes → Safari (o FactHunter) → Movimiento y orientación, luego Reintentar. Acepta el movimiento cuando el teléfono lo pida.',
  missingHttps: 'Abre la app por HTTPS, no http://192.168…',
  waitingCompass: 'Esperando la brújula — mueve un poco el teléfono.',
  tryAgain: 'Reintentar',
  startHunt: 'Empezar caza',
  huntHintIphone:
    'iPhone: Ajustes → Safari (o la app) → Movimiento y orientación.',
  gpsUncertain: 'GPS inseguro',
  wikiFetchFailed: 'No se pudieron cargar lugares de Wikipedia',
  noPlacesHere: 'No hay lugares aquí — camina un poco',
  moveCloser: 'Acércate',
  reconTitle: 'Explorar',
  reconIntro:
    'Hay conocimiento a lo lejos. Explora 2 km a tu alrededor. Los puntos muestran que hay algo — no qué. Camina hacia ellos y cambia a Caza dentro del anillo discontinuo.',
  startRecon: 'Empezar exploración',
  reconLiveTitle: 'Explorar · 2 km',
  reconWikiFailed: 'No se pudo explorar Wikipedia',
  reconEmpty: 'Ningún rastro en 2 km. Ve a otro sitio.',
  reconHint:
    'Conocimiento a lo lejos — cambia a Caza dentro del anillo discontinuo.',
  reconOsm: 'Mapa: OpenStreetMap',
  installHint: 'Mejor desde la pantalla de inicio',
  collectionTitle: 'Colección',
  points: '{score} puntos',
  search: 'Buscar',
  searchPlaceholder: 'Buscar en título y extracto',
  filter: 'Filtro',
  filterAll: 'Todos',
  filterUnread: 'No leídos',
  filterRead: 'Leídos',
  export: 'Exportar',
  import: 'Importar',
  importFailed: 'No se pudo leer el archivo',
  importedNew: 'Se importaron {count} hechos nuevos',
  importChooseHelp:
    'Combínalo con la colección de este teléfono, o sustitúyela. El mismo artículo de Wikipedia en distintos idiomas cuenta una vez; el idioma sigue las fuentes de Wikipedia. Sustituir borra los lugares que solo existen aquí.',
  importMerge: 'Combinar',
  importReplace: 'Sustituir',
  importedReplaced: 'La colección fue sustituida.',
  emptyJournal: 'El diario está vacío. Sal a cazar algunos hechos.',
  read: 'Leído',
  unread: 'No leído',
  close: 'Cerrar',
  metersAway: 'A {m} m',
  readMoreWiki: 'Leer más en Wikipedia',
  share: 'Compartir',
  copy: 'Copiar',
  sms: 'SMS',
  email: 'Correo',
  shareIntro: '¡Mira lo que encontré con FactHunter!',
  shareInstall: 'Instala la app:',
  settingsTitle: 'Ajustes',
  language: 'Idioma',
  languageHelp:
    'Elige el idioma de la app. El idioma de los hechos que encuentras lo marcan las fuentes de Wikipedia.',
  langNo: 'Norsk',
  langEn: 'English',
  langDe: 'Deutsch',
  langEs: 'Español',
  langPt: 'Português',
  langFr: 'Français',
  wikiLimit: 'Resultados de Wikipedia',
  wikiLimitHelp:
    'Cuántos lugares se cargan a tu alrededor. Más resultados densifican el mapa y la caza, pero la carga es más pesada.',
  wikiSources: 'Fuentes de Wikipedia',
  wikiSourcesHelp:
    'De una a tres ediciones de Wikipedia, en orden de prioridad. El mismo artículo (Wikidata) se muestra una sola vez; gana el primer idioma.',
  wikiSourcePrimary: 'Primera',
  wikiSourceSecondary: 'Segunda',
  wikiSourceTertiary: 'Tercera',
  wikiSourceNone: 'Ninguna',
  collectionReset: 'Colección de Wikipedia',
  collectionResetHelp:
    'La colección de lugares de Wikipedia desbloqueados vive solo en este teléfono. Los puntos van con ellos. Exporta primero si quieres conservarlos.',
  collectionResetAction: 'Vaciar colección',
  collectionResetConfirm:
    '¿Borrar todos los lugares desbloqueados? No se puede deshacer.',
  collectionResetConfirmAction: 'Vaciar ahora',
  collectionResetDone: 'La colección está vacía.',
  cancel: 'Cancelar',
  appUpdateTitle: 'App',
  appUpdate: 'Buscar actualizaciones',
  appUpdateChecking: 'Buscando…',
  appUpdateCurrent: 'Tienes la última versión.',
  appUpdateAvailable: 'Nueva versión. Pulsa para cargarla.',
  appUpdateApply: 'Cargar nueva versión',
  appUpdateOffline: 'Sin red. Prueba más tarde.',
  whatThisIs: 'Qué es esto',
  whatThisIsBody:
    'FactHunter es una capa fina que hace más divertido descubrir Wikipedia en el mundo real. Primero exploras el mapa en busca de rastros a lo lejos. Cuando estás lo bastante cerca, apuntas la cámara de la parte trasera del teléfono: los lugares aparecen como letreros en la calle; los desbloqueas y los guardas en un diario de campo. El contenido viene de Wikipedia; la app no lo posee.',
  privacy: 'Privacidad',
  privacyBody1:
    'La app no guarda nada en la nube. La colección, el estado de lectura y los puntos viven solo en el teléfono. FactHunter no sincroniza entre dispositivos.',
  privacyBody2:
    'Cambia de teléfono: exporta el archivo en el viejo, impórtalo en el nuevo. En Ajustes puedes vaciar la colección. Si pierdes el archivo, o borras los datos del sitio sin exportar, la colección desaparece. Los enlaces de Wikipedia que compartes van a Wikipedia. FactHunter no los guarda en la nube.',
  addToHome: 'Añadir a la pantalla de inicio',
  addToHomeBody:
    'FactHunter es un sitio web que instalas como app. No está en App Store ni en Google Play. Debes abrirla por HTTPS, o el teléfono rechazará la cámara y la brújula.',
  origin: 'Origen',
  originBody: 'La idea es de Reidar Kind. Desarrollado con ayuda de IA.',
  otherApps: 'Otras apps que he hecho',
  buyCoffee: 'Invítame a un café',
  buyCoffeeBody:
    'Esto es un proyecto de afición. Un café me ayuda a seguir trasteando en el tiempo libre.',
  ios1:
    'Abre FactHunter en Safari (no Chrome, no un enlace dentro de otra app).',
  ios2: 'Toca Compartir (el cuadrado con flecha hacia arriba) abajo en la pantalla.',
  ios3:
    'Desplázate por la hoja de Compartir y toca Añadir a pantalla de inicio. Si no lo ves: desliza la fila inferior o toca Editar acciones.',
  ios4: 'Toca Añadir. Abre FactHunter desde el nuevo icono.',
  ios5:
    'La app abre en Explorar. Cuando estés cerca: toca Empezar caza y permite cámara y ubicación.',
  ios6:
    'Brújula: Ajustes → Safari → Movimiento y orientación. Si añadiste la app a la pantalla de inicio: Ajustes → FactHunter → Movimiento y orientación.',
  iosNote:
    'La caza no funciona tan bien desde una pestaña normal de Safari como desde el icono de la pantalla de inicio. Empieza desde allí si falta la brújula.',
  android1: 'Abre FactHunter en Chrome (o Samsung Internet).',
  android2:
    'Toca el menú (tres puntos) arriba a la derecha, luego Instalar app o Añadir a pantalla de inicio. Algunos teléfonos también muestran un banner de instalación abajo.',
  android3: 'Abre FactHunter desde la pantalla de inicio.',
  android4:
    'La app abre en Explorar. Cuando estés cerca: toca Empezar caza y permite cámara y ubicación cuando el teléfono lo pida.',
  androidNote:
    'La brújula en Android sale del sensor de orientación del teléfono. Mantén el teléfono lejos de fundas magnéticas si la aguja salta.',
}

const pt: Copy = {
  navMain: 'Menu principal',
  tabRecon: 'Explorar',
  tabHunt: 'Caça',
  tabCollection: 'Coleção',
  menu: 'Menu',
  settings: 'Definições',
  about: 'Sobre a aplicação',
  back: 'Voltar',
  huntGateBody:
    'Agora apontas a câmara. Os sinais estão no mundo quando estás suficientemente perto. Câmara, posição e bússola ligam-se com o mesmo toque.',
  missingCamera: 'A câmara falta ou foi recusada',
  missingLocation: 'A posição falta ou foi recusada',
  missingCompass:
    'A bússola falta ou foi recusada. iPhone: Definições → Safari (ou FactHunter) → Movimento e orientação, depois Tentar novamente. Aceita o movimento quando o telefone perguntar.',
  missingHttps: 'Abre a aplicação por HTTPS, não http://192.168…',
  waitingCompass: 'A aguardar a bússola — mexe um pouco o telefone.',
  tryAgain: 'Tentar novamente',
  startHunt: 'Iniciar caça',
  huntHintIphone:
    'iPhone: Definições → Safari (ou a aplicação) → Movimento e orientação.',
  gpsUncertain: 'GPS incerto',
  wikiFetchFailed: 'Não foi possível obter lugares da Wikipedia',
  noPlacesHere: 'Não há lugares aqui — anda um pouco',
  moveCloser: 'Aproxima-te',
  reconTitle: 'Explorar',
  reconIntro:
    'Há conhecimento ao longe. Explora 2 km à tua volta. Os pontos mostram que há algo — não o quê. Caminha na direção deles e muda para Caça dentro do anel tracejado.',
  startRecon: 'Iniciar exploração',
  reconLiveTitle: 'Explorar · 2 km',
  reconWikiFailed: 'Não foi possível explorar a Wikipedia',
  reconEmpty: 'Nenhum rasto em 2 km. Vai para outro sítio.',
  reconHint:
    'Conhecimento ao longe — muda para Caça dentro do anel tracejado.',
  reconOsm: 'Mapa: OpenStreetMap',
  installHint: 'Melhor a partir do ecrã principal',
  collectionTitle: 'Coleção',
  points: '{score} pontos',
  search: 'Pesquisar',
  searchPlaceholder: 'Pesquisar no título e no excerto',
  filter: 'Filtro',
  filterAll: 'Todos',
  filterUnread: 'Não lidos',
  filterRead: 'Lidos',
  export: 'Exportar',
  import: 'Importar',
  importFailed: 'Não foi possível ler o ficheiro',
  importedNew: 'Importámos {count} factos novos',
  importChooseHelp:
    'Junta-o à coleção neste telefone, ou substitui-a. O mesmo artigo da Wikipedia em línguas diferentes conta uma vez; o idioma segue as fontes Wikipedia. Substituir apaga os lugares que só existem aqui.',
  importMerge: 'Juntar',
  importReplace: 'Substituir',
  importedReplaced: 'A coleção foi substituída.',
  emptyJournal: 'O diário está vazio. Sai e caça alguns factos.',
  read: 'Lido',
  unread: 'Não lido',
  close: 'Fechar',
  metersAway: 'A {m} m',
  readMoreWiki: 'Ler mais na Wikipedia',
  share: 'Partilhar',
  copy: 'Copiar',
  sms: 'SMS',
  email: 'E-mail',
  shareIntro: 'Vê o que encontrei com o FactHunter!',
  shareInstall: 'Instala a aplicação:',
  settingsTitle: 'Definições',
  language: 'Idioma',
  languageHelp:
    'Escolhe o idioma da aplicação. O idioma dos factos que encontras é definido nas fontes da Wikipedia.',
  langNo: 'Norsk',
  langEn: 'English',
  langDe: 'Deutsch',
  langEs: 'Español',
  langPt: 'Português',
  langFr: 'Français',
  wikiLimit: 'Resultados da Wikipedia',
  wikiLimitHelp:
    'Quantos lugares são obtidos à tua volta. Mais resultados tornam o mapa e a caça mais densos, mas o carregamento é mais pesado.',
  wikiSources: 'Fontes da Wikipedia',
  wikiSourcesHelp:
    'Uma a três edições da Wikipedia, por ordem de prioridade. O mesmo artigo (Wikidata) aparece uma só vez; o primeiro idioma ganha.',
  wikiSourcePrimary: 'Primeira',
  wikiSourceSecondary: 'Segunda',
  wikiSourceTertiary: 'Terceira',
  wikiSourceNone: 'Nenhuma',
  collectionReset: 'Coleção da Wikipedia',
  collectionResetHelp:
    'A coleção de lugares da Wikipedia desbloqueados fica só neste telefone. Os pontos vão com eles. Exporta primeiro se quiseres guardá-los.',
  collectionResetAction: 'Esvaziar coleção',
  collectionResetConfirm:
    'Apagar todos os lugares desbloqueados? Não dá para anular.',
  collectionResetConfirmAction: 'Esvaziar agora',
  collectionResetDone: 'A coleção está vazia.',
  cancel: 'Cancelar',
  appUpdateTitle: 'App',
  appUpdate: 'Procurar atualizações',
  appUpdateChecking: 'A procurar…',
  appUpdateCurrent: 'Tens a versão mais recente.',
  appUpdateAvailable: 'Nova versão. Toca para carregar.',
  appUpdateApply: 'Carregar nova versão',
  appUpdateOffline: 'Sem rede. Tenta mais tarde.',
  whatThisIs: 'O que isto é',
  whatThisIsBody:
    'O FactHunter é uma camada fina que torna a Wikipedia mais divertida de descobrir no mundo real. Primeiro explora o mapa à procura de rasto ao longe. Quando estás suficientemente perto, apontas a câmara nas costas do telefone: os lugares aparecem como sinais na rua; desbloqueias-nos e guardas-nos num diário de campo. O conteúdo vem da Wikipedia; a aplicação não o possui.',
  privacy: 'Privacidade',
  privacyBody1:
    'A aplicação não guarda nada na nuvem. A coleção, o estado de leitura e os pontos ficam só no telefone. O FactHunter não sincroniza entre dispositivos.',
  privacyBody2:
    'Mudas de telefone: exporta o ficheiro no antigo, importa no novo. Nas Definições podes esvaziar a coleção. Se perderes o ficheiro, ou apagares os dados do sítio sem exportar, a coleção desaparece. As ligações da Wikipedia que partilhas vão para a Wikipedia. O FactHunter não as guarda na nuvem.',
  addToHome: 'Adicionar ao ecrã principal',
  addToHomeBody:
    'O FactHunter é um sítio que instalas como aplicação. Não está na App Store nem no Google Play. Tens de o abrir por HTTPS, senão o telefone recusa a câmara e a bússola.',
  origin: 'Origem',
  originBody: 'A ideia é de Reidar Kind. Desenvolvido com ajuda de IA.',
  otherApps: 'Outras aplicações que fiz',
  buyCoffee: 'Oferece-me um café',
  buyCoffeeBody:
    'Isto é um projeto de hobby. Um café ajuda-me a continuar a mexer nas horas vagas.',
  ios1:
    'Abre o FactHunter no Safari (não no Chrome, não uma ligação dentro de outra aplicação).',
  ios2: 'Toca em Partilhar (o quadrado com seta para cima) no fundo do ecrã.',
  ios3:
    'Percorre a folha Partilhar e toca em Adicionar ao ecrã principal. Se não o vires: desliza a fila de baixo, ou toca em Editar ações.',
  ios4: 'Toca em Adicionar. Abre o FactHunter a partir do novo ícone.',
  ios5:
    'A aplicação abre em Explorar. Quando estiveres perto: toca em Iniciar caça e permite câmara e posição.',
  ios6:
    'Bússola: Definições → Safari → Movimento e orientação. Se adicionaste a aplicação ao ecrã principal: Definições → FactHunter → Movimento e orientação.',
  iosNote:
    'A caça não funciona tão bem a partir de um separador normal do Safari como a partir do ícone do ecrã principal. Começa daí se a bússola faltar.',
  android1: 'Abre o FactHunter no Chrome (ou Samsung Internet).',
  android2:
    'Toca no menu (três pontos) no canto superior direito, depois Instalar aplicação ou Adicionar ao ecrã inicial. Alguns telefones também mostram um banner de instalação em baixo.',
  android3: 'Abre o FactHunter a partir do ecrã inicial.',
  android4:
    'A aplicação abre em Explorar. Quando estiveres perto: toca em Iniciar caça e permite câmara e posição quando o telefone perguntar.',
  androidNote:
    'A bússola no Android vem do sensor de orientação do telefone. Mantém o telefone longe de capas magnéticas se a agulha saltar.',
}

const fr: Copy = {
  navMain: 'Menu principal',
  tabRecon: 'Explorer',
  tabHunt: 'Chasse',
  tabCollection: 'Collection',
  menu: 'Menu',
  settings: 'Réglages',
  about: 'À propos de l’app',
  back: 'Retour',
  huntGateBody:
    'Maintenant tu pointes la caméra. Les pancartes sont dans le monde quand tu es assez près. Caméra, position et boussole s’allument avec le même tap.',
  missingCamera: 'La caméra manque ou a été refusée',
  missingLocation: 'La position manque ou a été refusée',
  missingCompass:
    'La boussole manque ou a été refusée. iPhone : Réglages → Safari (ou FactHunter) → Mouvement et orientation, puis Réessayer. Accepte le mouvement quand le téléphone le demande.',
  missingHttps: 'Ouvre l’app en HTTPS, pas http://192.168…',
  waitingCompass: 'En attente de la boussole — bouge un peu le téléphone.',
  tryAgain: 'Réessayer',
  startHunt: 'Lancer la chasse',
  huntHintIphone:
    'iPhone : Réglages → Safari (ou l’app) → Mouvement et orientation.',
  gpsUncertain: 'GPS incertain',
  wikiFetchFailed: 'Impossible de charger les lieux depuis Wikipédia',
  noPlacesHere: 'Pas de lieux ici — marche un peu',
  moveCloser: 'Approche-toi',
  reconTitle: 'Explorer',
  reconIntro:
    'Il y a du savoir au loin. Explore 2 km autour de toi. Les points montrent que quelque chose est là — pas quoi. Marche vers eux, et passe à Chasse dans l’anneau en pointillés.',
  startRecon: 'Lancer l’exploration',
  reconLiveTitle: 'Explorer · 2 km',
  reconWikiFailed: 'Impossible d’explorer Wikipédia',
  reconEmpty: 'Aucune trace dans 2 km. Va ailleurs.',
  reconHint:
    'Du savoir au loin — passe à Chasse dans l’anneau en pointillés.',
  reconOsm: 'Carte : OpenStreetMap',
  installHint: 'Mieux depuis l’écran d’accueil',
  collectionTitle: 'Collection',
  points: '{score} points',
  search: 'Rechercher',
  searchPlaceholder: 'Rechercher dans le titre et l’extrait',
  filter: 'Filtre',
  filterAll: 'Tous',
  filterUnread: 'Non lus',
  filterRead: 'Lus',
  export: 'Exporter',
  import: 'Importer',
  importFailed: 'Impossible de lire le fichier',
  importedNew: '{count} nouveaux faits importés',
  importChooseHelp:
    'Fusionne avec la collection sur ce téléphone, ou remplace-la. Le même article Wikipédia en plusieurs langues ne compte qu’une fois ; la langue suit les sources Wikipédia. Remplacer efface les lieux qui n’existent qu’ici.',
  importMerge: 'Fusionner',
  importReplace: 'Remplacer',
  importedReplaced: 'La collection a été remplacée.',
  emptyJournal: 'Le journal est vide. Va chasser quelques faits.',
  read: 'Lu',
  unread: 'Non lu',
  close: 'Fermer',
  metersAway: 'À {m} m',
  readMoreWiki: 'Lire plus sur Wikipédia',
  share: 'Partager',
  copy: 'Copier',
  sms: 'SMS',
  email: 'E-mail',
  shareIntro: 'Regarde ce que j’ai trouvé avec FactHunter !',
  shareInstall: 'Installer l’app :',
  settingsTitle: 'Réglages',
  language: 'Langue',
  languageHelp:
    'Choisis la langue de l’app. La langue des faits que tu trouves est réglée sous les sources Wikipédia.',
  langNo: 'Norsk',
  langEn: 'English',
  langDe: 'Deutsch',
  langEs: 'Español',
  langPt: 'Português',
  langFr: 'Français',
  wikiLimit: 'Résultats Wikipédia',
  wikiLimitHelp:
    'Combien de lieux charger autour de toi. Plus de résultats densifient la carte et la chasse, mais le chargement est plus lourd.',
  wikiSources: 'Sources Wikipédia',
  wikiSourcesHelp:
    'Une à trois éditions de Wikipédia, par ordre de priorité. Le même article (Wikidata) n’apparaît qu’une fois ; la première langue gagne.',
  wikiSourcePrimary: 'Première',
  wikiSourceSecondary: 'Deuxième',
  wikiSourceTertiary: 'Troisième',
  wikiSourceNone: 'Aucune',
  collectionReset: 'Collection Wikipédia',
  collectionResetHelp:
    'La collection de lieux Wikipédia débloqués reste seulement sur ce téléphone. Les points suivent. Exporte d’abord si tu veux les garder.',
  collectionResetAction: 'Vider la collection',
  collectionResetConfirm:
    'Supprimer tous les lieux débloqués ? C’est irréversible.',
  collectionResetConfirmAction: 'Vider maintenant',
  collectionResetDone: 'La collection est vide.',
  cancel: 'Annuler',
  appUpdateTitle: 'App',
  appUpdate: 'Vérifier les mises à jour',
  appUpdateChecking: 'Vérification…',
  appUpdateCurrent: 'Tu as la dernière version.',
  appUpdateAvailable: 'Nouvelle version. Appuie pour la charger.',
  appUpdateApply: 'Charger la nouvelle version',
  appUpdateOffline: 'Pas de réseau. Réessaie plus tard.',
  whatThisIs: 'De quoi il s’agit',
  whatThisIsBody:
    'FactHunter est une couche mince qui rend Wikipédia plus amusant à découvrir dans le monde réel. D’abord tu explores la carte à la recherche de traces au loin. Quand tu es assez près, tu pointes la caméra au dos du téléphone : les lieux apparaissent comme des pancartes dans la rue ; tu les débloques et tu les ranges dans un journal de terrain. Le contenu vient de Wikipédia ; l’app ne le possède pas.',
  privacy: 'Confidentialité',
  privacyBody1:
    'L’app ne stocke rien dans le nuage. Collection, statut de lecture et points restent seulement sur le téléphone. FactHunter ne synchronise pas entre appareils.',
  privacyBody2:
    'Changer de téléphone : exporte le fichier sur l’ancien, importe-le sur le nouveau. Dans Réglages tu peux vider la collection. Si tu perds le fichier, ou que tu effaces les données du site sans exporter, la collection disparaît. Les liens Wikipédia que tu partages vont vers Wikipédia. FactHunter ne les stocke pas dans le nuage.',
  addToHome: 'Ajouter à l’écran d’accueil',
  addToHomeBody:
    'FactHunter est un site que tu installes comme app. Il n’est ni dans l’App Store ni dans Google Play. Tu dois l’ouvrir en HTTPS, sinon le téléphone refuse la caméra et la boussole.',
  origin: 'Origine',
  originBody: 'L’idée est de Reidar Kind. Développé avec l’aide de l’IA.',
  otherApps: 'D’autres apps que j’ai faites',
  buyCoffee: 'Offre-moi un café',
  buyCoffeeBody:
    'C’est un projet hobby. Un café m’aide à continuer à bricoler sur mon temps libre.',
  ios1:
    'Ouvre FactHunter dans Safari (pas Chrome, pas un lien dans une autre app).',
  ios2: 'Tape Partager (le carré avec une flèche vers le haut) en bas de l’écran.',
  ios3:
    'Fais défiler la feuille Partager et tape Sur l’écran d’accueil. Si tu ne le vois pas : balaye la rangée du bas, ou tape Modifier les actions.',
  ios4: 'Tape Ajouter. Ouvre FactHunter depuis la nouvelle icône.',
  ios5:
    'L’app s’ouvre sur Explorer. Quand tu es près : tape Lancer la chasse et autorise caméra et position.',
  ios6:
    'Boussole : Réglages → Safari → Mouvement et orientation. Si tu as ajouté l’app à l’écran d’accueil : Réglages → FactHunter → Mouvement et orientation.',
  iosNote:
    'La chasse marche moins bien depuis un onglet Safari normal que depuis l’icône de l’écran d’accueil. Pars de là si la boussole manque.',
  android1: 'Ouvre FactHunter dans Chrome (ou Samsung Internet).',
  android2:
    'Tape le menu (trois points) en haut à droite, puis Installer l’app ou Ajouter à l’écran d’accueil. Certains téléphones montrent aussi une bannière d’installation en bas.',
  android3: 'Ouvre FactHunter depuis l’écran d’accueil.',
  android4:
    'L’app s’ouvre sur Explorer. Quand tu es près : tape Lancer la chasse et autorise caméra et position quand le téléphone le demande.',
  androidNote:
    'La boussole sur Android vient du capteur d’orientation du téléphone. Éloigne le téléphone des coques magnétiques si l’aiguille saute.',
}

export const strings: Record<Locale, Copy> = {
  no,
  en,
  de,
  es,
  pt,
  fr,
}

export type MessageKey = keyof typeof no
