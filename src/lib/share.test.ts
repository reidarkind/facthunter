import { describe, expect, it } from 'vitest'
import { installUrl, shareText } from './share'

it('joins origin, base, install without double slashes', () => {
  expect(installUrl('https://ada.github.io', '/fact_hunter/')).toBe(
    'https://ada.github.io/fact_hunter/install',
  )
})

it('share text has wiki url, FactHunter, and install url', () => {
  const wiki = 'https://no.wikipedia.org/wiki/Nidarosdomen'
  const install = 'https://ada.github.io/fact_hunter/install'
  const text = shareText(wiki, install)
  expect(text).toContain(wiki)
  expect(text).toContain('FactHunter')
  expect(text).toContain(install)
  expect(text).toContain('Se hva jeg fant via FactHunter!')
})
