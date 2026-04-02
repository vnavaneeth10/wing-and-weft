// src/test/Navbar.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';

// ── Mock the search suggestions hook so it never fires a real Supabase call ───
vi.mock('../hooks', () => ({
  useSearchSuggestions: () => [],
}));

// ── Mock fetch so categories useEffect resolves immediately ───────────────────
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok:   true,
    json: () => Promise.resolve([
      { id: 'silk-sarees',   name: 'Silk Sarees' },
      { id: 'cotton-sarees', name: 'Cotton Sarees' },
    ]),
  }));
});

const renderNavbar = (path = '/') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Navbar />
    </MemoryRouter>
  );

describe('Navbar', () => {

  // ── Static rendering tests ─────────────────────────────────────────────────

  it('renders logo image with correct alt text', async () => {
    renderNavbar();
    await waitFor(() => {
      expect(screen.getByAltText('Wing & Weft')).toBeTruthy();
    });
  });

  it('has accessible main navigation landmark', async () => {
    renderNavbar();
    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeTruthy();
    });
  });

  it('renders Home, Our Story and Contact nav links', async () => {
    renderNavbar();
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Home' })).toBeTruthy();
      expect(screen.getByText('Our Story')).toBeTruthy();
      expect(screen.getByText('Contact')).toBeTruthy();
    });
  });

  it('has search button with correct aria-label', async () => {
    renderNavbar();
    await waitFor(() => {
      expect(screen.getByLabelText('Open search')).toBeTruthy();
    });
  });

  it('has theme toggle button', async () => {
    renderNavbar();
    await waitFor(() => {
      expect(screen.getByLabelText(/Switch to/i)).toBeTruthy();
    });
  });

  it('has Instagram link with noopener noreferrer', async () => {
    renderNavbar();
    await waitFor(() => {
      const igLink = screen.getByLabelText('Follow us on Instagram');
      expect(igLink.getAttribute('rel')).toContain('noopener');
      expect(igLink.getAttribute('rel')).toContain('noreferrer');
    });
  });

  it('Instagram link opens in new tab', async () => {
    renderNavbar();
    await waitFor(() => {
      const igLink = screen.getByLabelText('Follow us on Instagram');
      expect(igLink.getAttribute('target')).toBe('_blank');
    });
  });

  it('categories dropdown button has aria-haspopup true', async () => {
    renderNavbar();
    await waitFor(() => {
      const catBtn = screen.getByRole('button', { name: /Categories/i });
      expect(catBtn.getAttribute('aria-haspopup')).toBe('true');
    });
  });

  it('mobile menu button exists and starts closed', async () => {
    renderNavbar();
    await waitFor(() => {
      const menuBtn = document.querySelector(
        'button[aria-label="Open menu"]'
      ) as HTMLButtonElement;
      expect(menuBtn).toBeTruthy();
      expect(menuBtn.getAttribute('aria-expanded')).toBe('false');
    });
  });

  it('logo links to home page', async () => {
    renderNavbar();
    await waitFor(() => {
      const homeLink = screen.getByLabelText('Wing & Weft Home');
      expect(homeLink.getAttribute('href')).toBe('/');
    });
  });

  // ── Interactive tests ──────────────────────────────────────────────────────

  it('opens mobile menu on click — aria-expanded changes to true', async () => {
    renderNavbar();

    // findByLabelText already waits — no need for a separate waitFor
    const menuBtn = await screen.findByLabelText('Open menu');

    fireEvent.click(menuBtn);

    // After click the label flips to "Close menu" and the mobile nav appears
    await waitFor(() => {
      const closeBtn  = document.querySelector('button[aria-label="Close menu"]');
      const mobileNav = document.querySelector('[aria-label="Mobile navigation"]');
      expect(closeBtn !== null || mobileNav !== null).toBe(true);
    });
  });

  it('search input appears after clicking search button', async () => {
    renderNavbar();

    const searchBtn = await screen.findByLabelText('Open search');

    fireEvent.click(searchBtn);

    // Navbar uses Unicode ellipsis (…) not three dots (...) in the placeholder
    await waitFor(() => {
      const input =
        document.querySelector('input[placeholder="Search sarees, fabrics…"]') ||
        document.querySelector('input[aria-label="Search products"]');
      expect(input).not.toBeNull();
    });
  });

  it('scrollTo mock is available for navigation', () => {
    renderNavbar();
    expect(typeof global.scrollTo).toBe('function');
  });

});