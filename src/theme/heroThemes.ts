// src/theme/heroThemes.ts
// ─────────────────────────────────────────────────────────────────────────────
// WING & WEFT — CENTRALISED HERO THEME SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
//
//  ONE FILE TO RULE THEM ALL.
//  Change ACTIVE_HERO_THEME here and every page updates automatically.
//
//  Available themes:
//    'silkDusk'       → A · deep charcoal → amber         (default)
//    'oceanIndigo'    → B · deep navy → teal
//    'sandalwoodDusk' → C · near-black → warm sandalwood  (most premium)
//    'roseSilk'       → D · midnight maroon → rose pink   (festive / bridal)
//    'mysoreViolet'   → E · midnight blue → violet        (regal)
//
// ─────────────────────────────────────────────────────────────────────────────

export const ACTIVE_HERO_THEME = 'roseSilk'; // ← change this ONE line to swap ALL pages

// ─── Theme shape ──────────────────────────────────────────────────────────────

export interface HeroTheme {
  // Hero banner
  background:    string;
  radialGlow:    string;
  threadPrimary: string;
  threadAccent:  string;
  eyebrow:       string;
  h1:            string;
  tagline:       string;
  diamond:       string;
  rule:          string;
  ringColor:     string;

  // Page-wide accent colours
  threadColor1:  string;
  threadColor2:  string;
  accentPrimary: string;
  accentSecondary: string;

  // Icon / card colours (OurStory, Contact)
  iconBg:        string;
  iconHoverBg:   string;
  iconBorder:    string;
  iconColor:     string;
  cardIconColor: string;

  // Info row hover
  infoRowHoverDark:  string;
  infoRowHoverLight: string;

  // Link hover
  linkHover: string;

  // Input underline gradient
  inputUnderline1: string;
  inputUnderline2: string;

  // Submit / CTA button
  submitBg:     string;
  submitShadow: string;
  submitText:   string;

  // Primary CTA button (shared across pages)
  ctaBg:        string;
  ctaShadow:    string;
  ctaText:      string;

  // Card dividers
  cardDividerDark:  string;
  cardDividerLight: string;

  // Page background accent (Contact)
  pageBgAccentDark:  string;
  pageBgAccentLight: string;

  // Logo box (OurStory)
  glowColorDark:  string;
  glowColorLight: string;
  ringBorderDark:  string;
  ringBorderLight: string;
  cornerStroke:  string;

  // Story text
  eyebrowLine:  string;
  eyebrowText:  string;
  storyDivider: { dark: string; light: string };

  // Orbit dots (OurStory)
  orbitColors: { color: string; shadow: string }[];

  // Search page
  searchAccentBg:    string;  // gradient behind the search icon / result count chip
  searchHighlight:   string;  // colour for the highlighted query term
  searchEmptyGlow:   string;  // radial behind the empty-state illustration

  // 404 page
  notFoundPrimary: string;    // 4's text colour
  notFoundShimmer: string;    // shimmer gradient for the 0

  // Product detail page
  productBadgeBg:   string;   // gradient for discount / fabric badge
  productBadgeText: string;
  productCtaBg:     string;   // WhatsApp CTA (always #25D366 per brand, but fallback)
  productLinkHover: string;   // breadcrumb / accordion hover colour
  productDotActive: string;   // active carousel dot gradient
  accordionHover:   string;   // title hover colour
  specRowDivider:   { dark: string; light: string };

  // Footer / WhatsApp section
  waSectionBgDark:  string;
  waSectionBgLight: string;
  footerBannerBg:   string;
  footerButtonBg:   string;
  footerButtonText: string;
  heartFill:        string;
  naviLinkColor:    string;
}

// ─── Theme definitions ────────────────────────────────────────────────────────

