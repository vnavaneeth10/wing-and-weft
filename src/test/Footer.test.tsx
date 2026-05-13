
// src/test/Footer.test.tsx

import React from 'react';

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest';

import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';

import { MemoryRouter } from 'react-router-dom';

import Footer from '../components/Footer/Footer';

// ─────────────────────────────────────────────────────────────────────────────
// INTERSECTION OBSERVER MOCK
// ─────────────────────────────────────────────────────────────────────────────

class MockIntersectionObserver implements IntersectionObserver {
  root: Element | Document | null = null;

  rootMargin = '';

  thresholds: ReadonlyArray<number> = [];

  constructor(
    private callback: IntersectionObserverCallback,
  ) {}

  observe = vi.fn((element: Element) => {
    setTimeout(() => {
      this.callback(
        [
          {
            isIntersecting: true,
            target: element,
            intersectionRatio: 1,
            time: Date.now(),
            boundingClientRect: element.getBoundingClientRect(),
            intersectionRect: element.getBoundingClientRect(),
            rootBounds: null,
          } as IntersectionObserverEntry,
        ],
        this,
      );
    }, 0);
  });

  unobserve = vi.fn();

  disconnect = vi.fn();

  takeRecords = vi.fn(() => []);
}

vi.stubGlobal(
  'IntersectionObserver',
  MockIntersectionObserver,
);

// ─────────────────────────────────────────────────────────────────────────────
// MODULE MOCKS
// ─────────────────────────────────────────────────────────────────────────────

vi.mock('../../src/context/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
  }),
}));

vi.mock('../../src/context/SettingsContext', () => ({
  useSettings: () => ({
    whatsapp_number: '919999999999',
    contact_email: 'test@wingandweft.com',
    instagram_url: 'https://instagram.com/wingandweft',
    facebook_url: 'https://facebook.com/wingandweft',
  }),
}));

vi.mock('../../src/components/Policy/PolicyModal', () => ({
  default: () => null,
}));

vi.mock('../../src/admin/lib/supabase', () => ({
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
}));

vi.mock('../../src/theme/heroThemes', () => ({
  theme: {
    footerBannerBg: '#111111',
    footerButtonBg: '#ffffff',
    footerButtonText: '#000000',
    threadPrimary: '#ffffff',
    accentPrimary: '#bc3d3e',
    accentSecondary: '#b6893c',
    naviLinkColor: '#bc3d3e',
    heartFill: '#bc3d3e',
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// FETCH MOCK
// ─────────────────────────────────────────────────────────────────────────────

const mockFetchSuccess = () => {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {

      // categories
      if (url.includes('/categories')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }

      // policies
      if (url.includes('/policies')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: '1',
              title: 'Privacy Policy',
            },
          ]),
        });
      }

      // newsletter submit
      if (url.includes('/inquiries')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    }),
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// RENDER HELPER
// ─────────────────────────────────────────────────────────────────────────────

