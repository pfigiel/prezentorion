/** Read when the reveal starts, so a choice made in system settings applies to the next reveal. */
export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
