export type ArticleRef = {
  id: string
  lang: string
  title: string
  wikidataId?: string
  langTitles?: Record<string, string>
}

function titlesMatch(a: string, b: string): boolean {
  return a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0
}

export function isSameArticle(a: ArticleRef, b: ArticleRef): boolean {
  if (a.id === b.id) return true
  if (a.wikidataId && b.wikidataId && a.wikidataId === b.wikidataId) return true
  const aAsB = a.langTitles?.[b.lang]
  if (aAsB && titlesMatch(aAsB, b.title)) return true
  const bAsA = b.langTitles?.[a.lang]
  if (bAsA && titlesMatch(bAsA, a.title)) return true
  return false
}
