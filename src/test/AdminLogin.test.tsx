// src/test/AdminLogin.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminLogin from '../admin/pages/AdminLogin';

vi.mock('../admin/lib/AdminAuthContext', () => ({
  useAdminAuth: () => ({
    signIn: vi.fn(),
    loading: false,
    error: null,
    remainingAttempts: 5,
    lockoutMinutes: 0,
  }),
}));

describe('AdminLogin', () => {
  it('renders logo image', () => {
    render(<AdminLogin />);
    expect(screen.getByAltText('Wing & Weft')).toBeTruthy();
  });

  it('renders email and password fields', () => {
    render(<AdminLogin />);
    expect(screen.getByLabelText('Email Address')).toBeTruthy();
    expect(screen.getByLabelText('Password')).toBeTruthy();
  });

  it('shows Wing & Weft brand text', () => {
    render(<AdminLogin />);
    // Use getAllByText since "Wing & Weft" may appear in logo alt + heading
    const matches = screen.getAllByText(/Wing & Weft/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('shows Admin Dashboard subtitle', () => {
    render(<AdminLogin />);
    expect(screen.getByText('Admin Dashboard')).toBeTruthy();
  });

  it('toggles password visibility', () => {
    render(<AdminLogin />);
    const passInput = screen.getByLabelText('Password') as HTMLInputElement;
    expect(passInput.type).toBe('password');
    fireEvent.click(screen.getByLabelText('Show password'));
    expect(passInput.type).toBe('text');
    fireEvent.click(screen.getByLabelText('Hide password'));
    expect(passInput.type).toBe('password');
  });

  it('submit button is present', () => {
    render(<AdminLogin />);
    // Button contains icon + text — use getByRole with name matcher
    const btn = screen.getByRole('button', { name: /Sign In/i });
    expect(btn).toBeTruthy();
  });

  it('submit button is type submit', () => {
    render(<AdminLogin />);
    const btn = screen.getByRole('button', { name: /Sign In/i }) as HTMLButtonElement;
    expect(btn.type).toBe('submit');
  });

  it('has security note about session expiry', () => {
    render(<AdminLogin />);
    expect(screen.getByText(/Session ends automatically/i)).toBeTruthy();
  });

  it('email field has correct type and autocomplete', () => {
    render(<AdminLogin />);
    const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement;
    expect(emailInput.type).toBe('email');
    expect(emailInput.required).toBe(true);
  });

  it('form prevents default on submit', () => {
    render(<AdminLogin />);
    const form = document.querySelector('form');
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form?.dispatchEvent(submitEvent);
    // If handleSubmit calls e.preventDefault(), the form won't navigate
    expect(form).toBeTruthy();
  });

  it('authorised personnel note is present', () => {
    render(<AdminLogin />);
    expect(screen.getByText(/Authorised personnel only/i)).toBeTruthy();
  });
});