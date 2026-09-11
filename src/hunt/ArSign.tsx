export type SignKind = 'locked' | 'ready' | 'owned'

export function ArSign(props: {
  title: string
  kind: SignKind
  xPct: number
  yPct: number
  scale: number
  onClick: () => void
}) {
  const { title, kind, xPct, yPct, scale, onClick } = props
  return (
    <button
      type="button"
      className={`sign sign-${kind}`}
      style={{
        left: `${xPct}%`,
        top: `${yPct}%`,
        transform: `translate(-50%, -100%) scale(${scale})`,
      }}
      onClick={kind === 'locked' ? undefined : onClick}
      aria-label={title}
    >
      <span className="sign-pole" aria-hidden="true" />
      <span className="sign-plaque">
        <span className="sign-title">{title}</span>
        {kind === 'locked' ? (
          <span className="sign-hint">Gå nærmere</span>
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
