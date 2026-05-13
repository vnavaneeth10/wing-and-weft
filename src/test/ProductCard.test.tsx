// src/test/ProductCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductCard, { StarRating } from '../components/Products/ProductCard';

// ─── WHY these mocks are needed ───────────────────────────────────────────────
// ProductCard calls useTheme() and useSettings() at the top of every render.
// Without providers (or mocks) both hooks throw "must be used within a Provider".
// Mocking is cleaner than wrapping in real providers because it keeps tests
// independent of ThemeContext / SettingsContext logic.

vi.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({ isDark: false }),
}));

vi.mock('../../context/SettingsContext', () => ({
  useSettings: () => ({ whatsapp_number: '919876543210' }),
}));

// ─── Base mock product ────────────────────────────────────────────────────────
// Includes show_colors: true so color swatches render (the desktop section
// is conditionally rendered based on this flag, not CSS visibility).
const mockProduct = {
  id:             'silk-001',
  name:           'Kanchipuram Royal Silk',
  category:       'silk-sarees',
  fabric:         'Pure Silk',
  price:          8500,
  discount_price: 6500,
  stock:          5,
  colors:         ['#bc3d3e', '#b6893c'],
  images:         ['/test-image.jpg', '/test-image-2.jpg'],
  description:    'A beautiful saree',
  saree_fabric:   'Pure Silk',
  saree_length:   '6.3 meters',
  blouse_length:  '0.8 meters',
  blouse_fabric:  'Pure Silk',
  is_best_seller: true,
  is_new_arrival: false,
  is_featured:    false,
  show_rating:    false,   // keep rating hidden so we don't need to match those nodes
  show_colors:    true,    // explicitly enable colour swatches
  rating:         4.5,
  review_count:   12,
};

const renderCard = (overrides: Partial<typeof mockProduct> = {}) =>
  render(
    <MemoryRouter>
      <ProductCard product={{ ...mockProduct, ...overrides }} />
    </MemoryRouter>
  );

