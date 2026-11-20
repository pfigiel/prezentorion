import { useId } from 'react'

type Props = {
  className?: string
}

const stars = [
  [64, 96, 5],
  [176, 96, 4],
  [176, 118, 3.5],
  [64, 118, 3.5],
  [76, 196, 4.5],
  [164, 196, 5.5],
  [120, 196, 3.5],
  [80, 73.5, 4],
  [160, 73.5, 4],
] as const

export const ConstellationMark = ({ className }: Props) => {
  const id = useId()
  const glow = `${id}-glow`
  const sky = `${id}-sky`

  return (
    <svg viewBox="0 0 240 240" aria-hidden="true" className={className}>
      <defs>
        <filter id={glow} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1a33" />
          <stop offset="0.62" stopColor="#14365a" />
          <stop offset="1" stopColor="#2c5f82" />
        </linearGradient>
      </defs>
      <rect
        width="240"
        height="240"
        rx="54"
        fill={`url(#${sky})`}
        stroke="#ffffff"
        strokeOpacity="0.12"
        strokeWidth="2"
      />
      <g transform="translate(0 -13)">
        <g
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.55"
        >
          <path d="M64 96 L176 96 L176 118 L64 118 Z" />
          <path d="M76 118 L76 196 L164 196 L164 118" />
          <path d="M120 96 L120 196" />
          <ellipse cx="98" cy="82" rx="20" ry="12" transform="rotate(25 98 82)" />
          <ellipse cx="142" cy="82" rx="20" ry="12" transform="rotate(-25 142 82)" />
        </g>
        <g fill="#ffffff" filter={`url(#${glow})`}>
          {stars.map(([cx, cy, r]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
          ))}
        </g>
        <path
          filter={`url(#${glow})`}
          transform="translate(120 96)"
          d="M0 -16 C2.3 -2.8 2.8 -2.3 16 0 C2.8 2.3 2.3 2.8 0 16 C-2.3 2.8 -2.8 2.3 -16 0 C-2.8 -2.3 -2.3 -2.8 0 -16 Z"
          fill="#ffd36b"
        />
      </g>
    </svg>
  )
}
