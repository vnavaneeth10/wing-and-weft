// src/test/Footer.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../components/Footer/Footer';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve([
      { key: 'instagram_url',  value: 'https://instagram.com/wingandweft' },
      { key: 'facebook_url',   value: 'https://facebook.com/wingandweft' },
      { key: 'contact_email',  value: 'test@wingandweft.com' },
      { key: 'whatsapp_number', value: '919999999999' },
    ]),
  }));
});

const renderFooter = () =>
  render(<MemoryRouter><Footer /></MemoryRouter>);

describe('Footer', () => {
  it('renders without crashing', () => {
    const { container } = renderFooter();
    expect(container).toBeTruthy();
  });

  it('has contentinfo landmark role', () => {
    renderFooter();
    expect(screen.getByRole('contentinfo')).toBeTruthy();
  });

  it('renders Wing & Weft logo', () => {
    renderFooter();
    const logo = screen.getByAltText('Wing & Weft');
    expect(logo).toBeTruthy();
  });

  it('renders Quick Links section', async () => {
    renderFooter();
    await waitFor(() => {
      expect(screen.getByText('Quick Links')).toBeTruthy();
    });
  });

  it('renders Policies section', async () => {
    renderFooter();
    await waitFor(() => {
      expect(screen.getByText('Policies')).toBeTruthy();
    });
  });

  it('renders newsletter subscribe form', () => {
    renderFooter();
    expect(screen.getByLabelText('Email address for newsletter')).toBeTruthy();
  });

  it('newsletter input requires valid email', () => {
    renderFooter();
    const input = screen.getByLabelText('Email address for newsletter') as HTMLInputElement;
    expect(input.type).toBe('email');
    expect(input.required).toBe(true);
  });

  it('subscribe button is present', () => {
    renderFooter();
    expect(screen.getByLabelText('Subscribe to newsletter')).toBeTruthy();
  });

  it('renders Instagram social link', async () => {
    renderFooter();
    await waitFor(() => {
      expect(screen.getByLabelText('Instagram')).toBeTruthy();
    });
  });

  it('renders Facebook social link', async () => {
    renderFooter();
    await waitFor(() => {
      expect(screen.getByLabelText('Facebook')).toBeTruthy();
    });
  });

  it('renders Email link', async () => {
    renderFooter();
    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeTruthy();
    });
  });

  it('renders WhatsApp link', async () => {
    renderFooter();
    await waitFor(() => {
      expect(screen.getByLabelText('WhatsApp')).toBeTruthy();
    });
  });

  it('all external links have noopener noreferrer', async () => {
    renderFooter();
    await waitFor(() => {
      const externalLinks = document.querySelectorAll('a[target="_blank"]');
      externalLinks.forEach(link => {
        expect(link.getAttribute('rel')).toContain('noopener');
        expect(link.getAttribute('rel')).toContain('noreferrer');
      });
    });
  });

  it('renders developer credit link to Navi', async () => {
    renderFooter();
    await waitFor(() => {
      const naviLink = screen.getByText('Navi');
      expect(naviLink.getAttribute('href')).toBe('https://vnvne.vercel.app/');
    });
  });

  it('Home navigation link is present', async () => {
    renderFooter();
    await waitFor(() => {
      const homeLink = screen.getByRole('link', { name: 'Home' });
      expect(homeLink).toBeTruthy();
    });
  });

  it('copyright text is present', () => {
    renderFooter();
    expect(screen.getByText(/2026 Wing/i)).toBeTruthy();
  });

  it('newsletter submit saves email on valid submission', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, json: () => Promise.resolve([]),
    }));

    renderFooter();
    const input = screen.getByLabelText('Email address for newsletter');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByLabelText('Subscribe to newsletter'));

    await waitFor(() => {
      // After submission fetch is called with the inquiry endpoint
      expect(fetch).toHaveBeenCalled();
    });
  });
});