export const VISIBLE_RADIUS_M = 500
export const UNLOCK_RADIUS_M = 50
export const UNLOCK_ACCURACY_M = 50
export const FETCH_RADIUS_M = 1000
export const RECON_RADIUS_M = 2000
export const RECON_CLUSTER_M = 80
export const RECON_BLIP_CLUSTER_PX = 16
export const RECON_BLIP_RADIUS_PX = 6
export const RECON_CLUSTER_RADIUS_PX = 10
export const RECON_CLUSTER_RADIUS_WIDE_PX = 12
export const RECON_BLIP_COLOR = '#c9a227'
export const RECON_CLUSTER_COLOR = '#3d7a76'
export const RECON_CLUSTER_FILL_OPACITY = 0.55
export const RECON_RECENTER_M = 40
export const HEADING_SMOOTH = 0.28
export const FOV_HALF_DEG = 30
export const REFETCH_MOVE_M = 150
export const WIKI_LIMITS = [50, 100, 250, 500] as const
export const DEFAULT_WIKI_LIMIT = 50
export const WIKI_MAX_LIMIT = 500
export const DEFAULT_WIKI_LANGS = ['no', 'en'] as const
export const WIKI_SOURCE_LANGS = [
  { code: 'no', name: 'Norsk bokmål' },
  { code: 'nn', name: 'Norsk nynorsk' },
  { code: 'en', name: 'English' },
  { code: 'sv', name: 'Svenska' },
  { code: 'da', name: 'Dansk' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'fi', name: 'Suomi' },
  { code: 'is', name: 'Íslenska' },
  { code: 'pl', name: 'Polski' },
  { code: 'pt', name: 'Português' },
  { code: 'cs', name: 'Čeština' },
  { code: 'hu', name: 'Magyar' },
  { code: 'ro', name: 'Română' },
  { code: 'el', name: 'Ελληνικά' },
  { code: 'hr', name: 'Hrvatski' },
  { code: 'sk', name: 'Slovenčina' },
  { code: 'sl', name: 'Slovenščina' },
  { code: 'et', name: 'Eesti' },
  { code: 'lv', name: 'Latviešu' },
  { code: 'lt', name: 'Lietuvių' },
  { code: 'ru', name: 'Русский' },
  { code: 'uk', name: 'Українська' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'ar', name: 'العربية' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' },
  { code: 'ca', name: 'Català' },
  { code: 'eu', name: 'Euskara' },
] as const
export type WikiSourceLang = (typeof WIKI_SOURCE_LANGS)[number]['code']
export const RECON_BEAM_COLOR = '#e2473a'
export const POINTS_UNLOCK = 10
export const POINTS_READ = 5
export const APP_NAME = 'FactHunter'