// ─────────────────────────────────────────────────────────────────────────────
describe('ProductCard', () => {

  // ── Product name ─────────────────────────────────────────────────────────────
  it('renders the product name', () => {
    renderCard();
    // Name appears in both mobile and desktop sections — just assert presence
    expect(screen.getAllByText('Kanchipuram Royal Silk').length).toBeGreaterThanOrEqual(1);
  });

  // ── Pricing ──────────────────────────────────────────────────────────────────
  it('shows discounted price when discount_price is set', () => {
    renderCard();
    // ₹6,500 appears in both mobile and desktop price sections
    expect(screen.getAllByText('₹6,500').length).toBeGreaterThanOrEqual(1);
  });

  it('shows original price with line-through when discounted', () => {
    renderCard();
    const strikeEls = document.querySelectorAll('.line-through');
    const hasOriginal = Array.from(strikeEls).some(el =>
      el.textContent?.includes('8,500')
    );
    expect(hasOriginal).toBe(true);
  });

  it('shows only one price when there is no discount', () => {
    renderCard({ discount_price: null });
    // No strike-through elements should exist
    expect(document.querySelectorAll('.line-through').length).toBe(0);
  });

  // ── Badges ───────────────────────────────────────────────────────────────────
  it('shows "BEST SELLER" badge when is_best_seller is true', () => {
    renderCard();
    // Text is uppercase in the source: "BEST SELLER"
    expect(screen.getByText('BEST SELLER')).toBeTruthy();
  });

  it('does not show "BEST SELLER" badge when is_best_seller is false', () => {
    renderCard({ is_best_seller: false });
    expect(screen.queryByText('BEST SELLER')).toBeNull();
  });

  it('shows "NEW" badge when is_new_arrival is true', () => {
    renderCard({ is_new_arrival: true });
    // In compact=false (full card) the badge text is "NEW"
    expect(screen.getByText('NEW')).toBeTruthy();
  });

  // ── Out of stock ─────────────────────────────────────────────────────────────
  it('renders out-of-stock image overlay when stock is 0', () => {
    renderCard({ stock: 0 });
    // The overlay div with bg-black/50 contains the text
    const overlay = document.querySelector('.absolute.inset-0.bg-black\\/50');
    expect(overlay).toBeTruthy();
    expect(overlay?.textContent).toContain('Out of Stock');
  });

  it('does not render the WhatsApp buy button when out of stock', () => {
    renderCard({ stock: 0 });
    // Both desktop and mobile WA buttons are guarded by stock !== 0
    expect(screen.queryAllByLabelText(/Buy .* on WhatsApp/i).length).toBe(0);
  });

  // ── Navigation link ───────────────────────────────────────────────────────────
  it('product image link navigates to the correct detail page', () => {
    renderCard();
    // aria-label="View Kanchipuram Royal Silk" is on the <Link> wrapping the image
    const link = screen.getByLabelText('View Kanchipuram Royal Silk');
    expect(link.getAttribute('href')).toBe('/product/silk-001');
  });

  // ── WhatsApp button ───────────────────────────────────────────────────────────
  it('WhatsApp button has noopener rel when in stock', () => {
    renderCard({ stock: 5 });
    // Two WA links exist (desktop hidden + mobile) — check the first one
    const waLinks = screen.getAllByLabelText(/Buy .* on WhatsApp/i);
    expect(waLinks.length).toBeGreaterThanOrEqual(1);
    expect(waLinks[0].getAttribute('rel')).toContain('noopener');
  });

  it('WhatsApp button opens in a new tab', () => {
    renderCard({ stock: 5 });
    const waLinks = screen.getAllByLabelText(/Buy .* on WhatsApp/i);
    expect(waLinks[0].getAttribute('target')).toBe('_blank');
  });

  // ── Colour swatches ───────────────────────────────────────────────────────────
  it('renders colour swatches in the desktop section', () => {
    renderCard();
    // show_colors=true so swatches render inside .hidden.md:block
    // jsdom renders all elements regardless of CSS visibility
    const swatches = document.querySelectorAll('[aria-label^="Color:"]');
    expect(swatches.length).toBe(2);
  });

  it('does not render swatches when show_colors is false', () => {
    renderCard({ show_colors: false });
    expect(document.querySelectorAll('[aria-label^="Color:"]').length).toBe(0);
  });

  it('does not render swatches when colors array is empty', () => {
    renderCard({ colors: [] });
    expect(document.querySelectorAll('[aria-label^="Color:"]').length).toBe(0);
  });

  // ── Stock status text (desktop section) ───────────────────────────────────────
  it('shows "In Stock" when stock > 5', () => {
    renderCard({ stock: 10 });
    expect(screen.getByText('In Stock')).toBeTruthy();
  });

  it('shows "Only N left" when stock is 1–5', () => {
    renderCard({ stock: 3 });
    expect(screen.getByText('Only 3 left')).toBeTruthy();
  });

  it('shows "Out of Stock" text label when stock is 0', () => {
    renderCard({ stock: 0 });
    // This text appears both in the overlay span and in the desktop stock line
    expect(screen.getAllByText('Out of Stock').length).toBeGreaterThanOrEqual(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('StarRating', () => {
  it('renders exactly 5 star SVG icons', () => {
    const { container } = render(<StarRating rating={4} />);
    const stars = container.querySelectorAll('svg');
    expect(stars.length).toBe(5);
  });

  it('has role="img" for screen readers', () => {
    render(<StarRating rating={3} />);
    expect(screen.getByRole('img', { name: /3 out of 5 stars/i })).toBeTruthy();
  });

  it('aria-label includes the rating value', () => {
    const { container } = render(<StarRating rating={4} />);
    const wrapper = container.querySelector('[aria-label]');
    expect(wrapper?.getAttribute('aria-label')).toContain('4 out of 5');
  });

  it('renders with default size when size prop is omitted', () => {
    // Should not throw
    expect(() => render(<StarRating rating={5} />)).not.toThrow();
  });
});