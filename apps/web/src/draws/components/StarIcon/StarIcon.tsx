type Props = {
  className?: string
}

/** The four-pointed star of the logo, in the current text colour. */
export const StarIcon = ({ className }: Props) => (
  <svg viewBox="-14 -14 28 28" aria-hidden="true" className={className}>
    <path
      d="M0 -14 C2.3 -2.8 2.8 -2.3 14 0 C2.8 2.3 2.3 2.8 0 14 C-2.3 2.8 -2.8 2.3 -14 0 C-2.8 -2.3 -2.3 -2.8 0 -14 Z"
      fill="currentColor"
    />
  </svg>
)
