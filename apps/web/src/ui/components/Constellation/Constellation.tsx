import { useId } from 'react'

type Props = {
  linesClassName?: string
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

/** The gift drawn as a constellation, on a 240-unit square: an SVG group for a `viewBox="0 0 240 240"`. */
export const Constellation = ({ linesClassName }: Props) => {
  const glow = `${useId()}-glow`

  return (
    <g transform="translate(0 -13)">
      <defs>
        <filter id={glow} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g
        className={linesClassName}
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
  )
}
