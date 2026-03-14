// src/admin/lib/adminTokens.ts
// All theme-aware color tokens for the admin panel.
// Import this wherever you need theme-conditional styles.

export const adminTokens = {
  dark: {
    // Backgrounds
    pageBg:       '#0b0d18',
    sidebarBg:    '#0f1117',
    cardBg:       '#1a1b2e',
    cardBgHover:  '#1e2038',
    inputBg:      '#0f1117',
    topbarBg:     'rgba(11,13,24,0.95)',
    modalBg:      '#1a1b2e',
    // Borders
    border:       'rgba(255,255,255,0.07)',
    borderMed:    'rgba(255,255,255,0.12)',
    borderInput:  'rgba(255,255,255,0.10)',
    // Text
    textPrimary:  '#f1f0ee',
    textSecondary:'#94a3b8',
    textMuted:    '#64748b',
    textLabel:    '#cbd5e1',
    // Sidebar
    navActive:    'linear-gradient(135deg, rgba(188,61,62,0.3), rgba(182,137,60,0.2))',
    navActiveBorder: 'rgba(188,61,62,0.3)',
    navHoverBg:   'rgba(255,255,255,0.05)',
    navIconActive:'#e69358',
    navIconIdle:  '#64748b',
    // Misc
    scrollbarThumb: 'rgba(255,255,255,0.1)',
  },
  light: {
    // Backgrounds
    pageBg:       '#f4f1eb',
    sidebarBg:    '#ffffff',
    cardBg:       '#ffffff',
    cardBgHover:  '#faf8f4',
    inputBg:      '#f8f6f1',
    topbarBg:     'rgba(244,241,235,0.97)',
    modalBg:      '#ffffff',
    // Borders
    border:       'rgba(0,0,0,0.07)',
    borderMed:    'rgba(0,0,0,0.12)',
    borderInput:  'rgba(0,0,0,0.15)',
    // Text
    textPrimary:  '#1a1410',
    textSecondary:'#57534e',
    textMuted:    '#a8a29e',
    textLabel:    '#44403c',
    // Sidebar
    navActive:    'linear-gradient(135deg, rgba(188,61,62,0.1), rgba(182,137,60,0.08))',
    navActiveBorder: 'rgba(188,61,62,0.25)',
    navHoverBg:   'rgba(0,0,0,0.04)',
    navIconActive:'#bc3d3e',
    navIconIdle:  '#a8a29e',
    // Misc
    scrollbarThumb: 'rgba(0,0,0,0.12)',
  },
} as const;

export type AdminTokens = typeof adminTokens.dark;