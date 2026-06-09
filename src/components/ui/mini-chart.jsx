// MiniChart — small line / bar / area sparkline (UI spec §2). Hand-rolled SVG,
// no chart lib. Accepts a numeric series; renders responsively to its box.
const COLORS = { ink: '#1A1A1A', action: '#2C5BAA', risk: '#C9483D', ok: '#4C7A3B' }

export function MiniChart({
  points = [],
  kind = 'line',
  height = 48,
  color = 'ink',
  className,
}) {
  const data = points.length ? points : [0]
  const w = 200
  const h = height
  const pad = 6
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const stroke = COLORS[color] || color
  const stepX = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0
  const xy = (v, i) => {
    const x = pad + i * stepX
    const y = h - pad - ((v - min) / range) * (h - pad * 2)
    return [x, y]
  }
  const path = data
    .map((v, i) => { const [x, y] = xy(v, i); return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}` })
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={className}
      style={{ width: '100%', height, display: 'block' }}
      aria-hidden="true"
    >
      {kind === 'area' && (
        <path d={`${path} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`} fill={stroke} fillOpacity="0.1" stroke="none" />
      )}
      {(kind === 'line' || kind === 'area') && (
        <path d={path} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      )}
      {kind === 'line' &&
        data.map((v, i) => { const [x, y] = xy(v, i); return <circle key={i} cx={x} cy={y} r="2" fill={stroke} /> })}
      {kind === 'bar' &&
        data.map((v, i) => {
          const bw = (w - pad * 2) / data.length * 0.6
          const x = pad + i * ((w - pad * 2) / data.length) + ((w - pad * 2) / data.length - bw) / 2
          const bh = ((v - min) / range) * (h - pad * 2)
          return <rect key={i} x={x} y={h - pad - bh} width={bw} height={bh} fill={stroke} rx="1" />
        })}
    </svg>
  )
}
