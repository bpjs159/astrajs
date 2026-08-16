// 07 — File Upload · Client reads a file, server validates and stores it
import { component, store } from '@bpjs159/core';
import { server } from '@bpjs159/server';

interface UploadedFile {
  id: string;
  name: string;
  mime: string;
  size: number;
  dataUrl: string;
  uploadedAt: string;
}

// Server-side in-memory store. Keyed by a server-generated id — the client
// never controls the storage key, which avoids path-traversal-style attacks.
const uploads = new Map<string, UploadedFile>();

const MAX_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIME = /^image\/(png|jpeg|jpg|webp|gif)$/;

const uploadFile = server(async (base64: string, name: string, mime: string) => {
  if (!ALLOWED_MIME.test(mime)) {
    return { ok: false as const, error: `Unsupported type: ${mime}` };
  }

  const bytes = Buffer.from(base64, 'base64').length;
  if (bytes > MAX_BYTES) {
    return { ok: false as const, error: `File too large (${(bytes / 1024 / 1024).toFixed(2)}MB > 2MB)` };
  }

  const id = crypto.randomUUID();
  const file: UploadedFile = {
    id,
    name: name.slice(0, 120), // stored as metadata only — never used as a filesystem path
    mime,
    size: bytes,
    dataUrl: `data:${mime};base64,${base64}`,
    uploadedAt: new Date().toISOString(),
  };
  uploads.set(id, file);
  return { ok: true as const, file };
});

const listUploads = server(async () => Array.from(uploads.values()).reverse());

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export const FileUploadDemo = component(() => {
  const ui = store({
    files: [] as UploadedFile[],
    uploading: false,
    error: undefined as string | undefined,
  });

  listUploads().then(files => { ui.files = files; });

  async function handleFileChange(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    ui.error = undefined;
    ui.uploading = true;
    try {
      const base64 = await fileToBase64(file);
      const result = await uploadFile(base64, file.name, file.type);
      if (!result.ok) {
        ui.error = result.error;
      } else {
        ui.files = [result.file, ...ui.files];
      }
    } finally {
      ui.uploading = false;
      input.value = '';
    }
  }

  return (
    <div class="card">
      <div class="header">
        <h1>File Upload</h1>
        <p>Client reads bytes, <code>server()</code> validates size/type and stores them</p>
      </div>
      <div class="body">
        <label class="dropzone">
          <input type="file" accept="image/*" onChange={handleFileChange} disabled={ui.uploading} />
          {ui.uploading ? 'Uploading...' : 'Choose an image (max 2MB)'}
        </label>
        {ui.error && <p class="error">{ui.error}</p>}
        <div class="gallery">
          {ui.files.map(f => (
            <div class="thumb">
              <img src={f.dataUrl} alt={f.name} />
              <span class="thumbName">{f.name}</span>
              <span class="thumbSize">{(f.size / 1024).toFixed(1)} KB</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
