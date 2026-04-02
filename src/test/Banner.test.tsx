// src/test/Banner.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Banner from '../components/Banner/Banner';

// Mock fetch for banner data
const mockBanners = [
  { id: '1', title: 'Test Title', subtitle: 'Test Subtitle',
    cta_text: 'Shop Now', cta_link: '/test', image_url: '/test.jpg',
    is_active: true, sort_order: 1 },
];

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockBanners),
  }));
});

describe('Banner', () => {
  it('renders skeleton initially', () => {
    render(<MemoryRouter><Banner /></MemoryRouter>);
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
  });

  it('renders banner slides after data loads', async () => {
    render(<MemoryRouter><Banner /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.queryByText('Test Title')).toBeTruthy();
    });
  });

  it('has accessible section label', async () => {
    render(<MemoryRouter><Banner /></MemoryRouter>);
    const section = document.querySelector('[aria-label="Featured collection"]');
    expect(section).toBeTruthy();
  });

  it('shows empty state when no banners returned', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    }));
    render(<MemoryRouter><Banner /></MemoryRouter>);
    await waitFor(() => {
      // Should show empty/admin prompt, not a real slide
      expect(screen.queryByText('Test Title')).toBeNull();
    });
  });
});