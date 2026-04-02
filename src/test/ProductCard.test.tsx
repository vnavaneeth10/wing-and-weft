// src/test/ProductCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductCard, { StarRating } from '../components/Products/ProductCard';

const mockProduct = {
  id: 'silk-001',
  name: 'Kanchipuram Royal Silk',
  category: 'silk-sarees',
  fabric: 'Pure Silk',
  price: 8500,
  discount_price: 6500,
  stock: 5,
  colors: ['#bc3d3e', '#b6893c'],
  images: ['/test-image.jpg', '/test-image-2.jpg'],
  description: 'A beautiful saree',
  saree_fabric: 'Pure Silk',
  saree_length: '6.3 meters',
  blouse_length: '0.8 meters',
  blouse_fabric: 'Pure Silk',
  policy_points: [],
  is_best_seller: true,
  is_new_arrival: false,
  is_featured: false,
  rating: 4.5,
  review_count: 12,
};

const renderCard = (props = {}) =>
  render(
    <MemoryRouter>
      <ProductCard product={{ ...mockProduct, ...props }} />
    </MemoryRouter>
  );

describe('ProductCard', () => {
  it('renders product name', () => {
    renderCard();
    expect(screen.getByText('Kanchipuram Royal Silk')).toBeTruthy();
  });

  it('shows discounted price when set', () => {
    renderCard();
    expect(screen.getByText('₹6,500')).toBeTruthy();
  });

  it('shows original price with strikethrough when discounted', () => {
    renderCard();
    const strikeEl = document.querySelector('.line-through');
    expect(strikeEl?.textContent).toContain('8,500');
  });

  it('shows best seller badge', () => {
    renderCard();
    expect(screen.getByText('Best Seller')).toBeTruthy();
  });

  it('shows out of stock overlay when stock is 0', () => {
    renderCard({ stock: 0 });
    // "Out of Stock" appears in two places: the image overlay AND the stock status text
    // Use getAllByText and verify at least one exists
    const outOfStockEls = screen.getAllByText('Out of Stock');
    expect(outOfStockEls.length).toBeGreaterThanOrEqual(1);
  });

  it('shows out of stock image overlay specifically', () => {
    renderCard({ stock: 0 });
    // The overlay is a <span> inside the image wrapper with specific class
    const overlay = document.querySelector('.absolute.inset-0.bg-black\\/50');
    expect(overlay).toBeTruthy();
    expect(overlay?.textContent).toContain('Out of Stock');
  });

  it('product link navigates to product detail page', () => {
    renderCard();
    const link = screen.getByLabelText('View Kanchipuram Royal Silk');
    expect(link.getAttribute('href')).toBe('/product/silk-001');
  });

  it('WhatsApp buy button has correct rel attributes', () => {
    renderCard();
    const waLink = screen.getByLabelText('Buy Kanchipuram Royal Silk on WhatsApp');
    expect(waLink.getAttribute('rel')).toContain('noopener');
  });

  it('renders correct number of color swatches', () => {
    renderCard();
    const swatches = document.querySelectorAll('[aria-label^="Color:"]');
    expect(swatches.length).toBe(2);
  });

  it('shows in stock status text when stock > 5', () => {
    renderCard({ stock: 10 });
    expect(screen.getByText('In Stock')).toBeTruthy();
  });

  it('shows low stock warning when stock is 1-5', () => {
    renderCard({ stock: 3 });
    expect(screen.getByText('Only 3 left')).toBeTruthy();
  });
});

describe('StarRating', () => {
  it('renders 5 stars total', () => {
    const { container } = render(<StarRating rating={4} />);
    const stars = container.querySelectorAll('svg');
    expect(stars.length).toBe(5);
  });

  it('has accessible aria-label', () => {
    const { container } = render(<StarRating rating={4} />);
    const wrapper = container.querySelector('[aria-label]');
    expect(wrapper?.getAttribute('aria-label')).toContain('4 out of 5');
  });

  it('has role img for screen readers', () => {
    render(<StarRating rating={3} />);
    expect(screen.getByRole('img', { name: /3 out of 5/i })).toBeTruthy();
  });
});