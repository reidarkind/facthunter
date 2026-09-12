import { useT } from '../i18n/useT'

export type SignKind = 'locked' | 'ready' | 'owned'

export function ArSign(props: {
  title: string
  kind: SignKind
  xPct: number
  yPct: number
  scale: number
  distanceM: number
  zIndex: number
  onClick: () => void
}) {
  const { title, kind, xPct, yPct, scale, distanceM, zIndex, onClick } = props
  const { t } = useT()
  const away = t('metersAway', { m: Math.round(distanceM) })
  return (
    <button
      type="button"
      className={`sign sign-${kind}`}
      style={{
        left: `${xPct}%`,
        top: `${yPct}%`,
        zIndex,
        transform: `translate(-50%, -100%) scale(${scale})`,
      }}
      onClick={kind === 'locked' ? undefined : onClick}
      aria-label={`${title}, ${away}`}
    >
      <span className="sign-pole" aria-hidden="true" />
      <span className="sign-plaque">
        <span className="sign-title">{title}</span>
        <span className="sign-distance">{away}</span>
        {kind === 'locked' ? (
          <span className="sign-hint">{t('moveCloser')}</span>
        ) : null}
        {kind === 'owned' ? (
          <span className="sign-owned" aria-hidden="true">
            ✓
          </span>
        ) : null}
      </span>
    </button>
  )
}
