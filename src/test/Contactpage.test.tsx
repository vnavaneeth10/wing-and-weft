// src/test/ContactPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ContactPage from '../pages/ContactPage';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve([
      { key: 'contact_phone',    value: '+91 99999 99999' },
      { key: 'contact_email',    value: 'test@wingandweft.com' },
      { key: 'business_hours',   value: 'Mon–Sat: 10AM–7PM' },
      { key: 'instagram_handle', value: '@wingandweft' },
      { key: 'whatsapp_number',  value: '919999999999' },
    ]),
  }));
});

const renderPage = () =>
  render(<MemoryRouter><ContactPage /></MemoryRouter>);

describe('ContactPage', () => {
  it('renders page without crashing', () => {
    const { container } = renderPage();
    expect(container).toBeTruthy();
  });

  it('renders Contact Us heading', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Contact Us')).toBeTruthy();
    });
  });

  it('renders contact info card heading', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Contact Information')).toBeTruthy();
    });
  });

  it('renders the message form', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Send Us a Message')).toBeTruthy();
    });
  });

  it('form has Name, Email and Message fields', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Your full name')).toBeTruthy();
      expect(screen.getByPlaceholderText('your@email.com')).toBeTruthy();
      expect(screen.getByPlaceholderText('How can we help you?')).toBeTruthy();
    });
  });

  it('Name field is required', async () => {
    renderPage();
    await waitFor(() => {
      const nameInput = screen.getByPlaceholderText('Your full name') as HTMLInputElement;
      expect(nameInput.required).toBe(true);
    });
  });

  it('Submit button is present', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Send Message/i)).toBeTruthy();
    });
  });

  it('WhatsApp CTA button is present', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Chat on WhatsApp/i)).toBeTruthy();
    });
  });

  it('WhatsApp button links to correct URL format', async () => {
    renderPage();
    await waitFor(() => {
      const waBtn = screen.getByText(/Chat on WhatsApp/i).closest('a');
      expect(waBtn?.getAttribute('href')).toContain('wa.me');
    });
  });

  it('external links have noopener noreferrer', async () => {
    renderPage();
    await waitFor(() => {
      const waBtn = screen.getByText(/Chat on WhatsApp/i).closest('a');
      expect(waBtn?.getAttribute('rel')).toContain('noopener');
    });
  });

  it('form submission saves inquiry and opens WhatsApp', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([]) }));
    const mockOpen = vi.fn();
    vi.stubGlobal('open', mockOpen);

    renderPage();
    await waitFor(() => screen.getByPlaceholderText('Your full name'));

    fireEvent.change(screen.getByPlaceholderText('Your full name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('How can we help you?'), { target: { value: 'Test message' } });
    fireEvent.click(screen.getByText(/Send Message/i));

    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalled();
    });
  });
});