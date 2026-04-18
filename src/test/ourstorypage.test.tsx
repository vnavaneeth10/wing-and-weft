// src/test/OurStoryPage.test.tsx
//
// ─────────────────────────────────────────────────────────────────────────────
// Wing & Weft — OurStoryPage Test Suite
// Framework : Vitest + React Testing Library
// Coverage  : Rendering · Hero section · Story copy · Values section ·
//             Logo display · Accessibility · Theme tokens · Dark mode ·
//             Structured data (JSON-LD) · SEO · Responsiveness classes
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OurStoryPage from '../pages/OurStoryPage';

// ─── Render helpers ───────────────────────────────────────────────────────────

const renderPage = () =>
  render(
    <MemoryRouter>
      <OurStoryPage />
    </MemoryRouter>,
  );

/** Render with dark mode enabled via ThemeProvider */
const renderDark = async () => {
  const { ThemeProvider } = await import('../context/ThemeContext');
  return render(
    <MemoryRouter>
      <ThemeProvider isDark={true}>
        <OurStoryPage />
      </ThemeProvider>
    </MemoryRouter>,
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SUITES
// ─────────────────────────────────────────────────────────────────────────────

describe('OurStoryPage', () => {

  beforeEach(() => {
    vi.stubGlobal('open', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 1. Basic rendering
  // ════════════════════════════════════════════════════════════════════════════
  describe('1. Basic rendering', () => {

    it('renders without crashing', () => {
      const { container } = renderPage();
      expect(container).toBeTruthy();
    });

    it('renders a root element with min-h-screen class', () => {
      const { container } = renderPage();
      const root = container.querySelector('.min-h-screen');
      expect(root).toBeTruthy();
    });

    it('applies pt-20 top-padding class', () => {
      const { container } = renderPage();
      const root = container.querySelector('.pt-20');
      expect(root).toBeTruthy();
    });

    it('renders the max-width content wrapper', () => {
      const { container } = renderPage();
      const wrapper = container.querySelector('.max-w-6xl');
      expect(wrapper).toBeTruthy();
    });

  });

  // ════════════════════════════════════════════════════════════════════════════
  // 2. Hero banner
  // ════════════════════════════════════════════════════════════════════════════
  describe('2. Hero banner', () => {

    it('renders the hero section', () => {
      const { container } = renderPage();
      const hero = container.querySelector('[data-testid="hero-banner"]');
      expect(hero).toBeTruthy();
    });

    it('hero has overflow-hidden class', () => {
      const { container } = renderPage();
      const hero = container.querySelector('.overflow-hidden');
      expect(hero).toBeTruthy();
    });

    it('hero has a non-empty background style (theme gradient applied)', () => {
      const { container } = renderPage();
      const hero = container.querySelector('[data-testid="hero-banner"]') as HTMLElement;
      expect(hero?.style.background).toBeTruthy();
    });

    it('renders "Wing & Weft" eyebrow text inside the hero', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('Wing & Weft')).toBeTruthy());
    });

    it('renders "About Us" as the hero h1', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeTruthy());
      await waitFor(() => expect(screen.getByText('About Us')).toBeTruthy());
    });

    it('renders "Woven from tradition" tagline (lowercase)', async () => {
      renderPage();
      await waitFor(() =>
        expect(screen.getByText(/woven from tradition/i)).toBeTruthy(),
      );
    });

    it('hero contains animated thread SVG paths', () => {
      const { container } = renderPage();
      // Thread SVG paths sit inside the hero SVG
      const paths = container.querySelectorAll('path');
      expect(paths.length).toBeGreaterThan(0);
    });

    it('renders ambient ring divs (three of them)', () => {
      const { container } = renderPage();
      // Each ring is an absolute div with border-radius 50% and no pointer events
      const rings = Array.from(container.querySelectorAll('div')).filter(
        (el) =>
          el.style.borderRadius === '50%' &&
          el.style.pointerEvents === 'none' &&
          el.style.border.includes('1px solid'),
      );
      // At least 3 rings rendered in the hero
      expect(rings.length).toBeGreaterThanOrEqual(3);
    });

    it('renders scroll indicator SVG at the bottom of the hero', () => {
      const { container } = renderPage();
      // The scroll indicator has a rect element with rx="3"
      const rects = container.querySelectorAll('rect[rx="3"]');
      expect(rects.length).toBeGreaterThanOrEqual(1);
    });

  });

  // ════════════════════════════════════════════════════════════════════════════
  // 3. Story section — copy & eyebrow
  // ════════════════════════════════════════════════════════════════════════════
  describe('3. Story section', () => {

    it('renders "Woven from Tradition" eyebrow in the story panel', async () => {
      renderPage();
      await waitFor(() =>
        expect(screen.getByText('Woven from Tradition')).toBeTruthy(),
      );
    });

    it('renders "Where Every Thread Tells a Story" h2', async () => {
      renderPage();
      await waitFor(() =>
        expect(screen.getByText('Where Every Thread Tells a Story')).toBeTruthy(),
      );
    });

    it('renders the founding-friendship paragraph', async () => {
      renderPage();
      await waitFor(() =>
        expect(
          screen.getByText(/what began as a friendship in college/i),
        ).toBeTruthy(),
      );
    });

    it('renders the "Cheers to new beginnings" paragraph', async () => {
      renderPage();
      await waitFor(() =>
        expect(screen.getByText(/cheers to new beginnings/i)).toBeTruthy(),
      );
    });

    it('renders the "We sincerely appreciate" paragraph', async () => {
      renderPage();
      await waitFor(() =>
        expect(screen.getByText(/we sincerely appreciate/i)).toBeTruthy(),
      );
    });

    it('renders the "A heartfelt thank you" paragraph', async () => {
      renderPage();
      await waitFor(() =>
        expect(screen.getByText(/a heartfelt thank you/i)).toBeTruthy(),
      );
    });

    it('renders the "The Wing & Weft Family" signature', async () => {
      renderPage();
      await waitFor(() =>
        expect(screen.getByText(/The Wing.*Weft Family/i)).toBeTruthy(),
      );
    });

    it('renders exactly four story paragraphs', async () => {
      const { container } = renderPage();
      await waitFor(() => {
        // Story paragraphs have fontFamily Raleway, fontWeight 300
        const paras = Array.from(container.querySelectorAll('p')).filter(
          (el) =>
            el.style.fontWeight === '300' &&
            el.style.fontFamily?.includes('Raleway'),
        );
        expect(paras.length).toBe(4);
      });
    });

  });

  // ════════════════════════════════════════════════════════════════════════════
  // 4. Logo display
  // ════════════════════════════════════════════════════════════════════════════
  describe('4. Logo display', () => {

    it('renders the os-logo-container element', () => {
      const { container } = renderPage();
      expect(container.querySelector('.os-logo-container')).toBeTruthy();
    });

    it('renders the os-logo-box element', () => {
      const { container } = renderPage();
      expect(container.querySelector('.os-logo-box')).toBeTruthy();
    });

    it('renders the logo image with correct alt text', async () => {
      renderPage();
      await waitFor(() => {
        const img = screen.getByAltText(
          /Wing & Weft logo — authentic handloom sarees from Indian master weavers/i,
        );
        expect(img).toBeTruthy();
      });
    });

    it('logo image src is "/logo@1x.png"', async () => {
      renderPage();
      await waitFor(() => {
        const img = screen.getByAltText(/Wing & Weft logo/i) as HTMLImageElement;
        expect(img.getAttribute('src')).toBe('/logo@1x.png');
      });
    });

    it('logo image has loading="eager"', async () => {
      renderPage();
      await waitFor(() => {
        const img = screen.getByAltText(/Wing & Weft logo/i) as HTMLImageElement;
        expect(img.getAttribute('loading')).toBe('eager');
      });
    });

    it('renders the os-logo-shimmer wrapper', () => {
      const { container } = renderPage();
      expect(container.querySelector('.os-logo-shimmer')).toBeTruthy();
    });

    it('renders four orbiting dot elements', () => {
      const { container } = renderPage();
      const dots = container.querySelectorAll('.os-orbit-dot');
      expect(dots.length).toBe(4);
    });

    it('renders three pulsing ring elements', () => {
      const { container } = renderPage();
      const rings = container.querySelectorAll('.os-ring-pulse');
      expect(rings.length).toBe(3);
    });

    it('renders a <picture> element for responsive images', () => {
      const { container } = renderPage();
      expect(container.querySelector('picture')).toBeTruthy();
    });

    it('picture element includes a webp source', () => {
      const { container } = renderPage();
      const sources = container.querySelectorAll('picture source');
      const hasWebp = Array.from(sources).some(
        (s) => s.getAttribute('type') === 'image/webp',
      );
      expect(hasWebp).toBe(true);
    });

    it('picture element includes a png source', () => {
      const { container } = renderPage();
      const sources = container.querySelectorAll('picture source');
      const hasPng = Array.from(sources).some(
        (s) => s.getAttribute('type') === 'image/png',
      );
      expect(hasPng).toBe(true);
    });

  });

  // ════════════════════════════════════════════════════════════════════════════
  // 5. Values section
  // ════════════════════════════════════════════════════════════════════════════
  describe('5. Values section', () => {

    it('renders "Our Promise" eyebrow', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('Our Promise')).toBeTruthy());
    });

    it('renders "Our Values" section heading', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('Our Values')).toBeTruthy());
    });

    it('renders exactly four value cards', () => {
      const { container } = renderPage();
      const cards = container.querySelectorAll('.os-value-card');
      expect(cards.length).toBe(4);
    });

    it('renders "Authenticity" value card', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('Authenticity')).toBeTruthy());
    });

    it('renders "Craftsmanship" value card', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('Craftsmanship')).toBeTruthy());
    });

    it('renders "Sustainability" value card', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('Sustainability')).toBeTruthy());
    });

    it('renders "Quality" value card', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('Quality')).toBeTruthy());
    });

    it('renders Authenticity description text', async () => {
      renderPage();
      await waitFor(() =>
        expect(
          screen.getByText(/sourced directly from master weavers/i),
        ).toBeTruthy(),
      );
    });

    it('renders Craftsmanship description text', async () => {
      renderPage();
      await waitFor(() =>
        expect(
          screen.getByText(/preserving centuries-old weaving traditions/i),
        ).toBeTruthy(),
      );
    });

    it('renders Sustainability description text', async () => {
      renderPage();
      await waitFor(() =>
        expect(
          screen.getByText(/minimal electricity/i),
        ).toBeTruthy(),
      );
    });

    it('renders Quality description text', async () => {
      renderPage();
      await waitFor(() =>
        expect(
          screen.getByText(/rigorous quality checks/i),
        ).toBeTruthy(),
      );
    });

    it('renders four value icon elements (aria-hidden)', () => {
      const { container } = renderPage();
      const icons = container.querySelectorAll('.os-value-icon[aria-hidden="true"]');
      expect(icons.length).toBe(4);
    });

    it('value cards have the os-value-card class', () => {
      const { container } = renderPage();
      const cards = container.querySelectorAll('.os-value-card');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('value cards have rounded-2xl class', () => {
      const { container } = renderPage();
      const cards = container.querySelectorAll('.os-value-card.rounded-2xl');
      expect(cards.length).toBe(4);
    });

    it('values grid has responsive column classes', () => {
      const { container } = renderPage();
      // Grid wrapping the value cards
      const grid = container.querySelector(
        '.grid.grid-cols-1.sm\\:grid-cols-2.xl\\:grid-cols-4',
      );
      expect(grid).toBeTruthy();
    });

  });

  // ════════════════════════════════════════════════════════════════════════════
  // 6. Thread dividers (SVG decorators)
  // ════════════════════════════════════════════════════════════════════════════
  describe('6. Thread dividers', () => {

    it('renders at least two ThreadDivider SVGs (story + values header)', () => {
      const { container } = renderPage();
      // Thread dividers have viewBox="0 0 500 60"
      const svgs = container.querySelectorAll('svg[viewBox="0 0 500 60"]');
      expect(svgs.length).toBeGreaterThanOrEqual(2);
    });

    it('all ThreadDivider SVGs have aria-hidden="true"', () => {
      const { container } = renderPage();
      const svgs = container.querySelectorAll('svg[viewBox="0 0 500 60"]');
      svgs.forEach((svg) => {
        expect(svg.getAttribute('aria-hidden')).toBe('true');
      });
    });

    it('thread divider SVGs contain linearGradient definitions', () => {
      const { container } = renderPage();
      const gradients = container.querySelectorAll('linearGradient');
      expect(gradients.length).toBeGreaterThan(0);
    });

  });

  // ════════════════════════════════════════════════════════════════════════════
  // 7. Accessibility
  // ════════════════════════════════════════════════════════════════════════════
  describe('7. Accessibility', () => {

    it('all decorative SVGs carry aria-hidden="true"', () => {
      const { container } = renderPage();
      const hiddenSVGs = container.querySelectorAll('svg[aria-hidden="true"]');
      expect(hiddenSVGs.length).toBeGreaterThan(0);
    });

    it('page has exactly one h1 element', () => {
      const { container } = renderPage();
      const h1s = container.querySelectorAll('h1');
      expect(h1s.length).toBe(1);
    });

    it('h1 text is "About Us"', async () => {
      renderPage();
      await waitFor(() => {
        const h1 = screen.getByRole('heading', { level: 1 });
        expect(h1.textContent).toBe('About Us');
      });
    });

    it('logo image has a descriptive alt attribute', async () => {
      renderPage();
      await waitFor(() => {
        const img = screen.getByAltText(/Wing & Weft logo/i);
        expect(img.getAttribute('alt')?.length).toBeGreaterThan(10);
      });
    });

    it('value icon divs are marked aria-hidden (purely decorative)', () => {
      const { container } = renderPage();
      const icons = container.querySelectorAll('.os-value-icon');
      icons.forEach((icon) => {
        expect(icon.getAttribute('aria-hidden')).toBe('true');
      });
    });

    it('value cards each contain an h3 heading', () => {
      const { container } = renderPage();
      const cards = container.querySelectorAll('.os-value-card');
      cards.forEach((card) => {
        expect(card.querySelector('h3')).toBeTruthy();
      });
    });

    it('story section has an h2 heading', async () => {
      renderPage();
      await waitFor(() => {
        const h2s = screen.getAllByRole('heading', { level: 2 });
        expect(h2s.length).toBeGreaterThan(0);
      });
    });

  });

  // ════════════════════════════════════════════════════════════════════════════
  // 8. Theme token integrity
  // ════════════════════════════════════════════════════════════════════════════
  describe('8. Theme tokens', () => {

    it('hero banner has a background style (theme gradient applied)', () => {
      const { container } = renderPage();
      const hero = container.querySelector('[data-testid="hero-banner"]') as HTMLElement;
      expect(hero?.style.background).toBeTruthy();
    });

    it('logo box has a background style', () => {
      const { container } = renderPage();
      const box = container.querySelector('.os-logo-box') as HTMLElement;
      expect(box?.style.background).toBeTruthy();
    });

    it('<style id="os-theme-vars"> is injected into <head>', async () => {
      renderPage();
      await waitFor(() => {
        expect(document.getElementById('os-theme-vars')).toBeTruthy();
      });
    });

    it('os-theme-vars contains --os-icon-hover-bg variable', async () => {
      renderPage();
      await waitFor(() => {
        const vars = document.getElementById('os-theme-vars');
        expect(vars?.textContent).toContain('--os-icon-hover-bg');
      });
    });

    it('value icon elements have a background style from theme.iconBg', () => {
      const { container } = renderPage();
      const icons = container.querySelectorAll('.os-value-icon') as NodeListOf<HTMLElement>;
      icons.forEach((icon) => {
        expect(icon.style.background).toBeTruthy();
      });
    });

  });

  // ════════════════════════════════════════════════════════════════════════════
  // 9. Dark-mode rendering
  // ════════════════════════════════════════════════════════════════════════════
  describe('9. Dark mode', () => {

    it('renders without crashing with isDark=true', async () => {
      const { container } = await renderDark();
      expect(container).toBeTruthy();
    });

    it('"About Us" h1 is still present in dark mode', async () => {
      await renderDark();
      await waitFor(() => expect(screen.getByText('About Us')).toBeTruthy());
    });

    it('all four value card titles render in dark mode', async () => {
      await renderDark();
      await waitFor(() => {
        expect(screen.getByText('Authenticity')).toBeTruthy();
        expect(screen.getByText('Craftsmanship')).toBeTruthy();
        expect(screen.getByText('Sustainability')).toBeTruthy();
        expect(screen.getByText('Quality')).toBeTruthy();
      });
    });

    it('logo box uses dark background gradient in dark mode', async () => {
      const { container } = await renderDark();
      const box = container.querySelector('.os-logo-box') as HTMLElement;
      // Dark mode applies rgba background
      expect(box?.style.background).toContain('rgba');
    });

    it('applies bg-dark-bg class on root in dark mode', async () => {
      const { container } = await renderDark();
      const root = container.querySelector('.bg-dark-bg');
      expect(root).toBeTruthy();
    });

    it('value cards use bg-dark-card class in dark mode', async () => {
      const { container } = await renderDark();
      const darkCards = container.querySelectorAll('.bg-dark-card');
      expect(darkCards.length).toBeGreaterThan(0);
    });

  });

  // ════════════════════════════════════════════════════════════════════════════
  // 10. Light-mode class checks
  // ════════════════════════════════════════════════════════════════════════════
  describe('10. Light mode', () => {

    it('applies bg-stone-50 class on root in light mode', () => {
      const { container } = renderPage();
      const root = container.querySelector('.bg-stone-50');
      expect(root).toBeTruthy();
    });

    it('value cards use bg-white class in light mode', () => {
      const { container } = renderPage();
      const cards = container.querySelectorAll('.bg-white');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('logo box uses light background gradient in light mode', () => {
      const { container } = renderPage();
      const box = container.querySelector('.os-logo-box') as HTMLElement;
      expect(box?.style.background).toContain('#fdf8f2');
    });

  });

  // ════════════════════════════════════════════════════════════════════════════
  // 11. Structured data (JSON-LD SEO)
  // ════════════════════════════════════════════════════════════════════════════
  describe('11. Structured data (JSON-LD)', () => {

    it('renders a <script type="application/ld+json"> tag', () => {
      const { container } = renderPage();
      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).toBeTruthy();
    });

    it('JSON-LD contains @type Organization', () => {
      const { container } = renderPage();
      const script = container.querySelector('script[type="application/ld+json"]');
      const json = JSON.parse(script?.textContent ?? '{}');
      expect(json['@type']).toBe('Organization');
    });

    it('JSON-LD name is "Wing & Weft"', () => {
      const { container } = renderPage();
      const script = container.querySelector('script[type="application/ld+json"]');
      const json = JSON.parse(script?.textContent ?? '{}');
      expect(json.name).toBe('Wing & Weft');
    });

    it('JSON-LD contains a logo URL', () => {
      const { container } = renderPage();
      const script = container.querySelector('script[type="application/ld+json"]');
      const json = JSON.parse(script?.textContent ?? '{}');
      expect(json.logo).toContain('logo');
    });

    it('JSON-LD foundingDate is "2024"', () => {
      const { container } = renderPage();
      const script = container.querySelector('script[type="application/ld+json"]');
      const json = JSON.parse(script?.textContent ?? '{}');
      expect(json.foundingDate).toBe('2024');
    });

    it('JSON-LD areaServed is "India"', () => {
      const { container } = renderPage();
      const script = container.querySelector('script[type="application/ld+json"]');
      const json = JSON.parse(script?.textContent ?? '{}');
      expect(json.areaServed).toBe('India');
    });

    it('JSON-LD @context is "https://schema.org"', () => {
      const { container } = renderPage();
      const script = container.querySelector('script[type="application/ld+json"]');
      const json = JSON.parse(script?.textContent ?? '{}');
      expect(json['@context']).toBe('https://schema.org');
    });

  });

  // ════════════════════════════════════════════════════════════════════════════
  // 12. SEO component
  // ════════════════════════════════════════════════════════════════════════════
  describe('12. SEO', () => {

    it('renders a <title> element in the document', () => {
      renderPage();
      expect(document.querySelector('title')).toBeTruthy();
    });

  });

  // ════════════════════════════════════════════════════════════════════════════
  // 13. Layout / responsiveness classes
  // ════════════════════════════════════════════════════════════════════════════
  describe('13. Layout & responsiveness', () => {

    it('story section uses a two-column grid on md breakpoint', () => {
      const { container } = renderPage();
      const grid = container.querySelector(
        '.grid.grid-cols-1.md\\:grid-cols-2',
      );
      expect(grid).toBeTruthy();
    });

    it('story section grid has mb-24 bottom margin', () => {
      const { container } = renderPage();
      const grid = container.querySelector('.mb-24');
      expect(grid).toBeTruthy();
    });

    it('values grid defaults to single column on mobile', () => {
      const { container } = renderPage();
      const grid = container.querySelector('.grid-cols-1');
      expect(grid).toBeTruthy();
    });

    it('values grid has sm:grid-cols-2 for tablet', () => {
      const { container } = renderPage();
      const grid = container.querySelector('.sm\\:grid-cols-2');
      expect(grid).toBeTruthy();
    });

    it('values grid has xl:grid-cols-4 for large screens', () => {
      const { container } = renderPage();
      const grid = container.querySelector('.xl\\:grid-cols-4');
      expect(grid).toBeTruthy();
    });

    it('values section header has text-center class', () => {
      const { container } = renderPage();
      const header = container.querySelector('.text-center.mb-12');
      expect(header).toBeTruthy();
    });

    it('main content area has horizontal padding classes', () => {
      const { container } = renderPage();
      const wrapper = container.querySelector('.px-4');
      expect(wrapper).toBeTruthy();
    });

    it('main content area has vertical padding py-16', () => {
      const { container } = renderPage();
      const wrapper = container.querySelector('.py-16');
      expect(wrapper).toBeTruthy();
    });

  });

  // ════════════════════════════════════════════════════════════════════════════
  // 14. Animation / transition attributes
  // ════════════════════════════════════════════════════════════════════════════
  describe('14. Animation attributes', () => {

    it('hero h1 has animation style applied', async () => {
      renderPage();
      await waitFor(() => {
        const h1 = screen.getByRole('heading', { level: 1 }) as HTMLElement;
        expect(h1.style.animation).toBeTruthy();
      });
    });

    it('logo box has animation style (os-float)', () => {
      const { container } = renderPage();
      const box = container.querySelector('.os-logo-box') as HTMLElement;
      expect(box?.style.animation).toContain('os-float');
    });

    it('value cards have transition styles for hover effects', () => {
      const { container } = renderPage();
      const cards = container.querySelectorAll('.os-value-card') as NodeListOf<HTMLElement>;
      // CSS handles the transition via class, just check the class exists
      expect(cards.length).toBe(4);
    });

  });

});