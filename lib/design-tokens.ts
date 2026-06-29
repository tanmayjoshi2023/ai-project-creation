/**
 * InvestIQ Design System Tokens
 * Source of Truth: Engineering Bible Volume 4
 * 
 * All visual properties trace back to these tokens.
 * No hardcoded values. No magic numbers. Everything defined here.
 */

// ============================================================================
// COLOR TOKENS - Light & Dark Mode
// ============================================================================

export const COLOR_TOKENS = {
  // Brand Colors (from Vol 4)
  BRAND_NAVY: '#1A3C5E',
  BRAND_BLUE: '#2563EB',
  BRAND_GOLD: '#C9A84C',

  // Verdict Colors (locked - do not change)
  VERDICT_SUCCESS: '#22C55E', // BUY - Green
  VERDICT_WARNING: '#F59E0B', // HOLD - Amber
  VERDICT_ERROR: '#EF4444', // PASS - Red

  // Neutral Colors
  NEUTRAL_900: '#111827', // Primary text
  NEUTRAL_50: '#F9FAFB', // Backgrounds

  // Dark Mode Variants
  DARK_BRAND_NAVY: '#0F2F4C',
  DARK_BRAND_BLUE: '#3B82F6',
  DARK_BRAND_GOLD: '#FBBF24',
  DARK_VERDICT_SUCCESS: '#4ADE80',
  DARK_VERDICT_WARNING: '#FBBF24',
  DARK_VERDICT_ERROR: '#F87171',
} as const

// ============================================================================
// TYPOGRAPHY TOKENS - From Vol 4
// ============================================================================

export const TYPOGRAPHY_TOKENS = {
  // Font Families
  FONT_SANS: "'Inter', 'Geist', system-ui, sans-serif",
  FONT_MONO: "'JetBrains Mono', 'Geist Mono', monospace",

  // Display Scale
  DISPLAY_XL: {
    fontSize: '48px',
    fontWeight: 800,
    lineHeight: 1.2,
    fontFamily: 'Inter',
  },

  // Heading Scale
  HEADING_XL: {
    fontSize: '28px',
    fontWeight: 700,
    lineHeight: 1.3,
    fontFamily: 'Inter',
  },
  HEADING_LG: {
    fontSize: '24px',
    fontWeight: 600,
    lineHeight: 1.3,
    fontFamily: 'Inter',
  },
  HEADING_MD: {
    fontSize: '20px',
    fontWeight: 600,
    lineHeight: 1.4,
    fontFamily: 'Inter',
  },

  // Body Scale
  BODY_LG: {
    fontSize: '18px',
    fontWeight: 400,
    lineHeight: 1.5,
    fontFamily: 'Inter',
  },
  BODY_MD: {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: 1.5,
    fontFamily: 'Inter',
  },
  BODY_SM: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.5,
    fontFamily: 'Inter',
  },

  // Label
  LABEL: {
    fontSize: '12px',
    fontWeight: 500,
    lineHeight: 1.4,
    fontFamily: 'Inter',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },

  // Monospace
  MONO: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.4,
    fontFamily: 'JetBrains Mono',
  },
} as const

// ============================================================================
// SPACING SCALE
// ============================================================================

export const SPACING_TOKENS = {
  XS: '4px',
  SM: '8px',
  MD: '16px',
  LG: '24px',
  XL: '32px',
  '2XL': '48px',
  '3XL': '64px',
} as const

// ============================================================================
// BORDER RADIUS SCALE
// ============================================================================

export const BORDER_RADIUS_TOKENS = {
  NONE: '0px',
  SM: '4px',
  MD: '8px',
  LG: '12px',
  XL: '16px',
  '2XL': '20px',
  FULL: '9999px',
} as const

// ============================================================================
// SHADOW SCALE
// ============================================================================

export const SHADOW_TOKENS = {
  XS: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  SM: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  MD: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  LG: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  XL: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2XL': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
} as const

// ============================================================================
// MOTION TOKENS - All animations reference these
// ============================================================================