const HERO_THEMES: Record<string, HeroTheme> = {

  // ── A · Silk Dusk — deep charcoal → burnt amber ───────────────────────────
  silkDusk: {
    background:    'linear-gradient(150deg, #140a06 0%, #2c1010 30%, #5c1f1a 60%, #8b3a1a 80%, #b5692a 100%)',
    radialGlow:    'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(180,90,30,0.22) 0%, transparent 70%)',
    threadPrimary: '#d4924a',
    threadAccent:  '#bc3d3e',
    eyebrow:       'rgba(212,160,96,0.92)',
    h1:            '#f5ead8',
    tagline:       'rgba(245,234,216,0.72)',
    diamond:       '#d4a060',
    rule:          'rgba(212,160,96,0.75)',
    ringColor:     'rgba(212,160,96,0.10)',

    threadColor1:    '#bc3d3e',
    threadColor2:    '#b6893c',
    accentPrimary:   '#bc3d3e',
    accentSecondary: '#b6893c',

    iconBg:        'linear-gradient(135deg, rgba(188,61,62,0.12), rgba(182,137,60,0.12))',
    iconHoverBg:   'linear-gradient(135deg, rgba(188,61,62,0.20), rgba(182,137,60,0.20))',
    iconBorder:    'rgba(182,137,60,0.28)',
    iconColor:     '#b6893c',
    cardIconColor: '#b6893c',

    infoRowHoverDark:  'rgba(182,137,60,0.07)',
    infoRowHoverLight: 'rgba(188,61,62,0.05)',
    linkHover:         '#bc3d3e',

    inputUnderline1: '#bc3d3e',
    inputUnderline2: '#b6893c',

    submitBg:     'linear-gradient(115deg, #bc3d3e 0%, #a8322f 40%, #b6893c 100%)',
    submitShadow: 'rgba(188,61,62,0.35)',
    submitText:   '#f5ead8',

    ctaBg:     'linear-gradient(115deg, #bc3d3e 0%, #a8322f 40%, #b6893c 100%)',
    ctaShadow: 'rgba(188,61,62,0.40)',
    ctaText:   '#e9e3cb',

    cardDividerDark:  'rgba(182,137,60,0.15)',
    cardDividerLight: 'rgba(188,61,62,0.12)',

    pageBgAccentDark:  'rgba(42,31,26,0.6)',
    pageBgAccentLight: 'rgba(188,61,62,0.03)',

    glowColorDark:  'radial-gradient(circle, rgba(188,61,62,0.18) 0%, transparent 65%)',
    glowColorLight: 'radial-gradient(circle, rgba(188,61,62,0.10) 0%, transparent 65%)',
    ringBorderDark:  'rgba(188,61,62,0.10)',
    ringBorderLight: 'rgba(188,61,62,0.08)',
    cornerStroke:  '#b6893c',
    eyebrowLine:   '#bc3d3e',
    eyebrowText:   '#b6893c',
    storyDivider:  { dark: '#3a2e24', light: '#e9e3cb' },

    orbitColors: [
      { color: '#bc3d3e', shadow: '#bc3d3e' },
      { color: '#b6893c', shadow: '#b6893c' },
      { color: '#e69358', shadow: '#e69358' },
      { color: '#bc3d3e', shadow: '#bc3d3e' },
    ],

    searchAccentBg:  'linear-gradient(135deg, rgba(188,61,62,0.12), rgba(182,137,60,0.10))',
    searchHighlight: '#bc3d3e',
    searchEmptyGlow: 'radial-gradient(circle, rgba(188,61,62,0.12) 0%, transparent 65%)',

    notFoundPrimary: '#f0e8d6',
    notFoundShimmer: 'linear-gradient(90deg,#bc3d3e 0%,#e69358 20%,#f0c070 35%,#b6893c 50%,#f0c070 65%,#e69358 80%,#bc3d3e 100%)',

    productBadgeBg:   'linear-gradient(135deg, #bc3d3e, #b6893c)',
    productBadgeText: '#f5ead8',
    productCtaBg:     '#25D366',
    productLinkHover: '#bc3d3e',
    productDotActive: 'linear-gradient(90deg, #bc3d3e, #b6893c)',
    accordionHover:   '#bc3d3e',
    specRowDivider:   { dark: '#3a2e24', light: '#EDE5D4' },

    waSectionBgDark:  'linear-gradient(135deg, #231d17 0%, #2e1a1b 50%, #231d17 100%)',
    waSectionBgLight: 'linear-gradient(135deg, #7A1F2E 0%, #5C1520 40%, #9C6F2E 100%)',
    footerBannerBg:   'linear-gradient(135deg, #7A1F2E, #9C6F2E)',
    footerButtonBg:   '#FAF6EF',
    footerButtonText: '#7A1F2E',
    heartFill:        '#7A1F2E',
    naviLinkColor:    '#C49A4A',
  },

  // ── B · Ocean Indigo — deep navy → teal ──────────────────────────────────
  oceanIndigo: {
    background:    'linear-gradient(150deg, #0a0f14 0%, #0f2233 25%, #1a3d5c 55%, #1e5c72 78%, #1b7a7a 100%)',
    radialGlow:    'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(26,122,122,0.22) 0%, transparent 70%)',
    threadPrimary: '#4ab0c8',
    threadAccent:  '#2a7aaa',
    eyebrow:       'rgba(180,220,210,0.92)',
    h1:            '#e8f5f2',
    tagline:       'rgba(232,245,242,0.72)',
    diamond:       '#7ecec4',
    rule:          'rgba(126,206,196,0.75)',
    ringColor:     'rgba(180,220,210,0.10)',

    threadColor1:    '#2a7aaa',
    threadColor2:    '#4ab0c8',
    accentPrimary:   '#2a7aaa',
    accentSecondary: '#4ab0c8',

    iconBg:        'linear-gradient(135deg, rgba(26,92,114,0.14), rgba(74,176,200,0.12))',
    iconHoverBg:   'linear-gradient(135deg, rgba(26,92,114,0.22), rgba(74,176,200,0.20))',
    iconBorder:    'rgba(74,176,200,0.30)',
    iconColor:     '#4ab0c8',
    cardIconColor: '#4ab0c8',

    infoRowHoverDark:  'rgba(74,176,200,0.07)',
    infoRowHoverLight: 'rgba(26,92,114,0.05)',
    linkHover:         '#1a5c72',

    inputUnderline1: '#2a7aaa',
    inputUnderline2: '#4ab0c8',

    submitBg:     'linear-gradient(115deg, #1a5c72 0%, #0d3d50 40%, #1b7a7a 100%)',
    submitShadow: 'rgba(26,92,114,0.38)',
    submitText:   '#e8f5f2',

    ctaBg:     'linear-gradient(115deg, #1a5c72 0%, #0d3d50 40%, #1b7a7a 100%)',
    ctaShadow: 'rgba(26,92,114,0.42)',
    ctaText:   '#e8f5f2',

    cardDividerDark:  'rgba(74,176,200,0.15)',
    cardDividerLight: 'rgba(26,92,114,0.12)',

    pageBgAccentDark:  'rgba(10,22,40,0.6)',
    pageBgAccentLight: 'rgba(26,92,114,0.03)',

    glowColorDark:  'radial-gradient(circle, rgba(26,122,122,0.18) 0%, transparent 65%)',
    glowColorLight: 'radial-gradient(circle, rgba(26,122,122,0.10) 0%, transparent 65%)',
    ringBorderDark:  'rgba(74,176,200,0.12)',
    ringBorderLight: 'rgba(74,176,200,0.09)',
    cornerStroke:  '#4ab0c8',
    eyebrowLine:   '#2a7aaa',
    eyebrowText:   '#4ab0c8',
    storyDivider:  { dark: '#1a2e3a', light: '#c8e8ee' },

    orbitColors: [
      { color: '#2a7aaa', shadow: '#2a7aaa' },
      { color: '#4ab0c8', shadow: '#4ab0c8' },
      { color: '#7ecec4', shadow: '#7ecec4' },
      { color: '#2a7aaa', shadow: '#2a7aaa' },
    ],

    searchAccentBg:  'linear-gradient(135deg, rgba(26,92,114,0.14), rgba(74,176,200,0.10))',
    searchHighlight: '#2a7aaa',
    searchEmptyGlow: 'radial-gradient(circle, rgba(26,122,122,0.12) 0%, transparent 65%)',

    notFoundPrimary: '#e8f5f2',
    notFoundShimmer: 'linear-gradient(90deg,#2a7aaa 0%,#4ab0c8 20%,#7ecec4 35%,#4ab0c8 50%,#7ecec4 65%,#4ab0c8 80%,#2a7aaa 100%)',

    productBadgeBg:   'linear-gradient(135deg, #2a7aaa, #4ab0c8)',
    productBadgeText: '#e8f5f2',
    productCtaBg:     '#25D366',
    productLinkHover: '#2a7aaa',
    productDotActive: 'linear-gradient(90deg, #2a7aaa, #4ab0c8)',
    accordionHover:   '#2a7aaa',
    specRowDivider:   { dark: '#1a2e3a', light: '#c8e8ee' },

    waSectionBgDark:  'linear-gradient(135deg, #0a1628 0%, #0f2233 50%, #0a1628 100%)',
    waSectionBgLight: 'linear-gradient(135deg, #0f2233 0%, #1a3d5c 40%, #1b7a7a 100%)',
    footerBannerBg:   'linear-gradient(135deg, #0f2233, #1b7a7a)',
    footerButtonBg:   '#e8f5f2',
    footerButtonText: '#0f2233',
    heartFill:        '#1a5c72',
    naviLinkColor:    '#4ab0c8',
  },

  // ── C · Sandalwood Dusk — near-black → warm sandalwood gold ──────────────
  sandalwoodDusk: {
    background:    'linear-gradient(150deg, #0d0a06 0%, #1a1408 25%, #362410 50%, #5c3d1a 75%, #8c6030 100%)',
    radialGlow:    'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(92,61,26,0.18) 0%, transparent 70%)',
    threadPrimary: '#c8a86a',
    threadAccent:  '#8c6030',
    eyebrow:       'rgba(220,196,150,0.92)',
    h1:            '#f7efde',
    tagline:       'rgba(247,239,222,0.72)',
    diamond:       '#c8a86a',
    rule:          'rgba(200,168,106,0.75)',
    ringColor:     'rgba(220,196,150,0.10)',

    threadColor1:    '#8c6030',
    threadColor2:    '#c8a86a',
    accentPrimary:   '#8c6030',
    accentSecondary: '#c8a86a',

    iconBg:        'linear-gradient(135deg, rgba(140,96,48,0.14), rgba(200,168,106,0.12))',
    iconHoverBg:   'linear-gradient(135deg, rgba(140,96,48,0.22), rgba(200,168,106,0.20))',
    iconBorder:    'rgba(200,168,106,0.30)',
    iconColor:     '#c8a86a',
    cardIconColor: '#c8a86a',

    infoRowHoverDark:  'rgba(200,168,106,0.07)',
    infoRowHoverLight: 'rgba(140,96,48,0.05)',
    linkHover:         '#8c6030',

    inputUnderline1: '#8c6030',
    inputUnderline2: '#c8a86a',

    submitBg:     'linear-gradient(115deg, #8c6030 0%, #5c3d1a 40%, #c8a86a 100%)',
    submitShadow: 'rgba(140,96,48,0.38)',
    submitText:   '#f7efde',

    ctaBg:     'linear-gradient(115deg, #8c6030 0%, #5c3d1a 40%, #c8a86a 100%)',
    ctaShadow: 'rgba(140,96,48,0.42)',
    ctaText:   '#f7efde',

    cardDividerDark:  'rgba(200,168,106,0.15)',
    cardDividerLight: 'rgba(140,96,48,0.12)',

    pageBgAccentDark:  'rgba(13,10,6,0.6)',
    pageBgAccentLight: 'rgba(140,96,48,0.03)',

    glowColorDark:  'radial-gradient(circle, rgba(140,96,48,0.18) 0%, transparent 65%)',
    glowColorLight: 'radial-gradient(circle, rgba(140,96,48,0.10) 0%, transparent 65%)',
    ringBorderDark:  'rgba(200,168,106,0.12)',
    ringBorderLight: 'rgba(200,168,106,0.09)',
    cornerStroke:  '#c8a86a',
    eyebrowLine:   '#8c6030',
    eyebrowText:   '#c8a86a',
    storyDivider:  { dark: '#2e2410', light: '#e8d8b0' },

    orbitColors: [
      { color: '#8c6030', shadow: '#8c6030' },
      { color: '#c8a86a', shadow: '#c8a86a' },
      { color: '#e0c080', shadow: '#e0c080' },
      { color: '#8c6030', shadow: '#8c6030' },
    ],

    searchAccentBg:  'linear-gradient(135deg, rgba(140,96,48,0.14), rgba(200,168,106,0.10))',
    searchHighlight: '#8c6030',
    searchEmptyGlow: 'radial-gradient(circle, rgba(140,96,48,0.12) 0%, transparent 65%)',

    notFoundPrimary: '#f7efde',
    notFoundShimmer: 'linear-gradient(90deg,#8c6030 0%,#c8a86a 20%,#e0c080 35%,#c8a86a 50%,#e0c080 65%,#c8a86a 80%,#8c6030 100%)',

    productBadgeBg:   'linear-gradient(135deg, #8c6030, #c8a86a)',
    productBadgeText: '#f7efde',
    productCtaBg:     '#25D366',
    productLinkHover: '#8c6030',
    productDotActive: 'linear-gradient(90deg, #8c6030, #c8a86a)',
    accordionHover:   '#8c6030',
    specRowDivider:   { dark: '#2e2410', light: '#e8d8b0' },

    waSectionBgDark:  'linear-gradient(135deg, #1a1408 0%, #2e2010 50%, #1a1408 100%)',
    waSectionBgLight: 'linear-gradient(135deg, #5c3d1a 0%, #362410 40%, #8c6030 100%)',
    footerBannerBg:   'linear-gradient(135deg, #5c3d1a, #8c6030)',
    footerButtonBg:   '#f7efde',
    footerButtonText: '#5c3d1a',
    heartFill:        '#8c6030',
    naviLinkColor:    '#c8a86a',
  },

  // ── D · Rose Silk — midnight maroon → rose pink ───────────────────────────
  roseSilk: {
    background:    'linear-gradient(150deg, #10060a 0%, #280a18 25%, #520a30 50%, #8c1a4a 75%, #b52260 100%)',
    radialGlow:    'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(140,26,74,0.22) 0%, transparent 70%)',
    threadPrimary: '#f0a0bc',
    threadAccent:  '#b52260',
    eyebrow:       'rgba(255,192,210,0.92)',
    h1:            '#fdeef4',
    tagline:       'rgba(253,238,244,0.72)',
    diamond:       '#f0a0bc',
    rule:          'rgba(240,160,188,0.75)',
    ringColor:     'rgba(255,192,210,0.10)',

    threadColor1:    '#b52260',
    threadColor2:    '#f0a0bc',
    accentPrimary:   '#b52260',
    accentSecondary: '#d06090',

    iconBg:        'linear-gradient(135deg, rgba(140,26,74,0.14), rgba(240,160,188,0.12))',
    iconHoverBg:   'linear-gradient(135deg, rgba(140,26,74,0.22), rgba(240,160,188,0.20))',
    iconBorder:    'rgba(240,160,188,0.30)',
    iconColor:     '#d06090',
    cardIconColor: '#d06090',

    infoRowHoverDark:  'rgba(240,160,188,0.07)',
    infoRowHoverLight: 'rgba(140,26,74,0.05)',
    linkHover:         '#b52260',

    inputUnderline1: '#b52260',
    inputUnderline2: '#f0a0bc',

    submitBg:     'linear-gradient(115deg, #8c1a4a 0%, #6a1038 40%, #b52260 100%)',
    submitShadow: 'rgba(181,34,96,0.38)',
    submitText:   '#fdeef4',

    ctaBg:     'linear-gradient(115deg, #8c1a4a 0%, #6a1038 40%, #b52260 100%)',
    ctaShadow: 'rgba(181,34,96,0.42)',
    ctaText:   '#fdeef4',

    cardDividerDark:  'rgba(240,160,188,0.15)',
    cardDividerLight: 'rgba(140,26,74,0.12)',

    pageBgAccentDark:  'rgba(40,10,24,0.6)',
    pageBgAccentLight: 'rgba(140,26,74,0.03)',

    glowColorDark:  'radial-gradient(circle, rgba(140,26,74,0.18) 0%, transparent 65%)',
    glowColorLight: 'radial-gradient(circle, rgba(140,26,74,0.10) 0%, transparent 65%)',
    ringBorderDark:  'rgba(240,160,188,0.12)',
    ringBorderLight: 'rgba(240,160,188,0.09)',
    cornerStroke:  '#f0a0bc',
    eyebrowLine:   '#b52260',
    eyebrowText:   '#d06090',
    storyDivider:  { dark: '#3a1428', light: '#f0c8d8' },

    orbitColors: [
      { color: '#b52260', shadow: '#b52260' },
      { color: '#f0a0bc', shadow: '#f0a0bc' },
      { color: '#e86090', shadow: '#e86090' },
      { color: '#b52260', shadow: '#b52260' },
    ],

    searchAccentBg:  'linear-gradient(135deg, rgba(140,26,74,0.14), rgba(240,160,188,0.10))',
    searchHighlight: '#b52260',
    searchEmptyGlow: 'radial-gradient(circle, rgba(140,26,74,0.12) 0%, transparent 65%)',

    notFoundPrimary: '#fdeef4',
    notFoundShimmer: 'linear-gradient(90deg,#b52260 0%,#e86090 20%,#f0a0bc 35%,#d06090 50%,#f0a0bc 65%,#e86090 80%,#b52260 100%)',

    productBadgeBg:   'linear-gradient(135deg, #b52260, #f0a0bc)',
    productBadgeText: '#fdeef4',
    productCtaBg:     '#25D366',
    productLinkHover: '#b52260',
    productDotActive: 'linear-gradient(90deg, #b52260, #f0a0bc)',
    accordionHover:   '#b52260',
    specRowDivider:   { dark: '#3a1428', light: '#f0c8d8' },

    waSectionBgDark:  'linear-gradient(135deg, #280a18 0%, #3a0a22 50%, #280a18 100%)',
    waSectionBgLight: 'linear-gradient(135deg, #520a30 0%, #8c1a4a 40%, #b52260 100%)',
    footerBannerBg:   'linear-gradient(135deg, #520a30, #b52260)',
    footerButtonBg:   '#fdeef4',
    footerButtonText: '#520a30',
    heartFill:        '#8c1a4a',
    naviLinkColor:    '#f0a0bc',
  },

  // ── E · Mysore Violet — midnight blue → rich violet ───────────────────────
  mysoreViolet: {
    background:    'linear-gradient(150deg, #080810 0%, #0e0e28 25%, #1a1a52 50%, #2e2a7c 75%, #4a3aaa 100%)',
    radialGlow:    'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(46,42,124,0.26) 0%, transparent 70%)',
    threadPrimary: '#a090e0',
    threadAccent:  '#6050b8',
    eyebrow:       'rgba(196,188,255,0.92)',
    h1:            '#f0eeff',
    tagline:       'rgba(240,238,255,0.72)',
    diamond:       '#a090e0',
    rule:          'rgba(160,144,224,0.75)',
    ringColor:     'rgba(196,188,255,0.10)',

    threadColor1:    '#6050b8',
    threadColor2:    '#a090e0',
    accentPrimary:   '#6050b8',
    accentSecondary: '#9080d0',

    iconBg:        'linear-gradient(135deg, rgba(46,42,124,0.16), rgba(160,144,224,0.12))',
    iconHoverBg:   'linear-gradient(135deg, rgba(46,42,124,0.24), rgba(160,144,224,0.20))',
    iconBorder:    'rgba(160,144,224,0.30)',
    iconColor:     '#9080d0',
    cardIconColor: '#9080d0',

    infoRowHoverDark:  'rgba(160,144,224,0.07)',
    infoRowHoverLight: 'rgba(46,42,124,0.05)',
    linkHover:         '#6050b8',

    inputUnderline1: '#6050b8',
    inputUnderline2: '#a090e0',

    submitBg:     'linear-gradient(115deg, #2e2a7c 0%, #1e1a5c 40%, #4a3aaa 100%)',
    submitShadow: 'rgba(74,58,170,0.38)',
    submitText:   '#f0eeff',

    ctaBg:     'linear-gradient(115deg, #2e2a7c 0%, #1e1a5c 40%, #4a3aaa 100%)',
    ctaShadow: 'rgba(74,58,170,0.42)',
    ctaText:   '#f0eeff',

    cardDividerDark:  'rgba(160,144,224,0.15)',
    cardDividerLight: 'rgba(46,42,124,0.12)',

    pageBgAccentDark:  'rgba(14,14,40,0.6)',
    pageBgAccentLight: 'rgba(46,42,124,0.03)',

    glowColorDark:  'radial-gradient(circle, rgba(46,42,124,0.22) 0%, transparent 65%)',
    glowColorLight: 'radial-gradient(circle, rgba(46,42,124,0.12) 0%, transparent 65%)',
    ringBorderDark:  'rgba(160,144,224,0.12)',
    ringBorderLight: 'rgba(160,144,224,0.09)',
    cornerStroke:  '#a090e0',
    eyebrowLine:   '#6050b8',
    eyebrowText:   '#9080d0',
    storyDivider:  { dark: '#1e1a40', light: '#d0c8f0' },

    orbitColors: [
      { color: '#6050b8', shadow: '#6050b8' },
      { color: '#a090e0', shadow: '#a090e0' },
      { color: '#c0b0ff', shadow: '#c0b0ff' },
      { color: '#6050b8', shadow: '#6050b8' },
    ],

    searchAccentBg:  'linear-gradient(135deg, rgba(46,42,124,0.16), rgba(160,144,224,0.10))',
    searchHighlight: '#6050b8',
    searchEmptyGlow: 'radial-gradient(circle, rgba(46,42,124,0.14) 0%, transparent 65%)',

    notFoundPrimary: '#f0eeff',
    notFoundShimmer: 'linear-gradient(90deg,#6050b8 0%,#9080d0 20%,#c0b0ff 35%,#a090e0 50%,#c0b0ff 65%,#9080d0 80%,#6050b8 100%)',

    productBadgeBg:   'linear-gradient(135deg, #6050b8, #a090e0)',
    productBadgeText: '#f0eeff',
    productCtaBg:     '#25D366',
    productLinkHover: '#6050b8',
    productDotActive: 'linear-gradient(90deg, #6050b8, #a090e0)',
    accordionHover:   '#6050b8',
    specRowDivider:   { dark: '#1e1a40', light: '#d0c8f0' },

    waSectionBgDark:  'linear-gradient(135deg, #0e0e28 0%, #1a1a3c 50%, #0e0e28 100%)',
    waSectionBgLight: 'linear-gradient(135deg, #1a1a52 0%, #2e2a7c 40%, #4a3aaa 100%)',
    footerBannerBg:   'linear-gradient(135deg, #1a1a52, #4a3aaa)',
    footerButtonBg:   '#f0eeff',
    footerButtonText: '#1a1a52',
    heartFill:        '#2e2a7c',
    naviLinkColor:    '#a090e0',
  },
};

// ─── Resolved active theme ────────────────────────────────────────────────────
export const theme: HeroTheme = HERO_THEMES[ACTIVE_HERO_THEME];
export default theme;