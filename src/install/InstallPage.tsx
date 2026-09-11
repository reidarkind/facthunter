export function InstallPage(props: { onBack?: () => void }) {
  return (
    <article className="install-page">
      {props.onBack ? (
        <p>
          <button type="button" className="text-button" onClick={props.onBack}>
            Tilbake
          </button>
        </p>
      ) : null}

      <header className="install-hero">
        <img
          src={`${import.meta.env.BASE_URL}icon.png`}
          alt=""
          width={96}
          height={96}
        />
        <h1>FactHunter</h1>
      </header>

      <section>
        <h2>Hva dette er</h2>
        <p>
          FactHunter er et tynt lag som gjør Wikipedia morsommere å oppdage i
          den virkelige verden. Du peker bakkameraet, ser steder som skilt i
          gata, låser dem opp og samler dem i en feltjournal. Innholdet kommer
          fra Wikipedia; appen eier det ikke.
        </p>
      </section>

      <section>
        <h2>Personvern</h2>
        <p>
          Appen lagrer ingenting i skyen. Samling, lest-status og poeng ligger
          bare lokalt på telefonen. FactHunter synker ikke mellom enheter.
        </p>
        <p>
          Bytt telefon: eksporter filen på den gamle, importer på den nye.
          Mister du filen, eller sletter nettsteddata uten eksport, er
          samlingen borte. Wikipedia-lenker du deler går til Wikipedia — det er
          ikke FactHunter-sky.
        </p>
      </section>

      <section>
        <h2>Legg til på hjem-skjermen</h2>
        <p>
          FactHunter er en nettside du installerer som app. Den ligger ikke i
          App Store eller Google Play. Du må åpne den over HTTPS, ellers nekter
          telefonen kamera og kompass.
        </p>

        <h3>iPhone</h3>
        <ol>
          <li>
            Åpne FactHunter i <strong>Safari</strong> (ikke Chrome, ikke en
            lenke inne i en annen app).
          </li>
          <li>Trykk Del (firkanten med pil opp) nederst på skjermen.</li>
          <li>
            Bla i Del-arket og trykk <strong>Legg til på Hjem-skjerm</strong>.
            Ser du den ikke: sveip nederste rad, eller trykk Rediger handlinger.
          </li>
          <li>Trykk Legg til. Åpne FactHunter fra det nye ikonet.</li>
          <li>
            Første gang du trykker Start jakt: tillat kamera og posisjon.
          </li>
          <li>
            Kompass: Innstillinger → Safari → Bevegelse og retning. Har du
            lagt til appen på hjem-skjermen: Innstillinger → FactHunter →
            Bevegelse og retning.
          </li>
        </ol>
        <p>
          Jakten virker ikke fra en vanlig Safari-fane like godt som fra
          hjem-skjerm-ikonet. Start derfra hvis kompasset mangler.
        </p>

        <h3>Android</h3>
        <ol>
          <li>
            Åpne FactHunter i <strong>Chrome</strong> (eller Samsung Internet).
          </li>
          <li>
            Trykk menyen (tre prikker) oppe til høyre, deretter{' '}
            <strong>Installer app</strong> eller Legg til på startskjerm. Noen
            telefoner viser også et installasjonsbanner nederst.
          </li>
          <li>Åpne FactHunter fra startskjermen.</li>
          <li>
            Trykk Start jakt og tillat kamera og posisjon når telefonen spør.
          </li>
        </ol>
        <p>
          Kompasset på Android kommer fra telefonens retningssensor. Hold
          telefonen unna magnetiske deksler hvis pila hopper.
        </p>
      </section>
    </article>
  )
}
