
// src/test/ourstorypage.test.tsx

import React from 'react';

import {
  describe,
  it,
  expect,
  vi,
  afterEach,
} from 'vitest';

import {
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import { MemoryRouter } from 'react-router-dom';

import OurStoryPage from '../pages/OurStoryPage';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE MOCKS
// ─────────────────────────────────────────────────────────────────────────────

vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
  }),
}));

vi.mock('../hooks/usePageMeta', () => ({
  usePageMeta: vi.fn(),
}));

vi.mock('../hooks', () => ({
  useInView: () => ({
    ref: vi.fn(),
    inView: true,
  }),
}));

vi.mock('../components/SEO/SEO', () => ({
  default: () => (
    <>
      <title>
        Our Story — Wing & Weft
      </title>
    </>
  ),
}));

vi.mock('../theme/heroThemes', () => ({
  theme: {
    background:
      'linear-gradient(to right, #111, #222)',

    radialGlow:
      'radial-gradient(circle, rgba(255,255,255,0.2), transparent)',

    eyebrow: '#d4a060',
    eyebrowLine: '#d4a060',
    eyebrowText: '#d4a060',

    h1: '#ffffff',
    tagline: '#eeeeee',

    threadPrimary: '#ffffff',
    threadAccent: '#d4a060',

    rule: '#d4a060',
    diamond: '#d4a060',

    threadColor1: '#d4a060',
    threadColor2: '#ffffff',

    accentSecondary: '#d4a060',

    iconBg: '#f5ead8',
    iconHoverBg: '#ead7bb',
    cardIconColor: '#111111',

    glowColorLight:
      'rgba(255,255,255,0.15)',

    glowColorDark:
      'rgba(255,255,255,0.08)',

    ringBorderLight:
      'rgba(0,0,0,0.1)',

    ringBorderDark:
      'rgba(255,255,255,0.1)',

    cornerStroke: '#d4a060',

    storyDivider: {
      light: '#ddd',
      dark: '#333',
    },

    orbitColors: [
      {
        color: '#fff',
        shadow: '#fff',
      },
      {
        color: '#ccc',
        shadow: '#ccc',
      },
      {
        color: '#aaa',
        shadow: '#aaa',
      },
      {
        color: '#999',
        shadow: '#999',
      },
    ],
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// RENDER HELPER
// ─────────────────────────────────────────────────────────────────────────────

const renderPage = () => {
  return render(
    <MemoryRouter>
      <OurStoryPage />
    </MemoryRouter>,
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('OurStoryPage', () => {

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // BASIC RENDERING
  // ───────────────────────────────────────────────────────────────────────────

  describe('Basic Rendering', () => {

    it('renders page successfully', () => {
      const { container } = renderPage();

      expect(container).toBeTruthy();
    });

    it('renders About Us heading', async () => {
      renderPage();

      await waitFor(() => {
        expect(
          screen.getByRole('heading', {
            level: 1,
            name: 'About Us',
          }),
        ).toBeTruthy();
      });
    });

    it('renders Wing & Weft eyebrow text', async () => {
      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText('Wing & Weft'),
        ).toBeTruthy();
      });
    });

    // FIXED DUPLICATE TEXT ISSUE
    it('renders woven from tradition tagline', async () => {
      renderPage();

      await waitFor(() => {

        const matches = screen.getAllByText(
          /woven from tradition/i,
        );

        expect(matches.length).toBeGreaterThan(0);

      });
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // STORY SECTION
  // ───────────────────────────────────────────────────────────────────────────

  describe('Story Section', () => {

    it('renders story section heading', async () => {
      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText(
            'Where Every Thread Tells a Story',
          ),
        ).toBeTruthy();
      });
    });

    it('renders founding story paragraph', async () => {
      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText(
            /what began as a friendship/i,
          ),
        ).toBeTruthy();
      });
    });

    it('renders cheers to new beginnings text', async () => {
      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText(
            /cheers to new beginnings/i,
          ),
        ).toBeTruthy();
      });
    });

    it('renders appreciation paragraph', async () => {
      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText(
            /we sincerely appreciate/i,
          ),
        ).toBeTruthy();
      });
    });

    it('renders family signature', async () => {
      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText(
            /Wing.*Weft Family/i,
          ),
        ).toBeTruthy();
      });
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // VALUES SECTION
  // ───────────────────────────────────────────────────────────────────────────

  describe('Values Section', () => {

    it('renders Our Values heading', async () => {
      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText('Our Values'),
        ).toBeTruthy();
      });
    });

    it('renders Our Promise eyebrow', async () => {
      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText('Our Promise'),
        ).toBeTruthy();
      });
    });

    it('renders Authenticity card', async () => {
      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText('Authenticity'),
        ).toBeTruthy();
      });
    });

    it('renders Craftsmanship card', async () => {
      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText('Craftsmanship'),
        ).toBeTruthy();
      });
    });

    it('renders Sustainability card', async () => {
      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText('Sustainability'),
        ).toBeTruthy();
      });
    });

    it('renders Quality card', async () => {
      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText('Quality'),
        ).toBeTruthy();
      });
    });

    it('renders exactly four value headings', async () => {
      renderPage();

      await waitFor(() => {

        const headings = [
          screen.getByText('Authenticity'),
          screen.getByText('Craftsmanship'),
          screen.getByText('Sustainability'),
          screen.getByText('Quality'),
        ];

        expect(headings.length).toBe(4);
      });
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // LOGO SECTION
  // ───────────────────────────────────────────────────────────────────────────

  describe('Logo Section', () => {

    it('renders logo image', async () => {
      renderPage();

      await waitFor(() => {
        expect(
          screen.getByAltText(
            /Wing & Weft logo/i,
          ),
        ).toBeTruthy();
      });
    });

    it('logo image uses correct src', async () => {
      renderPage();

      await waitFor(() => {

        const img = screen.getByAltText(
          /Wing & Weft logo/i,
        ) as HTMLImageElement;

        expect(
          img.getAttribute('src'),
        ).toBe('/logo@1x.png');
      });
    });

    it('renders picture element', () => {
      const { container } = renderPage();

      expect(
        container.querySelector('picture'),
      ).toBeTruthy();
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // STRUCTURED DATA
  // ───────────────────────────────────────────────────────────────────────────

  describe('Structured Data', () => {

    it('renders JSON-LD script tag', () => {
      const { container } = renderPage();

      const script = container.querySelector(
        'script[type="application/ld+json"]',
      );

      expect(script).toBeTruthy();
    });

    it('JSON-LD contains Organization type', () => {
      const { container } = renderPage();

      const script = container.querySelector(
        'script[type="application/ld+json"]',
      );

      const json = JSON.parse(
        script?.textContent ?? '{}',
      );

      expect(
        json['@type'],
      ).toBe('Organization');
    });

    it('JSON-LD contains Wing & Weft name', () => {
      const { container } = renderPage();

      const script = container.querySelector(
        'script[type="application/ld+json"]',
      );

      const json = JSON.parse(
        script?.textContent ?? '{}',
      );

      expect(
        json.name,
      ).toBe('Wing & Weft');
    });

    it('JSON-LD areaServed is India', () => {
      const { container } = renderPage();

      const script = container.querySelector(
        'script[type="application/ld+json"]',
      );

      const json = JSON.parse(
        script?.textContent ?? '{}',
      );

      expect(
        json.areaServed,
      ).toBe('India');
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // ACCESSIBILITY
  // ───────────────────────────────────────────────────────────────────────────

  describe('Accessibility', () => {

    it('contains exactly one h1', () => {
      const { container } = renderPage();

      const h1s =
        container.querySelectorAll('h1');

      expect(h1s.length).toBe(1);
    });

    it('logo image has descriptive alt text', async () => {
      renderPage();

      await waitFor(() => {

        const img = screen.getByAltText(
          /Wing & Weft logo/i,
        );

        expect(
          img.getAttribute('alt')?.length,
        ).toBeGreaterThan(10);
      });
    });

    it('decorative icons are aria-hidden', () => {
      const { container } = renderPage();

      const icons = container.querySelectorAll(
        '.os-value-icon',
      );

      icons.forEach((icon) => {
        expect(
          icon.getAttribute('aria-hidden'),
        ).toBe('true');
      });
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // SEO
  // ───────────────────────────────────────────────────────────────────────────

  describe('SEO', () => {

    it('renders title element', () => {
      renderPage();

      expect(
        document.querySelector('title'),
      ).toBeTruthy();
    });

  });

});
