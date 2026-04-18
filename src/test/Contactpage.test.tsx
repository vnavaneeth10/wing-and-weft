// src/test/ContactPage.test.tsx
//
// ─────────────────────────────────────────────────────────────────────────────
// Wing & Weft — ContactPage Test Suite
// Framework : Vitest + React Testing Library
// Coverage  : Rendering · Contact details · External link security ·
//             WhatsApp CTA · Form fields · Interactivity · Submit success ·
//             Submit error · Settings fallback · Accessibility ·
//             Theme tokens · Dark mode · SEO
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ContactPage from '../pages/ContactPage';

// ─── Mock settings data ───────────────────────────────────────────────────────

const MOCK_SETTINGS = [
  { key: 'contact_phone',    value: '+91 99999 99999' },
  { key: 'contact_email',    value: 'test@wingandweft.com' },
  { key: 'business_hours',   value: 'Mon–Sat: 10AM–7PM' },
  { key: 'instagram_handle', value: '@wingandweft' },
  { key: 'instagram_url',    value: 'https://www.instagram.com/wingandweft/' },
  { key: 'facebook_name',    value: 'Wing & Weft FB' },
  { key: 'facebook_url',     value: 'https://facebook.com/wingandweft' },
  { key: 'whatsapp_number',  value: '919999999999' },
];

// ─── Fetch mock factory helpers ───────────────────────────────────────────────

/**
 * Happy-path: GET /settings succeeds, POST /inquiries succeeds.
 */
const mockFetchSuccess = () =>
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      if (String(url).includes('/settings')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(MOCK_SETTINGS),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }),
  );

/**
 * Settings load OK; inquiry POST returns HTTP 500.
 */
const mockFetchInquiryFail = () =>
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      if (String(url).includes('/settings')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(MOCK_SETTINGS),
        });
      }
      return Promise.resolve({ ok: false, status: 500 });
    }),
  );

/**
 * Network-level failure for settings (triggers graceful fallback to DEFAULTS).
 */
const mockFetchSettingsFail = () =>
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

// ─── Render helper ────────────────────────────────────────────────────────────

const renderPage = () =>
  render(
    <MemoryRouter>
      <ContactPage />
    </MemoryRouter>,
  );

// ─── Shared fill-and-submit helper ───────────────────────────────────────────

const fillAndSubmit = async (
  name    = 'Test User',
  message = 'Test message',
  email   = 'test@test.com',
) => {
  await waitFor(() => screen.getByPlaceholderText('Your full name'));
  fireEvent.change(screen.getByPlaceholderText('Your full name'),       { target: { value: name    } });
  fireEvent.change(screen.getByPlaceholderText('your@email.com'),       { target: { value: email   } });
  fireEvent.change(screen.getByPlaceholderText('How can we help you?'), { target: { value: message } });
  fireEvent.click(screen.getByText(/Send Message/i));
};

// ─────────────────────────────────────────────────────────────────────────────
// SUITES
// ─────────────────────────────────────────────────────────────────────────────

