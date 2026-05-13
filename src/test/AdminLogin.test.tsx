// src/test/AdminLogin.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminLogin from '../admin/pages/AdminLogin';

// ─── WHY these mocks are needed ───────────────────────────────────────────────
// AdminLogin directly calls isLockedOut() and getLockoutRemaining() from supabase.ts
// at module load time and inside useEffect. Without mocking them the module crashes
// because supabase.ts tries to use localStorage or make network calls in jsdom.
//
// useAdminAuth is also mocked to isolate AdminLogin from the real auth flow.

vi.mock('../admin/lib/AdminAuthContext', () => ({
  useAdminAuth: () => ({
    signIn: vi.fn(),
    loading: false,
    error: null,
    remainingAttempts: 5,
    lockoutMinutes: 0,
  }),
}));

// Mock the supabase helpers used directly by AdminLogin (not through context)
vi.mock('../admin/lib/supabase', () => ({
  isLockedOut:         vi.fn().mockReturnValue(false),
  getLockoutRemaining: vi.fn().mockReturnValue(0),
  // Export stubs for anything else supabase.ts might export that other
  // transitively-imported modules need
  SUPABASE_URL:      'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
}));

// ─────────────────────────────────────────────────────────────────────────────
describe('AdminLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Branding ────────────────────────────────────────────────────────────────
  it('renders the Wing & Weft logo image', () => {
    render(<AdminLogin />);
    // The <img> has alt="Wing & Weft"
    expect(screen.getByAltText('Wing & Weft')).toBeTruthy();
  });

  it('renders the Wing & Weft heading', () => {
    render(<AdminLogin />);
    // HTML entity &amp; renders as "Wing & Weft" in textContent
    const matches = screen.getAllByText(/Wing & Weft/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('renders "Admin Dashboard" subtitle', () => {
    render(<AdminLogin />);
    expect(screen.getByText('Admin Dashboard')).toBeTruthy();
  });

  // ── Form fields ──────────────────────────────────────────────────────────────
  it('renders email field with correct type and required attribute', () => {
    render(<AdminLogin />);
    // The label text is "Email Address" and htmlFor="adm-email" — RTL matches by for/id pair
    const email = screen.getByLabelText('Email Address') as HTMLInputElement;
    expect(email.type).toBe('email');
    expect(email.required).toBe(true);
  });

  it('renders password field with type password initially', () => {
    render(<AdminLogin />);
    const pass = screen.getByLabelText('Password') as HTMLInputElement;
    expect(pass.type).toBe('password');
  });

  // ── Password toggle ──────────────────────────────────────────────────────────
  it('toggles password visibility: password → text → password', () => {
    render(<AdminLogin />);
    const pass    = screen.getByLabelText('Password') as HTMLInputElement;
    const showBtn = screen.getByLabelText('Show password');

    expect(pass.type).toBe('password');
    fireEvent.click(showBtn);
    // After click the aria-label changes to "Hide password"
    expect(pass.type).toBe('text');
    expect(screen.getByLabelText('Hide password')).toBeTruthy();

    fireEvent.click(screen.getByLabelText('Hide password'));
    expect(pass.type).toBe('password');
  });

  // ── Submit button ────────────────────────────────────────────────────────────
  it('renders a submit button', () => {
    render(<AdminLogin />);
    // Use role=button with type check instead of accessible name because
    // the label includes a Lucide icon that may not have accessible text
    const buttons = screen.getAllByRole('button');
    const submitBtn = buttons.find(
      b => (b as HTMLButtonElement).type === 'submit'
    ) as HTMLButtonElement;
    expect(submitBtn).toBeTruthy();
    expect(submitBtn.type).toBe('submit');
  });

  it('submit button contains "Sign In" text', () => {
    render(<AdminLogin />);
    // getAllByText handles the case where the icon + text compose the label
    const signIn = screen.getByText(/Sign In/i);
    expect(signIn).toBeTruthy();
  });

  // ── Security notes ───────────────────────────────────────────────────────────
  it('shows session-expiry note', () => {
    render(<AdminLogin />);
    expect(screen.getByText(/Session ends automatically/i)).toBeTruthy();
  });

  it('shows authorised-personnel note', () => {
    render(<AdminLogin />);
    expect(screen.getByText(/Authorised personnel only/i)).toBeTruthy();
  });

  // ── Form behaviour ───────────────────────────────────────────────────────────
  it('calls e.preventDefault on submit (no page navigation)', () => {
    render(<AdminLogin />);
    const form = document.querySelector('form')!;
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);
    // If handleSubmit ran, defaultPrevented would be true
    expect(submitEvent.defaultPrevented).toBe(true);
  });

  it('typing into email field updates its value', () => {
    render(<AdminLogin />);
    const email = screen.getByLabelText('Email Address') as HTMLInputElement;
    fireEvent.change(email, { target: { value: 'admin@test.com' } });
    expect(email.value).toBe('admin@test.com');
  });

  it('typing into password field updates its value', () => {
    render(<AdminLogin />);
    const pass = screen.getByLabelText('Password') as HTMLInputElement;
    fireEvent.change(pass, { target: { value: 'secret123' } });
    expect(pass.value).toBe('secret123');
  });

  // ── Locked-out state ─────────────────────────────────────────────────────────
  it('shows lockout message when account is locked', async () => {
    // Override the supabase mock for this test only
    const { isLockedOut } = await import('../admin/lib/supabase');
    vi.mocked(isLockedOut).mockReturnValue(true);

    render(<AdminLogin />);
    await waitFor(() => {
      expect(screen.getByText(/Account temporarily locked/i)).toBeTruthy();
    });
  });
});