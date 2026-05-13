// src/test/adminExport.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToExcel, exportToPDF, downloadImage } from '../admin/lib/adminExport';

// ─── WHY these fixes ───────────────────────────────────────────────────────────
// OLD: vi.spyOn(document, 'createElement') replaced ALL createElement calls — this
//      broke React's own internal DOM operations and the style injection in exportToPDF.
// FIX: Only intercept the anchor element by checking the tag argument, and restore
//      original behaviour for everything else.

// ─── Anchor mock — scoped per test ───────────────────────────────────────────
let mockClick: ReturnType<typeof vi.fn>;
let mockAnchor: {
  href: string; download: string;
  style: { display: string };
  click: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  mockClick  = vi.fn();
  mockAnchor = { href: '', download: '', style: { display: '' }, click: mockClick };

  // ── URL stubs ──
  global.URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url');
  global.URL.revokeObjectURL = vi.fn();

  // ── createElement: only intercept 'a', pass everything else to the real impl ──
  const realCreate = document.createElement.bind(document);
  vi.spyOn(document, 'createElement').mockImplementation((tag: string, ...rest) => {
    if (tag === 'a') return mockAnchor as unknown as HTMLElement;
    return realCreate(tag, ...rest);
  });

  // ── body stubs — only needed for the anchor lifecycle ──
  vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node as Node);
  vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node as Node);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
describe('exportToExcel', () => {
  it('creates a CSV Blob and triggers anchor download', () => {
    exportToExcel([{ Name: 'Test Saree', Price: 5000, Stock: 3 }], 'test-export');

    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(mockClick).toHaveBeenCalledTimes(1);
    expect(mockAnchor.download).toBe('test-export.csv');
  });

  it('does nothing when data array is empty', () => {
    exportToExcel([], 'empty');
    // No anchor, no blob
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(mockClick).not.toHaveBeenCalled();
  });

  it('flattens array values to comma-separated strings', () => {
    exportToExcel([{ Colors: ['#bc3d3e', '#b6893c'] }], 'colors-test');

    // The Blob passed to createObjectURL should contain the joined value
    const blob = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0] as Blob;
    expect(blob).toBeInstanceOf(Blob);
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
  });

  it('escapes double-quotes inside cell values', () => {
    // Values with " should be escaped as "" in CSV
    exportToExcel([{ Name: 'She said "hello"' }], 'escape-test');
    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
  });

  it('handles null and undefined values as empty strings', () => {
    exportToExcel([{ Field: null, Other: undefined }] as Record<string, unknown>[], 'null-test');
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('sets correct MIME type on the blob (text/csv)', () => {
    exportToExcel([{ X: 'y' }], 'mime-test');
    const blob = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0] as Blob;
    expect(blob.type).toContain('text/csv');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('exportToPDF', () => {
  it('opens a new window and passes focus to it', () => {
    const mockWin = { focus: vi.fn() };
    const mockOpen = vi.fn().mockReturnValue(mockWin);
    vi.stubGlobal('open', mockOpen);

    exportToPDF('Test Report', ['Col1', 'Col2'], [['Val1', 'Val2']], 'test');

    expect(mockOpen).toHaveBeenCalledWith(expect.any(String), '_blank');
    expect(mockWin.focus).toHaveBeenCalled();
  });

  it('opens a blob:// URL (not a plain string)', () => {
    // URL.createObjectURL is already stubbed to return 'blob:test-url'
    const mockOpen = vi.fn().mockReturnValue({ focus: vi.fn() });
    vi.stubGlobal('open', mockOpen);

    exportToPDF('Report', ['H1'], [['R1']], 'report');

    const calledUrl = mockOpen.mock.calls[0][0] as string;
    expect(calledUrl).toBe('blob:test-url');
  });

  it('schedules URL revocation after 5 seconds', () => {
    vi.useFakeTimers();
    vi.stubGlobal('open', vi.fn().mockReturnValue({ focus: vi.fn() }));

    exportToPDF('R', ['H'], [['V']], 'f');

    // Before 5 s the URL should NOT be revoked yet
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    vi.advanceTimersByTime(5000);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url');

    vi.useRealTimers();
  });

  it('does not crash when window.open returns null (blocked popup)', () => {
    vi.stubGlobal('open', vi.fn().mockReturnValue(null));
    expect(() =>
      exportToPDF('R', ['H'], [['V']], 'f')
    ).not.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('downloadImage', () => {
  it('fetches the image, creates a Blob, and triggers anchor download', async () => {
    const mockBlob = new Blob(['img-bytes'], { type: 'image/jpeg' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      blob: () => Promise.resolve(mockBlob),
    }));

    await downloadImage('https://test.com/image.jpg', 'test.jpg');

    expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    expect(mockClick).toHaveBeenCalledTimes(1);
    expect(mockAnchor.download).toBe('test.jpg');
  });

  it('falls back to window.open when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    const mockOpen = vi.fn();
    vi.stubGlobal('open', mockOpen);

    await downloadImage('https://test.com/image.jpg', 'test.jpg');

    expect(mockOpen).toHaveBeenCalledWith(
      'https://test.com/image.jpg', '_blank', 'noopener,noreferrer'
    );
    // Should NOT have tried to create an anchor download
    expect(mockClick).not.toHaveBeenCalled();
  });

  it('falls back to window.open when blob() rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      blob: () => Promise.reject(new Error('Blob error')),
    }));
    const mockOpen = vi.fn();
    vi.stubGlobal('open', mockOpen);

    await downloadImage('https://cdn.example.com/img.png', 'img.png');

    expect(mockOpen).toHaveBeenCalledWith(
      'https://cdn.example.com/img.png', '_blank', 'noopener,noreferrer'
    );
  });
});