// src/test/CategoryPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CategoryPage from '../pages/CategoryPage';

// Mock useProductsByCategory hook
vi.mock('../hooks/useProducts', () => ({
  useProductsByCategory: vi.fn(() => ({
    products: [],
    loading: false,
  })),
}));

const mockProducts = [
  {
    id: 'silk-001', name: 'Kanchipuram Silk', category: 'silk-sarees',
    fabric: 'Pure Silk', price: 8500, discount_price: null, stock: 10,
    colors: ['#bc3d3e'], images: ['/img1.jpg', '/img2.jpg'],
    description: 'A beautiful saree', saree_fabric: 'Pure Silk',
    saree_length: '6.3m', blouse_length: '0.8m', blouse_fabric: 'Silk',
    policy_points: [], is_best_seller: true, is_new_arrival: false,
    is_featured: false, rating: 4.5, review_count: 10,
  },
  {
    id: 'silk-002', name: 'Mysore Silk', category: 'silk-sarees',
    fabric: 'Pure Silk', price: 5500, discount_price: 4500, stock: 3,
    colors: ['#b6893c'], images: ['/img3.jpg'],
    description: 'Elegant saree', saree_fabric: 'Pure Silk',
    saree_length: '6.0m', blouse_length: '0.8m', blouse_fabric: 'Silk',
    policy_points: [], is_best_seller: false, is_new_arrival: true,
    is_featured: false, rating: 4.0, review_count: 5,
  },
];

const renderPage = (categoryId = 'silk-sarees') =>
  render(
    <MemoryRouter initialEntries={[`/category/${categoryId}`]}>
      <Routes>
        <Route path="/category/:categoryId" element={<CategoryPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('CategoryPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id: 'silk-sarees', name: 'Silk Sarees', description: 'Pure silk', sort_order: 1, is_active: true }]),
    }));
  });

  it('renders breadcrumb with Home link', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Home')).toBeTruthy();
    });
  });

  it('renders view toggle buttons', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByLabelText('2 columns grid')).toBeTruthy();
      expect(screen.getByLabelText('3 columns grid')).toBeTruthy();
      expect(screen.getByLabelText('4 columns grid')).toBeTruthy();
    });
  });

  it('shows coming soon state when no products', async () => {
    renderPage();
    await waitFor(() => {
      // With empty products the coming soon state renders
      expect(document.querySelector('.min-h-screen')).toBeTruthy();
    });
  });

  it('renders search input', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search in this category/i)).toBeTruthy();
    });
  });

  it('renders sort dropdown', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByLabelText('Sort products')).toBeTruthy();
    });
  });

  it('renders filter toggle button', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeTruthy();
    });
  });

  it('opens filter panel on click', async () => {
    renderPage();
    await waitFor(() => {
      const filterBtn = screen.getByText('Filters');
      fireEvent.click(filterBtn);
      expect(screen.getByText('Filter by')).toBeTruthy();
    });
  });

  it('has accessible breadcrumb nav', async () => {
    renderPage();
    await waitFor(() => {
      const nav = document.querySelector('nav[aria-label="Breadcrumb"]');
      expect(nav).toBeTruthy();
    });
  });
});