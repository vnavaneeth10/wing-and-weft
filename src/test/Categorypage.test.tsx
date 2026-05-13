// src/test/CategoryPage.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CategoryPage from '../pages/CategoryPage';

// ─── WHY these mocks are needed ───────────────────────────────────────────────
// 1. CategoryPage calls useTheme() — mock to avoid needing a real ThemeProvider.
//
// 2. CategoryPage calls usePageMeta() — mock to avoid document.title side-effects
//    that could bleed between tests.
//
// 3. CategoryPage uses <SEO> which renders helmet-style meta tags — mock to a
//    no-op so we don't have to care about head mutations in jsdom.
//
// 4. useProductsByCategory is mocked so we control loading/data states.
//    IMPORTANT: vi.mock path must resolve to the same module the component
//    imports. CategoryPage imports from '../hooks/useProducts' (relative to
//    src/pages/). The test lives at src/test/, so '../hooks/useProducts'
//    resolves to src/hooks/useProducts — the same file. ✓
//
// 5. CategoryPage fetches category metadata via direct fetch() calls using
//    SUPABASE_URL/SUPABASE_ANON_KEY constants imported from the admin supabase
//    module. We mock those constants to known values and stub global fetch to
//    return a predictable category object.

vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({ isDark: false }),
}));

vi.mock('../hooks/usePageMeta', () => ({
  usePageMeta: vi.fn(),
}));

vi.mock('../components/SEO/SEO', () => ({
  default: () => null,
}));

vi.mock('../admin/lib/supabase', () => ({
  SUPABASE_URL:      'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
}));

// ── useProductsByCategory mock — default returns empty / not loading ──
const mockUseProductsByCategory = vi.fn(() => ({ products: [], loading: false }));
vi.mock('../hooks/useProducts', () => ({
  useProductsByCategory: (...args: unknown[]) => mockUseProductsByCategory(...args),
}));

// ─── Sample category metadata ─────────────────────────────────────────────────
const silkCategory = {
  id:          'silk-sarees',
  name:        'Silk Sarees',
  description: 'Pure silk weaves',
  sort_order:  1,
  is_active:   true,
};

// ─── Sample products ──────────────────────────────────────────────────────────
const mockProducts = [
  {
    id: 'silk-001', name: 'Kanchipuram Silk', category: 'silk-sarees',
    fabric: 'Pure Silk', price: 8500, discount_price: null, stock: 10,
    colors: ['#bc3d3e'], images: ['/img1.jpg'],
    description: 'A beautiful saree', saree_fabric: 'Pure Silk',
    saree_length: '6.3m', blouse_length: '0.8m', blouse_fabric: 'Silk',
    is_best_seller: true, is_new_arrival: false, is_featured: false,
    show_rating: false, show_colors: true,
    rating: 4.5, review_count: 10, is_visible: true,
  },
];

// ─── Render helper ────────────────────────────────────────────────────────────
const renderPage = (categoryId = 'silk-sarees') =>
  render(
    <MemoryRouter initialEntries={[`/category/${categoryId}`]}>
      <Routes>
        <Route path="/category/:categoryId" element={<CategoryPage />} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  // Default fetch: categories endpoint returns the test category
  vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
    if (url.includes('/categories')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([silkCategory]),
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
  }));

  // Reset product hook to default (empty, not loading)
  mockUseProductsByCategory.mockReturnValue({ products: [], loading: false });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
