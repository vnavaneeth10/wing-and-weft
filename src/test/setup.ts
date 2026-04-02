// src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// ── Mock SEO component ────────────────────────────────────────────────────────
vi.mock('../components/SEO/SEO', () => ({
  default: () => null,
}));

// ── Mock Supabase ─────────────────────────────────────────────────────────────
vi.mock('../admin/lib/supabase', () => ({
  SUPABASE_URL:        'https://test.supabase.co',
  SUPABASE_ANON_KEY:   'test-key',
  dbSelect:            vi.fn().mockResolvedValue([]),
  dbInsert:            vi.fn().mockResolvedValue([{ id: 'test-id' }]),
  dbUpdate:            vi.fn().mockResolvedValue([{}]),
  dbDelete:            vi.fn().mockResolvedValue(undefined),
  uploadImage:         vi.fn().mockResolvedValue('https://test.supabase.co/storage/test.jpg'),
  publicFetch:         vi.fn().mockResolvedValue([]),
  isLockedOut:         vi.fn().mockReturnValue(false),
  getLockoutRemaining: vi.fn().mockReturnValue(0),
}));

// ── Stable location object — prevents useEffect re-runs between renders ───────
const mockLocation = { pathname: '/', search: '', hash: '', state: null };

// ── Mock react-router-dom ─────────────────────────────────────────────────────
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => mockLocation,
    useParams:   () => ({ categoryId: 'silk-sarees', productId: 'test-product-001' }),
  };
});

// ── Mock IntersectionObserver ─────────────────────────────────────────────────
class IntersectionObserverMock {
  observe     = vi.fn();
  unobserve   = vi.fn();
  disconnect  = vi.fn();
  takeRecords = vi.fn(() => []);
  constructor(_cb: IntersectionObserverCallback, _opts?: IntersectionObserverInit) {}
}
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

// ── Mock ResizeObserver ───────────────────────────────────────────────────────
class ResizeObserverMock {
  observe    = vi.fn();
  unobserve  = vi.fn();
  disconnect = vi.fn();
  constructor(_cb: ResizeObserverCallback) {}
}
vi.stubGlobal('ResizeObserver', ResizeObserverMock);

// ── Mock window.scrollTo ──────────────────────────────────────────────────────
global.scrollTo = vi.fn() as unknown as typeof scrollTo;

// ── Mock fetch globally ───────────────────────────────────────────────────────
global.fetch = vi.fn().mockResolvedValue({
  ok:   true,
  json: () => Promise.resolve([]),
}) as unknown as typeof fetch;

// ── Suppress React Router future flag warnings ────────────────────────────────
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('React Router Future Flag')) return;
    originalWarn(...args);
  };
});
afterAll(() => { console.warn = originalWarn; });

// ── Suppress noisy console.error ─────────────────────────────────────────────
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) return;
    originalError(...args);
  };
});
afterAll(() => { console.error = originalError; });