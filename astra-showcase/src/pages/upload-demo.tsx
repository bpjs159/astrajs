import { component, store, mounted } from 'astrajs.dev/core';
import { getUploads, uploadFile } from '../server/files.server.js';

const uploadState = store({
  files: [] as Array<{ name: string; size: string; date: string }>,
  uploading: false,
  uploadedName: undefined as string | undefined,
  error: undefined as string | undefined,
});

export const UploadPage = component(() => {
  mounted(() => {
    getUploads().then((files) => {
      uploadState.files = files;
    });
  });

  async function handleUpload(): Promise<void> {
    const demoFiles = ['report-q4.pdf', 'analytics.csv', 'photo.png'];
    const fileName = demoFiles[Math.floor(Math.random() * demoFiles.length)]!;

    uploadState.uploading = true;
    uploadState.error = undefined;
    uploadState.uploadedName = undefined;

    try {
      const result = await uploadFile(fileName, 'mock-data');
      if (result.ok) {
        uploadState.uploadedName = fileName;
        uploadState.files = [
          { name: fileName, size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`, date: new Date().toISOString().slice(0, 10) },
          ...uploadState.files,
        ];
      }
    } catch (e) {
      uploadState.error = e instanceof Error ? e.message : 'Upload failed';
    } finally {
      uploadState.uploading = false;
    }
  }

  return (
    <div class="page">
      <div class="page-header">
        <h1>File Upload</h1>
        <p>File handling via <code>server()</code> — example 07</p>
      </div>

      <div class="upload-zone" onClick={handleUpload}>
        <div class="upload-icon">📤</div>
        <div class="upload-text">
          {uploadState.uploading ? 'Uploading...' : 'Click to simulate upload'}
        </div>
        <div class="upload-hint">Files are sent to the server via RPC</div>
      </div>

      {uploadState.uploadedName && (
        <div class="success-banner">✓ "{uploadState.uploadedName}" uploaded successfully</div>
      )}

      {uploadState.error && (
        <div class="error-banner">{uploadState.error}</div>
      )}

      <div class="file-list">
        <h3>Uploaded Files</h3>
        {uploadState.files.map((f) => (
          <div class="file-row">
            <span class="file-name">📄 {f.name}</span>
            <span class="file-meta">{f.size} — {f.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
});