export const MOTION_TOKENS = {
  // Duration Scale
  DURATION_FAST: '150ms',
  DURATION_NORMAL: '300ms',
  DURATION_SLOW: '500ms',

  // Easing Curves
  EASING_OUT: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  EASING_IN: 'cubic-bezier(0.4, 0, 0.6, 1)',
  EASING_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  EASING_LINEAR: 'linear',

  // Prefers Reduced Motion
  PREFERS_REDUCED_MOTION: '@media (prefers-reduced-motion: reduce)',
} as const

// ============================================================================
// ANIMATION DEFINITIONS
// ============================================================================

export const ANIMATION_TOKENS = {
  VERDICT_ENTRANCE: {
    name: 'verdict-entrance',
    duration: '150ms',
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    keyframes: {
      from: { transform: 'scale(0.8)', opacity: '0' },
      to: { transform: 'scale(1)', opacity: '1' },
    },
  },
  THOUGHT_SLIDE: {
    name: 'thought-slide',
    duration: '300ms',
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    keyframes: {
      from: { transform: 'translateY(8px)', opacity: '0' },
      to: { transform: 'translateY(0)', opacity: '1' },
    },
  },
  PROGRESS_RING: {
    name: 'progress-ring',
    duration: '2s',
    easing: 'ease-out',
    keyframes: {
      from: { strokeDashoffset: '339.29' },
      to: { strokeDashoffset: '0' },
    },
  },
  PULSE_RING: {
    name: 'pulse-ring',
    duration: '2s',
    easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
    keyframes: {
      '0%, 100%': { transform: 'scale(1)', opacity: '1' },
      '50%': { transform: 'scale(1.05)', opacity: '0.8' },
    },
  },
} as const

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const Z_INDEX_TOKENS = {
  BACKGROUND: 0,
  BASE: 10,
  DROPDOWN: 100,
  STICKY: 20,
  FLOATING: 30,
  MODAL: 1000,
  POPOVER: 1100,
  TOOLTIP: 1200,
} as const

// ============================================================================
// COMPONENT VARIANTS - Verdict Badge
// ============================================================================

export const VERDICT_BADGE_VARIANTS = {
  BUY: {
    backgroundColor: COLOR_TOKENS.VERDICT_SUCCESS,
    color: '#ffffff',
    borderColor: COLOR_TOKENS.VERDICT_SUCCESS,
    icon: 'TrendingUp',
  },
  HOLD: {
    backgroundColor: COLOR_TOKENS.VERDICT_WARNING,
    color: '#ffffff',
    borderColor: COLOR_TOKENS.VERDICT_WARNING,
    icon: 'Minus',
  },
  PASS: {
    backgroundColor: COLOR_TOKENS.VERDICT_ERROR,
    color: '#ffffff',
    borderColor: COLOR_TOKENS.VERDICT_ERROR,
    icon: 'TrendingDown',
  },
} as const

export const VERDICT_BADGE_SIZES = {
  sm: {
    container: '24px',
    icon: '12px',
    fontSize: '12px',
    padding: '4px 8px',
  },
  md: {
    container: '32px',
    icon: '16px',
    fontSize: '14px',
    padding: '6px 12px',
  },
  lg: {
    container: '40px',
    icon: '20px',
    fontSize: '16px',
    padding: '8px 16px',
  },
} as const

// ============================================================================
// CONTRAST RATIOS - WCAG AA Compliance
// ============================================================================

export const CONTRAST_RATIOS = {
  NORMAL_TEXT: '4.5:1', // Normal text requirement
  LARGE_TEXT: '3:1', // Large text requirement
  UI_COMPONENTS: '3:1', // UI component requirement
} as const

export default {
  COLOR_TOKENS,
  TYPOGRAPHY_TOKENS,
  SPACING_TOKENS,
  BORDER_RADIUS_TOKENS,
  SHADOW_TOKENS,
  MOTION_TOKENS,
  ANIMATION_TOKENS,
  Z_INDEX_TOKENS,
  VERDICT_BADGE_VARIANTS,
  VERDICT_BADGE_SIZES,
  CONTRAST_RATIOS,
}
