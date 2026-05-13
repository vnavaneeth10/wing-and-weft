
// src/test/Contactpage.test.tsx

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

import ContactPage from '../pages/ContactPage';

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL API MOCKS
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

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

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

vi.mock('../components/SEO/SEO', () => ({
  default: () => null,
}));

vi.mock('../admin/lib/supabase', () => ({
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
}));

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_SETTINGS = [
  { key: 'contact_phone', value: '+91 99999 99999' },
  { key: 'contact_email', value: 'test@wingandweft.com' },
  { key: 'business_hours', value: 'Mon–Sat: 10AM–7PM' },
  { key: 'instagram_handle', value: '@wingandweft' },
  {
    key: 'instagram_url',
    value: 'https://www.instagram.com/wingandweft/',
  },
  {
    key: 'facebook_url',
    value: 'https://facebook.com/wingandweft',
  },
  {
    key: 'facebook_name',
    value: 'Wing & Weft FB',
  },
  {
    key: 'whatsapp_number',
    value: '919999999999',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// FETCH HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const mockFetchSuccess = () => {
  return vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      if (url.includes('/settings')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(MOCK_SETTINGS),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    }),
  );
};

const mockFetchFailure = () => {
  return vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      if (url.includes('/settings')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(MOCK_SETTINGS),
        });
      }

      return Promise.resolve({
        ok: false,
        status: 500,
      });
    }),
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// RENDER HELPER
// ─────────────────────────────────────────────────────────────────────────────

const renderPage = async () => {
  await act(async () => {
    render(
      <MemoryRouter>
        <ContactPage />
      </MemoryRouter>,
    );
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// FORM HELPER
// ─────────────────────────────────────────────────────────────────────────────

const fillForm = async () => {
  fireEvent.change(
    screen.getByPlaceholderText('Your full name'),
    {
      target: {
        value: 'Navaneeth',
      },
    },
  );

  fireEvent.change(
    screen.getByPlaceholderText('your@email.com'),
    {
      target: {
        value: 'nav@test.com',
      },
    },
  );

  fireEvent.change(
    screen.getByPlaceholderText('How can we help you?'),
    {
      target: {
        value: 'Need help with sarees',
      },
    },
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('ContactPage', () => {

  beforeEach(() => {
    mockFetchSuccess();

    vi.stubGlobal(
      'open',
      vi.fn(() => null),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // BASIC RENDERING
  // ───────────────────────────────────────────────────────────────────────────

  describe('Basic Rendering', () => {

    it('renders hero heading', async () => {
      await renderPage();

      expect(
        screen.getByText('Contact Us'),
      ).toBeTruthy();
    });

    it('renders contact card', async () => {
      await renderPage();

      expect(
        screen.getByText('Contact Information'),
      ).toBeTruthy();
    });

    it('renders form card', async () => {
      await renderPage();

      expect(
        screen.getByText('Send Us a Message'),
      ).toBeTruthy();
    });

    it('renders all form inputs', async () => {
      await renderPage();

      expect(
        screen.getByPlaceholderText('Your full name'),
      ).toBeTruthy();

      expect(
        screen.getByPlaceholderText('your@email.com'),
      ).toBeTruthy();

      expect(
        screen.getByPlaceholderText('+91 XXXXX XXXXX'),
      ).toBeTruthy();

      expect(
        screen.getByPlaceholderText('How can we help you?'),
      ).toBeTruthy();
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // CONTACT DATA
  // ───────────────────────────────────────────────────────────────────────────

  describe('Contact Data', () => {

    it('renders fetched phone number', async () => {
      await renderPage();

      await waitFor(() => {
        expect(
          screen.getByText('+91 99999 99999'),
        ).toBeTruthy();
      });
    });

    it('renders fetched email', async () => {
      await renderPage();

      await waitFor(() => {
        expect(
          screen.getByText('test@wingandweft.com'),
        ).toBeTruthy();
      });
    });

    it('renders instagram handle', async () => {
      await renderPage();

      await waitFor(() => {
        expect(
          screen.getByText('@wingandweft'),
        ).toBeTruthy();
      });
    });

    it('phone link contains tel:', async () => {
      await renderPage();

      await waitFor(() => {
        const link = screen
          .getByText('+91 99999 99999')
          .closest('a');

        expect(
          link?.getAttribute('href'),
        ).toContain('tel:');
      });
    });

    it('email link contains mailto:', async () => {
      await renderPage();

      await waitFor(() => {
        const link = screen
          .getByText('test@wingandweft.com')
          .closest('a');

        expect(
          link?.getAttribute('href'),
        ).toContain('mailto:');
      });
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // WHATSAPP CTA
  // ───────────────────────────────────────────────────────────────────────────

  describe('WhatsApp CTA', () => {

    it('renders whatsapp button', async () => {
      await renderPage();

      expect(
        screen.getByText(/Chat on WhatsApp/i),
      ).toBeTruthy();
    });

    it('contains wa.me link', async () => {
      await renderPage();

      await waitFor(() => {
        const btn = screen
          .getByText(/Chat on WhatsApp/i)
          .closest('a');

        expect(
          btn?.getAttribute('href'),
        ).toContain('wa.me');
      });
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // FORM INTERACTION
  // ───────────────────────────────────────────────────────────────────────────

  describe('Form Interaction', () => {

    it('updates input values on typing', async () => {
      await renderPage();

      const input = screen.getByPlaceholderText(
        'Your full name',
      ) as HTMLInputElement;

      fireEvent.change(input, {
        target: {
          value: 'Priya',
        },
      });

      expect(input.value).toBe('Priya');
    });

    it('submits form successfully', async () => {
      await renderPage();

      await fillForm();

      await act(async () => {
        fireEvent.click(
          screen.getByText(/Send Message/i),
        );
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('opens whatsapp after successful submit', async () => {
      await renderPage();

      await fillForm();

      await act(async () => {
        fireEvent.click(
          screen.getByText(/Send Message/i),
        );
      });

      await waitFor(() => {
        expect(global.open).toHaveBeenCalled();
      });
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // ERROR HANDLING
  // ───────────────────────────────────────────────────────────────────────────

  describe('Error Handling', () => {

    it('shows error message when submit fails', async () => {

      mockFetchFailure();

      await renderPage();

      await fillForm();

      await act(async () => {
        fireEvent.click(
          screen.getByText(/Send Message/i),
        );
      });

      await waitFor(() => {
        expect(
          screen.getByText(/Something went wrong/i),
        ).toBeTruthy();
      });
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // ACCESSIBILITY
  // ───────────────────────────────────────────────────────────────────────────

  describe('Accessibility', () => {

    it('submit button has type submit', async () => {
      await renderPage();

      const btn = screen
        .getByText(/Send Message/i)
        .closest('button') as HTMLButtonElement;

      expect(btn.type).toBe('submit');
    });

    it('email input has email type', async () => {
      await renderPage();

      const input = screen.getByPlaceholderText(
        'your@email.com',
      ) as HTMLInputElement;

      expect(input.type).toBe('email');
    });

    it('message field is textarea', async () => {
      await renderPage();

      const textarea = screen.getByPlaceholderText(
        'How can we help you?',
      );

      expect(
        textarea.tagName.toLowerCase(),
      ).toBe('textarea');
    });

  });

});

