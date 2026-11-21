export const tokens = {
  font: {
    family: { body: "'Sora Variable', system-ui, sans-serif" },
    weight: { regular: '400', semibold: '600', bold: '700' },
  },
  text: {
    color: {
      default: '#f2f5fa',
      soft: '#cdd8e6',
      dimmed: '#9fb4cc',
      label: '#8fa6c2',
      placeholder: '#7f95b0',
    },
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
    border: { color: 'rgb(255 211 107 / 35%)' },
  },
  danger: { color: '#ff9b8a' },
  /** Night sky behind every screen, from the top of the page down. */
  sky: {
    color: { top: '#07111f', middle: '#0b1a33', bottom: '#133458' },
    star: {
      color: '#ffffff',
      warm: { color: '#ffe7a8' },
      halo: { size: { sm: '4px', lg: '10px' } },
    },
    /** Rising off the bottom edge on a window wide enough to show sky beside the column. */
    glow: { color: 'rgb(255 211 107 / 16%)' },
    constellation: { size: '32.5rem' },
  },
  control: {
    height: { sm: '2.25rem', md: '2.75rem', lg: '3.25rem' },
    /** Translucent, so a hovered control lightens whatever surface it sits on. */
    hover: { background: { color: 'rgb(255 255 255 / 8%)' } },
    background: { color: 'rgb(255 255 255 / 6%)' },
  },
  /** Translucent, so an edge or a divider stays as distinct on every surface it lies on. */
  border: {
    color: 'rgb(255 255 255 / 12%)',
    quiet: { color: 'rgb(255 255 255 / 10%)' },
    strong: { color: 'rgb(255 255 255 / 22%)' },
  },
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
    width: '26.875rem',
    /** The column standing on the sky once the window is wider than it. */
    column: {
      background: { color: 'rgb(7 17 31 / 55%)' },
      shadow: '0 0 80px rgb(0 0 0 / 50%), 0 0 140px rgb(255 211 107 / 6%)',
    },
    header: { height: '4rem' },
    nav: { height: '4.5rem' },
    bar: { background: { color: 'rgb(5 12 24 / 75%)' } },
  },
  avatar: { size: { md: '2.25rem', lg: '4rem' } },
  priority: {
    dot: { size: { sm: '0.4375rem', lg: '1.375rem' } },
    off: { color: 'rgb(255 255 255 / 18%)' },
  },
  note: { background: { color: 'rgb(159 180 204 / 10%)' } },
  thumb: { size: '3.25rem', color: { from: '#1d3f66', to: '#2c5f82' } },
  photo: { preview: { height: '11rem' } },
  file: { picker: { height: '4.75rem' } },
  select: { dropdown: { height: '17rem' } },
  /** The tile a giver taps to reveal whom they drew, and the card it shrinks into. */
  reveal: { tile: { height: '28rem' }, mark: { size: '6rem' } },
  logo: { size: { md: '1.5rem', lg: '9.25rem' } },
  icon: { size: { sm: '0.9375rem', md: '1.375rem' } },
  shadow: { glow: '0 6px 24px rgb(255 211 107 / 25%)' },
  motion: { duration: '200ms', easing: 'ease' },
} as const

/** Resolved tokens, as the `--pz-*` custom properties a stylesheet reads. */
export type CssVariables = Record<string, string>