describe('CategoryPage', () => {

  // ── Breadcrumb ───────────────────────────────────────────────────────────────
  it('renders breadcrumb nav with Home link', async () => {
    renderPage();
    await waitFor(() => {
      expect(document.querySelector('nav[aria-label="Breadcrumb"]')).toBeTruthy();
    });
    expect(screen.getByText('Home')).toBeTruthy();
  });

  it('breadcrumb contains a Collections link', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Collections')).toBeTruthy());
  });

  it('breadcrumb shows the current category name', async () => {
    renderPage();
    // 'Silk Sarees' appears in both the breadcrumb <span> AND the page <h1>,
    // so getByText throws "multiple elements". Query inside the breadcrumb nav instead.
    await waitFor(() => {
      const nav = document.querySelector('nav[aria-label="Breadcrumb"]')!;
      expect(nav.textContent).toContain('Silk Sarees');
    });
  });

  // ── Grid view toggles ────────────────────────────────────────────────────────
  it('renders 2-column, 3-column, and 4-column view toggle buttons', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByLabelText('2 columns grid')).toBeTruthy();
      expect(screen.getByLabelText('3 columns grid')).toBeTruthy();
      expect(screen.getByLabelText('4 columns grid')).toBeTruthy();
    });
  });

  it('view toggle buttons have aria-pressed attribute', async () => {
    renderPage();
    await waitFor(() => {
      const btn = screen.getByLabelText('4 columns grid') as HTMLButtonElement;
      // 4col is the default — should be pressed
      expect(btn.getAttribute('aria-pressed')).toBe('true');
    });
  });

  // ── Search ────────────────────────────────────────────────────────────────────
  it('renders the search input', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search in this category/i)).toBeTruthy();
    });
  });

  // ── Sort ─────────────────────────────────────────────────────────────────────
  it('renders the sort dropdown with aria-label', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByLabelText('Sort products')).toBeTruthy();
    });
  });

  it('sort dropdown has a "Featured" default option', async () => {
    renderPage();
    await waitFor(() => {
      const select = screen.getByLabelText('Sort products') as HTMLSelectElement;
      expect(select.value).toBe('featured');
    });
  });

  // ── Filter panel ─────────────────────────────────────────────────────────────
  it('renders the Filters toggle button', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Filters')).toBeTruthy());
  });

  it('opens the filter panel on Filters button click', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Filters')).toBeTruthy());

    fireEvent.click(screen.getByText('Filters'));

    await waitFor(() => {
      // "Filter by" heading is inside the filter panel
      expect(screen.getByText('Filter by')).toBeTruthy();
    });
  });

  it('filter panel contains Fabric and Price filter sections', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Filters')).toBeTruthy());
    fireEvent.click(screen.getByText('Filters'));
    await waitFor(() => {
      const filterPanel = document.querySelector('#filter-panel')!;
      expect(filterPanel).toBeTruthy();

      // "Fabric" heading is inside the panel
      expect(screen.getByText('Fabric')).toBeTruthy();

      // The three h3s ('Filter by', 'Fabric', 'Price: ₹…') live in separate
      // grid-column divs, so :last-of-type resolves per-parent and always
      // returns the first h3 found. Use querySelectorAll + last index instead.
      const headings = Array.from(filterPanel.querySelectorAll('h3'));
      const priceHeading = headings[headings.length - 1];
      expect(priceHeading?.textContent).toMatch(/Price:/);
    });
  });

  it('closing the filter panel hides "Filter by" text', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Filters'));

    fireEvent.click(screen.getByText('Filters')); // open
    await waitFor(() => expect(screen.getByText('Filter by')).toBeTruthy());

    fireEvent.click(screen.getByText('Filters')); // close (toggle)
    await waitFor(() => {
      expect(screen.queryByText('Filter by')).toBeNull();
    });
  });

  // ── Empty / coming-soon state ─────────────────────────────────────────────────
  it('shows the coming-soon empty state when no products exist', async () => {
    renderPage();
    await waitFor(() => {
      // ComingSoonEmpty renders "Coming Soon" heading
      expect(screen.getByText('Coming Soon')).toBeTruthy();
    });
  });

  // ── Product grid ──────────────────────────────────────────────────────────────
  it('renders product cards when products are returned by the hook', async () => {
    mockUseProductsByCategory.mockReturnValue({ products: mockProducts, loading: false });
    renderPage();
    await waitFor(() => {
      // ProductCard renders the name in both mobile and desktop sections,
      // so getByText throws "multiple elements" — getAllByText handles this.
      expect(screen.getAllByText('Kanchipuram Silk').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows loading skeleton while products are loading', async () => {
    mockUseProductsByCategory.mockReturnValue({ products: [], loading: true });
    renderPage();
    await waitFor(() => {
      expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
    });
  });

  // ── Results count ─────────────────────────────────────────────────────────────
  it('shows product count when products are loaded', async () => {
    mockUseProductsByCategory.mockReturnValue({ products: mockProducts, loading: false });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/1 product/i)).toBeTruthy();
    });
  });
});