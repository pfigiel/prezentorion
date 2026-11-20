export const tokens = {
  font: {
    family: { body: "'Sora Variable', system-ui, sans-serif" },
    weight: { regular: '400', semibold: '600', bold: '700' },
  },
  text: {
    color: { default: '#f2f5fa', soft: '#cdd8e6', dimmed: '#9fb4cc', placeholder: '#7f95b0' },
    font: { size: { xs: '0.6875rem', sm: '0.8125rem', md: '0.9375rem' } },
    line: { height: '1.5' },
  },
  heading: {
    font: { size: { sm: '1.0625rem', md: '1.1875rem', lg: '1.625rem', xl: '1.875rem' } },
    line: { height: '1.2' },
    letter: { spacing: '-0.02em' },
  },
  /** Star gold: the main action, a status, the active tab. */
  accent: {
    color: { default: '#ffd36b', hover: '#ffe29a', subtle: 'rgb(255 211 107 / 16%)' },
    contrast: { color: '#0b1a33' },
    glow: { color: 'rgb(255 211 107 / 25%)' },
  },
  danger: { color: '#ff9b8a' },
  /** Night sky behind every screen, from the top of the page down. */
  sky: {
    color: { top: '#07111f', middle: '#0b1a33', bottom: '#133458' },
    star: { color: '#ffffff', warm: { color: '#ffe7a8' } },
  },
  control: {
    height: { sm: '2.25rem', md: '2.75rem', lg: '3.25rem' },
    /** Translucent, so a hovered control lightens whatever surface it sits on. */
    hover: { background: { color: 'rgb(255 255 255 / 8%)' } },
    background: { color: 'rgb(255 255 255 / 6%)' },
  },
  /** Translucent, so an edge or a divider stays as distinct on every surface it lies on. */
  border: { color: 'rgb(255 255 255 / 12%)', strong: { color: 'rgb(255 255 255 / 22%)' } },
  /** The sky, then each level of nesting a step further from it; see `data-surface` in globals.css. */
  surface: {
    canvas: { background: { color: 'transparent' } },
    1: { background: { color: 'rgb(255 255 255 / 6%)' } },
    2: { background: { color: 'rgb(255 255 255 / 4%)' } },
    3: { background: { color: 'rgb(255 255 255 / 4%)' } },
    /** For what floats above the page and must hide the sky beneath it: menus, modals. */
    raised: { background: { color: '#12274a' } },
  },
  spacing: { xs: '0.25rem', sm: '0.5rem', md: '0.875rem', lg: '1.25rem', xl: '1.75rem' },
  radius: { sm: '0.625rem', md: '0.875rem', lg: '1.25rem', full: '9999px' },
  shell: {
    width: '30rem',
    header: { height: '4rem' },
    nav: { height: '4.5rem', background: { color: 'rgb(5 12 24 / 75%)' } },
  },
  logo: { size: { md: '2rem', lg: '9.25rem' } },
  icon: { size: { sm: '0.9375rem', md: '1.375rem' } },
  shadow: { glow: '0 6px 24px rgb(255 211 107 / 25%)' },
  motion: { duration: '200ms', easing: 'ease' },
} as const

/** Resolved tokens, as the `--pz-*` custom properties a stylesheet reads. */
export type CssVariables = Record<string, string>
