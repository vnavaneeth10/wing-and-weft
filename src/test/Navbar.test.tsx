import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

import Navbar from '@/components/Navbar/Navbar';

import { render, screen, waitFor } from '@/test/test-utils';

// ─────────────────────────────────────────────────────────────
// MOCKS
// ─────────────────────────────────────────────────────────────

const mockToggleTheme = vi.fn();

vi.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    toggleTheme: mockToggleTheme,
  }),
}));

vi.mock('@/hooks', () => ({
  useSearchSuggestions: vi.fn(() => []),
}));

vi.mock('@/data/products', () => ({
  INSTAGRAM_URL: 'https://instagram.com/wingandweft',
}));

vi.mock('@/lib/categoriesCache', () => ({
  getCategories: vi.fn(() =>
    Promise.resolve([
      {
        id: 'silk-sarees',
        name: 'Silk Sarees',
      },
      {
        id: 'cotton-sarees',
        name: 'Cotton Sarees',
      },
    ]),
  ),
}));

// ─────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────

describe('Navbar', () => {
  it('renders navigation landmark', () => {
    render(<Navbar />);

    expect(
      screen.getByRole('navigation', {
        name: /main navigation/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders logo image', () => {
    render(<Navbar />);

    expect(
      screen.getByAltText(/wing & weft/i),
    ).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Navbar />);

    expect(
      screen.getByRole('link', {
        name: /home/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', {
        name: /about us/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', {
        name: /contact/i,
      }),
    ).toBeInTheDocument();
  });

  it('opens search panel when search button is clicked', async () => {
    render(<Navbar />);

    const user = userEvent.setup();

    await user.click(
      screen.getByLabelText(/open search/i),
    );

    expect(
      screen.getByLabelText(/search products/i),
    ).toBeInTheDocument();
  });

  it('renders search placeholder correctly', async () => {
    render(<Navbar />);

    const user = userEvent.setup();

    await user.click(
      screen.getByLabelText(/open search/i),
    );

    expect(
      screen.getByPlaceholderText(
        /search sarees, fabrics/i,
      ),
    ).toBeInTheDocument();
  });

  it('opens categories dropdown', async () => {
    render(<Navbar />);

    const user = userEvent.setup();

    await user.click(
      screen.getByRole('button', {
        name: /categories/i,
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByText(/silk sarees/i),
      ).toBeInTheDocument();
    });
  });

  it('shows view all collections link', async () => {
    render(<Navbar />);

    const user = userEvent.setup();

    await user.click(
      screen.getByRole('button', {
        name: /categories/i,
      }),
    );

    expect(
      screen.getByText(/view all collections/i),
    ).toBeInTheDocument();
  });

  it('opens mobile menu', async () => {
    render(<Navbar />);

    const user = userEvent.setup();

    await user.click(
      screen.getByLabelText(/open menu/i),
    );

    expect(
      screen.getByLabelText(/close menu/i),
    ).toBeInTheDocument();
  });

  it('calls toggleTheme when theme button is clicked', async () => {
    render(<Navbar />);

    const user = userEvent.setup();

    await user.click(
      screen.getByLabelText(
        /switch to dark mode/i,
      ),
    );

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('instagram link opens safely in new tab', () => {
    render(<Navbar />);

    const link = screen.getByLabelText(
      /follow us on instagram/i,
    );

    expect(link).toHaveAttribute(
      'target',
      '_blank',
    );

    expect(link).toHaveAttribute(
      'rel',
      expect.stringContaining('noopener'),
    );

    expect(link).toHaveAttribute(
      'rel',
      expect.stringContaining('noreferrer'),
    );
  });

  it('track order link points to courier tracking site', () => {
    render(<Navbar />);

    const link = screen.getByLabelText(
      /track your courier order/i,
    );

    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('trackcourier.io'),
    );
  });

  it('categories button has correct accessibility attributes', () => {
    render(<Navbar />);

    const button = screen.getByRole('button', {
      name: /categories/i,
    });

    expect(button).toHaveAttribute(
      'aria-haspopup',
      'true',
    );

    expect(button).toHaveAttribute(
      'aria-expanded',
    );
  });

  it('mobile menu button updates aria-expanded state', async () => {
    render(<Navbar />);

    const user = userEvent.setup();

    const button = screen.getByLabelText(
      /open menu/i,
    );

    expect(button).toHaveAttribute(
      'aria-expanded',
      'false',
    );

    await user.click(button);

    expect(
      screen.getByLabelText(/close menu/i),
    ).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });
});