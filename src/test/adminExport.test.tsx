// src/test/adminExport.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportToExcel, exportToPDF, downloadImage } from '../admin/lib/adminExport';

// Mock URL and DOM methods used by export functions
beforeEach(() => {
  global.URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url');
  global.URL.revokeObjectURL = vi.fn();
  const mockAnchor = {
    href: '', download: '', style: { display: '' },
    click: vi.fn(),
  };
  vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLElement);
  vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as unknown as Node);
  vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor as unknown as Node);
});

describe('exportToExcel', () => {
  it('creates a CSV blob and triggers download', () => {
    const data = [{ Name: 'Test Saree', Price: 5000, Stock: 3 }];
    exportToExcel(data, 'test-export');
    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
  });

  it('does nothing with empty data', () => {
    exportToExcel([], 'empty');
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('flattens array values to comma-separated strings', () => {
    const data = [{ Colors: ['#bc3d3e', '#b6893c'] }];
    exportToExcel(data, 'test');
    expect(URL.createObjectURL).toHaveBeenCalled();
  });
});

describe('exportToPDF', () => {
  it('opens a new window with HTML content', () => {
    const mockOpen = vi.fn().mockReturnValue({ focus: vi.fn() });
    vi.stubGlobal('open', mockOpen);
    exportToPDF('Test Report', ['Col1', 'Col2'], [['Val1', 'Val2']], 'test');
    expect(mockOpen).toHaveBeenCalledWith(expect.any(String), '_blank');
  });
});

describe('downloadImage', () => {
  it('fetches image and triggers download', async () => {
    const mockBlob = new Blob(['image'], { type: 'image/jpeg' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      blob: () => Promise.resolve(mockBlob),
    }));
    await downloadImage('https://test.com/image.jpg', 'test.jpg');
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
  });

  it('falls back to window.open on fetch failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    const mockOpen = vi.fn();
    vi.stubGlobal('open', mockOpen);
    await downloadImage('https://test.com/image.jpg', 'test.jpg');
    expect(mockOpen).toHaveBeenCalledWith('https://test.com/image.jpg', '_blank', 'noopener,noreferrer');
  });
});