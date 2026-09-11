export function installUrl(origin: string, base: string): string {
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  const baseUrl = new URL(normalizedBase, origin)
  return new URL('install', baseUrl).href
}

export function shareText(pageUrl: string, installUrl: string): string {
  return `Se hva jeg fant via FactHunter!
${pageUrl}

Installer appen: ${installUrl}`
}
