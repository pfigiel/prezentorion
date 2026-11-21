type Props = {
  className?: string
}

export const GiftMark = ({ className }: Props) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 10.5V18a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-7.5" />
      <rect x="3" y="7" width="18" height="3.5" rx="1.2" />
      <path d="M12 7v13" />
      <ellipse cx="9.3" cy="5" rx="2.6" ry="1.6" transform="rotate(25 9.3 5)" />
      <ellipse cx="14.7" cy="5" rx="2.6" ry="1.6" transform="rotate(-25 14.7 5)" />
    </g>
    <circle cx="12" cy="7.2" r="1.7" fill="#ffd36b" />
  </svg>
)
