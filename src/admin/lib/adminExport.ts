// src/admin/lib/adminExport.ts
// Handles Excel (XLSX) and PDF export for all admin sections
// Uses browser-native APIs — no server required

// ─── Excel export ─────────────────────────────────────────────────────────────
export function exportToExcel(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const rows    = data.map(row => headers.map(h => {
    const v = row[h];
    if (Array.isArray(v)) return v.join(', ');
    if (v === null || v === undefined) return '';
    return String(v);
  }));

  // Build CSV (Excel opens it natively)
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const csv = [
    headers.map(escape).join(','),
    ...rows.map(r => r.map(escape).join(','))
  ].join('\r\n');

  // Add BOM for Excel UTF-8 recognition
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `${filename}.csv`);
}

// ─── PDF export ───────────────────────────────────────────────────────────────
export function exportToPDF(
  title: string,
  headers: string[],
  rows: (string | number)[][][],  // array of row arrays
  filename: string,
) {
  // Build a simple HTML table and print it as PDF
  const tableRows = rows.map(row =>
    `<tr>${row.map(cell => `<td>${String(cell ?? '').replace(/</g, '&lt;')}</td>`).join('')}</tr>`
  ).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: 'Helvetica Neue', sans-serif; font-size: 11px; color: #1a1410; padding: 24px; }
    h1 { font-size: 18px; color: #7A1F2E; margin: 0 0 4px; }
    p.sub { font-size: 10px; color: #888; margin: 0 0 16px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #7A1F2E; color: white; padding: 7px 10px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; }
    td { padding: 6px 10px; border-bottom: 1px solid #f0ebe0; font-size: 11px; }
    tr:nth-child(even) td { background: #faf6ef; }
    .footer { margin-top: 24px; font-size: 9px; color: #aaa; text-align: center; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="sub">Exported ${new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })} · Wing &amp; Weft Admin</p>
  <table>
    <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
  <p class="footer">Wing &amp; Weft · Authorised Admin Export · Confidential</p>
  <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); }</script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank');
  if (win) win.focus();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// ─── Image download helper ────────────────────────────────────────────────────
export async function downloadImage(url: string, filename: string) {
  try {
    const res  = await fetch(url);
    const blob = await res.blob();
    triggerDownload(blob, filename);
  } catch {
    // Fallback: open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

// ─── Internal ─────────────────────────────────────────────────────────────────
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}