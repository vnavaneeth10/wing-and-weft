// src/test/Banner.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Banner from '../components/Banner/Banner';

// ─── WHY these mocks are needed ───────────────────────────────────────────────
// 1. Banner uses useTheme() — must wrap in ThemeProvider or mock the context.
//    Mocking is simpler and keeps tests isolated from theme logic.
//
// 2. Banner makes TWO fetch calls in the same useEffect:
//      a. /rest/v1/banners   → the slides data
//      b. /rest/v1/settings  → ribbon_visible flag
//    The old test had a single fetch stub that returned the same response for
//    both calls, but the settings fetch expects [{value: "..."}], not a banner
//    array. We need to distinguish calls by URL.
//
// 3. SUPABASE_URL / SUPABASE_ANON_KEY are imported from the admin supabase module
//    — we stub them to known values so the constructed URL is predictable.

vi.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({ isDark: false }),
}));

// Stub supabase constants so URL matching in the fetch mock is reliable
vi.mock('../../admin/lib/supabase', () => ({
  SUPABASE_URL:      'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
}));

const mockBanners = [
  {
    id:         '1',
    title:      'Test Title',
    subtitle:   'Test Subtitle',
    eyebrow:    'New Arrivals',
    cta_text:   'Shop Now',
    cta_link:   '/test',
    image_url:  '/test.jpg',
    is_active:  true,
    sort_order: 1,
  },
];

// ── Fetch dispatcher — returns the right data based on which endpoint is called ──
const makeFetchMock = (banners = mockBanners) =>
  vi.fn().mockImplementation((url: string) => {
    if (url.includes('/banners')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(banners) });
    }
    // settings (ribbon_visible) — return empty so ribbon stays visible by default
    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
  });

const renderBanner = () =>
  render(
    <MemoryRouter>
      <Banner />
    </MemoryRouter>
  );

beforeEach(() => {
  vi.stubGlobal('fetch', makeFetchMock());
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Banner', () => {
  // ── Loading state ────────────────────────────────────────────────────────────
  it('renders the skeleton with aria-busy="true" while loading', () => {
    // Don't await — we want to catch the synchronous loading state
    renderBanner();
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
  });

  it('wraps everything in a section with aria-label="Featured collection"', () => {
    renderBanner();
    const section = document.querySelector('section[aria-label="Featured collection"]');
    expect(section).toBeTruthy();
  });

  // ── Loaded state ─────────────────────────────────────────────────────────────
  it('renders the banner title after data loads', async () => {
    renderBanner();
    await waitFor(() => {
      expect(screen.getByText('Test Title')).toBeTruthy();
    });
  });

  it('renders the banner subtitle after data loads', async () => {
    renderBanner();
    await waitFor(() => {
      expect(screen.getByText('Test Subtitle')).toBeTruthy();
    });
  });

  it('renders the CTA link with correct href after data loads', async () => {
    renderBanner();
    await waitFor(() => {
      const cta = screen.getByText('Shop Now').closest('a');
      expect(cta?.getAttribute('href')).toBe('/test');
    });
  });

  // ── Empty state ───────────────────────────────────────────────────────────────
  it('shows empty state when banners fetch returns empty array', async () => {
    vi.stubGlobal('fetch', makeFetchMock([]));
    renderBanner();
    await waitFor(() => {
      // BannerEmpty renders "Coming Soon" text
      expect(screen.getByText('Coming Soon')).toBeTruthy();
    });
  });

  it('shows empty state when banners fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    renderBanner();
    await waitFor(() => {
      expect(screen.getByText('Coming Soon')).toBeTruthy();
    });
  });

  it('does NOT render banner title in empty state', async () => {
    vi.stubGlobal('fetch', makeFetchMock([]));
    renderBanner();
    await waitFor(() => {
      expect(screen.queryByText('Test Title')).toBeNull();
    });
  });

  // ── Skeleton → loaded transition ─────────────────────────────────────────────
  it('removes aria-busy once slides have loaded', async () => {
    renderBanner();
    // Initially present
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
    // After load it's gone (BannerSkeleton unmounts)
    await waitFor(() => {
      expect(document.querySelector('[aria-busy="true"]')).toBeNull();
    });
  });
});