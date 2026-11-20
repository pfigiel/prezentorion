import { useId } from 'react'

type Props = {
  className?: string
}

export const GiftMark = ({ className }: Props) => {
  const sky = `${useId()}-sky`

  return (
    <svg viewBox="0 0 240 240" aria-hidden="true" className={className}>
      <defs>
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
        strokeOpacity="0.15"
        strokeWidth="6"
      />
      <g
        transform="translate(43.2 45) scale(6.4)"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4.5 10.5V18a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-7.5" />
        <rect x="3" y="7" width="18" height="3.5" rx="1.2" />
        <path d="M12 7v13" />
        <ellipse cx="9.3" cy="5" rx="2.6" ry="1.6" transform="rotate(25 9.3 5)" />
        <ellipse cx="14.7" cy="5" rx="2.6" ry="1.6" transform="rotate(-25 14.7 5)" />
        <circle cx="12" cy="7.2" r="1.9" fill="#ffd36b" stroke="none" />
      </g>
    </svg>
  )
}
