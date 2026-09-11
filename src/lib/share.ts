export function installUrl(origin: string, base: string): string {
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  const baseUrl = new URL(normalizedBase, origin)
  return new URL('install', baseUrl).href
}

export function shareText(
  pageUrl: string,
  installUrl: string,
  intro = 'Se hva jeg fant via FactHunter!',
  installLine = 'Installer appen:',
): string {
  return `${intro}
${pageUrl}

${installLine} ${installUrl}`
}
