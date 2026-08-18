import { server } from 'astrajs.dev/server';

export const uploadFile = server(async (fileName: string, _fileData: string): Promise<{ ok: boolean; url: string }> => {
  // SECURITY: fileName is client input — never trust it as a URL path.
  // Keep only the final safe segment and percent-encode it.
  const base = fileName.split(/[\\/]/).pop() ?? 'upload';
  const safe = base.replace(/[^\w.\- ]/g, '').trim() || 'upload';
  return { ok: true, url: `/uploads/${encodeURIComponent(safe)}` };
});

export const getUploads = server(async (): Promise<Array<{ name: string; size: string; date: string }>> => {
  return [
    { name: 'report-q3.pdf', size: '2.4 MB', date: '2026-08-10' },
    { name: 'hero-banner.png', size: '1.1 MB', date: '2026-08-09' },
    { name: 'data-export.csv', size: '856 KB', date: '2026-08-08' },
  ];
});
