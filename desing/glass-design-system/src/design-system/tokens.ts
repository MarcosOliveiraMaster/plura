export const colors = {
  // Primary Palette
  blue: {
    50:  '#e8f4ff',
    100: '#c3ddff',
    200: '#9ac6ff',
    300: '#6aadff',
    400: '#3d94ff',
    500: '#1a7aff',  // brand primary
    600: '#0062e6',
    700: '#004bbf',
    800: '#003499',
    900: '#001e6e',
  },
  white: {
    pure:     '#ffffff',
    glass:    'rgba(255, 255, 255, 0.12)',
    glassMid: 'rgba(255, 255, 255, 0.20)',
    glassHigh:'rgba(255, 255, 255, 0.35)',
    alpha10:  'rgba(255, 255, 255, 0.10)',
    alpha20:  'rgba(255, 255, 255, 0.20)',
    alpha40:  'rgba(255, 255, 255, 0.40)',
    alpha60:  'rgba(255, 255, 255, 0.60)',
    alpha80:  'rgba(255, 255, 255, 0.80)',
  },
  black: {
    pure:     '#000000',
    glass:    'rgba(0, 0, 0, 0.20)',
    glassMid: 'rgba(0, 0, 0, 0.35)',
    glassHigh:'rgba(0, 0, 0, 0.60)',
    alpha10:  'rgba(0, 0, 0, 0.10)',
    alpha20:  'rgba(0, 0, 0, 0.20)',
    alpha40:  'rgba(0, 0, 0, 0.40)',
    alpha60:  'rgba(0, 0, 0, 0.60)',
    alpha80:  'rgba(0, 0, 0, 0.80)',
  },
  // Semantic
  semantic: {
    success: '#22c55e',
    warning: '#f59e0b',
    error:   '#ef4444',
    info:    '#1a7aff',
  },
} as const

export const gradients = {
  heroBackground:   'linear-gradient(135deg, #0a0a1a 0%, #0d1b3e 50%, #071428 100%)',
  glassBlue:        'linear-gradient(135deg, rgba(26,122,255,0.25) 0%, rgba(0,98,230,0.15) 100%)',
  glassWhite:       'linear-gradient(135deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.08) 100%)',
  glassCard:        'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
  primaryButton:    'linear-gradient(135deg, #1a7aff 0%, #0062e6 100%)',
  primaryButtonHover:'linear-gradient(135deg, #3d94ff 0%, #1a7aff 100%)',
  shimmer:          'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
} as const

export const glass = {
  // Blur levels
  blur: {
    sm:  'blur(8px)',
    md:  'blur(16px)',
    lg:  'blur(24px)',
    xl:  'blur(40px)',
  },
  // Backdrop filters
  backdrop: {
    sm:  'blur(8px) saturate(1.4)',
    md:  'blur(16px) saturate(1.6)',
    lg:  'blur(24px) saturate(1.8)',
    xl:  'blur(40px) saturate(2.0)',
  },
  // Border
  border: {
    subtle:  '1px solid rgba(255,255,255,0.10)',
    default: '1px solid rgba(255,255,255,0.18)',
    strong:  '1px solid rgba(255,255,255,0.30)',
    blue:    '1px solid rgba(26,122,255,0.40)',
  },
  // Box shadows
  shadow: {
    sm:  '0 2px 8px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.10)',
    md:  '0 8px 24px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.12)',
    lg:  '0 16px 48px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.15)',
    xl:  '0 32px 80px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.18)',
    glow:'0 0 30px rgba(26,122,255,0.35), 0 8px 24px rgba(0,0,0,0.30)',
  },
} as const

export const typography = {
  fontFamily: {
    sans:  '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
    mono:  '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
  },
  fontSize: {
    xs:   '0.75rem',    // 12px
    sm:   '0.875rem',   // 14px
    base: '1rem',       // 16px
    lg:   '1.125rem',   // 18px
    xl:   '1.25rem',    // 20px
    '2xl':'1.5rem',     // 24px
    '3xl':'1.875rem',   // 30px
    '4xl':'2.25rem',    // 36px
    '5xl':'3rem',       // 48px
    '6xl':'3.75rem',    // 60px
  },
  fontWeight: {
    light:    300,
    regular:  400,
    medium:   500,
    semibold: 600,
    bold:     700,
    extrabold:800,
  },
  lineHeight: {
    tight:  1.2,
    snug:   1.375,
    normal: 1.5,
    relaxed:1.625,
    loose:  2,
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight:   '-0.025em',
    normal:  '0em',
    wide:    '0.025em',
    wider:   '0.05em',
    widest:  '0.1em',
  },
} as const

export const spacing = {
  0:   '0',
  1:   '0.25rem',  // 4px
  2:   '0.5rem',   // 8px
  3:   '0.75rem',  // 12px
  4:   '1rem',     // 16px
  5:   '1.25rem',  // 20px
  6:   '1.5rem',   // 24px
  8:   '2rem',     // 32px
  10:  '2.5rem',   // 40px
  12:  '3rem',     // 48px
  16:  '4rem',     // 64px
  20:  '5rem',     // 80px
  24:  '6rem',     // 96px
} as const

export const borderRadius = {
  none: '0',
  sm:   '0.375rem',   // 6px
  md:   '0.75rem',    // 12px
  lg:   '1rem',       // 16px
  xl:   '1.5rem',     // 24px
  '2xl':'2rem',       // 32px
  full: '9999px',
} as const

export const animation = {
  duration: {
    fast:   '150ms',
    normal: '250ms',
    slow:   '400ms',
    slower: '600ms',
  },
  easing: {
    ease:      'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn:    'cubic-bezier(0.4, 0, 1, 1)',
    easeOut:   'cubic-bezier(0, 0, 0.2, 1)',
    spring:    'cubic-bezier(0.34, 1.56, 0.64, 1)',
    bounce:    'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const

export const breakpoints = {
  sm:  '640px',
  md:  '768px',
  lg:  '1024px',
  xl:  '1280px',
  '2xl':'1536px',
} as const