const renderFooter = async () => {
  await act(async () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('Footer', () => {

  beforeEach(() => {
    mockFetchSuccess();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // BASIC RENDERING
  // ───────────────────────────────────────────────────────────────────────────

  describe('Basic Rendering', () => {

    it('renders footer landmark', async () => {
      await renderFooter();

      expect(
        screen.getByRole('contentinfo'),
      ).toBeTruthy();
    });

    it('renders Wing & Weft logo', async () => {
      await renderFooter();

      expect(
        screen.getByAltText('Wing & Weft'),
      ).toBeTruthy();
    });

    it('renders Quick Links heading', async () => {
      await renderFooter();

      expect(
        screen.getByText('Quick Links'),
      ).toBeTruthy();
    });

    it('renders Policies heading', async () => {
      await renderFooter();

      expect(
        screen.getByText('Policies'),
      ).toBeTruthy();
    });

    it('renders Stay in the Loop section', async () => {
      await renderFooter();

      expect(
        screen.getByText('Stay in the Loop'),
      ).toBeTruthy();
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // NAVIGATION LINKS
  // ───────────────────────────────────────────────────────────────────────────

  describe('Navigation Links', () => {

    it('renders Home link', async () => {
      await renderFooter();

      expect(
        screen.getByRole('link', { name: 'Home' }),
      ).toBeTruthy();
    });

    it('renders About Us link', async () => {
      await renderFooter();

      expect(
        screen.getByRole('link', { name: 'About Us' }),
      ).toBeTruthy();
    });

    it('renders Contact link', async () => {
      await renderFooter();

      expect(
        screen.getByRole('link', { name: 'Contact' }),
      ).toBeTruthy();
    });

    it('renders Track Your Order external link', async () => {
      await renderFooter();

      const link = screen.getByLabelText(
        /Track your courier order/i,
      );

      expect(
        link.getAttribute('href'),
      ).toContain('trackcourier.io');
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // NEWSLETTER
  // ───────────────────────────────────────────────────────────────────────────

  describe('Newsletter', () => {

    it('renders newsletter email input', async () => {
      await renderFooter();

      const input = screen.getByLabelText(
        'Email address for newsletter',
      ) as HTMLInputElement;

      expect(input).toBeTruthy();
      expect(input.type).toBe('email');
    });

    it('renders agreement checkbox', async () => {
      await renderFooter();

      expect(
        screen.getByLabelText(
          /I agree to receive promotional emails/i,
        ),
      ).toBeTruthy();
    });

    it('renders subscribe button', async () => {
      await renderFooter();

      expect(
        screen.getByRole('button', {
          name: /Agree to promotional emails and subscribe/i,
        }),
      ).toBeTruthy();
    });

    it('newsletter submission calls fetch', async () => {
      await renderFooter();

      const input = screen.getByLabelText(
        'Email address for newsletter',
      );

      fireEvent.change(input, {
        target: {
          value: 'test@example.com',
        },
      });

      const checkbox = screen.getByLabelText(
        /I agree to receive promotional emails/i,
      );

      fireEvent.click(checkbox);

      await act(async () => {
        fireEvent.click(
          screen.getByRole('button', {
            name: /Agree to promotional emails and subscribe/i,
          }),
        );
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // SOCIAL LINKS
  // ───────────────────────────────────────────────────────────────────────────

  describe('Social Links', () => {

    it('renders Instagram link', async () => {
      await renderFooter();

      expect(
        screen.getByLabelText('Instagram'),
      ).toBeTruthy();
    });

    it('renders Facebook link', async () => {
      await renderFooter();

      expect(
        screen.getByLabelText('Facebook'),
      ).toBeTruthy();
    });

    it('renders Email link', async () => {
      await renderFooter();

      expect(
        screen.getByLabelText('Email'),
      ).toBeTruthy();
    });

    it('renders WhatsApp link', async () => {
      await renderFooter();

      expect(
        screen.getByLabelText('WhatsApp'),
      ).toBeTruthy();
    });

    it('external links contain noopener noreferrer', async () => {
      await renderFooter();

      const links = document.querySelectorAll(
        'a[target="_blank"]',
      );

      links.forEach((link) => {
        expect(
          link.getAttribute('rel'),
        ).toContain('noopener');

        expect(
          link.getAttribute('rel'),
        ).toContain('noreferrer');
      });
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // FOOTER BOTTOM BAR
  // ───────────────────────────────────────────────────────────────────────────

  describe('Bottom Bar', () => {

    it('renders copyright text', async () => {
      await renderFooter();

      expect(
        screen.getByText(/2026 Wing/i),
      ).toBeTruthy();
    });

    it('renders Navi developer link', async () => {
      await renderFooter();

      const link = screen.getByText('Navi');

      expect(
        link.getAttribute('href'),
      ).toBe('https://vnvne.vercel.app/');
    });

    it('renders footer email link', async () => {
      await renderFooter();

      const emailLink = screen.getAllByText(
        'test@wingandweft.com',
      )[0];

      expect(emailLink).toBeTruthy();
    });

  });

});