describe('ContactPage', () => {

  beforeEach(() => {
    mockFetchSuccess();
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

    it('renders "Contact Us" hero h1', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('Contact Us')).toBeTruthy());
    });

    it('renders "Get in Touch" eyebrow text', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('Get in Touch')).toBeTruthy());
    });

    it('renders "We respond within 24 hours" tagline', async () => {
      renderPage();
      await waitFor(() =>
        expect(screen.getByText(/we respond within 24 hours/i)).toBeTruthy(),
      );
    });

    it('renders "Contact Information" card heading', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('Contact Information')).toBeTruthy());
    });

    it('renders "Send Us a Message" card heading', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('Send Us a Message')).toBeTruthy());
    });

    it('renders helper note below submit button', async () => {
      renderPage();
      await waitFor(() =>
        expect(
          screen.getByText(/your message will be saved and whatsapp will open/i),
        ).toBeTruthy(),
      );
    });

    it('renders a hero section with background styling', () => {
      const { container } = renderPage();
      const hero = container.querySelector('.overflow-hidden') as HTMLElement;
      expect(hero).toBeTruthy();
      expect(hero.style.background).toBeTruthy();
    });

  });

  // ════════════════════════════════════════════════════════════════════════════
  // 2. Contact detail rows
  // ════════════════════════════════════════════════════════════════════════════
  describe('2. Contact detail rows', () => {

    it('shows "Phone" label', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('Phone')).toBeTruthy());
    });

    it('shows "Email" label', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('Email')).toBeTruthy());
    });

    it('shows "Business Hours" label', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('Business Hours')).toBeTruthy());
    });

    it('shows "Instagram" label', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('Instagram')).toBeTruthy());
    });

    it('shows "Facebook" label', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('Facebook')).toBeTruthy());
    });

    it('displays fetched phone number', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('+91 99999 99999')).toBeTruthy());
    });

    it('displays fetched email address', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('test@wingandweft.com')).toBeTruthy());
    });

    it('displays fetched business hours', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('Mon–Sat: 10AM–7PM')).toBeTruthy());
    });

    it('displays fetched instagram handle', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('@wingandweft')).toBeTruthy());
    });

    it('phone link has a tel: href', async () => {
      renderPage();
      await waitFor(() => {
        const link = screen.getByText('+91 99999 99999').closest('a');
        expect(link?.getAttribute('href')).toMatch(/^tel:/);
      });
    });

    it('email link has the correct mailto: href', async () => {
      renderPage();
      await waitFor(() => {
        const link = screen.getByText('test@wingandweft.com').closest('a');
        expect(link?.getAttribute('href')).toBe('mailto:test@wingandweft.com');
      });
    });

    it('instagram link opens in a new tab', async () => {
      renderPage();
      await waitFor(() => {
        const link = screen.getByText('@wingandweft').closest('a');
        expect(link?.getAttribute('target')).toBe('_blank');
      });
    });

    it('instagram href contains "instagram.com"', async () => {
      renderPage();
      await waitFor(() => {
        const link = screen.getByText('@wingandweft').closest('a');
        expect(link?.getAttribute('href')).toContain('instagram.com');
      });
    });

    it('business hours renders as a plain <p> — not a link', async () => {
      renderPage();
      await waitFor(() => {
        const el = screen.getByText('Mon–Sat: 10AM–7PM');
        expect(el.tagName.toLowerCase()).toBe('p');
      });
    });

    it('exactly five .cp-info-row elements are rendered', async () => {
      const { container } = renderPage();
      await waitFor(() => {
        const rows = container.querySelectorAll('.cp-info-row');
        expect(rows.length).toBe(5);
      });
    });

  });

  // ════════════════════════════════════════════════════════════════════════════
  // 3. External link security
  // ════════════════════════════════════════════════════════════════════════════
  describe('3. External link security', () => {

    it('WhatsApp CTA rel contains "noopener"', async () => {
      renderPage();
      await waitFor(() => {
        const btn = screen.getByText(/Chat on WhatsApp/i).closest('a');
        expect(btn?.getAttribute('rel')).toContain('noopener');
      });
    });

    it('WhatsApp CTA rel contains "noreferrer"', async () => {
      renderPage();
      await waitFor(() => {
        const btn = screen.getByText(/Chat on WhatsApp/i).closest('a');
        expect(btn?.getAttribute('rel')).toContain('noreferrer');
      });
    });

    it('WhatsApp CTA target="_blank"', async () => {
      renderPage();
      await waitFor(() => {
        const btn = screen.getByText(/Chat on WhatsApp/i).closest('a');
        expect(btn?.getAttribute('target')).toBe('_blank');
      });
    });

    it('Instagram link rel contains "noopener"', async () => {
      renderPage();
      await waitFor(() => {
        const link = screen.getByText('@wingandweft').closest('a');
        expect(link?.getAttribute('rel')).toContain('noopener');
      });
    });

    it('phone link does NOT open in a new tab (tel: stays in current context)', async () => {
      renderPage();
      await waitFor(() => {
        const link = screen.getByText('+91 99999 99999').closest('a');
        expect(link?.getAttribute('target')).not.toBe('_blank');
      });
    });

  });

  // ════════════════════════════════════════════════════════════════════════════
  // 4. WhatsApp CTA
  // ════════════════════════════════════════════════════════════════════════════
  describe('4. WhatsApp CTA', () => {

    it('renders in the DOM', async () => {
      renderPage();
      await waitFor(() =>
        expect(screen.getByText(/Chat on WhatsApp/i)).toBeTruthy(),
      );
    });

    it('href contains "wa.me"', async () => {
      renderPage();
      await waitFor(() => {
        const btn = screen.getByText(/Chat on WhatsApp/i).closest('a');
        expect(btn?.getAttribute('href')).toContain('wa.me');
      });
    });

    it('href contains the fetched WhatsApp number', async () => {
      renderPage();
      await waitFor(() => {
        const btn = screen.getByText(/Chat on WhatsApp/i).closest('a');
        expect(btn?.getAttribute('href')).toContain('919999999999');
      });
    });

    it('href includes a pre-filled "text=" query parameter', async () => {
      renderPage();
      await waitFor(() => {
        const href =
          screen.getByText(/Chat on WhatsApp/i).closest('a')?.getAttribute('href') ?? '';
        expect(href).toContain('text=');
      });
    });

    it('button has the WhatsApp green (#25D366) background', async () => {
      renderPage();
      await waitFor(() => {
        const btn = screen.getByText(/Chat on WhatsApp/i).closest('a') as HTMLAnchorElement;
        expect(btn.style.background).toContain('#25D366');
      });
    });

  });

  // ════════════════════════════════════════════════════════════════════════════
  // 5. Form fields
  // ════════════════════════════════════════════════════════════════════════════
  describe('5. Form fields', () => {

    it('renders Name input', async () => {
      renderPage();
      await waitFor(() =>
        expect(screen.getByPlaceholderText('Your full name')).toBeTruthy(),
      );
    });

    it('renders Email input', async () => {
      renderPage();
      await waitFor(() =>
        expect(screen.getByPlaceholderText('your@email.com')).toBeTruthy(),
      );
    });

    it('renders WhatsApp input', async () => {
      renderPage();
      await waitFor(() =>
        expect(screen.getByPlaceholderText('+91 XXXXX XXXXX')).toBeTruthy(),
      );
    });

    it('renders Message textarea', async () => {
      renderPage();
      await waitFor(() =>
        expect(screen.getByPlaceholderText('How can we help you?')).toBeTruthy(),
      );
    });

    it('Name input is required', async () => {
      renderPage();
      await waitFor(() => {
        const el = screen.getByPlaceholderText('Your full name') as HTMLInputElement;
        expect(el.required).toBe(true);
      });
    });

    it('Email input is required', async () => {
      renderPage();
      await waitFor(() => {
        const el = screen.getByPlaceholderText('your@email.com') as HTMLInputElement;
        expect(el.required).toBe(true);
      });
    });

    it('Message textarea is required', async () => {
      renderPage();
      await waitFor(() => {
        const el = screen.getByPlaceholderText('How can we help you?') as HTMLTextAreaElement;
        expect(el.required).toBe(true);
      });
    });

    it('WhatsApp field is NOT required', async () => {
      renderPage();
      await waitFor(() => {
        const el = screen.getByPlaceholderText('+91 XXXXX XXXXX') as HTMLInputElement;
        expect(el.required).toBe(false);
      });
    });

    it('Email input has type="email"', async () => {
      renderPage();
      await waitFor(() => {
        const el = screen.getByPlaceholderText('your@email.com') as HTMLInputElement;
        expect(el.type).toBe('email');
      });
    });

    it('WhatsApp input has type="tel"', async () => {
      renderPage();
      await waitFor(() => {
        const el = screen.getByPlaceholderText('+91 XXXXX XXXXX') as HTMLInputElement;
        expect(el.type).toBe('tel');
      });
    });

    it('Name input has type="text"', async () => {
      renderPage();
      await waitFor(() => {
        const el = screen.getByPlaceholderText('Your full name') as HTMLInputElement;
        expect(el.type).toBe('text');
      });
    });

    it('Message element is a <textarea>', async () => {
      renderPage();
      await waitFor(() => {
        const el = screen.getByPlaceholderText('How can we help you?');
        expect(el.tagName.toLowerCase()).toBe('textarea');
      });
    });

    it('renders "Send Message" submit button', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText(/Send Message/i)).toBeTruthy());
    });

    it('submit button has type="submit"', async () => {
      renderPage();
      await waitFor(() => {
        const btn = screen.getByText(/Send Message/i).closest('button') as HTMLButtonElement;
        expect(btn.type).toBe('submit');
      });
    });

    it('form element has noValidate attribute', async () => {
      renderPage();
      await waitFor(() => {
        const form = document.querySelector('form');
        expect(form).toBeTruthy();
        // noValidate is reflected as the `noValidate` boolean property
        expect((form as HTMLFormElement).noValidate).toBe(true);
      });
    });

    it('"Name *" label text is present', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('Name *')).toBeTruthy());
    });

    it('"Email *" label text is present', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('Email *')).toBeTruthy());
    });

    it('"Message *" label text is present', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('Message *')).toBeTruthy());
    });

    it('"WhatsApp Number" optional label is present', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('WhatsApp Number')).toBeTruthy());
    });

  });

  // ════════════════════════════════════════════════════════════════════════════
  // 6. Form interactivity
  // ════════════════════════════════════════════════════════════════════════════
  describe('6. Form interactivity', () => {

    it('typing in Name field updates its value', async () => {
      renderPage();
      await waitFor(() => screen.getByPlaceholderText('Your full name'));
      const input = screen.getByPlaceholderText('Your full name') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Priya Nair' } });
      expect(input.value).toBe('Priya Nair');
    });

    it('typing in Email field updates its value', async () => {
      renderPage();
      await waitFor(() => screen.getByPlaceholderText('your@email.com'));
      const input = screen.getByPlaceholderText('your@email.com') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'priya@example.com' } });
      expect(input.value).toBe('priya@example.com');
    });

    it('typing in WhatsApp field updates its value', async () => {
      renderPage();
      await waitFor(() => screen.getByPlaceholderText('+91 XXXXX XXXXX'));
      const input = screen.getByPlaceholderText('+91 XXXXX XXXXX') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '+91 88888 88888' } });
      expect(input.value).toBe('+91 88888 88888');
    });

    it('typing in Message field updates its value', async () => {
      renderPage();
      await waitFor(() => screen.getByPlaceholderText('How can we help you?'));
      const ta = screen.getByPlaceholderText('How can we help you?') as HTMLTextAreaElement;
      fireEvent.change(ta, { target: { value: 'Looking for silk sarees.' } });
      expect(ta.value).toBe('Looking for silk sarees.');
    });

    it('submit with empty Name does NOT POST to /inquiries', async () => {
      const fetchMock = vi.fn((url: string) => {
        if (String(url).includes('/settings'))
          return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
        return Promise.resolve({ ok: true });
      });
      vi.stubGlobal('fetch', fetchMock);
      renderPage();
      await waitFor(() => screen.getByPlaceholderText('Your full name'));
      fireEvent.change(screen.getByPlaceholderText('How can we help you?'), {
        target: { value: 'Hello' },
      });
      fireEvent.click(screen.getByText(/Send Message/i));
      await act(async () => {});
      const inquiryCalls = fetchMock.mock.calls.filter((c) =>
        String(c[0]).includes('/inquiries'),
      );
      expect(inquiryCalls.length).toBe(0);
    });

    it('submit with empty Message does NOT POST to /inquiries', async () => {
      const fetchMock = vi.fn((url: string) => {
        if (String(url).includes('/settings'))
          return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
        return Promise.resolve({ ok: true });
      });
      vi.stubGlobal('fetch', fetchMock);
      renderPage();
      await waitFor(() => screen.getByPlaceholderText('Your full name'));
      fireEvent.change(screen.getByPlaceholderText('Your full name'), {
        target: { value: 'Priya' },
      });
      fireEvent.click(screen.getByText(/Send Message/i));
      await act(async () => {});
      const inquiryCalls = fetchMock.mock.calls.filter((c) =>
        String(c[0]).includes('/inquiries'),
      );
      expect(inquiryCalls.length).toBe(0);
    });

    it('whitespace-only Name is treated as empty — no inquiry POST', async () => {
      const fetchMock = vi.fn((url: string) => {
        if (String(url).includes('/settings'))
          return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
        return Promise.resolve({ ok: true });
      });
      vi.stubGlobal('fetch', fetchMock);
      renderPage();
      await waitFor(() => screen.getByPlaceholderText('Your full name'));
      fireEvent.change(screen.getByPlaceholderText('Your full name'), {
        target: { value: '   ' },
      });
      fireEvent.change(screen.getByPlaceholderText('How can we help you?'), {
        target: { value: 'Hello' },
      });
      fireEvent.click(screen.getByText(/Send Message/i));
      await act(async () => {});
      const inquiryCalls = fetchMock.mock.calls.filter((c) =>
        String(c[0]).includes('/inquiries'),
      );
      expect(inquiryCalls.length).toBe(0);
    });

  });

  // ════════════════════════════════════════════════════════════════════════════
  // 7. Form submission — success
  // ════════════════════════════════════════════════════════════════════════════
  describe('7. Submit — success', () => {

    it('shows "Sending…" label while request is in-flight', async () => {
      let resolvePost!: () => void;
      vi.stubGlobal('fetch', vi.fn((url: string) => {
        if (String(url).includes('/settings'))
          return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_SETTINGS) });
        return new Promise<{ ok: boolean }>((res) => { resolvePost = () => res({ ok: true }); });
      }));
      renderPage();
      await fillAndSubmit();
      await waitFor(() => expect(screen.getByText(/Sending…/i)).toBeTruthy());
      resolvePost();
    });

    it('submit button is disabled while saving', async () => {
      let resolvePost!: () => void;
      vi.stubGlobal('fetch', vi.fn((url: string) => {
        if (String(url).includes('/settings'))
          return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_SETTINGS) });
        return new Promise<{ ok: boolean }>((res) => { resolvePost = () => res({ ok: true }); });
      }));
      renderPage();
      await fillAndSubmit();
      await waitFor(() => {
        const btn = screen.getByText(/Sending…/i).closest('button') as HTMLButtonElement;
        expect(btn.disabled).toBe(true);
      });
      resolvePost();
    });

    it('calls window.open with a wa.me URL on success', async () => {
      const mockOpen = vi.fn();
      vi.stubGlobal('open', mockOpen);
      renderPage();
      await fillAndSubmit();
      await waitFor(() => expect(mockOpen).toHaveBeenCalled());
      expect(mockOpen.mock.calls[0][0]).toContain('wa.me');
    });

    it('window.open is called with target="_blank"', async () => {
      const mockOpen = vi.fn();
      vi.stubGlobal('open', mockOpen);
      renderPage();
      await fillAndSubmit();
      await waitFor(() => expect(mockOpen).toHaveBeenCalled());
      expect(mockOpen.mock.calls[0][1]).toBe('_blank');
    });

    it('window.open URL contains the submitted name', async () => {
      const mockOpen = vi.fn();
      vi.stubGlobal('open', mockOpen);
      renderPage();
      await fillAndSubmit('Lakshmi', 'I want a Kanjivaram');
      await waitFor(() => expect(mockOpen).toHaveBeenCalled());
      expect(decodeURIComponent(mockOpen.mock.calls[0][0])).toContain('Lakshmi');
    });

    it('window.open URL contains the submitted message', async () => {
      const mockOpen = vi.fn();
      vi.stubGlobal('open', mockOpen);
      renderPage();
      await fillAndSubmit('Priya', 'I want a Kanjivaram saree');
      await waitFor(() => expect(mockOpen).toHaveBeenCalled());
      expect(decodeURIComponent(mockOpen.mock.calls[0][0])).toContain(
        'I want a Kanjivaram saree',
      );
    });

    it('shows "Message saved!" success banner', async () => {
      renderPage();
      await fillAndSubmit();
      await waitFor(() => expect(screen.getByText(/Message saved/i)).toBeTruthy());
    });

    it('form fields are cleared after success', async () => {
      renderPage();
      await waitFor(() => screen.getByPlaceholderText('Your full name'));
      const nameInput = screen.getByPlaceholderText('Your full name') as HTMLInputElement;
      const msgInput  = screen.getByPlaceholderText('How can we help you?') as HTMLTextAreaElement;
      await fillAndSubmit('Clear Test', 'Will be cleared');
      await waitFor(() => {
        expect(nameInput.value).toBe('');
        expect(msgInput.value).toBe('');
      });
    });

    it('POST body contains correct customer_name', async () => {
      const fetchMock = vi.fn((url: string) => {
        if (String(url).includes('/settings'))
          return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_SETTINGS) });
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });
      vi.stubGlobal('fetch', fetchMock);
      renderPage();
      await fillAndSubmit('Anjali');
      await waitFor(() => {
        const call = fetchMock.mock.calls.find((c) => String(c[0]).includes('/inquiries'));
        const body = JSON.parse((call![1] as RequestInit).body as string);
        expect(body.customer_name).toBe('Anjali');
      });
    });

    it('POST body contains correct message', async () => {
      const fetchMock = vi.fn((url: string) => {
        if (String(url).includes('/settings'))
          return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_SETTINGS) });
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });
      vi.stubGlobal('fetch', fetchMock);
      renderPage();
      await fillAndSubmit('User', 'Kanjivaram query');
      await waitFor(() => {
        const call = fetchMock.mock.calls.find((c) => String(c[0]).includes('/inquiries'));
        const body = JSON.parse((call![1] as RequestInit).body as string);
        expect(body.message).toBe('Kanjivaram query');
      });
    });

    it('POST body has status="new"', async () => {
      const fetchMock = vi.fn((url: string) => {
        if (String(url).includes('/settings'))
          return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_SETTINGS) });
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });
      vi.stubGlobal('fetch', fetchMock);
      renderPage();
      await fillAndSubmit();
      await waitFor(() => {
        const call = fetchMock.mock.calls.find((c) => String(c[0]).includes('/inquiries'));
        const body = JSON.parse((call![1] as RequestInit).body as string);
        expect(body.status).toBe('new');
      });
    });

    it('POST body defaults customer_phone to "N/A" when WhatsApp is empty', async () => {
      const fetchMock = vi.fn((url: string) => {
        if (String(url).includes('/settings'))
          return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_SETTINGS) });
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });
      vi.stubGlobal('fetch', fetchMock);
      renderPage();
      await fillAndSubmit('No Phone User', 'No phone provided');
      await waitFor(() => {
        const call = fetchMock.mock.calls.find((c) => String(c[0]).includes('/inquiries'));
        const body = JSON.parse((call![1] as RequestInit).body as string);
        expect(body.customer_phone).toBe('N/A');
      });
    });

    it('POST uses method="POST"', async () => {
      const fetchMock = vi.fn((url: string) => {
        if (String(url).includes('/settings'))
          return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_SETTINGS) });
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });
      vi.stubGlobal('fetch', fetchMock);
      renderPage();
      await fillAndSubmit();
      await waitFor(() => {
        const call = fetchMock.mock.calls.find((c) => String(c[0]).includes('/inquiries'));
        expect((call![1] as RequestInit).method).toBe('POST');
      });
    });

    it('POST Content-Type header is "application/json"', async () => {
      const fetchMock = vi.fn((url: string) => {
        if (String(url).includes('/settings'))
          return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_SETTINGS) });
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });
      vi.stubGlobal('fetch', fetchMock);
      renderPage();
      await fillAndSubmit();
      await waitFor(() => {
        const call = fetchMock.mock.calls.find((c) => String(c[0]).includes('/inquiries'));
        const headers = (call![1] as RequestInit).headers as Record<string, string>;
        expect(headers['Content-Type']).toBe('application/json');
      });
    });

  });

  // ════════════════════════════════════════════════════════════════════════════
  // 8. Form submission — error path
  // ════════════════════════════════════════════════════════════════════════════
  describe('8. Submit — error', () => {

    it('shows "Something went wrong" error banner when POST fails', async () => {
      mockFetchInquiryFail();
      renderPage();
      await fillAndSubmit();
      await waitFor(() =>
        expect(screen.getByText(/something went wrong/i)).toBeTruthy(),
      );
    });

    it('does NOT call window.open when POST fails', async () => {
      mockFetchInquiryFail();
      const mockOpen = vi.fn();
      vi.stubGlobal('open', mockOpen);
      renderPage();
      await fillAndSubmit();
      await waitFor(() =>
        expect(screen.getByText(/something went wrong/i)).toBeTruthy(),
      );
      expect(mockOpen).not.toHaveBeenCalled();
    });

    it('form fields retain their values after a failed submission', async () => {
      mockFetchInquiryFail();
      renderPage();
      await waitFor(() => screen.getByPlaceholderText('Your full name'));
      const nameInput = screen.getByPlaceholderText('Your full name') as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: 'Error User' } });
      fireEvent.change(screen.getByPlaceholderText('How can we help you?'), {
        target: { value: 'This should fail' },
      });
      fireEvent.click(screen.getByText(/Send Message/i));
      await waitFor(() =>
        expect(screen.getByText(/something went wrong/i)).toBeTruthy(),
      );
      expect(nameInput.value).toBe('Error User');
    });

  });

  // ════════════════════════════════════════════════════════════════════════════
  // 9. Settings fetch — graceful fallback to DEFAULTS
  // ════════════════════════════════════════════════════════════════════════════
  describe('9. Settings fallback (network failure)', () => {

    it('shows default phone number', async () => {
      mockFetchSettingsFail();
      renderPage();
      await waitFor(() =>
        expect(screen.getByText('+91 99999 99999')).toBeTruthy(),
      );
    });

    it('shows default email', async () => {
      mockFetchSettingsFail();
      renderPage();
      await waitFor(() =>
        expect(screen.getByText('support@wingandweft.com')).toBeTruthy(),
      );
    });

    it('shows default business hours', async () => {
      mockFetchSettingsFail();
      renderPage();
      await waitFor(() => expect(screen.getByText(/Mon–Sat/)).toBeTruthy());
    });

    it('WhatsApp CTA still renders', async () => {
      mockFetchSettingsFail();
      renderPage();
      await waitFor(() =>
        expect(screen.getByText(/Chat on WhatsApp/i)).toBeTruthy(),
      );
    });

    it('WhatsApp CTA href still contains "wa.me"', async () => {
      mockFetchSettingsFail();
      renderPage();
      await waitFor(() => {
        const btn = screen.getByText(/Chat on WhatsApp/i).closest('a');
        expect(btn?.getAttribute('href')).toContain('wa.me');
      });
    });

  });

  // ════════════════════════════════════════════════════════════════════════════
  // 10. Accessibility
  // ════════════════════════════════════════════════════════════════════════════
  describe('10. Accessibility', () => {

    it('decorative SVGs carry aria-hidden="true"', async () => {
      const { container } = renderPage();
      await waitFor(() => {
        const hiddenSVGs = container.querySelectorAll('svg[aria-hidden="true"]');
        expect(hiddenSVGs.length).toBeGreaterThan(0);
      });
    });

    it('five icon wrapper elements render (one per contact row)', async () => {
      const { container } = renderPage();
      await waitFor(() => {
        const wrappers = container.querySelectorAll('.cp-icon-wrap');
        expect(wrappers.length).toBe(5);
      });
    });

  });

  // ════════════════════════════════════════════════════════════════════════════
  // 11. Theme token integrity
  // ════════════════════════════════════════════════════════════════════════════
  describe('11. Theme tokens', () => {

    it('submit button has a non-empty background (gradient applied)', async () => {
      renderPage();
      await waitFor(() => {
        const btn = screen.getByText(/Send Message/i).closest('button') as HTMLButtonElement;
        expect(btn.style.background).toBeTruthy();
      });
    });

    it('submit button has a non-empty color (theme text colour applied)', async () => {
      renderPage();
      await waitFor(() => {
        const btn = screen.getByText(/Send Message/i).closest('button') as HTMLButtonElement;
        expect(btn.style.color).toBeTruthy();
      });
    });

    it('CSS custom properties for underline are injected into :root', async () => {
      renderPage();
      await waitFor(() => {
        const vars = document.getElementById('cp-theme-vars');
        expect(vars).toBeTruthy();
        expect(vars?.textContent).toContain('--cp-underline-1');
        expect(vars?.textContent).toContain('--cp-underline-2');
      });
    });

    it('<style id="cp-theme-vars"> is injected into <head>', async () => {
      renderPage();
      await waitFor(() => {
        expect(document.getElementById('cp-theme-vars')).toBeTruthy();
      });
    });

  });

  // ════════════════════════════════════════════════════════════════════════════
  // 12. Dark-mode rendering
  // ════════════════════════════════════════════════════════════════════════════
  describe('12. Dark mode', () => {

    it('renders without crashing when isDark=true', async () => {
      const { ThemeProvider } = await import('../context/ThemeContext');
      const { container } = render(
        <MemoryRouter>
          <ThemeProvider isDark={true}>
            <ContactPage />
          </ThemeProvider>
        </MemoryRouter>,
      );
      expect(container).toBeTruthy();
      await waitFor(() => expect(screen.getByText('Contact Us')).toBeTruthy());
    });

    it('renders "Contact Information" card in dark mode', async () => {
      const { ThemeProvider } = await import('../context/ThemeContext');
      render(
        <MemoryRouter>
          <ThemeProvider isDark={true}>
            <ContactPage />
          </ThemeProvider>
        </MemoryRouter>,
      );
      await waitFor(() => expect(screen.getByText('Contact Information')).toBeTruthy());
    });

    it('renders the contact form in dark mode', async () => {
      const { ThemeProvider } = await import('../context/ThemeContext');
      render(
        <MemoryRouter>
          <ThemeProvider isDark={true}>
            <ContactPage />
          </ThemeProvider>
        </MemoryRouter>,
      );
      await waitFor(() =>
        expect(screen.getByPlaceholderText('Your full name')).toBeTruthy(),
      );
    });

  });

  // ════════════════════════════════════════════════════════════════════════════
  // 13. SEO
  // ════════════════════════════════════════════════════════════════════════════
  describe('13. SEO', () => {

    it('renders a <title> element in the document', async () => {
      renderPage();
      await waitFor(() => {
        expect(document.querySelector('title')).toBeTruthy();
      });
    });

  });

});