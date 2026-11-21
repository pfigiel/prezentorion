import { useId } from 'react'
import { Constellation } from '../Constellation'

type Props = {
  className?: string
}

export const ConstellationMark = ({ className }: Props) => {
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
        strokeOpacity="0.12"
        strokeWidth="2"
      />
      <Constellation />
    </svg>
  )
}
